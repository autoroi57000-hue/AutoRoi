"use server"

import { revalidatePath } from "next/cache"
import { createActionClient } from "@/lib/supabase/server"
import { generateRentalSlug, getVehicleOccupiedDates } from "@/lib/rentals"
import type { OccupiedDateRange } from "@/types/rental"
import { LOCALES } from "@/lib/constants"
import type { RentalVehicleStatus } from "@/types/rental"

type AnyClient = any

interface ActionResult {
  success: boolean
  vehicleId?: string
  error?: string
}

async function getAuthedUser(supabase: AnyClient) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { user: null, error: "Non authentifié" }
  return { user, error: null }
}

async function getRole(supabase: AnyClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single()
  const typed = data as { role: string } | null
  if (error || !typed) return { role: null, error: "Profil non trouvé" }
  return { role: typed.role, error: null }
}

// ─── getRentalVehiclesList (admin) ────────────────────────────────────────────

export async function getRentalVehiclesList(params: {
  status?: string
  page?: number
  perPage?: number
}) {
  try {
    const supabase = await createActionClient()
    const { user, error: authError } = await getAuthedUser(supabase)
    if (!user) return { success: false, error: authError, vehicles: [], total: 0, totalPages: 0 }

    const { role } = await getRole(supabase, user.id)
    if (!role) return { success: false, error: "Profil non trouvé", vehicles: [], total: 0, totalPages: 0 }

    const page = params.page ?? 1
    const perPage = params.perPage ?? 20
    const from = (page - 1) * perPage

    let query = (supabase as AnyClient)
      .from("rental_vehicles_with_stats")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + perPage - 1)

    if (role === "collaborateur") {
      query = query.eq("created_by", user.id)
    }
    if (params.status && params.status !== "all") {
      query = query.eq("status", params.status)
    }

    const { data, error, count } = await query

    if (error) {
      return { success: false, error: error.message, vehicles: [], total: 0, totalPages: 0 }
    }

    // Map view columns to frontend-expected properties
    const vehicles = (data ?? []).map((v: any) => {
      // Compute effective display status:
      // If the vehicle is "disponible" but is_rented_today → show "loue"
      let displayStatus = v.status
      if (v.status === "disponible" && v.is_rented_today) {
        displayStatus = "loue"
      }

      return {
        ...v,
        total_rentals: v.total_rentals_count ?? 0,
        active_rentals: v.active_reservations_count ?? 0,
        has_upcoming_48h: v.has_upcoming_48h ?? false,
        is_rented_today: v.is_rented_today ?? false,
        display_status: displayStatus,
      }
    })

    return {
      success: true,
      vehicles,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / perPage),
    }
  } catch (err) {
    console.error("getRentalVehiclesList error:", err)
    return { success: false, error: "Erreur inattendue", vehicles: [], total: 0, totalPages: 0 }
  }
}

// ─── getRentalVehicleForEdit ──────────────────────────────────────────────────

export async function getRentalVehicleForEdit(id: string) {
  try {
    const supabase = await createActionClient()
    const { user } = await getAuthedUser(supabase)
    if (!user) return { success: false, error: "Non authentifié", vehicle: null }

    const { role } = await getRole(supabase, user.id)

    let query = (supabase as AnyClient)
      .from("rental_vehicles")
      .select("*")
      .eq("id", id)

    if (role === "collaborateur") {
      query = query.eq("created_by", user.id)
    }

    const { data, error } = await query.single()

    if (error || !data) return { success: false, error: "Véhicule introuvable", vehicle: null }

    return { success: true, vehicle: data as any }
  } catch (err) {
    return { success: false, error: "Erreur inattendue", vehicle: null }
  }
}

// ─── getRentalOptions ─────────────────────────────────────────────────────────

export async function getRentalOptions() {
  try {
    const supabase = await createActionClient()
    const { data } = await (supabase as AnyClient)
      .from("rental_options")
      .select("*")
      .order("sort_order")

    return { success: true, options: (data ?? []) as any[] }
  } catch {
    return { success: false, options: [] }
  }
}

// ─── createRentalVehicle ──────────────────────────────────────────────────────

