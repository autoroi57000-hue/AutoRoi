"use server"

import { revalidatePath } from "next/cache"
import { createActionClient } from "@/lib/supabase/server"
import { sendRentalEmail } from "@/lib/rental-emails"
import { generateRentalContract } from "@/lib/rental-contract"
import { LOCALES } from "@/lib/constants"
import type { RentalStatus, Rental } from "@/types/rental"

type AnyClient = any

interface ActionResult {
  success: boolean
  error?: string
}

// ─── Auth helpers (identique aux autres actions.ts du projet) ─────────────────

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

// Vérifie que le collaborateur a accès à cette réservation
// (le véhicule loué doit lui appartenir)
async function canAccessRental(
  supabase: AnyClient,
  rentalId: string,
  userId: string
): Promise<boolean> {
  const { data } = await (supabase as AnyClient)
    .from("rentals")
    .select("rental_vehicle_id, rental_vehicles!inner(created_by)")
    .eq("id", rentalId)
    .eq("rental_vehicles.created_by", userId)
    .single()
  return !!data
}

// ─── getLiRentalsList ─────────────────────────────────────────────────────────

export async function getRentalsList(params: {
  status?: string
  vehicleId?: string
  search?: string
  page?: number
  perPage?: number
}) {
  try {
    const supabase = await createActionClient()
    const { user, error: authError } = await getAuthedUser(supabase)
    if (!user) return { success: false, error: authError, rentals: [], total: 0, totalPages: 0 }

    const { role } = await getRole(supabase, user.id)
    if (!role) return { success: false, error: "Profil non trouvé", rentals: [], total: 0, totalPages: 0 }

    const page = params.page ?? 1
    const perPage = params.perPage ?? 20
    const from = (page - 1) * perPage

    let query = (supabase as AnyClient)
      .from("rentals")
      .select(
        `*, rental_vehicle:rental_vehicles(id, brand, model, year, cover_photo, slug)`,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, from + perPage - 1)

    // Collaborateur : uniquement les réservations de ses véhicules
    if (role === "collaborateur") {
      const { data: ownVehicles } = await (supabase as AnyClient)
        .from("rental_vehicles")
        .select("id")
        .eq("created_by", user.id)
      const ownIds = ((ownVehicles as { id: string }[]) ?? []).map((v) => v.id)
      if (ownIds.length === 0) {
        return { success: true, rentals: [], total: 0, totalPages: 0 }
      }
      query = query.in("rental_vehicle_id", ownIds)
    }

    if (params.status && params.status !== "all") {
      query = query.eq("status", params.status)
    }
    if (params.vehicleId) {
      query = query.eq("rental_vehicle_id", params.vehicleId)
    }
    if (params.search) {
      query = query.or(
        `reference.ilike.%${params.search}%,client_email.ilike.%${params.search}%,client_last_name.ilike.%${params.search}%`
      )
    }

    const { data, error, count } = await query
    if (error) {
      console.error("getRentalsList error:", error)
      return { success: false, error: error.message, rentals: [], total: 0, totalPages: 0 }
    }

    return {
      success: true,
      rentals: (data as Rental[]) ?? [],
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / perPage),
    }
  } catch (err) {
    console.error("getRentalsList unexpected:", err)
    return { success: false, error: "Erreur inattendue", rentals: [], total: 0, totalPages: 0 }
  }
}

// ─── getRentalsStats ──────────────────────────────────────────────────────────

