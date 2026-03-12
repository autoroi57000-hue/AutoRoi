// =============================================================================
// Auto Roi — Types générés depuis le schéma Supabase
// =============================================================================

export type VehicleType = 'voiture' | 'moto' | 'utilitaire' | 'autre'
export type FuelType = 'essence' | 'diesel' | 'hybride' | 'electrique' | 'gpl' | 'autre'
export type TransmissionType = 'manuelle' | 'automatique' | 'semi-automatique'
export type BodyType =
  | 'berline' | 'suv' | 'break' | 'coupe' | 'cabriolet'
  | 'monospace' | 'pickup' | 'utilitaire' | 'moto' | 'autre'
export type ConditionType = 'excellent' | 'bon' | 'passable' | 'pieces'
export type CtStatus = 'valide' | 'a_passer' | 'non_requis'
export type VehicleStatus = 'brouillon' | 'publie' | 'vendu' | 'archive'
export type UserRole = 'admin' | 'collaborateur'
export type MessageStatus = 'non_lu' | 'lu' | 'traite' | 'archive'
export type DriveType = '2RM' | '4RM' | 'integral'

// =============================================================================
// PROFILES
// =============================================================================
export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>
export type ProfileUpdate = Partial<Omit<Profile, 'id'>>

// =============================================================================
// VEHICLES
// =============================================================================
export interface Vehicle {
  id: string

  // Identité
  brand: string
  model: string
  version: string | null
  year: number
  vehicle_type: VehicleType

  // Motorisation
  fuel: FuelType
  engine_size: number | null
  power_hp: number | null
  power_kw: number | null
  transmission: TransmissionType | null
  drive: DriveType | null

  // Carrosserie
  body: BodyType | null
  doors: number | null
  seats: number | null
  color_ext: string | null
  color_int: string | null

  // Kilométrage & Prix
  mileage: number
  price: number
  price_negotiable: boolean
  first_sale_date: string | null

  // État
  condition: ConditionType
  ct_status: CtStatus
  ct_date: string | null

  // Descriptions bilingues
  description_fr: string | null
  description_en: string | null

  // SEO
  slug: string | null

  // Statut & méta
  status: VehicleStatus
  is_featured: boolean
  views_count: number
  search_vector: string | null

  // Relations
  created_by: string | null

  // Timestamps
  created_at: string
  updated_at: string
  published_at: string | null
  sold_at: string | null
}

export type VehicleInsert = Omit<
  Vehicle,
  'id' | 'slug' | 'views_count' | 'search_vector' | 'created_at' | 'updated_at' | 'published_at' | 'sold_at' | 'created_by'
>

export type VehicleUpdate = Partial<Omit<Vehicle, 'id' | 'created_at' | 'search_vector'>>

// Vue DB avec photo de couverture
export interface VehicleWithCover extends Vehicle {
  cover_url: string | null
  cover_storage_path: string | null
}

// =============================================================================
// VEHICLE_PHOTOS
// =============================================================================
export interface VehiclePhoto {
  id: string
  vehicle_id: string
  url: string
  storage_path: string
  is_primary: boolean
  sort_order: number
  width: number | null
  height: number | null
  size_bytes: number | null
  created_at: string
}

export type VehiclePhotoInsert = Omit<VehiclePhoto, 'id' | 'created_at'>
export type VehiclePhotoUpdate = Partial<Omit<VehiclePhoto, 'id' | 'vehicle_id'>>

// =============================================================================
// VEHICLE_FEATURES
// =============================================================================
export interface VehicleFeature {
  id: string
  vehicle_id: string
  feature: string
  category: string
}

export type VehicleFeatureInsert = Omit<VehicleFeature, 'id'>

// =============================================================================
// CONTACT_MESSAGES
// =============================================================================
export interface ContactMessage {
  id: string
  vehicle_id: string | null
  vehicle_ref: string | null
  first_name: string
  last_name: string
  email: string
  phone: string | null
  message: string
  status: MessageStatus
  ip_address: string | null
  user_agent: string | null
  created_at: string
  read_at: string | null
  replied_at: string | null
}

export type ContactMessageInsert = Pick<
  ContactMessage,
  'first_name' | 'last_name' | 'email' | 'message'
> & {
  vehicle_id?: string | null
  vehicle_ref?: string | null
  phone?: string | null
  ip_address?: string | null
  user_agent?: string | null
  status?: MessageStatus
}

export type ContactMessageUpdate = Partial<Pick<ContactMessage, 'status' | 'read_at' | 'replied_at'>>

// =============================================================================
// SITE_SETTINGS
// =============================================================================
export interface SiteSetting {
  key: string
  value: string
  description: string | null
  updated_at: string
  updated_by: string | null
}

export type SiteSettingInsert = Pick<SiteSetting, 'key' | 'value'> & {
  description?: string | null
  updated_by?: string | null
}

export type SiteSettingUpdate = Partial<Pick<SiteSetting, 'value' | 'description' | 'updated_by'>>

// =============================================================================
// TYPE GÉNÉRIQUE DATABASE (pour le client Supabase typé)
// =============================================================================
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
        Relationships: []
      }
      vehicles: {
        Row: Vehicle
        Insert: VehicleInsert
        Update: VehicleUpdate
        Relationships: []
      }
      vehicle_photos: {
        Row: VehiclePhoto
        Insert: VehiclePhotoInsert
        Update: VehiclePhotoUpdate
        Relationships: []
      }
      vehicle_features: {
        Row: VehicleFeature
        Insert: VehicleFeatureInsert
        Update: Partial<VehicleFeatureInsert>
        Relationships: []
      }
      contact_messages: {
        Row: ContactMessage
        Insert: ContactMessageInsert
        Update: ContactMessageUpdate
        Relationships: []
      }
      site_settings: {
        Row: SiteSetting
        Insert: SiteSettingInsert
        Update: SiteSettingUpdate
        Relationships: []
      }
    }
    Views: {
      vehicles_with_cover: {
        Row: VehicleWithCover
      }
    }
    Functions: Record<string, never>
    Enums: {
      vehicle_type: VehicleType
      fuel_type: FuelType
      transmission_type: TransmissionType
      body_type: BodyType
      condition_type: ConditionType
      ct_status: CtStatus
      vehicle_status: VehicleStatus
      user_role: UserRole
      message_status: MessageStatus
      drive_type: DriveType
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
