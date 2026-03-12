import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/server"
import { SITE_URL, SITE_NAME } from "@/lib/constants"
import type { Rental } from "@/types/rental"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
})

const bodySchema = z.object({
  rentalId: z.string().uuid("rentalId doit être un UUID valide"),
  locale: z.enum(["fr", "en"]).default("fr"),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Valider le body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Corps de requête JSON invalide" }, { status: 400 })
    }

    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { rentalId, locale } = parsed.data

    // 2. Récupérer la réservation avec son véhicule
    const supabase = createAdminClient()
    const { data: rental, error: rentalError } = await supabase
      .from("rentals")
      .select("*, rental_vehicle:rental_vehicles(id, brand, model, year, cover_photo, slug)")
      .eq("id", rentalId)
      .single()

    if (rentalError || !rental) {
      return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 })
    }

    const r = rental as unknown as Rental

    // 3. Vérifier que la réservation est en attente de paiement
    if (r.status !== "pending") {
      return NextResponse.json(
        {
          error: `Cette réservation ne peut pas être payée (statut : ${r.status})`,
        },
        { status: 409 }
      )
    }

    // 4. Vérifier qu'un paiement n'est pas déjà en cours (session active)
    if (r.stripe_session_id) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(r.stripe_session_id)
        if (
          existingSession.status === "open" &&
          existingSession.expires_at > Math.floor(Date.now() / 1000)
        ) {
          return NextResponse.json({ url: existingSession.url })
        }
      } catch {
        // Session expirée ou invalide — on en crée une nouvelle
      }
    }

    // 5. Préparer les données de la session
    const vehicle = r.rental_vehicle
    const depositCents = Math.round(r.deposit_amount * 100)

    if (depositCents <= 0) {
      return NextResponse.json({ error: "Montant d'acompte invalide" }, { status: 422 })
    }

    const startFormatted = new Date(r.start_date).toLocaleDateString(
      locale === "en" ? "en-GB" : "fr-FR",
      { day: "2-digit", month: "short", year: "numeric" }
    )
    const endFormatted = new Date(r.end_date).toLocaleDateString(
      locale === "en" ? "en-GB" : "fr-FR",
      { day: "2-digit", month: "short", year: "numeric" }
    )

    const productName =
      locale === "en"
        ? `Deposit — ${vehicle?.brand ?? ""} ${vehicle?.model ?? ""}`
        : `Acompte location — ${vehicle?.brand ?? ""} ${vehicle?.model ?? ""}`

    const productDescription =
      locale === "en"
        ? `Booking ${r.reference} · ${startFormatted} → ${endFormatted} · ${r.total_days} day${r.total_days > 1 ? "s" : ""}`
        : `Réservation ${r.reference} · du ${startFormatted} au ${endFormatted} · ${r.total_days} jour${r.total_days > 1 ? "s" : ""}`

    // 6. Construire les images produit (Stripe n'accepte que les URLs HTTPS)
    const productImages: string[] = []
    if (
      vehicle?.cover_photo &&
      vehicle.cover_photo.startsWith("https://")
    ) {
      productImages.push(vehicle.cover_photo)
    }

    // 7. Créer la Stripe Checkout Session
    const vehicleSlug = vehicle?.slug ?? rentalId
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: r.client_email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: depositCents,
            product_data: {
              name: productName,
              description: productDescription,
              ...(productImages.length > 0 && { images: productImages }),
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        rental_id: rentalId,
        rental_reference: r.reference,
        site: SITE_NAME,
      },
      success_url: `${SITE_URL}/${locale}/location/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/${locale}/location/${vehicleSlug}?cancelled=true`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // +30 minutes
      payment_intent_data: {
        description: `${SITE_NAME} — ${r.reference}`,
        metadata: {
          rental_id: rentalId,
          rental_reference: r.reference,
        },
      },
    })

    // 8. Persister la session dans la réservation
    await supabase
      .from("rentals")
      .update({
        stripe_session_id: session.id,
        stripe_checkout_expires_at: new Date(session.expires_at * 1000).toISOString(),
      } as never)
      .eq("id", rentalId)

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("POST /api/rentals/checkout error:", err)

    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: err.message }, { status: 502 })
    }

    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