export async function getRentalsStats() {
  try {
    const supabase = await createActionClient()
    const { user } = await getAuthedUser(supabase)
    if (!user) return { success: false, stats: null }

    const { role } = await getRole(supabase, user.id)
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // Pour les collaborateurs, filtrer sur leurs véhicules
    let vehicleFilter: string[] | null = null
    if (role === "collaborateur") {
      const { data: ownVehicles } = await (supabase as AnyClient)
        .from("rental_vehicles")
        .select("id")
        .eq("created_by", user.id)
      vehicleFilter = ((ownVehicles as { id: string }[]) ?? []).map((v) => v.id)
    }

    const applyFilter = (q: AnyClient) => {
      if (vehicleFilter) {
        return vehicleFilter.length > 0 ? q.in("rental_vehicle_id", vehicleFilter) : q.eq("id", "00000000-0000-0000-0000-000000000000")
      }
      return q
    }

    const [thisMonth, pending, inProgress, confirmed] = await Promise.all([
      applyFilter(
        (supabase as AnyClient)
          .from("rentals")
          .select("total_amount", { count: "exact" })
          .gte("created_at", firstDayOfMonth)
          .not("status", "in", '("cancelled","no_show")')
      ),
      applyFilter(
        (supabase as AnyClient)
          .from("rentals")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      applyFilter(
        (supabase as AnyClient)
          .from("rentals")
          .select("*", { count: "exact", head: true })
          .eq("status", "in_progress")
      ),
      applyFilter(
        (supabase as AnyClient)
          .from("rentals")
          .select("total_amount")
          .in("status", ["confirmed", "deposit_paid", "in_progress", "completed"])
          .gte("created_at", firstDayOfMonth)
      ),
    ])

    const confirmedRevenue = ((confirmed.data as { total_amount: number }[]) ?? []).reduce(
      (sum: number, r: { total_amount: number }) => sum + (r.total_amount ?? 0),
      0
    )

    return {
      success: true,
      stats: {
        thisMonth: thisMonth.count ?? 0,
        confirmedRevenue,
        pendingCount: pending.count ?? 0,
        inProgressCount: inProgress.count ?? 0,
      },
    }
  } catch (err) {
    console.error("getRentalsStats error:", err)
    return { success: false, stats: null }
  }
}

// ─── getRentalDetail ──────────────────────────────────────────────────────────

export async function getRentalDetail(id: string) {
  try {
    const supabase = await createActionClient()
    const { user } = await getAuthedUser(supabase)
    if (!user) return { success: false, error: "Non authentifié", rental: null, emailLogs: [] }

    const { role } = await getRole(supabase, user.id)

    const { data, error } = await (supabase as AnyClient)
      .from("rentals")
      .select("*, rental_vehicle:rental_vehicles(*)")
      .eq("id", id)
      .single()

    if (error || !data) {
      return { success: false, error: "Réservation introuvable", rental: null, emailLogs: [] }
    }

    // Vérifier accès collaborateur
    if (role === "collaborateur") {
      const rental = data as Rental
      if ((rental.rental_vehicle as any)?.created_by !== user.id) {
        return { success: false, error: "Accès non autorisé", rental: null, emailLogs: [] }
      }
    }

    // Charger le log emails
    const { data: emailLogs } = await (supabase as AnyClient)
      .from("rental_emails_log")
      .select("*")
      .eq("rental_id", id)
      .order("sent_at", { ascending: false })

    return {
      success: true,
      rental: data as Rental,
      emailLogs: (emailLogs ?? []) as any[],
    }
  } catch (err) {
    console.error("getRentalDetail error:", err)
    return { success: false, error: "Erreur inattendue", rental: null, emailLogs: [] }
  }
}

// ─── updateRentalStatus ───────────────────────────────────────────────────────

export async function updateRentalStatus(
  rentalId: string,
  newStatus: RentalStatus,
  reason?: string
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

    if (role === "collaborateur" && !(await canAccessRental(supabase, rentalId, user.id))) {
      return { success: false, error: "Accès non autorisé à cette réservation" }
    }

    const updateData: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }
    if (newStatus === "cancelled") {
      updateData.cancelled_at = new Date().toISOString()
      updateData.cancellation_reason = reason ?? null
    }

    const { error: updateError } = await (supabase as AnyClient)
      .from("rentals")
      .update(updateData)
      .eq("id", rentalId)

    if (updateError) {
      return { success: false, error: "Erreur lors de la mise à jour du statut" }
    }

    // Envoyer email selon le nouveau statut
    if (newStatus === "cancelled" || newStatus === "confirmed") {
      try {
        const { data: rental } = await (supabase as AnyClient)
          .from("rentals")
          .select("*, rental_vehicle:rental_vehicles(*)")
          .eq("id", rentalId)
          .single()
        if (rental) {
          if (newStatus === "cancelled") {
            await sendRentalEmail("cancellation", rental as Rental, { locale: "fr" })
          } else if (newStatus === "confirmed" && (rental as Rental).client_email) {
            await sendRentalEmail("admin_confirmed", rental as Rental, { locale: "fr" })
          }
        }
      } catch (emailErr) {
        console.error(`[Rental] Email ${newStatus} échoué:`, emailErr)
        // Ne pas throw — la réservation est confirmée/annulée quand même
      }
    }

    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin/locations`)
      revalidatePath(`/${locale}/admin/locations/${rentalId}`)
    })

    return { success: true }
  } catch (err) {
    console.error("updateRentalStatus error:", err)
    return { success: false, error: "Erreur inattendue" }
  }
}

// ─── updateRentalNotes ────────────────────────────────────────────────────────

export async function updateRentalNotes(
  rentalId: string,
  notes: string
): Promise<ActionResult> {
  try {
    const supabase = await createActionClient()
    const { user, error: authError } = await getAuthedUser(supabase)
    if (!user) return { success: false, error: authError ?? "Non authentifié" }

    const { role } = await getRole(supabase, user.id)
    if (role !== "admin" && role !== "collaborateur") {
      return { success: false, error: "Accès non autorisé" }
    }
    if (role === "collaborateur" && !(await canAccessRental(supabase, rentalId, user.id))) {
      return { success: false, error: "Accès non autorisé à cette réservation" }
    }

    const { error } = await (supabase as AnyClient)
      .from("rentals")
      .update({ internal_notes: notes, updated_at: new Date().toISOString() })
      .eq("id", rentalId)

    if (error) return { success: false, error: "Erreur lors de la sauvegarde" }

    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin/locations/${rentalId}`)
    })

    return { success: true }
  } catch (err) {
    console.error("updateRentalNotes error:", err)
    return { success: false, error: "Erreur inattendue" }
  }
}

