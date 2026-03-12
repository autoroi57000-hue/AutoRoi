// =============================================================================
// Types métier — Feature Location
// =============================================================================

// ─── Statuts ─────────────────────────────────────────────────────────────────

export type RentalStatus =
  | "pending"
  | "confirmed"
  | "deposit_paid"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show"

export type RentalVehicleStatus = "disponible" | "indisponible" | "maintenance"

export type RentalEmailType =
  | "confirmation_client"
  | "confirmation_admin"
  | "admin_confirmed"
  | "payment_received"
  | "contract_ready"
  | "reminder_24h"
  | "reminder_pickup"
  | "cancellation"
  | "no_show"

// ─── Tarification ────────────────────────────────────────────────────────────

export type PricingTier = {
  days_from: number
  days_to?: number
  price_per_day: number
}

// ─── Options ─────────────────────────────────────────────────────────────────

/** Snapshot d'une option dans la table rentals.selected_options */
export type SelectedOption = {
  option_id: string
  name: string
  price_type: "fixed" | "per_day"
  price: number
  quantity: number
}

// ─── Résultat calcul de prix ──────────────────────────────────────────────────

export type PricingBreakdownItem = {
  label: string
  amount: number
  type: "base" | "option" | "surcharge" | "deposit"
}

export type RentalPricingResult = {
  base_price_per_day: number
  total_days: number
  subtotal: number
  options_total: number
  surcharge_total: number
  total_amount: number
  deposit_amount: number
  /** Solde restant dû à la remise des clés */
  balance_at_pickup: number
  breakdown: PricingBreakdownItem[]
}

// ─── Formulaire client (étape du stepper) ────────────────────────────────────

export type RentalClientData = {
  first_name: string
  last_name: string
  email: string
  phone: string
  address?: string
  city?: string
  postal_code?: string
  birth_date?: string
  license_number?: string
  is_business: boolean
  business_name?: string
  business_siret?: string
  cgv_accepted: boolean
  /** Champ honeypot anti-spam — doit rester vide */
  website?: string
}

// ─── Tables DB ───────────────────────────────────────────────────────────────

export type RentalVehiclePhoto = {
  url: string
  is_cover: boolean
}

export type RentalVehicle = {
  id: string
  created_by: string | null
  brand: string
  model: string
  version: string | null
  year: number | null
  vehicle_type: string | null
  fuel: string | null
  transmission: string | null
  body: string | null
  seats: number | null
  doors: number | null
  color: string | null
  mileage: number | null
  power_hp: number | null
  description_fr: string | null
  description_en: string | null
  price_per_day: number
  price_per_hour: number | null
  pricing_tiers: PricingTier[]
  weekend_surcharge: number
  holiday_surcharge: number
  deposit_amount: number
  deposit_percentage: number
  included_km_per_day: number
  extra_km_price: number
  status: RentalVehicleStatus
  photos: RentalVehiclePhoto[]
  cover_photo: string | null
  slug: string
  created_at: string
  updated_at: string
}

/** rental_vehicles enrichi avec les stats de la vue DB */
export type RentalVehicleWithStats = RentalVehicle & {
  total_rentals_count: number
  active_reservations_count: number
  next_available_after: string | null
  has_upcoming_48h: boolean
  is_rented_today: boolean
}

export type RentalOption = {
  id: string
  name: string
  description: string | null
  category: "accessoire" | "assurance" | "forfait_km"
  price_type: "fixed" | "per_day"
  price: number
  is_active: boolean
  sort_order: number
}

export type Rental = {
  id: string
  reference: string
  rental_vehicle_id: string
  rental_vehicle?: RentalVehicle
  start_date: string
  end_date: string
  pickup_time: string
  return_time: string
  total_days: number
  total_hours: number | null
  base_price_per_day: number
  subtotal: number
  options_total: number
  surcharge_total: number
  total_amount: number
  deposit_amount: number
  deposit_paid: boolean
  deposit_paid_at: string | null
  stripe_payment_intent_id: string | null
  stripe_session_id: string | null
  stripe_checkout_expires_at: string | null
  selected_options: SelectedOption[]
  client_first_name: string
  client_last_name: string
  client_email: string
  client_phone: string
  client_address: string | null
  client_city: string | null
  client_postal_code: string | null
  client_birth_date: string | null
  client_license_number: string | null
  is_business: boolean
  business_name: string | null
  business_siret: string | null
  cgv_accepted: boolean
  cgv_accepted_at: string | null
  status: RentalStatus
  cancelled_at: string | null
  cancellation_reason: string | null
  contract_url: string | null
  contract_generated_at: string | null
  internal_notes: string | null
  managed_by: string | null
  created_at: string
  updated_at: string
}

export type RentalEmailLog = {
  id: string
  rental_id: string | null
  type: RentalEmailType
  sent_to: string
  sent_at: string
  resend_message_id: string | null
  status: "sent" | "failed" | "bounced"
}

// ─── Plages de dates occupées (pour le calendrier) ───────────────────────────

export type OccupiedDateRange = {
  start_date: string
  end_date: string
}