export async function createRentalVehicle(
  formData: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const supabase = await createActionClient()
    const { user, error: authError } = await getAuthedUser(supabase)
    if (!user) return { success: false, error: authError ?? "Non authentifié" }

    const { role, error: roleError } = await getRole(supabase, user.id)
    if (!role) return { success: false, error: roleError ?? "Profil non trouvé" }
    if (role !== "admin" && role !== "collaborateur") {
      return { success: false, error: "Accès non autorisé" }
    }

    const brand = String(formData.brand ?? "")
    const model = String(formData.model ?? "")
    const year = Number(formData.year ?? new Date().getFullYear())
    const slug = generateRentalSlug(brand, model, year)

    const { data: vehicle, error: insertError } = await (supabase as AnyClient)
      .from("rental_vehicles")
      .insert({
        brand,
        model,
        version: formData.version ?? null,
        year,
        vehicle_type: formData.vehicle_type ?? null,
        fuel: formData.fuel ?? null,
        transmission: formData.transmission ?? null,
        body: formData.body ?? null,
        seats: formData.seats ? Number(formData.seats) : null,
        doors: formData.doors ? Number(formData.doors) : null,
        color: formData.color ?? null,
        mileage: formData.mileage ? Number(formData.mileage) : null,
        power_hp: formData.power_hp ? Number(formData.power_hp) : null,
        description_fr: formData.description_fr ?? null,
        description_en: formData.description_en ?? null,
        price_per_day: Number(formData.price_per_day),
        price_per_hour: formData.price_per_hour ? Number(formData.price_per_hour) : null,
        pricing_tiers: formData.pricing_tiers ?? [],
        weekend_surcharge: Number(formData.weekend_surcharge ?? 0),
        holiday_surcharge: Number(formData.holiday_surcharge ?? 0),
        deposit_amount: Number(formData.deposit_amount ?? 0),
        deposit_percentage: Number(formData.deposit_percentage ?? 30),
        included_km_per_day: Number(formData.included_km_per_day ?? 200),
        extra_km_price: Number(formData.extra_km_price ?? 0.25),
        status: (formData.status as RentalVehicleStatus) ?? "disponible",
        photos: formData.photos ?? [],
        cover_photo: formData.cover_photo ?? null,
        slug,
        created_by: user.id,
      })
      .select("id")
      .single()

    if (insertError) {
      console.error("createRentalVehicle error:", insertError)
      return { success: false, error: "Erreur lors de la création du véhicule" }
    }

    const typedVehicle = vehicle as { id: string }

    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin/locations/vehicules`)
      revalidatePath(`/${locale}/location`)
    })

    return { success: true, vehicleId: typedVehicle.id }
  } catch (err) {
    console.error("createRentalVehicle unexpected:", err)
    return { success: false, error: "Une erreur inattendue est survenue" }
  }
}

// ─── updateRentalVehicle ──────────────────────────────────────────────────────

export async function updateRentalVehicle(
  id: string,
  formData: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const supabase = await createActionClient()
    const { user, error: authError } = await getAuthedUser(supabase)
    if (!user) return { success: false, error: authError ?? "Non authentifié" }

    const { role, error: roleError } = await getRole(supabase, user.id)
    if (!role) return { success: false, error: roleError ?? "Profil non trouvé" }
    if (role !== "admin" && role !== "collaborateur") {
      return { success: false, error: "Accès non autorisé" }
    }

    // Vérifier la propriété pour les collaborateurs
    let fetchQuery = (supabase as AnyClient)
      .from("rental_vehicles")
      .select("brand, model, year")
      .eq("id", id)
    if (role === "collaborateur") {
      fetchQuery = fetchQuery.eq("created_by", user.id)
    }
    const { data: existing, error: fetchError } = await fetchQuery.single()
    if (fetchError || !existing) {
      return { success: false, error: "Vous n'êtes pas autorisé à modifier ce véhicule" }
    }

    const brand = String(formData.brand ?? existing.brand)
    const model = String(formData.model ?? existing.model)
    const year = Number(formData.year ?? existing.year)
    const slug = generateRentalSlug(brand, model, year)

    const { error: updateError } = await (supabase as AnyClient)
      .from("rental_vehicles")
      .update({
        brand,
        model,
        version: formData.version ?? null,
        year,
        vehicle_type: formData.vehicle_type ?? null,
        fuel: formData.fuel ?? null,
        transmission: formData.transmission ?? null,
        body: formData.body ?? null,
        seats: formData.seats ? Number(formData.seats) : null,
        doors: formData.doors ? Number(formData.doors) : null,
        color: formData.color ?? null,
        mileage: formData.mileage ? Number(formData.mileage) : null,
        power_hp: formData.power_hp ? Number(formData.power_hp) : null,
        description_fr: formData.description_fr ?? null,
        description_en: formData.description_en ?? null,
        price_per_day: Number(formData.price_per_day),
        price_per_hour: formData.price_per_hour ? Number(formData.price_per_hour) : null,
        pricing_tiers: formData.pricing_tiers ?? [],
        weekend_surcharge: Number(formData.weekend_surcharge ?? 0),
        holiday_surcharge: Number(formData.holiday_surcharge ?? 0),
        deposit_amount: Number(formData.deposit_amount ?? 0),
        deposit_percentage: Number(formData.deposit_percentage ?? 30),
        included_km_per_day: Number(formData.included_km_per_day ?? 200),
        extra_km_price: Number(formData.extra_km_price ?? 0.25),
        status: (formData.status as RentalVehicleStatus) ?? "disponible",
        slug,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      console.error("updateRentalVehicle error:", updateError)
      return { success: false, error: "Erreur lors de la mise à jour" }
    }

    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin/locations/vehicules`)
      revalidatePath(`/${locale}/admin/locations/vehicules/${id}/modifier`)
      revalidatePath(`/${locale}/location`)
    })

    return { success: true, vehicleId: id }
  } catch (err) {
    console.error("updateRentalVehicle unexpected:", err)
    return { success: false, error: "Une erreur inattendue est survenue" }
  }
}

