import { z } from "zod"
import type {
  VehicleType,
  FuelType,
  TransmissionType,
  BodyType,
  ConditionType,
  CtStatus,
  VehicleStatus,
  DriveType,
} from "@/types/database"

// ─── Types de base ─────────────────────────────────────────────────────────

export const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: "voiture", label: "Voiture" },
  { value: "moto", label: "Moto" },
  { value: "utilitaire", label: "Utilitaire" },
  { value: "autre", label: "Autre" },
]

export const FUEL_TYPES: { value: FuelType; label: string; color: string }[] = [
  { value: "essence", label: "Essence", color: "#EF4444" },
  { value: "diesel", label: "Diesel", color: "#3B82F6" },
  { value: "hybride", label: "Hybride", color: "#10B981" },
  { value: "electrique", label: "Électrique", color: "#8B5CF6" },
  { value: "gpl", label: "GPL", color: "#F59E0B" },
]

export const TRANSMISSION_TYPES: { value: TransmissionType; label: string }[] = [
  { value: "manuelle", label: "Manuelle" },
  { value: "automatique", label: "Automatique" },
  { value: "semi-automatique", label: "Semi-automatique" },
]

export const BODY_TYPES: { value: BodyType; label: string; icon: string }[] = [
  { value: "berline", label: "Berline", icon: "Car" },
  { value: "suv", label: "SUV", icon: "Truck" },
  { value: "break", label: "Break", icon: "Caravan" },
  { value: "coupe", label: "Coupé", icon: "Car" },
  { value: "cabriolet", label: "Cabriolet", icon: "CloudSun" },
  { value: "monospace", label: "Monospace", icon: "Users" },
  { value: "pickup", label: "Pickup", icon: "Truck" },
  { value: "utilitaire", label: "Utilitaire", icon: "Package" },
  { value: "moto", label: "Moto", icon: "Bike" },
  { value: "autre", label: "Autre", icon: "Circle" },
]

export const DRIVE_TYPES: { value: DriveType; label: string }[] = [
  { value: "2RM", label: "2 roues motrices" },
  { value: "4RM", label: "4 roues motrices" },
  { value: "integral", label: "Intégrale" },
]

export const CONDITION_TYPES: { value: ConditionType; label: string; color: string; bgColor: string }[] = [
  { value: "excellent", label: "Excellent", color: "#059669", bgColor: "#D1FAE5" },
  { value: "bon", label: "Bon", color: "#2563EB", bgColor: "#DBEAFE" },
  { value: "passable", label: "Passable", color: "#D97706", bgColor: "#FEF3C7" },
  { value: "pieces", label: "Pièces", color: "#DC2626", bgColor: "#FEE2E2" },
]

export const CT_STATUS_TYPES: { value: CtStatus; label: string }[] = [
  { value: "valide", label: "Valide" },
  { value: "a_passer", label: "À passer" },
  { value: "non_requis", label: "Non requis" },
]

export const VEHICLE_STATUS_TYPES: { value: VehicleStatus; label: string; color: string }[] = [
  { value: "brouillon", label: "Brouillon", color: "#6B7280" },
  { value: "publie", label: "Publié", color: "#10B981" },
  { value: "vendu", label: "Vendu", color: "#8B5CF6" },
  { value: "archive", label: "Archivé", color: "#DC2626" },
]

export const BRANDS = [
  "Audi", "BMW", "Citroën", "Dacia", "DS", "Fiat", "Ford", "Honda", "Hyundai",
  "Jaguar", "Kia", "Land Rover", "Lexus", "Maserati", "Mazda", "Mercedes-Benz",
  "Mini", "Mitsubishi", "Nissan", "Opel", "Peugeot", "Porsche", "Renault",
  "SEAT", "Skoda", "Smart", "Subaru", "Suzuki", "Tesla", "Toyota", "Volkswagen", "Volvo",
] as const

export type PredefinedColor = {
  name: string
  hex: string
  border?: boolean
}

export const PREDEFINED_COLORS: PredefinedColor[] = [
  { name: "Blanc", hex: "#FFFFFF", border: true },
  { name: "Noir", hex: "#000000" },
  { name: "Gris", hex: "#6B7280" },
  { name: "Argent", hex: "#C0C0C0" },
  { name: "Bleu", hex: "#3B82F6" },
  { name: "Rouge", hex: "#EF4444" },
  { name: "Vert", hex: "#10B981" },
  { name: "Jaune", hex: "#F59E0B" },
  { name: "Orange", hex: "#F97316" },
  { name: "Marron", hex: "#92400E" },
  { name: "Beige", hex: "#D4C5B5" },
  { name: "Or", hex: "#FFD700" },
  { name: "Bleu marine", hex: "#1E3A8A" },
  { name: "Bleu clair", hex: "#60A5FA" },
  { name: "Rouge foncé", hex: "#991B1B" },
  { name: "Vert foncé", hex: "#14532D" },
  { name: "Violet", hex: "#8B5CF6" },
  { name: "Rose", hex: "#EC4899" },
  { name: "Bronze", hex: "#CD7F32" },
  { name: "Autre", hex: "transparent" },
] as const

// ─── Équipements par catégorie ─────────────────────────────────────────────

