// =============================================================================
// Fonctions DB — Feature Location
// Pattern identique à src/lib/vehicles.ts
// =============================================================================

import { createClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/utils"

type AnyClient = any

/** createClient() retourne un client typé Database qui ne connaît pas les tables rental_*.
 *  On cast en any pour les requêtes sur ces tables. */
async function getClient(): Promise<AnyClient> {
  return await createClient() as AnyClient
}
import type {
  RentalVehicle,
  RentalVehicleWithStats,
  RentalOption,
  Rental,
  RentalStatus,
  OccupiedDateRange,
} from "@/types/rental"

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface RentalVehiclesFilters {
  vehicle_type?: string
  seats?: number
  fuel?: string
}

export interface RentalVehiclesListParams {
  page?: number
  perPage?: number
  status?: string
  createdBy?: string
}

export interface RentalVehiclesListResult {
  vehicles: RentalVehicleWithStats[]
  total: number
  pages: number
  page: number
  perPage: number
}

export interface RentalsListParams {
  status?: RentalStatus | "all"
  vehicleId?: string
  page?: number
  perPage?: number
}

export interface RentalsListResult {
  rentals: Rental[]
  total: number
  pages: number
  page: number
  perPage: number
}

// ─── PUBLIC — Catalogue location ─────────────────────────────────────────────

/**
 * Récupère les véhicules disponibles à la location (status = 'disponible').
 * Utilisé sur la page publique /location.
 */
export async function getRentalVehicles(
  filters: RentalVehiclesFilters = {}
): Promise<RentalVehicle[]> {
  const supabase = await getClient()

  let query = supabase
    .from("rental_vehicles")
    .select("*")
    .eq("status", "disponible")
    .order("price_per_day", { ascending: true })

  if (filters.vehicle_type) {
    query = query.eq("vehicle_type", filters.vehicle_type)
  }
  if (filters.fuel) {
    query = query.eq("fuel", filters.fuel)
  }
  if (filters.seats) {
    query = query.gte("seats", filters.seats)
  }

  const { data, error } = await query

  if (error) {
    console.error("getRentalVehicles error:", error)
    return []
  }

  return (data as RentalVehicle[]) ?? []
}

// ─── PUBLIC — Détail véhicule ─────────────────────────────────────────────────

/**
 * Récupère un véhicule de location par son slug avec ses options actives.
 * Retourne null si introuvable.
 */
export async function getRentalVehicleBySlug(slug: string): Promise<{
  vehicle: RentalVehicle
  options: RentalOption[]
} | null> {
  const supabase = await getClient()

  const [vehicleResult, optionsResult] = await Promise.all([
    supabase
      .from("rental_vehicles")
      .select("*")
      .eq("slug", slug)
      .eq("status", "disponible")
      .single(),
    supabase
      .from("rental_options")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ])

  if (vehicleResult.error || !vehicleResult.data) {
    return null
  }

  return {
    vehicle: vehicleResult.data as RentalVehicle,
    options: (optionsResult.data as RentalOption[]) ?? [],
  }
}

// ─── PUBLIC — Dates occupées pour le calendrier ───────────────────────────────

/**
 * Retourne les plages de dates occupées pour un véhicule sur un mois donné.
 * Utilisé par le DatePicker pour désactiver les jours non disponibles.
 */
export async function getVehicleOccupiedDates(
  vehicleId: string,
  year: number,
  month: number
): Promise<OccupiedDateRange[]> {
  const supabase = await getClient()

  // Calcule le premier et dernier jour du mois
  const firstDay = new Date(Date.UTC(year, month - 1, 1)).toISOString()
  const lastDay = new Date(Date.UTC(year, month, 0, 23, 59, 59)).toISOString()

  const { data, error } = await supabase
    .from("rentals")
    .select("start_date, end_date")
    .eq("rental_vehicle_id", vehicleId)
    .not("status", "in", '("cancelled","no_show","completed")')
    // Sélectionne les réservations qui chevauchent le mois demandé
    .lte("start_date", lastDay)
    .gte("end_date", firstDay)

  if (error) {
    console.error("getVehicleOccupiedDates error:", error)
    return []
  }

  return (data as OccupiedDateRange[]) ?? []
}

// ─── ADMIN — Liste des véhicules avec stats ───────────────────────────────────

/**
 * Liste paginée des véhicules de location pour l'interface admin.
 * Utilise la vue rental_vehicles_with_stats.
 */
export async function getRentalVehiclesList(
  params: RentalVehiclesListParams = {}
): Promise<RentalVehiclesListResult> {
  const { page = 1, perPage = 20, status, createdBy } = params
  const supabase = await getClient()

  let query = supabase
    .from("rental_vehicles_with_stats")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })

  if (status && status !== "all") {
    query = query.eq("status", status)
  }
  if (createdBy) {
    query = query.eq("created_by", createdBy)
  }

  const from = (page - 1) * perPage
  query = query.range(from, from + perPage - 1)

  const { data, error, count } = await query

  if (error) {
    console.error("getRentalVehiclesList error:", error)
    return { vehicles: [], total: 0, pages: 0, page, perPage }
  }

  return {
    vehicles: (data as RentalVehicleWithStats[]) ?? [],
    total: count ?? 0,
    pages: Math.ceil((count ?? 0) / perPage),
    page,
    perPage,
  }
}

