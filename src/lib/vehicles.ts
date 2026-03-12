import { createClient } from "@/lib/supabase/server"
import type { VehicleCard, VehicleSortKey } from "@/types/vehicle"
import type { FuelType, TransmissionType, BodyType, CtStatus, VehicleType } from "@/types/database"

// ─── Interfaces publiques ────────────────────────────────────────────────────

export interface CatalogFilters {
  q?: string
  type?: VehicleType
  marque?: string
  carburant?: FuelType
  prix_min?: number
  prix_max?: number
  annee_min?: number
  annee_max?: number
  km_max?: number
  transmission?: TransmissionType
  carrosserie?: BodyType
  ct?: CtStatus
  sort?: VehicleSortKey
}

export interface CatalogResult {
  vehicles: VehicleCard[]
  total: number
  pages: number
  page: number
  perPage: number
}

export interface FiltersData {
  brands: { name: string; count: number }[]
  types: { value: VehicleType; count: number }[]
  fuels: { value: FuelType; count: number }[]
  transmissions: { value: TransmissionType; count: number }[]
  bodies: { value: BodyType; count: number }[]
  priceRange: { min: number; max: number }
  yearRange: { min: number; max: number }
  kmMax: number
  total: number
}

// ─── getVehicles ─────────────────────────────────────────────────────────────

export async function getVehicles(
  filters: CatalogFilters,
  page = 1,
  perPage = 20
): Promise<CatalogResult> {
  const supabase = await createClient()

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
      fuel,
      mileage,
      price,
      price_negotiable,
      transmission,
      power_hp,
      body,
      condition,
      ct_status,
      status,
      is_featured,
      published_at,
      vehicle_photos (url, is_primary)
    `,
      { count: "exact" }
    )
    .eq("status", "publie")

  // ── Filtres texte ──
  if (filters.q?.trim()) {
    query = query.or(
      `brand.ilike.%${filters.q}%,model.ilike.%${filters.q}%,version.ilike.%${filters.q}%`
    )
  }

  // ── Filtres enum ──
  if (filters.type) query = query.eq("vehicle_type", filters.type)
  if (filters.marque) query = query.eq("brand", filters.marque)
  if (filters.carburant) query = query.eq("fuel", filters.carburant)
  if (filters.transmission) query = query.eq("transmission", filters.transmission)
  if (filters.carrosserie) query = query.eq("body", filters.carrosserie)
  if (filters.ct) query = query.eq("ct_status", filters.ct)

  // ── Filtres plage ──
  if (filters.prix_min) query = query.gte("price", filters.prix_min)
  if (filters.prix_max) query = query.lte("price", filters.prix_max)
  if (filters.annee_min) query = query.gte("year", filters.annee_min)
  if (filters.annee_max) query = query.lte("year", filters.annee_max)
  if (filters.km_max) query = query.lte("mileage", filters.km_max)

  // ── Tri ──
  switch (filters.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true })
      break
    case "price_desc":
      query = query.order("price", { ascending: false })
      break
    case "mileage_asc":
      query = query.order("mileage", { ascending: true })
      break
    case "year_desc":
      query = query.order("year", { ascending: false })
      break
    case "year_asc":
      query = query.order("year", { ascending: true })
      break
    default:
      query = query.order("is_featured", { ascending: false }).order("published_at", { ascending: false })
  }

  // ── Pagination ──
  const from = (page - 1) * perPage
  query = query.range(from, from + perPage - 1)

  const { data, error, count } = await query

  if (error) {
    console.error("getVehicles error:", error)
    return { vehicles: [], total: 0, pages: 0, page, perPage }
  }

  const vehicles: VehicleCard[] = (data as any[]).map((v) => ({
    id: v.id,
    slug: v.slug,
    brand: v.brand,
    model: v.model,
    version: v.version,
    year: v.year,
    fuel: v.fuel,
    mileage: v.mileage,
    price: v.price,
    price_negotiable: v.price_negotiable,
    transmission: v.transmission,
    power_hp: v.power_hp,
    body: v.body,
    condition: v.condition,
    status: v.status,
    is_featured: v.is_featured,
    published_at: v.published_at,
    cover_url:
      (v.vehicle_photos as any[])?.find((p: any) => p.is_primary)?.url ||
      (v.vehicle_photos as any[])?.[0]?.url ||
      null,
  }))

  return {
    vehicles,
    total: count ?? 0,
    pages: Math.ceil((count ?? 0) / perPage),
    page,
    perPage,
  }
}

// ─── getVehicleFiltersData ───────────────────────────────────────────────────

export async function getVehicleFiltersData(): Promise<FiltersData> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("vehicles")
    .select("brand, vehicle_type, fuel, transmission, body, price, year, mileage")
    .eq("status", "publie")

  const vehicles = (data as any[]) ?? []

  if (vehicles.length === 0) {
    const currentYear = new Date().getFullYear()
    return {
      brands: [],
      types: [],
      fuels: [],
      transmissions: [],
      bodies: [],
      priceRange: { min: 0, max: 50000 },
      yearRange: { min: 2000, max: currentYear },
      kmMax: 300000,
      total: 0,
    }
  }

  function countBy<T>(key: string): { value: T; count: number }[] {
    const map = vehicles.reduce((acc, v) => {
      const val = v[key]
      if (val) acc[val] = (acc[val] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(map)
      .map(([value, count]) => ({ value: value as T, count: count as number }))
      .sort((a, b) => b.count - a.count)
  }

  const brandMap = vehicles.reduce((acc, v) => {
    if (v.brand) acc[v.brand] = (acc[v.brand] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const brands = Object.entries(brandMap)
    .map(([name, count]) => ({ name, count: count as number }))
    .sort((a, b) => b.count - a.count)

  const prices = vehicles.map((v) => v.price).filter(Boolean) as number[]
  const years = vehicles.map((v) => v.year).filter(Boolean) as number[]
  const mileages = vehicles.map((v) => v.mileage).filter(Boolean) as number[]

  return {
    brands,
    types: countBy<VehicleType>("vehicle_type"),
    fuels: countBy<FuelType>("fuel"),
    transmissions: countBy<TransmissionType>("transmission"),
    bodies: countBy<BodyType>("body"),
    priceRange: {
      min: prices.length ? Math.floor(Math.min(...prices) / 1000) * 1000 : 0,
      max: prices.length ? Math.ceil(Math.max(...prices) / 1000) * 1000 : 50000,
    },
    yearRange: {
      min: years.length ? Math.min(...years) : 2000,
      max: years.length ? Math.max(...years) : new Date().getFullYear(),
    },
    kmMax: mileages.length ? Math.ceil(Math.max(...mileages) / 10000) * 10000 : 300000,
    total: vehicles.length,
  }
}
