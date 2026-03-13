/**
 * Seed script — Insère 20 véhicules de démonstration dans Supabase.
 *
 * Usage :
 *   npx tsx scripts/seed-vehicles.ts          # insert (skip si déjà présents)
 *   npx tsx scripts/seed-vehicles.ts --reset   # supprime puis recrée
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import path from "path"

// ── Load .env.local ──────────────────────────────────────────────────────────
dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Variables NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requises dans .env.local")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ── Marqueur pour identifier les données de démo ─────────────────────────────
const DEMO_MARKER = "[DEMO]"

// ── Helper: slug à partir de brand + model + year ────────────────────────────
function toSlug(brand: string, model: string, year: number): string {
  return `${brand}-${model}-${year}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// ── Helper: date échelonnée sur 6 mois ───────────────────────────────────────
function staggeredDate(index: number): string {
  const now = new Date()
  const daysAgo = Math.floor((index / 20) * 180) // 0→180 jours
  const d = new Date(now.getTime() - daysAgo * 86_400_000)
  return d.toISOString()
}

// ── Photos Unsplash par catégorie (libres de droits) ─────────────────────────
const PHOTO_SETS: Record<string, string[]> = {
  "porsche-911": [
    "https://images.unsplash.com/photo-1614162692292-7ac56d7f787e?w=800&q=80",
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800&q=80",
    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
  ],
  "mercedes-amg": [
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80",
    "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80",
  ],
  "bmw-sport": [
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80",
    "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=800&q=80",
  ],
  "audi-rs": [
    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
    "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80",
    "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80",
  ],
  "maserati": [
    "https://images.unsplash.com/photo-1580274455191-1c62238ce452?w=800&q=80",
    "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80",
    "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80",
  ],
  "bmw-berline": [
    "https://images.unsplash.com/photo-1520050206757-cda1e3eb0fa3?w=800&q=80",
    "https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?w=800&q=80",
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0ffe?w=800&q=80",
  ],
  "mercedes-berline": [
    "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80",
    "https://images.unsplash.com/photo-1618843479619-f3d0d81e4d10?w=800&q=80",
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80",
  ],
  "audi-berline": [
    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
    "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&q=80",
    "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80",
  ],
  "volvo-suv": [
    "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80",
    "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
  ],
  "lexus": [
    "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&q=80",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
  ],
  "range-rover": [
    "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80",
    "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
  ],
  "porsche-cayenne": [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
    "https://images.unsplash.com/photo-1614162692292-7ac56d7f787e?w=800&q=80",
  ],
  "bmw-suv": [
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    "https://images.unsplash.com/photo-1520050206757-cda1e3eb0fa3?w=800&q=80",
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0ffe?w=800&q=80",
  ],
  "mercedes-suv": [
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80",
    "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80",
  ],
  "audi-suv": [
    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
    "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80",
    "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&q=80",
  ],
  "cabriolet": [
    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800&q=80",
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
  ],
  "golf-r": [
    "https://images.unsplash.com/photo-1471479917193-f00955256257?w=800&q=80",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
  ],
  "alfa-romeo": [
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
  ],
}

// ── Les 20 véhicules de démonstration ────────────────────────────────────────
interface SeedVehicle {
  brand: string
  model: string
  version: string | null
  year: number
  vehicle_type: "voiture"
  fuel: "essence" | "diesel" | "hybride"
  engine_size: number
  power_hp: number
  power_kw: number
  transmission: "automatique" | "manuelle"
  drive: "2RM" | "4RM" | "integral"
  body: "berline" | "suv" | "break" | "coupe" | "cabriolet"
  doors: number
  seats: number
  color_ext: string
  color_int: string
  mileage: number
  price: number
  price_negotiable: boolean
  first_sale_date: string
  condition: "excellent" | "bon"
  ct_status: "valide" | "a_passer"
  ct_date: string | null
  description_fr: string
  description_en: string
  status: "publie" | "brouillon" | "vendu"
  is_featured: boolean
  photoKey: string
  features: { feature: string; category: string }[]
}

const vehicles: SeedVehicle[] = [
  // ═══ LUXE (5) ══════════════════════════════════════════════════════════════
  {
    brand: "Porsche",
    model: "911 Carrera",
    version: "992 3.0 Carrera S PDK",
    year: 2022,
    vehicle_type: "voiture",
    fuel: "essence",
    engine_size: 2981,
    power_hp: 450,
    power_kw: 331,
    transmission: "automatique",
    drive: "2RM",
    body: "coupe",
    doors: 2,
    seats: 4,
    color_ext: "Blanc Carrara",
    color_int: "Cuir noir",
    mileage: 18000,
    price: 89900,
    price_negotiable: true,
    first_sale_date: "2022-03-15",
    condition: "excellent",
    ct_status: "valide",
    ct_date: "2026-03-15",
    description_fr: `${DEMO_MARKER} Porsche 911 Carrera S en état concours. Intérieur cuir intégral, pack Sport Chrono, toit ouvrant panoramique. Historique complet en concession Porsche. Une icône de la route, prête à vous offrir des sensations uniques.`,
    description_en: `${DEMO_MARKER} Porsche 911 Carrera S in showroom condition. Full leather interior, Sport Chrono package, panoramic sunroof. Complete Porsche dealer service history. A true road icon ready to deliver unique driving sensations.`,
    status: "publie",
    is_featured: true,
    photoKey: "porsche-911",
    features: [
      { feature: "Pack Sport Chrono", category: "performance" },
      { feature: "Toit ouvrant panoramique", category: "confort" },
      { feature: "Sièges chauffants", category: "confort" },
      { feature: "Caméra de recul", category: "sécurité" },
      { feature: "Apple CarPlay", category: "multimedia" },
    ],
  },
  {
    brand: "Mercedes-Benz",
    model: "AMG GT",
    version: "53 4MATIC+",
    year: 2021,
    vehicle_type: "voiture",
    fuel: "essence",
    engine_size: 2999,
    power_hp: 435,
    power_kw: 320,
    transmission: "automatique",
    drive: "integral",
    body: "coupe",
    doors: 2,
    seats: 4,
    color_ext: "Gris Sélénite",
    color_int: "Cuir Nappa rouge",
    mileage: 32000,
    price: 74500,
    price_negotiable: true,
    first_sale_date: "2021-06-20",
    condition: "excellent",
    ct_status: "valide",
    ct_date: "2025-06-20",
    description_fr: `${DEMO_MARKER} Mercedes-AMG GT 53 au caractère affirmé. Sellerie cuir Nappa bicolore, système Burmester, pack AMG Performance. Un grand tourisme d'exception combinant puissance brute et raffinement Mercedes.`,
    description_en: `${DEMO_MARKER} Mercedes-AMG GT 53 with bold character. Two-tone Nappa leather seats, Burmester sound system, AMG Performance package. An exceptional grand tourer combining raw power with Mercedes refinement.`,
    status: "publie",
    is_featured: true,
    photoKey: "mercedes-amg",
    features: [
      { feature: "Pack AMG Performance", category: "performance" },
      { feature: "Sono Burmester", category: "multimedia" },
      { feature: "Cuir Nappa bicolore", category: "confort" },
      { feature: "Freinage carbone-céramique", category: "performance" },
      { feature: "Affichage tête haute", category: "confort" },
    ],
  },
  {
    brand: "BMW",
    model: "M4 Competition",
    version: "G82 xDrive",
    year: 2023,
    vehicle_type: "voiture",
    fuel: "essence",
    engine_size: 2993,
    power_hp: 510,
    power_kw: 375,
    transmission: "automatique",
    drive: "integral",
    body: "coupe",
    doors: 2,
    seats: 4,
    color_ext: "Vert Isle of Man",
    color_int: "Cuir Merino noir",
    mileage: 8500,
    price: 82000,
    price_negotiable: false,
    first_sale_date: "2023-01-10",
    condition: "excellent",
    ct_status: "valide",
    ct_date: "2027-01-10",
    description_fr: `${DEMO_MARKER} BMW M4 Competition xDrive dans sa livrée exclusive Vert Isle of Man. Seulement 8 500 km, pratiquement neuve. Pack M Carbon, sièges baquets M, système Harman Kardon. La sportive bavaroise ultime.`,
    description_en: `${DEMO_MARKER} BMW M4 Competition xDrive in exclusive Isle of Man Green. Only 8,500 km, virtually new. M Carbon package, M bucket seats, Harman Kardon system. The ultimate Bavarian sports car.`,
    status: "publie",
    is_featured: true,
    photoKey: "bmw-sport",
    features: [
      { feature: "Pack M Carbon", category: "performance" },
      { feature: "Sièges baquets M", category: "confort" },
      { feature: "Sono Harman Kardon", category: "multimedia" },
      { feature: "M Drive Professional", category: "performance" },
      { feature: "Caméra 360°", category: "sécurité" },
    ],
  },
  {
    brand: "Audi",
    model: "RS6 Avant",
    version: "C8 4.0 TFSI Quattro",
    year: 2022,
    vehicle_type: "voiture",
    fuel: "essence",
    engine_size: 3996,
    power_hp: 600,
    power_kw: 441,
    transmission: "automatique",
    drive: "integral",
    body: "break",
    doors: 5,
    seats: 5,
    color_ext: "Gris Nardo",
    color_int: "Cuir Valcona noir",
    mileage: 22000,
    price: 91000,
    price_negotiable: true,
    first_sale_date: "2022-05-18",
    condition: "excellent",
    ct_status: "valide",
    ct_date: "2026-05-18",
    description_fr: `${DEMO_MARKER} Audi RS6 Avant en Gris Nardo, la super break par excellence. 600 chevaux sous le capot, transmission Quattro, pack dynamique plus. Le compromis parfait entre sportivité extrême et praticité familiale.`,
    description_en: `${DEMO_MARKER} Audi RS6 Avant in Nardo Grey, the ultimate super wagon. 600 horsepower, Quattro transmission, dynamic plus package. The perfect balance between extreme sportiness and family practicality.`,
    status: "publie",
    is_featured: true,
    photoKey: "audi-rs",
    features: [
      { feature: "Pack dynamique plus", category: "performance" },
      { feature: "Échappement sport RS", category: "performance" },
      { feature: "Sono Bang & Olufsen", category: "multimedia" },
      { feature: "Suspensions pneumatiques", category: "confort" },
      { feature: "Matrix LED", category: "sécurité" },
    ],
  },
  {
    brand: "Maserati",
    model: "Ghibli",
    version: "3.0 V6 GranSport",
    year: 2020,
    vehicle_type: "voiture",
    fuel: "essence",
    engine_size: 2979,
    power_hp: 350,
    power_kw: 257,
    transmission: "automatique",
    drive: "2RM",
    body: "berline",
    doors: 4,
    seats: 5,
    color_ext: "Bleu Emozione",
    color_int: "Cuir beige",
    mileage: 41000,
    price: 48900,
    price_negotiable: true,
    first_sale_date: "2020-09-12",
    condition: "bon",
    ct_status: "valide",
    ct_date: "2024-09-12",
    description_fr: `${DEMO_MARKER} Maserati Ghibli GranSport, l'élégance italienne à l'état pur. V6 Ferrari au son envoûtant, sellerie cuir pleine fleur, finition Zegna. Un choix audacieux pour les connaisseurs qui recherchent l'exclusivité.`,
    description_en: `${DEMO_MARKER} Maserati Ghibli GranSport, pure Italian elegance. Ferrari-derived V6 with captivating sound, full-grain leather, Zegna finishing. A bold choice for connoisseurs seeking exclusivity.`,
    status: "publie",
    is_featured: false,
    photoKey: "maserati",
    features: [
      { feature: "Finition Zegna", category: "confort" },
      { feature: "Sono Harman Kardon", category: "multimedia" },
      { feature: "Skyhook suspension", category: "confort" },
      { feature: "Aide au stationnement", category: "sécurité" },
    ],
  },

  // ═══ PREMIUM (5) ═══════════════════════════════════════════════════════════
  {
    brand: "BMW",
    model: "Série 5",
    version: "530d xDrive M Sport",
    year: 2021,
    vehicle_type: "voiture",
    fuel: "diesel",
    engine_size: 2993,
    power_hp: 286,
    power_kw: 210,
    transmission: "automatique",
    drive: "integral",
    body: "berline",
    doors: 4,
    seats: 5,
    color_ext: "Noir Saphir",
    color_int: "Cuir Vernasca cognac",
    mileage: 45000,
    price: 38900,
    price_negotiable: true,
    first_sale_date: "2021-04-22",
    condition: "bon",
    ct_status: "valide",
    ct_date: "2025-04-22",
    description_fr: `${DEMO_MARKER} BMW 530d xDrive M Sport, la référence des berlines d'affaires. Finition M Sport intégrale, cuir Vernasca cognac, système de navigation Professional. Confort et efficience au quotidien.`,
    description_en: `${DEMO_MARKER} BMW 530d xDrive M Sport, the benchmark for business sedans. Full M Sport trim, Vernasca cognac leather, Professional navigation system. Daily comfort and efficiency.`,
    status: "publie",
    is_featured: false,
    photoKey: "bmw-berline",
    features: [
      { feature: "Pack M Sport", category: "confort" },
      { feature: "Navigation Professional", category: "multimedia" },
      { feature: "Sièges chauffants", category: "confort" },
      { feature: "Régulateur adaptatif", category: "sécurité" },
    ],
  },
  {
    brand: "Mercedes-Benz",
    model: "Classe E",
    version: "220d AMG Line",
    year: 2020,
    vehicle_type: "voiture",
    fuel: "diesel",
    engine_size: 1950,
    power_hp: 194,
    power_kw: 143,
    transmission: "automatique",
    drive: "2RM",
    body: "berline",
    doors: 4,
    seats: 5,
    color_ext: "Blanc Polaire",
    color_int: "Cuir noir",
    mileage: 58000,
    price: 34500,
    price_negotiable: true,
    first_sale_date: "2020-07-08",
    condition: "bon",
    ct_status: "valide",
    ct_date: "2024-07-08",
    description_fr: `${DEMO_MARKER} Mercedes Classe E 220d AMG Line, le raffinement étoilé. Intérieur bi-écran MBUX, pack premium, éclairage d'ambiance 64 couleurs. Le choix des dirigeants exigeants.`,
    description_en: `${DEMO_MARKER} Mercedes E-Class 220d AMG Line, stellar refinement. Dual-screen MBUX interior, premium package, 64-color ambient lighting. The choice of discerning executives.`,
    status: "publie",
    is_featured: false,
    photoKey: "mercedes-berline",
    features: [
      { feature: "MBUX bi-écran", category: "multimedia" },
      { feature: "Éclairage ambiance 64 couleurs", category: "confort" },
      { feature: "Pack Premium", category: "confort" },
      { feature: "Aide au maintien de voie", category: "sécurité" },
    ],
  },
  {
    brand: "Audi",
    model: "A6",
    version: "40 TDI S Line Quattro",
    year: 2022,
    vehicle_type: "voiture",
    fuel: "diesel",
    engine_size: 1968,
    power_hp: 204,
    power_kw: 150,
    transmission: "automatique",
    drive: "integral",
    body: "berline",
    doors: 4,
    seats: 5,
    color_ext: "Gris Daytona",
    color_int: "Cuir noir/gris",
    mileage: 28000,
    price: 42000,
    price_negotiable: false,
    first_sale_date: "2022-02-14",
    condition: "excellent",
    ct_status: "valide",
    ct_date: "2026-02-14",
    description_fr: `${DEMO_MARKER} Audi A6 S Line Quattro, la technologie au service du voyage. Triple écran tactile, Virtual Cockpit, Matrix LED. Un concentré de technologie dans un écrin d'élégance germanique.`,
    description_en: `${DEMO_MARKER} Audi A6 S Line Quattro, technology serving the journey. Triple touchscreen, Virtual Cockpit, Matrix LED. A technology showcase wrapped in Germanic elegance.`,
    status: "publie",
    is_featured: false,
    photoKey: "audi-berline",
    features: [
      { feature: "Virtual Cockpit", category: "multimedia" },
      { feature: "Matrix LED", category: "sécurité" },
      { feature: "Quattro Ultra", category: "performance" },
      { feature: "Pack S Line", category: "confort" },
    ],
  },
  {
    brand: "Volvo",
    model: "XC90",
    version: "T8 Recharge Inscription",
    year: 2021,
    vehicle_type: "voiture",
    fuel: "hybride",
    engine_size: 1969,
    power_hp: 390,
    power_kw: 287,
    transmission: "automatique",
    drive: "integral",
    body: "suv",
    doors: 5,
    seats: 7,
    color_ext: "Bleu Denim",
    color_int: "Cuir Nappa blond",
    mileage: 35000,
    price: 44900,
    price_negotiable: true,
    first_sale_date: "2021-11-05",
    condition: "bon",
    ct_status: "valide",
    ct_date: "2025-11-05",
    description_fr: `${DEMO_MARKER} Volvo XC90 T8 Recharge, le SUV scandinave hybride rechargeable 7 places. Sono Bowers & Wilkins, pack Intellisafe, intérieur cuir Nappa. Sécurité et conscience écologique sans compromis.`,
    description_en: `${DEMO_MARKER} Volvo XC90 T8 Recharge, the 7-seat Scandinavian plug-in hybrid SUV. Bowers & Wilkins sound, Intellisafe package, Nappa leather interior. Safety and eco-consciousness without compromise.`,
    status: "brouillon",
    is_featured: false,
    photoKey: "volvo-suv",
    features: [
      { feature: "Sono Bowers & Wilkins", category: "multimedia" },
      { feature: "Intellisafe Pro", category: "sécurité" },
      { feature: "7 places", category: "confort" },
      { feature: "Recharge hybride", category: "performance" },
    ],
  },
  {
    brand: "Lexus",
    model: "RX 450h",
    version: "F Sport Executive",
    year: 2022,
    vehicle_type: "voiture",
    fuel: "hybride",
    engine_size: 2494,
    power_hp: 313,
    power_kw: 230,
    transmission: "automatique",
    drive: "integral",
    body: "suv",
    doors: 5,
    seats: 5,
    color_ext: "Blanc Cristal",
    color_int: "Cuir rouge flare",
    mileage: 19000,
    price: 47500,
    price_negotiable: true,
    first_sale_date: "2022-08-30",
    condition: "excellent",
    ct_status: "valide",
    ct_date: "2026-08-30",
    description_fr: `${DEMO_MARKER} Lexus RX 450h F Sport, la fiabilité japonaise en version premium. Hybride auto-rechargeable, sellerie cuir rouge exclusif, système Mark Levinson. Un SUV qui allie luxe discret et conscience environnementale.`,
    description_en: `${DEMO_MARKER} Lexus RX 450h F Sport, Japanese reliability in premium form. Self-charging hybrid, exclusive red leather seats, Mark Levinson system. An SUV combining understated luxury with environmental awareness.`,
    status: "publie",
    is_featured: false,
    photoKey: "lexus",
    features: [
      { feature: "Sono Mark Levinson", category: "multimedia" },
      { feature: "Pack F Sport", category: "performance" },
      { feature: "Hybride auto-rechargeable", category: "performance" },
      { feature: "Toit panoramique", category: "confort" },
    ],
  },

  // ═══ SUV / CROSSOVER (5) ═══════════════════════════════════════════════════
  {
    brand: "Land Rover",
    model: "Range Rover Sport",
    version: "3.0 SDV6 HSE Dynamic",
    year: 2021,
    vehicle_type: "voiture",
    fuel: "diesel",
    engine_size: 2996,
    power_hp: 306,
    power_kw: 225,
    transmission: "automatique",
    drive: "integral",
    body: "suv",
    doors: 5,
    seats: 5,
    color_ext: "Noir Santorini",
    color_int: "Cuir Windsor noir",
    mileage: 38000,
    price: 68000,
    price_negotiable: true,
    first_sale_date: "2021-02-28",
    condition: "bon",
    ct_status: "valide",
    ct_date: "2025-02-28",
    description_fr: `${DEMO_MARKER} Range Rover Sport HSE Dynamic, l'aristocrate des SUV. Présence imposante, intérieur cuir Windsor, système Terrain Response 2. Aussi à l'aise sur autoroute qu'en tout-terrain.`,
    description_en: `${DEMO_MARKER} Range Rover Sport HSE Dynamic, the aristocrat of SUVs. Imposing presence, Windsor leather interior, Terrain Response 2 system. Equally at home on the highway as off-road.`,
    status: "publie",
    is_featured: true,
    photoKey: "range-rover",
    features: [
      { feature: "Terrain Response 2", category: "performance" },
      { feature: "Cuir Windsor", category: "confort" },
      { feature: "Sono Meridian", category: "multimedia" },
      { feature: "Suspensions pneumatiques", category: "confort" },
      { feature: "Caméra 360°", category: "sécurité" },
    ],
  },
  {
    brand: "Porsche",
    model: "Cayenne",
    version: "3.0 V6 Tiptronic",
    year: 2020,
    vehicle_type: "voiture",
    fuel: "essence",
    engine_size: 2995,
    power_hp: 340,
    power_kw: 250,
    transmission: "automatique",
    drive: "integral",
    body: "suv",
    doors: 5,
    seats: 5,
    color_ext: "Gris Craie",
    color_int: "Cuir noir",
    mileage: 47000,
    price: 58900,
    price_negotiable: true,
    first_sale_date: "2020-05-15",
    condition: "bon",
    ct_status: "valide",
    ct_date: "2024-05-15",
    description_fr: `${DEMO_MARKER} Porsche Cayenne, le SUV sportif par excellence. ADN Porsche dans un format familial, chassis PASM, pack Chrono. Les performances d'une sportive dans le confort d'un SUV premium.`,
    description_en: `${DEMO_MARKER} Porsche Cayenne, the quintessential sports SUV. Porsche DNA in a family format, PASM chassis, Chrono package. Sports car performance in the comfort of a premium SUV.`,
    status: "publie",
    is_featured: false,
    photoKey: "porsche-cayenne",
    features: [
      { feature: "PASM (suspension active)", category: "performance" },
      { feature: "Pack Sport Chrono", category: "performance" },
      { feature: "Sono BOSE", category: "multimedia" },
      { feature: "Toit panoramique", category: "confort" },
    ],
  },
  {
    brand: "BMW",
    model: "X5",
    version: "xDrive30d M Sport",
    year: 2022,
    vehicle_type: "voiture",
    fuel: "diesel",
    engine_size: 2993,
    power_hp: 286,
    power_kw: 210,
    transmission: "automatique",
    drive: "integral",
    body: "suv",
    doors: 5,
    seats: 5,
    color_ext: "Bleu Phytonic",
    color_int: "Cuir Vernasca noir",
    mileage: 25000,
    price: 52000,
    price_negotiable: false,
    first_sale_date: "2022-06-10",
    condition: "excellent",
    ct_status: "valide",
    ct_date: "2026-06-10",
    description_fr: `${DEMO_MARKER} BMW X5 xDrive30d M Sport, le SUV polyvalent par excellence. Grand écran incurvé, pack Driving Assistant Professional, coffre modulable. La référence du segment pour les familles exigeantes.`,
    description_en: `${DEMO_MARKER} BMW X5 xDrive30d M Sport, the ultimate versatile SUV. Curved display, Driving Assistant Professional package, modular trunk. The segment benchmark for discerning families.`,
    status: "publie",
    is_featured: false,
    photoKey: "bmw-suv",
    features: [
      { feature: "Driving Assistant Professional", category: "sécurité" },
      { feature: "Écran incurvé", category: "multimedia" },
      { feature: "Pack M Sport", category: "confort" },
      { feature: "Hayon électrique", category: "confort" },
    ],
  },
  {
    brand: "Mercedes-Benz",
    model: "GLE",
    version: "300d 4MATIC AMG Line",
    year: 2021,
    vehicle_type: "voiture",
    fuel: "diesel",
    engine_size: 1950,
    power_hp: 272,
    power_kw: 200,
    transmission: "automatique",
    drive: "integral",
    body: "suv",
    doors: 5,
    seats: 5,
    color_ext: "Gris Graphite",
    color_int: "Cuir noir/marron",
    mileage: 33000,
    price: 49500,
    price_negotiable: true,
    first_sale_date: "2021-09-03",
    condition: "bon",
    ct_status: "valide",
    ct_date: "2025-09-03",
    description_fr: `${DEMO_MARKER} Mercedes GLE 300d AMG Line, le grand SUV étoilé. MBUX avec commande vocale "Hey Mercedes", Energizing Comfort, pack mémoire. Le luxe et la technologie au service de vos voyages.`,
    description_en: `${DEMO_MARKER} Mercedes GLE 300d AMG Line, the star-studded full-size SUV. MBUX with "Hey Mercedes" voice control, Energizing Comfort, memory package. Luxury and technology serving your journeys.`,
    status: "brouillon",
    is_featured: false,
    photoKey: "mercedes-suv",
    features: [
      { feature: "MBUX commande vocale", category: "multimedia" },
      { feature: "Energizing Comfort", category: "confort" },
      { feature: "Pack AMG Line", category: "confort" },
      { feature: "Aide au stationnement active", category: "sécurité" },
    ],
  },
  {
    brand: "Audi",
    model: "Q7",
    version: "50 TDI Quattro S Line",
    year: 2020,
    vehicle_type: "voiture",
    fuel: "diesel",
    engine_size: 2967,
    power_hp: 286,
    power_kw: 210,
    transmission: "automatique",
    drive: "integral",
    body: "suv",
    doors: 5,
    seats: 7,
    color_ext: "Noir Mythic",
    color_int: "Cuir Valcona gris",
    mileage: 52000,
    price: 44000,
    price_negotiable: true,
    first_sale_date: "2020-03-20",
    condition: "bon",
    ct_status: "valide",
    ct_date: "2024-03-20",
    description_fr: `${DEMO_MARKER} Audi Q7 S Line, le grand SUV familial 7 places. Triple écran tactile, Virtual Cockpit Plus, suspensions pneumatiques adaptatives. L'espace et le confort sans sacrifier la sportivité.`,
    description_en: `${DEMO_MARKER} Audi Q7 S Line, the 7-seat family SUV. Triple touchscreen, Virtual Cockpit Plus, adaptive air suspension. Space and comfort without sacrificing sportiness.`,
    status: "publie",
    is_featured: false,
    photoKey: "audi-suv",
    features: [
      { feature: "7 places", category: "confort" },
      { feature: "Virtual Cockpit Plus", category: "multimedia" },
      { feature: "Suspensions pneumatiques", category: "confort" },
      { feature: "Pack S Line", category: "confort" },
    ],
  },

  // ═══ SPORTIVES & CABRIOLETS (3) ════════════════════════════════════════════
  {
    brand: "Porsche",
    model: "718 Boxster",
    version: "2.0 Turbo PDK",
    year: 2021,
    vehicle_type: "voiture",
    fuel: "essence",
    engine_size: 1988,
    power_hp: 300,
    power_kw: 221,
    transmission: "automatique",
    drive: "2RM",
    body: "cabriolet",
    doors: 2,
    seats: 2,
    color_ext: "Rouge Carmin",
    color_int: "Cuir noir",
    mileage: 14000,
    price: 58000,
    price_negotiable: false,
    first_sale_date: "2021-07-14",
    condition: "excellent",
    ct_status: "valide",
    ct_date: "2025-07-14",
    description_fr: `${DEMO_MARKER} Porsche 718 Boxster, le roadster mid-engine par excellence. Moteur central, capote électrique, chassis sport PASM. Le plaisir de conduire à l'état pur sous le soleil.`,
    description_en: `${DEMO_MARKER} Porsche 718 Boxster, the quintessential mid-engine roadster. Central engine, electric soft-top, PASM sport chassis. Pure driving pleasure under the sun.`,
    status: "publie",
    is_featured: false,
    photoKey: "cabriolet",
    features: [
      { feature: "Capote électrique", category: "confort" },
      { feature: "PASM sport", category: "performance" },
      { feature: "Sono BOSE", category: "multimedia" },
      { feature: "Bi-Xenon PDLS", category: "sécurité" },
    ],
  },
  {
    brand: "BMW",
    model: "Z4",
    version: "sDrive30i M Sport",
    year: 2022,
    vehicle_type: "voiture",
    fuel: "essence",
    engine_size: 1998,
    power_hp: 258,
    power_kw: 190,
    transmission: "automatique",
    drive: "2RM",
    body: "cabriolet",
    doors: 2,
    seats: 2,
    color_ext: "Jaune San Remo",
    color_int: "Cuir Vernasca noir",
    mileage: 9000,
    price: 44900,
    price_negotiable: true,
    first_sale_date: "2022-04-01",
    condition: "excellent",
    ct_status: "valide",
    ct_date: "2026-04-01",
    description_fr: `${DEMO_MARKER} BMW Z4 sDrive30i M Sport en Jaune San Remo éclatant. Seulement 9 000 km, capote souple électrique, différentiel M Sport. Le roadster bavarois qui attire tous les regards.`,
    description_en: `${DEMO_MARKER} BMW Z4 sDrive30i M Sport in striking San Remo Yellow. Only 9,000 km, electric soft-top, M Sport differential. The Bavarian roadster that turns every head.`,
    status: "vendu",
    is_featured: false,
    photoKey: "cabriolet",
    features: [
      { feature: "Capote souple électrique", category: "confort" },
      { feature: "Différentiel M Sport", category: "performance" },
      { feature: "Navigation Live Cockpit", category: "multimedia" },
      { feature: "Phares adaptatifs LED", category: "sécurité" },
    ],
  },
  {
    brand: "Mercedes-Benz",
    model: "SLC",
    version: "200 AMG Line",
    year: 2020,
    vehicle_type: "voiture",
    fuel: "essence",
    engine_size: 1991,
    power_hp: 184,
    power_kw: 135,
    transmission: "automatique",
    drive: "2RM",
    body: "cabriolet",
    doors: 2,
    seats: 2,
    color_ext: "Argent Iridium",
    color_int: "Cuir noir/rouge",
    mileage: 38000,
    price: 32500,
    price_negotiable: true,
    first_sale_date: "2020-06-22",
    condition: "bon",
    ct_status: "a_passer",
    ct_date: null,
    description_fr: `${DEMO_MARKER} Mercedes SLC 200 AMG Line, le petit roadster étoilé au toit rigide rétractable. Finition AMG Line, système COMAND, toit panoramique vario. L'élégance décapotable au quotidien.`,
    description_en: `${DEMO_MARKER} Mercedes SLC 200 AMG Line, the compact roadster with retractable hardtop. AMG Line trim, COMAND system, panoramic vario-roof. Everyday convertible elegance.`,
    status: "brouillon",
    is_featured: false,
    photoKey: "cabriolet",
    features: [
      { feature: "Toit rigide rétractable", category: "confort" },
      { feature: "COMAND Online", category: "multimedia" },
      { feature: "Pack AMG Line", category: "confort" },
    ],
  },

  // ═══ ACCESSIBLES PREMIUM (2) ═══════════════════════════════════════════════
  {
    brand: "Volkswagen",
    model: "Golf R",
    version: "2.0 TSI 4Motion DSG",
    year: 2022,
    vehicle_type: "voiture",
    fuel: "essence",
    engine_size: 1984,
    power_hp: 320,
    power_kw: 235,
    transmission: "manuelle",
    drive: "integral",
    body: "berline",
    doors: 5,
    seats: 5,
    color_ext: "Bleu Lapiz",
    color_int: "Tissu/cuir R noir",
    mileage: 12000,
    price: 38900,
    price_negotiable: false,
    first_sale_date: "2022-10-15",
    condition: "excellent",
    ct_status: "valide",
    ct_date: "2026-10-15",
    description_fr: `${DEMO_MARKER} Volkswagen Golf R, la compacte sportive de référence. 320 chevaux, transmission 4Motion, mode Drift. Discrète au quotidien, redoutable sur route. Le best-seller des passionnés.`,
    description_en: `${DEMO_MARKER} Volkswagen Golf R, the benchmark hot hatch. 320 horsepower, 4Motion AWD, Drift mode. Discreet daily, formidable on the road. The enthusiast's best-seller.`,
    status: "vendu",
    is_featured: false,
    photoKey: "golf-r",
    features: [
      { feature: "4Motion", category: "performance" },
      { feature: "Mode Drift", category: "performance" },
      { feature: "Digital Cockpit Pro", category: "multimedia" },
      { feature: "Sièges R chauffants", category: "confort" },
    ],
  },
  {
    brand: "Alfa Romeo",
    model: "Giulia",
    version: "2.0 Turbo 200 Sprint AT8",
    year: 2021,
    vehicle_type: "voiture",
    fuel: "essence",
    engine_size: 1995,
    power_hp: 200,
    power_kw: 147,
    transmission: "automatique",
    drive: "2RM",
    body: "berline",
    doors: 4,
    seats: 5,
    color_ext: "Rouge Alfa",
    color_int: "Cuir noir",
    mileage: 44000,
    price: 29900,
    price_negotiable: true,
    first_sale_date: "2021-03-18",
    condition: "bon",
    ct_status: "valide",
    ct_date: "2025-03-18",
    description_fr: `${DEMO_MARKER} Alfa Romeo Giulia Sprint, le tempérament italien accessible. Ligne sculpturale, châssis Giorgio, distribution parfaite 50/50. Pour ceux qui veulent une berline avec du caractère et de la passion.`,
    description_en: `${DEMO_MARKER} Alfa Romeo Giulia Sprint, accessible Italian temperament. Sculptural lines, Giorgio platform, perfect 50/50 weight distribution. For those who want a sedan with character and passion.`,
    status: "publie",
    is_featured: false,
    photoKey: "alfa-romeo",
    features: [
      { feature: "Châssis Giorgio", category: "performance" },
      { feature: "Écran 8.8\" tactile", category: "multimedia" },
      { feature: "DNA Drive Mode", category: "performance" },
      { feature: "Freins Brembo", category: "sécurité" },
    ],
  },
]

// ── Fake VIN / Immatriculation generators ────────────────────────────────────
function fakeVIN(index: number): string {
  const base = "WDEMO"
  const chars = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789"
  let vin = base
  for (let i = 0; i < 12; i++) {
    vin += chars[(index * 7 + i * 3) % chars.length]
  }
  return vin.slice(0, 17)
}

function fakeImmat(index: number): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  const l1 = letters[(index * 3) % letters.length]
  const l2 = letters[(index * 7 + 1) % letters.length]
  const l3 = letters[(index * 11 + 2) % letters.length]
  const l4 = letters[(index * 13 + 3) % letters.length]
  const num = String(100 + index).slice(-3)
  return `${l1}${l2}-${num}-${l3}${l4}`
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
async function main() {
  const isReset = process.argv.includes("--reset")

  console.log("🚗 Auto Roi — Seed véhicules de démonstration")
  console.log("─".repeat(50))

  // ── Reset mode: supprimer les données demo existantes ──────────────────
  if (isReset) {
    console.log("🗑️  Mode --reset : suppression des données de démo…")

    // Trouver les véhicules démo par le marqueur dans description_fr
    const { data: existing } = await supabase
      .from("vehicles")
      .select("id")
      .like("description_fr", `%${DEMO_MARKER}%`)

    if (existing && existing.length > 0) {
      const ids = existing.map((v: { id: string }) => v.id)

      // Supprimer photos et features en cascade (ON DELETE CASCADE), mais on nettoie aussi explicitement
      await supabase.from("vehicle_photos").delete().in("vehicle_id", ids)
      await supabase.from("vehicle_features").delete().in("vehicle_id", ids)
      const { error } = await supabase.from("vehicles").delete().in("id", ids)

      if (error) {
        console.error("❌ Erreur suppression :", error.message)
        process.exit(1)
      }
      console.log(`   ✅ ${existing.length} véhicules de démo supprimés`)
    } else {
      console.log("   ℹ️  Aucune donnée de démo trouvée")
    }
  }

  // ── Vérifier les doublons ──────────────────────────────────────────────
  const { data: existingDemo } = await supabase
    .from("vehicles")
    .select("id")
    .like("description_fr", `%${DEMO_MARKER}%`)

  if (existingDemo && existingDemo.length > 0 && !isReset) {
    console.log(`⚠️  ${existingDemo.length} véhicules de démo déjà présents. Utilisez --reset pour recréer.`)
    process.exit(0)
  }

  // ── Insérer les véhicules ──────────────────────────────────────────────
  console.log("📦 Insertion de 20 véhicules…")

  const insertedIds: string[] = []

  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i]
    const slug = toSlug(v.brand, v.model, v.year)
    const created_at = staggeredDate(i)

    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        brand: v.brand,
        model: v.model,
        version: v.version,
        year: v.year,
        vehicle_type: v.vehicle_type,
        fuel: v.fuel,
        engine_size: v.engine_size,
        power_hp: v.power_hp,
        power_kw: v.power_kw,
        transmission: v.transmission,
        drive: v.drive,
        body: v.body,
        doors: v.doors,
        seats: v.seats,
        color_ext: v.color_ext,
        color_int: v.color_int,
        mileage: v.mileage,
        price: v.price,
        price_negotiable: v.price_negotiable,
        first_sale_date: v.first_sale_date,
        condition: v.condition,
        ct_status: v.ct_status,
        ct_date: v.ct_date,
        description_fr: v.description_fr,
        description_en: v.description_en,
        slug: slug,
        status: v.status,
        is_featured: v.is_featured,
        created_at: created_at,
      } as any)
      .select("id")
      .single()

    if (error) {
      console.error(`   ❌ ${v.brand} ${v.model} : ${error.message}`)
      continue
    }

    const vehicleId = data.id
    insertedIds.push(vehicleId)

    // ── Photos ───────────────────────────────────────────────────────────
    const photos = PHOTO_SETS[v.photoKey] || []
    if (photos.length > 0) {
      const photoInserts = photos.map((url, idx) => ({
        vehicle_id: vehicleId,
        url,
        storage_path: `demo/${slug}/${idx + 1}.jpg`,
        is_primary: idx === 0,
        sort_order: idx,
      }))

      const { error: photoErr } = await supabase
        .from("vehicle_photos")
        .insert(photoInserts as any)

      if (photoErr) {
        console.error(`   ⚠️  Photos ${v.brand} ${v.model} : ${photoErr.message}`)
      }
    }

    // ── Features / Équipements ───────────────────────────────────────────
    if (v.features.length > 0) {
      const featureInserts = v.features.map((f) => ({
        vehicle_id: vehicleId,
        feature: f.feature,
        category: f.category,
      }))

      const { error: featErr } = await supabase
        .from("vehicle_features")
        .insert(featureInserts as any)

      if (featErr) {
        console.error(`   ⚠️  Features ${v.brand} ${v.model} : ${featErr.message}`)
      }
    }

    const statusIcon = v.status === "publie" ? "🟢" : v.status === "vendu" ? "🔴" : "⚪"
    console.log(`   ${statusIcon} ${v.brand} ${v.model} ${v.year} — ${v.price.toLocaleString("fr-FR")}€ [${v.status}]`)
  }

  // ── Résumé ─────────────────────────────────────────────────────────────
  console.log("─".repeat(50))
  console.log(`✅ ${insertedIds.length}/20 véhicules insérés avec succès`)

  const publie = vehicles.filter((v) => v.status === "publie").length
  const brouillon = vehicles.filter((v) => v.status === "brouillon").length
  const vendu = vehicles.filter((v) => v.status === "vendu").length
  console.log(`   🟢 ${publie} publiés  ⚪ ${brouillon} brouillons  🔴 ${vendu} vendus`)
  console.log(`   📸 ${insertedIds.length * 3} photos associées`)
  console.log(`   🔧 ${vehicles.reduce((sum, v) => sum + v.features.length, 0)} équipements ajoutés`)
}

main().catch((err) => {
  console.error("❌ Erreur fatale :", err)
  process.exit(1)
})