export const FEATURES_BY_CATEGORY = {
  securite: {
    label: "Sécurité",
    features: [
      { id: "abs", label: "ABS" },
      { id: "esp", label: "ESP" },
      { id: "airbags_frontaux", label: "Airbags frontaux" },
      { id: "airbags_latéraux", label: "Airbags latéraux" },
      { id: "camera_recul", label: "Caméra de recul" },
      { id: "capteurs_avant", label: "Capteurs de stationnement avant" },
      { id: "capteurs_arriere", label: "Capteurs de stationnement arrière" },
      { id: "alerte_franchissement", label: "Alerte franchissement de ligne" },
      { id: "regulateur_adaptatif", label: "Régulateur adaptatif" },
    ],
  },
  confort: {
    label: "Confort",
    features: [
      { id: "clim_manuelle", label: "Climatisation manuelle" },
      { id: "clim_auto", label: "Climatisation auto" },
      { id: "sieges_chauffants", label: "Sièges chauffants" },
      { id: "sieges_electriques", label: "Sièges électriques" },
      { id: "toit_ouvrant", label: "Toit ouvrant" },
      { id: "toit_panoramique", label: "Toit panoramique" },
      { id: "volant_chauffant", label: "Volant chauffant" },
      { id: "demarrage_sans_cle", label: "Démarrage sans clé" },
      { id: "acces_sans_cle", label: "Accès sans clé" },
    ],
  },
  multimedia: {
    label: "Multimédia",
    features: [
      { id: "autoradio", label: "Autoradio" },
      { id: "ecran_tactile", label: "Écran tactile" },
      { id: "apple_carplay", label: "Apple CarPlay" },
      { id: "android_auto", label: "Android Auto" },
      { id: "gps", label: "GPS intégré" },
      { id: "bluetooth", label: "Bluetooth" },
      { id: "usb", label: "Prise USB" },
      { id: "camera_360", label: "Caméra 360°" },
      { id: "head_up_display", label: "Head-up display" },
    ],
  },
  exterieur: {
    label: "Extérieur",
    features: [
      { id: "jantes_alliage", label: "Jantes alliage" },
      { id: "jantes_17plus", label: "Jantes 17\"+" },
      { id: "peinture_metallisee", label: "Peinture métallisée" },
      { id: "vitres_teintees", label: "Vitres teintées" },
      { id: "barres_toit", label: "Barres de toit" },
      { id: "attelage", label: "Attelage" },
      { id: "phares_led", label: "Phares LED" },
      { id: "phares_xenon", label: "Phares Xénon" },
      { id: "phares_laser", label: "Phares laser" },
    ],
  },
} as const

// ─── Schéma Zod ────────────────────────────────────────────────────────────

export const vehicleFormSchema = z.object({
  // Section 1: Identité
  brand: z.string().min(1, "La marque est requise"),
  model: z.string().min(1, "Le modèle est requis"),
  version: z.string().default(""),
  year: z.number().min(1990).max(2025),
  vehicle_type: z.enum(["voiture", "moto", "utilitaire", "autre"]),

  // Section 2: Motorisation
  fuel: z.enum(["essence", "diesel", "hybride", "electrique", "gpl", "autre"]),
  engine_size: z.number().nullable().optional(),
  power_hp: z.number().nullable().optional(),
  power_kw: z.number().nullable().optional(),
  transmission: z.enum(["manuelle", "automatique", "semi-automatique"]).nullable().optional(),
  drive: z.enum(["2RM", "4RM", "integral"]).nullable().optional(),

  // Section 3: Carrosserie
  body: z.enum(["berline", "suv", "break", "coupe", "cabriolet", "monospace", "pickup", "utilitaire", "moto", "autre"]).nullable().optional(),
  doors: z.number().min(2).max(5).nullable().optional(),
  seats: z.number().min(1).max(9).nullable().optional(),
  color_ext: z.string().nullable().optional(),
  color_int: z.string().nullable().optional(),

  // Section 4: Kilométrage & Prix
  mileage: z.number().min(0, "Le kilométrage doit être positif"),
  price: z.number().min(0, "Le prix doit être positif"),
  price_negotiable: z.boolean().default(false),
  first_sale_date: z.string().nullable().optional(),

  // Section 5: État & CT
  condition: z.enum(["excellent", "bon", "passable", "pieces"]),
  ct_status: z.enum(["valide", "a_passer", "non_requis"]),
  ct_date: z.string().nullable().optional(),

  // Section 6: Équipements
  features: z.array(z.string()).default([]),

  // Section 7: Description
  description_fr: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),

  // Section 8: Statut
  status: z.enum(["brouillon", "publie", "vendu", "archive"]).default("brouillon"),
  is_featured: z.boolean().default(false),
})

export type VehicleFormData = z.infer<typeof vehicleFormSchema>

// ─── Helper de conversion ─────────────────────────────────────────────────

export function formDataToVehicleInsert(data: VehicleFormData) {
  return {
    brand: data.brand,
    model: data.model,
    version: data.version || null,
    year: data.year,
    vehicle_type: data.vehicle_type,
    fuel: data.fuel,
    engine_size: data.engine_size ?? null,
    power_hp: data.power_hp ?? null,
    power_kw: data.power_kw ?? null,
    transmission: data.transmission ?? null,
    drive: data.drive ?? null,
    body: data.body ?? null,
    doors: data.doors ?? null,
    seats: data.seats ?? null,
    color_ext: data.color_ext ?? null,
    color_int: data.color_int ?? null,
    mileage: data.mileage,
    price: data.price,
    price_negotiable: data.price_negotiable,
    first_sale_date: data.first_sale_date || null,
    condition: data.condition,
    ct_status: data.ct_status,
    ct_date: data.ct_date || null,
    description_fr: data.description_fr || null,
    description_en: data.description_en || null,
    status: data.status,
    is_featured: data.is_featured,
    // Note: features et created_by sont gérés séparément côté serveur
    features: data.features || [],
  }
}
