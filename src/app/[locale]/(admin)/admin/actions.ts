"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import type { VehicleStatus } from "@/types/database"

// ─── Auth guard commun ──────────────────────────────────────────────────────

async function requireAdmin(supabase: ReturnType<typeof createAdminClient>) {
  const { data: { user }, error } = await (supabase as any).auth.getUser()
  if (error || !user) throw new Error("Non authentifié")
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  const role = (profile as { role: string } | null)?.role
  if (!role || (role !== "admin" && role !== "collaborateur")) {
    throw new Error("Accès non autorisé")
  }
  return { user, role }
}

// ─── STATS DASHBOARD ────────────────────────────────────────────────────────

export async function getDashboardStats() {
  try {
    const supabase = await createClient()
    await requireAdmin(supabase)

    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      { count: publishedCount },
      { count: draftCount },
      { count: soldThisMonth },
      { count: unreadMessages },
    ] = await Promise.all([
      supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .eq("status", "publie"),
      supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .eq("status", "brouillon"),
      supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .eq("status", "vendu")
        .gte("sold_at", firstDayOfMonth.toISOString()),
      supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("status", "non_lu"),
    ])

    return {
      success: true,
      stats: {
        published: publishedCount ?? 0,
        drafts: draftCount ?? 0,
        soldThisMonth: soldThisMonth ?? 0,
        unreadMessages: unreadMessages ?? 0,
      },
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      success: false,
      error: "Erreur lors du chargement des statistiques",
      stats: { published: 0, drafts: 0, soldThisMonth: 0, unreadMessages: 0 },
    }
  }
}

// ─── DERNIÈRES ANNONCES ─────────────────────────────────────────────────────

export async function getLatestVehicles(limit = 5) {
  try {
    const supabase = await createClient()
    await requireAdmin(supabase)

    const { data: vehicles, error } = await supabase
      .from("vehicles")
      .select(`
        id,
        brand,
        model,
        version,
        year,
        price,
        status,
        published_at,
        vehicle_photos (url, is_primary)
      `)
      .eq("status", "publie")
      .order("published_at", { ascending: false })
      .limit(limit)

    if (error) throw error

    return {
      success: true,
      vehicles: (vehicles as any[])?.map((v) => ({
        ...v,
        coverPhoto: v.vehicle_photos?.find((p: any) => p.is_primary)?.url || 
                    v.vehicle_photos?.[0]?.url,
      })) || [],
    }
  } catch (error) {
    console.error("Error fetching latest vehicles:", error)
    return { success: false, error: "Erreur lors du chargement", vehicles: [] }
  }
}

// ─── LISTE ANNONCES AVEC FILTRES ────────────────────────────────────────────

export interface VehicleFilters {
  search?: string
  status?: VehicleStatus | "all"
  type?: string
  collaborator?: string
  page?: number
  perPage?: number
}

export async function getVehiclesList(filters: VehicleFilters = {}) {
  try {
    const supabase = await createClient()
    await requireAdmin(supabase)

    const {
      search,
      status = "all",
      type = "all",
      collaborator = "all",
      page = 1,
      perPage = 20,
    } = filters

    let query = supabase
      .from("vehicles")
      .select(
        `
        id,
        slug,
        brand,
        model,
        version,
        year,
        mileage,
        price,
        fuel,
        transmission,
        status,
        vehicle_type,
        is_featured,
        views_count,
        created_at,
        published_at,
        created_by,
        profiles (full_name),
        vehicle_photos (url, is_primary)
      `,
        { count: "exact" }
      )

    // Appliquer les filtres
    if (status !== "all") {
      query = query.eq("status", status)
    }

    if (type !== "all") {
      query = query.eq("vehicle_type", type)
    }

    if (collaborator !== "all") {
      query = query.eq("created_by", collaborator)
    }

    if (search) {
      query = query.or(`brand.ilike.%${search}%,model.ilike.%${search}%`)
    }

    // Pagination
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    const { data: vehicles, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) throw error

    const formattedVehicles = (vehicles as any[])?.map((v) => ({
      id: v.id,
      slug: v.slug,
      brand: v.brand,
      model: v.model,
      version: v.version,
      year: v.year,
      mileage: v.mileage,
      price: v.price,
      fuel: v.fuel,
      transmission: v.transmission,
      status: v.status,
      vehicle_type: v.vehicle_type,
      is_featured: v.is_featured,
      views_count: v.views_count ?? 0,
      created_at: v.created_at,
      published_at: v.published_at,
      created_by: v.profiles?.full_name || "Inconnu",
      coverPhoto:
        v.vehicle_photos?.find((p: any) => p.is_primary)?.url ||
        v.vehicle_photos?.[0]?.url,
    }))

    return {
      success: true,
      vehicles: formattedVehicles || [],
      total: count || 0,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage),
    }
  } catch (error) {
    console.error("Error fetching vehicles list:", error)
    return {
      success: false,
      error: "Erreur lors du chargement des annonces",
      vehicles: [],
      total: 0,
      page: 1,
      perPage: 20,
      totalPages: 0,
    }
  }
}

