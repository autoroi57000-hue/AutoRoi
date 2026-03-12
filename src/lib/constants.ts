import type {
  VehicleType,
  FuelType,
  TransmissionType,
  BodyType,
  ConditionType,
  CtStatus,
  VehicleStatus,
  DriveType,
  UserRole,
} from '@/types/database'

// ─── Site ─────────────────────────────────────────────────────────────────────
export const SITE_NAME = 'Auto Roi'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://autoroi.fr'
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '33600000000'
export const PHONE_NUMBER = process.env.NEXT_PUBLIC_PHONE_NUMBER ?? '+33 6 00 00 00 00'
export const EMAIL = process.env.NEXT_PUBLIC_EMAIL ?? 'contact@autoroi.fr'

// ─── i18n ─────────────────────────────────────────────────────────────────────
export const LOCALES = ['fr', 'en'] as const
export const DEFAULT_LOCALE = 'fr' as const
export type Locale = (typeof LOCALES)[number]

// ─── ENUMs DB (alignés avec les types PostgreSQL) ────────────────────────────

export const VEHICLE_TYPES: readonly VehicleType[] = [
  'voiture', 'moto', 'utilitaire', 'autre',
]

export const FUEL_TYPES: readonly FuelType[] = [
  'essence', 'diesel', 'hybride', 'electrique', 'gpl', 'autre',
]

export const TRANSMISSION_TYPES: readonly TransmissionType[] = [
  'manuelle', 'automatique', 'semi-automatique',
]

export const BODY_TYPES: readonly BodyType[] = [
  'berline', 'suv', 'break', 'coupe', 'cabriolet',
  'monospace', 'pickup', 'utilitaire', 'moto', 'autre',
]

export const CONDITION_TYPES: readonly ConditionType[] = [
  'excellent', 'bon', 'passable', 'pieces',
]

export const CT_STATUSES: readonly CtStatus[] = [
  'valide', 'a_passer', 'non_requis',
]

export const VEHICLE_STATUSES: readonly VehicleStatus[] = [
  'brouillon', 'publie', 'vendu', 'archive',
]

export const DRIVE_TYPES: readonly DriveType[] = ['2RM', '4RM', 'integral']

export const USER_ROLES: readonly UserRole[] = ['admin', 'collaborateur']

// ─── Labels FR pour l'affichage ──────────────────────────────────────────────

export const FUEL_LABELS: Record<FuelType, string> = {
  essence: 'Essence',
  diesel: 'Diesel',
  hybride: 'Hybride',
  electrique: 'Électrique',
  gpl: 'GPL',
  autre: 'Autre',
}

export const TRANSMISSION_LABELS: Record<TransmissionType, string> = {
  manuelle: 'Manuelle',
  automatique: 'Automatique',
  'semi-automatique': 'Semi-automatique',
}

export const BODY_LABELS: Record<BodyType, string> = {
  berline: 'Berline',
  suv: 'SUV / 4x4',
  break: 'Break',
  coupe: 'Coupé',
  cabriolet: 'Cabriolet',
  monospace: 'Monospace',
  pickup: 'Pick-up',
  utilitaire: 'Utilitaire',
  moto: 'Moto',
  autre: 'Autre',
}

export const CONDITION_LABELS: Record<ConditionType, string> = {
  excellent: 'Excellent état',
  bon: 'Bon état',
  passable: 'État passable',
  pieces: 'Pour pièces',
}

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  brouillon: 'Brouillon',
  publie: 'Publié',
  vendu: 'Vendu',
  archive: 'Archivé',
}

export const DRIVE_LABELS: Record<DriveType, string> = {
  '2RM': '2 roues motrices',
  '4RM': '4 roues motrices',
  integral: 'Intégral',
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export const VEHICLES_PER_PAGE = 12
export const ADMIN_VEHICLES_PER_PAGE = 20

// ─── Storage ──────────────────────────────────────────────────────────────────
export const STORAGE_BUCKET = 'vehicle-photos'
export const MAX_PHOTO_SIZE_MB = 15
export const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024
export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
