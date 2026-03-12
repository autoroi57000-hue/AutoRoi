import type {
  Vehicle as VehicleRow,
  VehiclePhoto,
  VehicleFeature,
  VehicleInsert,
  VehicleUpdate,
  VehicleWithCover,
  VehicleType,
  FuelType,
  TransmissionType,
  BodyType,
  ConditionType,
  CtStatus,
  VehicleStatus,
  DriveType,
} from './database'

// ─── Re-exports des types DB ─────────────────────────────────────────────────
export type {
  VehicleRow,
  VehiclePhoto,
  VehicleFeature,
  VehicleInsert,
  VehicleUpdate,
  VehicleWithCover,
  VehicleType,
  FuelType,
  TransmissionType,
  BodyType,
  ConditionType,
  CtStatus,
  VehicleStatus,
  DriveType,
}

/** Alias principal — type complet d'un véhicule (= ligne DB) */
export type Vehicle = VehicleRow

// ─── Types métier enrichis ───────────────────────────────────────────────────

/** Véhicule complet avec ses photos */
export interface VehicleWithPhotos extends VehicleRow {
  vehicle_photos: VehiclePhoto[]
}

/** Véhicule complet avec photos + équipements */
export interface VehicleWithAll extends VehicleRow {
  vehicle_photos: VehiclePhoto[]
  vehicle_features: VehicleFeature[]
}

/** Version allégée pour les cards de listing */
export interface VehicleCard {
  id: string
  slug: string | null
  brand: string
  model: string
  version: string | null
  year: number
  fuel: FuelType
  mileage: number
  price: number
  price_negotiable: boolean
  transmission: TransmissionType | null
  power_hp: number | null
  body: BodyType | null
  condition: ConditionType
  status: VehicleStatus
  is_featured: boolean
  cover_url: string | null
  published_at: string | null
}

/** Filtres pour la recherche publique */
export interface VehicleFilters {
  brand?: string
  model?: string
  vehicle_type?: VehicleType
  fuel?: FuelType
  transmission?: TransmissionType
  body?: BodyType
  condition?: ConditionType
  drive?: DriveType
  min_price?: number
  max_price?: number
  min_year?: number
  max_year?: number
  max_mileage?: number
  min_power_hp?: number
  is_featured?: boolean
  search?: string
}

/** Tri disponibles pour le catalogue */
export type VehicleSortKey =
  | 'price_asc'
  | 'price_desc'
  | 'year_asc'
  | 'year_desc'
  | 'mileage_asc'
  | 'published_desc'

/** Résultat paginé */
export interface VehicleListResult {
  vehicles: VehicleCard[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