// ─── COLLABORATEURS ─────────────────────────────────────────────────────────

export async function getCollaborators() {
  try {
    const supabase = await createClient()
    const { role } = await requireAdmin(supabase)
    if (role !== "admin") throw new Error("Accès réservé aux administrateurs")

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select(`
        id,
        email,
        full_name,
        role,
        is_active,
        created_at
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Récupérer last_sign_in_at depuis auth.users via le service role
    const adminClient = createAdminClient()
    const { data: authData } = await adminClient.auth.admin.listUsers()
    const lastSignInMap: Record<string, string | null> = {}
    if (authData?.users) {
      for (const u of authData.users) {
        lastSignInMap[u.id] = u.last_sign_in_at ?? null
      }
    }

    // Récupérer le nombre d'annonces par collaborateur
    const { data: vehicleCounts } = await supabase
      .from("vehicles")
      .select("created_by")
      .in(
        "created_by",
        (profiles as any[])?.map((p) => p.id) || []
      )

    const countsByUser = (vehicleCounts as any[])?.reduce((acc, v) => {
      acc[v.created_by] = (acc[v.created_by] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const formattedProfiles = (profiles as any[])?.map((p) => ({
      ...p,
      last_sign_in_at: lastSignInMap[p.id] ?? null,
      vehicleCount: countsByUser?.[p.id] || 0,
    }))

    return { success: true, collaborators: formattedProfiles || [] }
  } catch (error) {
    console.error("Error fetching collaborators:", error)
    return { success: false, error: "Erreur lors du chargement", collaborators: [] }
  }
}

// ─── COLLABORATEURS ACTIONS ──────────────────────────────────────────────────

export async function toggleCollaboratorStatus(userId: string, isActive: boolean) {
  try {
    const supabase = await createClient()
    const { role } = await requireAdmin(supabase)
    if (role !== "admin") throw new Error("Accès réservé aux administrateurs")
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: isActive } as never)
      .eq("id", userId)
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Error toggling collaborator status:", error)
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

export async function changeCollaboratorRole(userId: string, newRole: "admin" | "collaborateur") {
  try {
    const supabase = await createClient()
    const { role } = await requireAdmin(supabase)
    if (role !== "admin") throw new Error("Accès réservé aux administrateurs")
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole } as never)
      .eq("id", userId)
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Error changing collaborator role:", error)
    return { success: false, error: "Erreur lors du changement de rôle" }
  }
}

export async function deleteCollaborator(userId: string) {
  try {
    const supabaseCheck = await createClient()
    const { role } = await requireAdmin(supabaseCheck)
    if (role !== "admin") throw new Error("Accès réservé aux administrateurs")

    const adminClient = createAdminClient()
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)
    if (authError) throw new Error(`Auth deletion failed: ${authError.message}`)

    // 2. Supprimer le profil DB. Si ça échoue, l'utilisateur ne peut de toute
    //    façon plus se connecter (Auth supprimé). On log sans bloquer.
    const supabase = await createClient()
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId)
    if (profileError) {
      console.error("Profile deletion failed after Auth deletion:", profileError)
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting collaborator:", error)
    return { success: false, error: "Erreur lors de la suppression" }
  }
}

// ─── MESSAGES ───────────────────────────────────────────────────────────────

export async function getMessages(status?: string) {
  try {
    const supabase = await createClient()
    await requireAdmin(supabase)

    let query = supabase
      .from("contact_messages")
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        message,
        status,
        created_at,
        vehicle_id,
        vehicles (brand, model, year)
      `)
      .order("created_at", { ascending: false })

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    const { data: messages, error } = await query

    if (error) throw error

    const formattedMessages = (messages as any[])?.map((m) => ({
      id: m.id,
      firstName: m.first_name,
      lastName: m.last_name,
      email: m.email,
      phone: m.phone || null,
      message: m.message,
      status: m.status,
      createdAt: m.created_at,
      vehicleId: m.vehicle_id,
      vehicleInfo: m.vehicles
        ? `${m.vehicles.brand} ${m.vehicles.model} (${m.vehicles.year})`
        : null,
    }))

    return { success: true, messages: formattedMessages || [] }
  } catch (error) {
    console.error("Error fetching messages:", error)
    return { success: false, error: "Erreur lors du chargement", messages: [] }
  }
}