// ─── regenerateContract ───────────────────────────────────────────────────────

export async function regenerateContract(rentalId: string): Promise<ActionResult & { url?: string }> {
  try {
    const supabase = await createActionClient()
    const { user, error: authError } = await getAuthedUser(supabase)
    if (!user) return { success: false, error: authError ?? "Non authentifié" }

    const { role } = await getRole(supabase, user.id)
    if (role !== "admin") return { success: false, error: "Admin requis" }

    const url = await generateRentalContract(rentalId)

    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin/locations/${rentalId}`)
    })

    return { success: true, url }
  } catch (err) {
    console.error("regenerateContract error:", err)
    return { success: false, error: "Erreur lors de la génération du contrat" }
  }
}

// ─── markDepositPaid ─────────────────────────────────────────────────────────

export async function markDepositPaid(rentalId: string): Promise<ActionResult> {
  try {
    const supabase = await createActionClient()
    const { user, error: authError } = await getAuthedUser(supabase)
    if (!user) return { success: false, error: authError ?? "Non authentifié" }

    const { role } = await getRole(supabase, user.id)
    if (role !== "admin") return { success: false, error: "Admin requis" }

    const { error } = await supabase
      .from("rentals")
      .update({
        deposit_paid: true,
        deposit_paid_at: new Date().toISOString(),
      } as never)
      .eq("id", rentalId)

    if (error) throw error

    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin/locations/${rentalId}`)
    })

    return { success: true }
  } catch (err) {
    console.error("markDepositPaid error:", err)
    return { success: false, error: "Erreur lors de la mise à jour du paiement" }
  }
}

// ─── sendManualReminder ───────────────────────────────────────────────────────