// ─── getAdminOccupiedRanges ───────────────────────────────────────────────────

export async function getAdminOccupiedRanges(
  vehicleId: string,
  year: number,
  month: number
): Promise<OccupiedDateRange[]> {
  return getVehicleOccupiedDates(vehicleId, year, month)
}

// ─── deleteRentalVehicle ──────────────────────────────────────────────────────

export async function deleteRentalVehicle(id: string): Promise<ActionResult> {
  try {
    const supabase = await createActionClient()
    const { user, error: authError } = await getAuthedUser(supabase)
    if (!user) return { success: false, error: authError ?? "Non authentifié" }

    const { role, error: roleError } = await getRole(supabase, user.id)
    if (!role) return { success: false, error: roleError ?? "Profil non trouvé" }
    if (role !== "admin") return { success: false, error: "Admin requis" }

    // Vérifier qu'il n'y a pas de réservation active
    const { count: activeCount } = await (supabase as AnyClient)
      .from("rentals")
      .select("*", { count: "exact", head: true })
      .eq("rental_vehicle_id", id)
      .not("status", "in", '("cancelled","no_show","completed")')

    if (activeCount && activeCount > 0) {
      return {
        success: false,
        error: `Impossible de supprimer : ${activeCount} réservation(s) active(s) sur ce véhicule.`,
      }
    }

    const { error: deleteError } = await (supabase as AnyClient)
      .from("rental_vehicles")
      .delete()
      .eq("id", id)

    if (deleteError) {
      return { success: false, error: "Erreur lors de la suppression" }
    }

    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin/locations/vehicules`)
      revalidatePath(`/${locale}/location`)
    })

    return { success: true }
  } catch (err) {
    console.error("deleteRentalVehicle error:", err)
    return { success: false, error: "Erreur inattendue" }
  }
}

// ─── toggleRentalVehicleStatus ────────────────────────────────────────────────

export async function toggleRentalVehicleStatus(
  id: string,
  status: RentalVehicleStatus
): Promise<ActionResult> {
  try {
    const supabase = await createActionClient()
    const { user, error: authError } = await getAuthedUser(supabase)
    if (!user) return { success: false, error: authError ?? "Non authentifié" }

    const { role } = await getRole(supabase, user.id)
    if (role !== "admin" && role !== "collaborateur") {
      return { success: false, error: "Accès non autorisé" }
    }

    let query = (supabase as AnyClient)
      .from("rental_vehicles")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (role === "collaborateur") {
      query = query.eq("created_by", user.id)
    }

    const { error } = await query
    if (error) return { success: false, error: "Erreur lors de la mise à jour" }

    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin/locations/vehicules`)
      revalidatePath(`/${locale}/location`)
    })

    return { success: true }
  } catch (err) {
    return { success: false, error: "Erreur inattendue" }
  }
}
