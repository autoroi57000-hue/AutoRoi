"use server"

import * as Sentry from "@sentry/nextjs"
import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/server"
import { getRentalVehicleBySlug, checkRentalAvailability, getVehicleOccupiedDates } from "@/lib/rentals"
import { calculateRentalPrice, buildSelectedOptionsSnapshot } from "@/lib/rental-pricing"
import { sendRentalEmail } from "@/lib/rental-emails"
import { SITE_URL } from "@/lib/constants"
import type { Rental, OccupiedDateRange } from "@/types/rental"

// ─── Action publique : dates occupées pour un mois ────────────────────────────

export async function getOccupiedDates(
  vehicleId: string,
  year: number,
  month: number
): Promise<OccupiedDateRange[]> {
  return getVehicleOccupiedDates(vehicleId, year, month)
}

// ─── Schéma de validation ─────────────────────────────────────────────────────

const ReservationSchema = z.object({
  vehicle_id: z.string().uuid(),
  start_date: z.string().min(1, "Date de début requise"),
  end_date: z.string().min(1, "Date de fin requise"),
  pickup_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format heure invalide").default("09:00"),
  return_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format heure invalide").default("18:00"),
  /** Map option_id → quantity */
  selected_options: z.record(z.string(), z.number().int().min(0)).default({}),
  /** Prix total envoyé par le client (pour vérification côté serveur) */
  price_total_client: z.number().positive(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email("Email invalide"),
  phone: z.string().min(6).max(30),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  postal_code: z.string().max(10).optional(),
  birth_date: z.string().optional(),
  license_number: z.string().max(50).optional(),
  is_business: z.boolean().default(false),
  business_name: z.string().max(200).optional(),
  business_siret: z.string().max(20).optional(),
  cgv_accepted: z.boolean(),
  website: z.string().max(0, "Spam détecté").optional(), // honeypot
  locale: z.enum(["fr", "en"]).default("fr"),
})

export type ReservationInput = z.infer<typeof ReservationSchema>

export interface ReservationResult {
  success: boolean
  stripeUrl?: string
  rentalId?: string
  error?: string
}

// ─── Action principale ────────────────────────────────────────────────────────

export async function createRentalReservation(
  slug: string,
  rawData: unknown
): Promise<ReservationResult> {
  // 1. Validation Zod
  const parsed = ReservationSchema.safeParse(rawData)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return { success: false, error: firstIssue?.message ?? "Données invalides" }
  }

  const data = parsed.data

  // Anti-spam honeypot
  if (data.website) {
    return { success: false, error: "Spam détecté" }
  }

  // CGV obligatoires
  if (!data.cgv_accepted) {
    return { success: false, error: "Vous devez accepter les conditions générales de location" }
  }

  // 2. Récupérer le véhicule + options
  const vehicleResult = await getRentalVehicleBySlug(slug)
  if (!vehicleResult) {
    return { success: false, error: "Ce véhicule n'est plus disponible à la location" }
  }

  const { vehicle, options } = vehicleResult

  // 3. Vérifier les dates
  const startDate = new Date(data.start_date)
  const endDate = new Date(data.end_date)

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { success: false, error: "Dates invalides" }
  }

  if (endDate <= startDate) {
    return { success: false, error: "La date de fin doit être après la date de début" }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (startDate < today) {
    return { success: false, error: "La date de début ne peut pas être dans le passé" }
  }

  // 4. Vérifier la disponibilité via RPC
  const isAvailable = await checkRentalAvailability(vehicle.id, startDate, endDate)
  if (!isAvailable) {
    return {
      success: false,
      error: "Ce véhicule n'est plus disponible pour ces dates. Veuillez choisir d'autres dates.",
    }
  }

  // 5. Calculer le prix côté serveur (source de vérité)
  const selectedOptionsList: { option: (typeof options)[0]; quantity: number }[] = Object.entries(
    data.selected_options
  )
    .filter(([, qty]) => qty > 0)
    .map(([optionId, qty]) => {
      const opt = options.find((o) => o.id === optionId)
      return opt ? { option: opt, quantity: qty } : null
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

  let pricing
  try {
    pricing = calculateRentalPrice({
      vehicle,
      startDate,
      endDate,
      selectedOptions: selectedOptionsList,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur de calcul"
    return { success: false, error: msg }
  }

  // Tolérance de 1€ entre prix client et prix serveur
  if (Math.abs(pricing.total_amount - data.price_total_client) > 1) {
    console.warn(
      `[createRentalReservation] Écart de prix : client=${data.price_total_client} serveur=${pricing.total_amount}`
    )
    // On continue avec le prix serveur mais on le log
  }

  // 6. Insérer la réservation en DB
  Sentry.setContext("rental", {
    action: "createReservation",
    vehicleId: vehicle.id,
    slug,
    startDate: data.start_date,
    endDate: data.end_date,
    totalAmount: pricing.total_amount,
  })

  const supabase = createAdminClient()

  const selectedOptionsSnapshot = buildSelectedOptionsSnapshot(selectedOptionsList, pricing.total_days)

  const { data: rentalRow, error: insertError } = await supabase
    .from("rentals")
    .insert({
      rental_vehicle_id: vehicle.id,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      pickup_time: data.pickup_time,
      return_time: data.return_time,
      total_days: pricing.total_days,
      base_price_per_day: pricing.base_price_per_day,
      subtotal: pricing.subtotal,
      options_total: pricing.options_total,
      surcharge_total: pricing.surcharge_total,
      total_amount: pricing.total_amount,
      deposit_amount: pricing.deposit_amount,
      selected_options: selectedOptionsSnapshot,
      client_first_name: data.first_name,
      client_last_name: data.last_name,
      client_email: data.email,
      client_phone: data.phone,
      client_address: data.address ?? null,
      client_city: data.city ?? null,
      client_postal_code: data.postal_code ?? null,
      client_birth_date: data.birth_date ?? null,
      client_license_number: data.license_number ?? null,
      is_business: data.is_business,
      business_name: data.business_name ?? null,
      business_siret: data.business_siret ?? null,
      cgv_accepted: true,
      cgv_accepted_at: new Date().toISOString(),
      status: "pending",
    } as never)
    .select("id, reference")
    .single()

  if (insertError || !rentalRow) {
    Sentry.captureException(insertError ?? new Error("Rental insert returned null"), {
      tags: { action: "createRentalReservation", step: "db_insert" },
    })
    console.error("[createRentalReservation] Insert error:", insertError)
    return { success: false, error: "Erreur lors de la création de la réservation. Veuillez réessayer." }
  }

  const { id: rentalId } = rentalRow as { id: string; reference: string }

  // 7. Envoyer emails de confirmation (non-bloquants)
  const { data: fullRentalData } = await supabase
    .from("rentals")
    .select("*, rental_vehicle:rental_vehicles(*)")
    .eq("id", rentalId)
    .single()

  if (fullRentalData) {
    const rentalObj = fullRentalData as unknown as Rental
    sendRentalEmail("confirmation_client", rentalObj, { locale: data.locale }).catch((err) => {
      Sentry.captureException(err, { tags: { action: "sendRentalEmail", type: "confirmation_client" } })
      console.error("[createRentalReservation] confirmation_client email failed:", err)
    })
    sendRentalEmail("confirmation_admin", rentalObj, { locale: data.locale }).catch((err) => {
      Sentry.captureException(err, { tags: { action: "sendRentalEmail", type: "confirmation_admin" } })
      console.error("[createRentalReservation] confirmation_admin email failed:", err)
    })
  }

  // 8. Créer la Stripe Checkout Session
  const siteUrl = SITE_URL ?? "https://autoroi.fr"
  let stripeUrl: string

  try {
    const checkoutRes = await fetch(`${siteUrl}/api/rentals/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rentalId, locale: data.locale }),
    })

    if (!checkoutRes.ok) {
      const errText = await checkoutRes.text()
      Sentry.captureMessage(`Stripe checkout failed: ${errText}`, {
        level: "error",
        tags: { action: "createRentalReservation", step: "stripe_checkout" },
      })
      console.error("[createRentalReservation] Stripe checkout error:", errText)
      return {
        success: false,
        error: "Réservation créée, mais erreur lors de l'ouverture du paiement. Contactez-nous.",
      }
    }

    const { url } = await checkoutRes.json()
    stripeUrl = url
  } catch (err) {
    Sentry.captureException(err, { tags: { action: "createRentalReservation", step: "stripe_fetch" } })
    console.error("[createRentalReservation] fetch checkout error:", err)
    return {
      success: false,
      error: "Réservation créée, mais impossible de lancer le paiement. Contactez-nous.",
    }
  }

  return { success: true, stripeUrl, rentalId }
}