export async function sendManualReminder(rentalId: string): Promise<ActionResult> {
  try {
    const supabase = await createActionClient()
    const { user, error: authError } = await getAuthedUser(supabase)
    if (!user) return { success: false, error: authError ?? "Non authentifié" }

    const { role } = await getRole(supabase, user.id)
    if (role !== "admin" && role !== "collaborateur") {
      return { success: false, error: "Accès non autorisé" }
    }

    const { data: rental, error } = await (supabase as AnyClient)
      .from("rentals")
      .select("*, rental_vehicle:rental_vehicles(*)")
      .eq("id", rentalId)
      .single()

    if (error || !rental) return { success: false, error: "Réservation introuvable" }

    await sendRentalEmail("reminder_24h", rental as Rental, { locale: "fr" })

    return { success: true }
  } catch (err) {
    console.error("sendManualReminder error:", err)
    return { success: false, error: "Erreur lors de l'envoi du rappel" }
  }
}

// ─── getClientProfile ────────────────────────────────────────────────────────
// Agrège les données client à partir de toutes ses réservations (identifié par email)

export async function getClientProfile(clientEmail: string) {
  try {
    const supabase = await createActionClient()
    const { user, error: authError } = await getAuthedUser(supabase)
    if (!user) return { success: false, error: authError, client: null }

    const { role } = await getRole(supabase, user.id)
    if (!role || (role !== "admin" && role !== "collaborateur")) {
      return { success: false, error: "Accès non autorisé", client: null }
    }

    const isCollab = role === "collaborateur"

    // For collaborateurs, restrict to rentals on their own vehicles
    let rentalQuery = (supabase as AnyClient)
      .from("rentals")
      .select(
        `id, reference, start_date, end_date, total_amount, status, created_at,
         client_first_name, client_last_name, client_email, client_phone,
         client_address, client_city, client_postal_code,
         client_birth_date, client_license_number,
         is_business, business_name, business_siret,
         internal_notes, contract_url,
         rental_vehicle:rental_vehicles(id, brand, model, year, slug, created_by)`
      )
      .eq("client_email", clientEmail)
      .order("created_at", { ascending: false })

    if (isCollab) {
      const { data: ownVehicles } = await (supabase as AnyClient)
        .from("rental_vehicles")
        .select("id")
        .eq("created_by", user.id)
      const ownIds = (ownVehicles ?? []).map((v: any) => v.id)
      rentalQuery = rentalQuery.in("rental_vehicle_id", ownIds.length > 0 ? ownIds : ["__none__"])
    }

    const { data: rentals, error } = await rentalQuery

    if (error) throw error
    if (!rentals || rentals.length === 0) {
      return { success: false, error: "Client introuvable", client: null }
    }

    // Prendre les données client les plus récentes
    const latest = rentals[0] as any
    const completedCount = (rentals as any[]).filter(
      (r: any) => r.status === "completed"
    ).length
    const totalSpent = isCollab
      ? 0 // Collaborateurs ne voient pas les stats financières
      : (rentals as any[]).reduce(
          (sum: number, r: any) =>
            ["completed", "in_progress", "confirmed", "deposit_paid"].includes(r.status)
              ? sum + (r.total_amount ?? 0)
              : sum,
          0
        )

    // Statut client
    let clientStatus: "nouveau" | "regulier" | "vip" = "nouveau"
    if (completedCount >= 5 || totalSpent >= 5000) clientStatus = "vip"
    else if (completedCount >= 2) clientStatus = "regulier"

    return {
      success: true,
      client: {
        firstName: latest.client_first_name,
        lastName: latest.client_last_name,
        email: latest.client_email,
        phone: latest.client_phone,
        address: latest.client_address,
        city: latest.client_city,
        postalCode: latest.client_postal_code,
        birthDate: latest.client_birth_date,
        licenseNumber: latest.client_license_number,
        isBusiness: latest.is_business,
        businessName: latest.business_name,
        businessSiret: latest.business_siret,
        status: clientStatus,
        totalRentals: rentals.length,
        completedRentals: completedCount,
        totalSpent,
        // Hide internal notes for collaborateurs
        hideFinancials: isCollab,
        rentals: (rentals as any[]).map((r: any) => ({
          id: r.id,
          reference: r.reference,
          startDate: r.start_date,
          endDate: r.end_date,
          totalAmount: isCollab ? 0 : r.total_amount,
          status: r.status,
          createdAt: r.created_at,
          contractUrl: r.contract_url,
          vehicle: r.rental_vehicle
            ? `${r.rental_vehicle.brand} ${r.rental_vehicle.model}${r.rental_vehicle.year ? ` (${r.rental_vehicle.year})` : ""}`
            : "—",
        })),
      },
    }
  } catch (err) {
    console.error("getClientProfile error:", err)
    return { success: false, error: "Erreur inattendue", client: null }
  }
}

