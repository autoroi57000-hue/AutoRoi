import { z } from 'zod'

// ─── Enums Zod (alignés avec les ENUMs PostgreSQL) ───────────────────────────

const vehicleTypeEnum = z.enum(['voiture', 'moto', 'utilitaire', 'autre'])
const fuelTypeEnum = z.enum(['essence', 'diesel', 'hybride', 'electrique', 'gpl', 'autre'])
const transmissionEnum = z.enum(['manuelle', 'automatique', 'semi-automatique'])
const bodyTypeEnum = z.enum([
  'berline', 'suv', 'break', 'coupe', 'cabriolet',
  'monospace', 'pickup', 'utilitaire', 'moto', 'autre',
])
const conditionEnum = z.enum(['excellent', 'bon', 'passable', 'pieces'])
const ctStatusEnum = z.enum(['valide', 'a_passer', 'non_requis'])
const vehicleStatusEnum = z.enum(['brouillon', 'publie', 'vendu', 'archive'])
const driveTypeEnum = z.enum(['2RM', '4RM', 'integral'])
const userRoleEnum = z.enum(['admin', 'collaborateur'])

// ─── Schema véhicule (formulaire admin) ─────────────────────────────────────

export const vehicleSchema = z.object({
  // Identité
  brand: z
    .string()
    .min(1, 'La marque est requise')
    .max(100, 'La marque ne peut pas dépasser 100 caractères'),
  model: z
    .string()
    .min(1, 'Le modèle est requis')
    .max(100, 'Le modèle ne peut pas dépasser 100 caractères'),
  version: z.string().max(150).optional().nullable(),
  year: z
    .number({ error: "L'année doit être un nombre" })
    .int()
    .min(1900, "L'année doit être supérieure à 1900")
    .max(new Date().getFullYear() + 1, "L'année ne peut pas être dans le futur"),
  vehicle_type: vehicleTypeEnum,

  // Motorisation
  fuel: fuelTypeEnum,
  engine_size: z.number().int().positive().optional().nullable(),
  power_hp: z.number().int().positive().optional().nullable(),
  power_kw: z.number().int().positive().optional().nullable(),
  transmission: transmissionEnum.optional().nullable(),
  drive: driveTypeEnum.optional().nullable(),

  // Carrosserie
  body: bodyTypeEnum.optional().nullable(),
  doors: z.number().int().min(1).max(10).optional().nullable(),
  seats: z.number().int().min(1).max(20).optional().nullable(),
  color_ext: z.string().max(50).optional().nullable(),
  color_int: z.string().max(50).optional().nullable(),

  // Prix & kilométrage
  mileage: z
    .number({ error: 'Le kilométrage doit être un nombre' })
    .int()
    .min(0, 'Le kilométrage ne peut pas être négatif'),
  price: z
    .number({ error: 'Le prix doit être un nombre' })
    .min(0, 'Le prix ne peut pas être négatif'),
  price_negotiable: z.boolean().default(false),
  first_sale_date: z.string().date().optional().nullable(),

  // État
  condition: conditionEnum,
  ct_status: ctStatusEnum,
  ct_date: z.string().date().optional().nullable(),

  // Descriptions bilingues
  description_fr: z.string().max(10000).optional().nullable(),
  description_en: z.string().max(10000).optional().nullable(),

  // Statut
  status: vehicleStatusEnum,
  is_featured: z.boolean().default(false),
})

export type VehicleFormData = z.infer<typeof vehicleSchema>

// ─── Schema contact public ───────────────────────────────────────────────────

export const contactSchema = z.object({
  first_name: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  last_name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  email: z
    .string()
    .email('Adresse email invalide')
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  phone: z
    .string()
    .regex(/^[\d\s+\-().]{7,20}$/, 'Numéro de téléphone invalide')
    .optional()
    .nullable()
    .or(z.literal('')),
  message: z
    .string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(2000, 'Le message ne peut pas dépasser 2000 caractères'),
  vehicle_id: z.string().uuid().optional().nullable(),
  vehicle_ref: z.string().max(100).optional().nullable(),
})

export type ContactFormData = z.infer<typeof contactSchema>

// ─── Schema profil collaborateur ─────────────────────────────────────────────

export const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z
    .string()
    .regex(/^[\d\s+\-().]{7,20}$/, 'Numéro de téléphone invalide')
    .optional()
    .nullable()
    .or(z.literal('')),
  role: userRoleEnum,
  is_active: z.boolean().default(true),
})

export type ProfileFormData = z.infer<typeof profileSchema>

// ─── Schema paramètres site ──────────────────────────────────────────────────

export const siteSettingsSchema = z.object({
  phone_number: z
    .string()
    .regex(/^[\d\s+\-().]{7,20}$/, 'Numéro invalide'),
  whatsapp_number: z
    .string()
    .regex(/^\d{10,15}$/, 'Numéro WhatsApp invalide (chiffres uniquement, sans +)'),
  whatsapp_default_message: z.string().max(500),
  contact_email: z.string().email('Email invalide'),
  business_name: z.string().min(1).max(100),
  business_address: z.string().max(300),
  meta_description_fr: z.string().max(160),
  meta_description_en: z.string().max(160),
})

export type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>