// ─── ACTIONS MESSAGES ───────────────────────────────────────────────────────

export async function updateMessageStatus(
  id: string,
  status: "lu" | "traite" | "archive"
) {
  try {
    const supabase = await createClient()
    await requireAdmin(supabase)

    const updateData: Record<string, string> = { status }
    
    if (status === "lu") {
      updateData.read_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from("contact_messages")
      .update(updateData as never)
      .eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error updating message:", error)
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

// ─── RENTAL DASHBOARD STATS ─────────────────────────────────────────────────

export async function getRentalDashboardStats() {
  try {
    const supabase = await createClient()
    const { user, role } = await requireAdmin(supabase)

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
    const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).toISOString()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // For collaborateurs, restrict to their own vehicles
    let ownVehicleIds: string[] | null = null
    if (role === "collaborateur") {
      const { data: ownVehicles } = await supabase
        .from("rental_vehicles")
        .select("id")
        .eq("created_by", user.id)
      ownVehicleIds = (ownVehicles as { id: string }[] | null)?.map((v) => v.id) ?? []
    }

    // Build queries with optional vehicle filtering
    let availableQuery = supabase
      .from("rental_vehicles")
      .select("*", { count: "exact", head: true })
      .eq("status", "disponible")
    if (ownVehicleIds !== null) {
      availableQuery = availableQuery.in("id", ownVehicleIds.length > 0 ? ownVehicleIds : ["__none__"])
    }

    let activeQuery = supabase
      .from("rentals")
      .select("*", { count: "exact", head: true })
      .in("status", ["in_progress", "confirmed", "deposit_paid"])
      .lte("start_date", todayEnd)
      .gte("end_date", todayStart)
    if (ownVehicleIds !== null) {
      activeQuery = activeQuery.in("rental_vehicle_id", ownVehicleIds.length > 0 ? ownVehicleIds : ["__none__"])
    }

    let upcomingQuery = supabase
      .from("rentals")
      .select("*", { count: "exact", head: true })
      .in("status", ["confirmed", "deposit_paid", "pending"])
      .gt("start_date", todayEnd)
      .lte("start_date", weekEnd)
    if (ownVehicleIds !== null) {
      upcomingQuery = upcomingQuery.in("rental_vehicle_id", ownVehicleIds.length > 0 ? ownVehicleIds : ["__none__"])
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queries: any[] = [availableQuery, activeQuery, upcomingQuery]

    // Only fetch revenue for admins
    if (role === "admin") {
      queries.push(
        supabase
          .from("rentals")
          .select("total_amount")
          .in("status", ["confirmed", "deposit_paid", "in_progress", "completed"])
          .gte("created_at", firstDayOfMonth)
      )
    }

    const results = await Promise.all(queries) as any[]

    const monthlyRevenue =
      role === "admin"
        ? ((results[3]?.data as { total_amount: number }[]) ?? []).reduce(
            (sum, r) => sum + (r.total_amount ?? 0),
            0
          )
        : 0

    return {
      success: true,
      stats: {
        availableVehicles: results[0].count ?? 0,
        activeReservations: results[1].count ?? 0,
        upcomingReservations: results[2].count ?? 0,
        monthlyRevenue,
      },
    }
  } catch (error) {
    console.error("Error fetching rental dashboard stats:", error)
    return {
      success: false,
      stats: {
        availableVehicles: 0,
        activeReservations: 0,
        upcomingReservations: 0,
        monthlyRevenue: 0,
      },
    }
  }
}

// ─── RENTAL CALENDAR EVENTS ─────────────────────────────────────────────────

export async function getRentalCalendarEvents(startDate: string, endDate: string) {
  try {
    const supabase = await createClient()
    const { user, role } = await requireAdmin(supabase)

    let query = supabase
      .from("rentals")
      .select(
        `id, reference, start_date, end_date, status,
         client_first_name, client_last_name,
         rental_vehicle:rental_vehicles(id, brand, model, created_by)`
      )
      .not("status", "in", '("cancelled","no_show")')
      .lte("start_date", endDate)
      .gte("end_date", startDate)
      .order("start_date", { ascending: true })

    // For collaborateurs, filter to own vehicles
    if (role === "collaborateur") {
      const { data: ownVehicles } = await supabase
        .from("rental_vehicles")
        .select("id")
        .eq("created_by", user.id)
      const ownIds = (ownVehicles as { id: string }[] | null)?.map((v) => v.id) ?? []
      query = query.in("rental_vehicle_id", ownIds.length > 0 ? ownIds : ["__none__"])
    }

    const { data, error } = await query

    if (error) throw error

    return {
      success: true,
      events: (data as any[]) ?? [],
    }
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    return { success: false, events: [] }
  }
}

// ─── UPCOMING RENTALS (TODAY & TOMORROW) ────────────────────────────────────

export async function getUpcomingRentals() {
  try {
    const supabase = await createClient()
    const { user, role } = await requireAdmin(supabase)

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const dayAfterTomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 2
    ).toISOString()

    let query = supabase
      .from("rentals")
      .select(
        `id, reference, start_date, end_date, status,
         client_first_name, client_last_name, client_email, client_phone,
         contract_url,
         rental_vehicle:rental_vehicles(id, brand, model, slug)`
      )
      .not("status", "in", '("cancelled","no_show")')
      .lte("start_date", dayAfterTomorrow)
      .gte("end_date", todayStart)
      .order("start_date", { ascending: true })

    // For collaborateurs, filter to own vehicles
    if (role === "collaborateur") {
      const { data: ownVehicles } = await supabase
        .from("rental_vehicles")
        .select("id")
        .eq("created_by", user.id)
      const ownIds = (ownVehicles as { id: string }[] | null)?.map((v) => v.id) ?? []
      query = query.in("rental_vehicle_id", ownIds.length > 0 ? ownIds : ["__none__"])
    }

    const { data, error } = await query

    if (error) throw error

    return {
      success: true,
      rentals: (data as any[]) ?? [],
    }
  } catch (error) {
    console.error("Error fetching upcoming rentals:", error)
    return { success: false, rentals: [] }
  }
}

// ─── COLLABORATOR TODAY TASKS ──────────────────────────────────────────────

export async function getCollaboratorTodayTasks() {
  try {
    const supabase = await createClient()
    const { user, role } = await requireAdmin(supabase)

    const now = new Date()
    const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      .toISOString()
      .split("T")[0]

    // Get own vehicle IDs for collaborateurs
    let vehicleFilter: string[] | null = null
    if (role === "collaborateur") {
      const { data: ownVehicles } = await supabase
        .from("rental_vehicles")
        .select("id")
        .eq("created_by", user.id)
      vehicleFilter = (ownVehicles as { id: string }[] | null)?.map((v) => v.id) ?? []
    }

    // Departures today (start_date = today)
    let departuresQuery = supabase
      .from("rentals")
      .select(
        `id, reference, start_date, end_date, status,
         client_first_name, client_last_name,
         rental_vehicle:rental_vehicles(id, brand, model)`
      )
      .eq("start_date", todayStr)
      .not("status", "in", '("cancelled","no_show","completed")')
      .order("start_date", { ascending: true })
    if (vehicleFilter !== null) {
      departuresQuery = departuresQuery.in(
        "rental_vehicle_id",
        vehicleFilter.length > 0 ? vehicleFilter : ["__none__"]
      )
    }

    // Returns today (end_date = today)
    let returnsQuery = supabase
      .from("rentals")
      .select(
        `id, reference, start_date, end_date, status,
         client_first_name, client_last_name,
         rental_vehicle:rental_vehicles(id, brand, model)`
      )
      .eq("end_date", todayStr)
      .not("status", "in", '("cancelled","no_show","completed")')
      .order("end_date", { ascending: true })
    if (vehicleFilter !== null) {
      returnsQuery = returnsQuery.in(
        "rental_vehicle_id",
        vehicleFilter.length > 0 ? vehicleFilter : ["__none__"]
      )
    }

    const [departuresRes, returnsRes] = await Promise.all([departuresQuery, returnsQuery])

    if (departuresRes.error) throw departuresRes.error
    if (returnsRes.error) throw returnsRes.error

    return {
      success: true,
      departures: (departuresRes.data as any[]) ?? [],
      returns: (returnsRes.data as any[]) ?? [],
    }
  } catch (error) {
    console.error("Error fetching collaborator today tasks:", error)
    return { success: false, departures: [], returns: [] }
  }
}

// ─── EXPORT CSV ─────────────────────────────────────────────────────────────

export async function exportVehiclesToCSV(filters: VehicleFilters = {}) {
  try {
    // Auth checked transitively via getVehiclesList → requireAdmin
    const result = await getVehiclesList({ ...filters, perPage: 10000 })

    if (!result.success) {
      return { success: false, error: result.error }
    }

    const headers = [
      "ID",
      "Marque",
      "Modèle",
      "Année",
      "Kilométrage",
      "Prix",
      "Carburant",
      "Statut",
      "Créé par",
      "Date publication",
    ]

    const rows = result.vehicles.map((v) => [
      v.id,
      v.brand,
      v.model,
      v.year,
      v.mileage,
      v.price,
      v.fuel,
      v.status,
      v.created_by,
      v.published_at || "-",
    ])

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n")

    return { success: true, csv }
  } catch (error) {
    console.error("Error exporting CSV:", error)
    return { success: false, error: "Erreur lors de l'export" }
  }
}

// ─── ACTIONS MASSE ANNONCES ─────────────────────────────────────────────────

export async function bulkUpdateVehicleStatus(
  ids: string[],
  status: VehicleStatus
) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { success: false, error: "Non authentifié" }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single<{ role: string }>()
    if (!profileData) return { success: false, error: "Profil non trouvé" }

    let targetIds = ids

    if (profileData.role === "collaborateur") {
      // Filtrer : ne traiter que les véhicules dont created_by === user.id
      const { data: owned } = await supabase
        .from("vehicles")
        .select("id")
        .in("id", ids)
        .eq("created_by", user.id)
      targetIds = (owned ?? []).map((v: { id: string }) => v.id)
      if (targetIds.length === 0) return { success: false, error: "Aucune annonce autorisée" }
    } else if (profileData.role !== "admin") {
      return { success: false, error: "Accès non autorisé" }
    }

    const updateData: Record<string, string | null> = { status }

    if (status === "publie") {
      updateData.published_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from("vehicles")
      .update(updateData as never)
      .in("id", targetIds)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error bulk updating:", error)
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

export async function bulkDeleteVehicles(ids: string[]) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { success: false, error: "Non authentifié" }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single<{ role: string }>()
    if (!profileData || profileData.role !== "admin") {
      return { success: false, error: "Accès non autorisé - Admin requis" }
    }

    const { error } = await supabase.from("vehicles").delete().in("id", ids)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error bulk deleting:", error)
    return { success: false, error: "Erreur lors de la suppression" }
  }
}