// ─── updateClientNotes ───────────────────────────────────────────────────────
// Met à jour les notes internes d'une réservation spécifique

export async function updateClientNotes(
  rentalId: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  return updateRentalNotes(rentalId, notes)
}

// ─── getContractData ─────────────────────────────────────────────────────────
// Retourne toutes les données nécessaires pour pré-remplir la modale de contrat

export async function getContractData(rentalId: string) {
  try {
    const supabase = await createActionClient()
    const { user, error: authError } = await getAuthedUser(supabase)
    if (!user) return { success: false, error: authError, data: null }

    const { data: rental, error } = await (supabase as AnyClient)
      .from("rentals")
      .select("*, rental_vehicle:rental_vehicles(*)")
      .eq("id", rentalId)
      .single()

    if (error || !rental) {
      return { success: false, error: "Réservation introuvable", data: null }
    }

    // Charger les settings entreprise
    const { data: settingsRows } = await (supabase as AnyClient)
      .from("site_settings")
      .select("key, value")
      .in("key", [
        "business_name",
        "business_address",
        "legal_siret",
        "legal_entity_name",
        "legal_form",
        "legal_address",
        "phone_number",
        "contact_email",
      ])

    const settings: Record<string, string> = {}
    if (settingsRows) {
      for (const row of settingsRows as { key: string; value: string }[]) {
        settings[row.key] = row.value
      }
    }

    // Numéro de contrat auto-généré
    const year = new Date().getFullYear()
    const { count } = await (supabase as AnyClient)
      .from("rentals")
      .select("*", { count: "exact", head: true })
      .not("contract_url", "is", null)
      .gte("created_at", `${year}-01-01`)

    const contractNumber = `CTR-${year}-${String((count ?? 0) + 1).padStart(4, "0")}`

    return {
      success: true,
      data: {
        rental: rental as Rental,
        settings,
        contractNumber,
      },
    }
  } catch (err) {
    console.error("getContractData error:", err)
    return { success: false, error: "Erreur inattendue", data: null }
  }
}

// ─── deleteRentals ─────────────────────────────────────────────────────────────
// Supprime une ou plusieurs réservations (admin uniquement)

export async function deleteRentals(ids: string[]): Promise<ActionResult> {
  try {
    if (!ids.length) return { success: false, error: "Aucune réservation sélectionnée" }

    const supabase = await createActionClient()
    const { user, error: authError } = await getAuthedUser(supabase)
    if (!user) return { success: false, error: authError ?? "Non authentifié" }

    const { role, error: roleError } = await getRole(supabase, user.id)
    if (!role) return { success: false, error: roleError ?? "Profil non trouvé" }
    if (role !== "admin") return { success: false, error: "Admin requis" }

    const { error: deleteError } = await (supabase as AnyClient)
      .from("rentals")
      .delete()
      .in("id", ids)

    if (deleteError) {
      console.error("deleteRentals error:", deleteError)
      return { success: false, error: "Erreur lors de la suppression" }
    }

    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin/locations`)
    })

    return { success: true }
  } catch (err) {
    console.error("deleteRentals error:", err)
    return { success: false, error: "Erreur inattendue" }
  }
}