// ─── ADMIN — Détail réservation ───────────────────────────────────────────────

/**
 * Récupère une réservation complète avec le véhicule jointé.
 * Retourne null si introuvable ou accès non autorisé (RLS).
 */
export async function getRental(id: string): Promise<Rental | null> {
  const supabase = await getClient()

  const { data, error } = await supabase
    .from("rentals")
    .select(
      `
      *,
      rental_vehicle:rental_vehicles (*)
    `
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error("getRental error:", error)
    return null
  }

  return data as Rental
}

// ─── ADMIN — Liste des réservations ──────────────────────────────────────────

/**
 * Liste paginée des réservations pour l'interface admin.
 * Filtrable par statut et par véhicule.
 */
export async function getRentalsList(
  params: RentalsListParams = {}
): Promise<RentalsListResult> {
  const { status, vehicleId, page = 1, perPage = 20 } = params
  const supabase = await getClient()

  let query = supabase
    .from("rentals")
    .select(
      `
      *,
      rental_vehicle:rental_vehicles (
        id, brand, model, year, slug, cover_photo
      )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })

  if (status && status !== "all") {
    query = query.eq("status", status)
  }
  if (vehicleId) {
    query = query.eq("rental_vehicle_id", vehicleId)
  }

  const from = (page - 1) * perPage
  query = query.range(from, from + perPage - 1)

  const { data, error, count } = await query

  if (error) {
    console.error("getRentalsList error:", error)
    return { rentals: [], total: 0, pages: 0, page, perPage }
  }

  return {
    rentals: (data as Rental[]) ?? [],
    total: count ?? 0,
    pages: Math.ceil((count ?? 0) / perPage),
    page,
    perPage,
  }
}

// ─── Vérification de disponibilité (RPC) ─────────────────────────────────────

/**
 * Vérifie la disponibilité d'un véhicule via la fonction SQL check_rental_availability.
 * Retourne true si le véhicule est libre sur la plage donnée.
 *
 * @param excludeRentalId - ID de la réservation à exclure (utile lors d'une modification)
 */
export async function checkRentalAvailability(
  vehicleId: string,
  start: Date,
  end: Date,
  excludeRentalId?: string
): Promise<boolean> {
  const supabase = await getClient()

  const { data, error } = await supabase.rpc("check_rental_availability", {
    p_vehicle_id: vehicleId,
    p_start: start.toISOString(),
    p_end: end.toISOString(),
    p_exclude_rental_id: excludeRentalId ?? null,
  })

  if (error) {
    console.error("checkRentalAvailability error:", error)
    // En cas d'erreur DB, on refuse la réservation par sécurité
    return false
  }

  return data === true
}

// ─── Génération de slug ───────────────────────────────────────────────────────

/**
 * Génère un slug unique pour un véhicule de location.
 * Format : "peugeot-308-2022-location"
 * Le suffixe "-location" évite tout conflit avec les slugs du catalogue de vente.
 */
export function generateRentalSlug(brand: string, model: string, year: number): string {
  const base = slugify(`${brand} ${model} ${year}`)
  return `${base}-location`
}
