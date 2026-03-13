/**
 * Seed script — Insère 16 véhicules de location + 8 réservations de démo.
 *
 * Usage :
 *   npx tsx scripts/seed-rental-vehicles.ts          # insert (skip si déjà présents)
 *   npx tsx scripts/seed-rental-vehicles.ts --reset   # supprime puis recrée
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

const DEMO_MARKER = "[DEMO]"

// ── Helpers ──────────────────────────────────────────────────────────────────
function toSlug(brand: string, model: string, year: number): string {
  return `location-${brand}-${model}-${year}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function staggeredDate(index: number, totalDays: number): string {
  const now = new Date()
  const daysAgo = Math.floor((index / 16) * totalDays)
  return new Date(now.getTime() - daysAgo * 86_400_000).toISOString()
}

function futureDate(daysFromNow: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().split("T")[0] + "T09:00:00+00:00"
}

function pastDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split("T")[0] + "T09:00:00+00:00"
}

// ── Photos Unsplash ──────────────────────────────────────────────────────────
const PHOTOS: Record<string, string[]> = {
  lamborghini: [
    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
    "https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800&q=80",
    "https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?w=800&q=80",
    "https://images.unsplash.com/photo-1525609004556-c46c60edc35c?w=800&q=80",
  ],
  ferrari: [
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
    "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
  ],
  "porsche-gt3": [
    "https://images.unsplash.com/photo-1614162692292-7ac56d7f787e?w=800&q=80",
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800&q=80",
    "https://images.unsplash.com/photo-1611821064430-0d40291d0f0b?w=800&q=80",
    "https://images.unsplash.com/photo-1580274455191-1c62238ce452?w=800&q=80",
  ],
  "aston-martin": [
    "https://images.unsplash.com/photo-1596906092732-56f4b2780cd8?w=800&q=80",
    "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
  ],
  "porsche-911": [
    "https://images.unsplash.com/photo-1614162692292-7ac56d7f787e?w=800&q=80",
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800&q=80",
    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
    "https://images.unsplash.com/photo-1611821064430-0d40291d0f0b?w=800&q=80",
  ],
  "bmw-m": [
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80",
    "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=800&q=80",
  ],
  "mercedes-amg": [
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80",
    "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80",
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
  "bmw-x6": [
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    "https://images.unsplash.com/photo-1520050206757-cda1e3eb0fa3?w=800&q=80",
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0ffe?w=800&q=80",
  ],
  "ferrari-cab": [
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
    "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800&q=80",
    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
  ],
  "porsche-boxster": [
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800&q=80",
    "https://images.unsplash.com/photo-1614162692292-7ac56d7f787e?w=800&q=80",
    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
  ],
  "mercedes-sl": [
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80",
    "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80",
  ],
  "rolls-royce": [
    "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    "https://images.unsplash.com/photo-1580274455191-1c62238ce452?w=800&q=80",
  ],
  bentley: [
    "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80",
    "https://images.unsplash.com/photo-1580274455191-1c62238ce452?w=800&q=80",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
  ],
  "mercedes-s": [
    "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80",
    "https://images.unsplash.com/photo-1618843479619-f3d0d81e4d10?w=800&q=80",
    "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80",
  ],
}

// ── Les 16 véhicules de location ─────────────────────────────────────────────
interface SeedRentalVehicle {
  brand: string
  model: string
  version: string | null
  year: number
  vehicle_type: string
  fuel: string
  transmission: string
  body: string
  seats: number
  doors: number
  color: string
  mileage: number
  power_hp: number
  description_fr: string
  description_en: string
  price_per_day: number
  price_per_hour: number | null
  pricing_tiers: { days_from: number; days_to?: number; price_per_day: number }[]
  weekend_surcharge: number
  holiday_surcharge: number
  deposit_amount: number
  deposit_percentage: number
  included_km_per_day: number
  extra_km_price: number
  status: "disponible" | "indisponible" | "maintenance"
  photoKey: string
}

const vehicles: SeedRentalVehicle[] = [
  // ═══ SUPERCARS & LUXE EXTRÊME (3) ═════════════════════════════════════════
  {
    brand: "Lamborghini",
    model: "Huracán EVO",
    version: "LP 610-4",
    year: 2022,
    vehicle_type: "voiture",
    fuel: "essence",
    transmission: "automatique",
    body: "coupe",
    seats: 2,
    doors: 2,
    color: "Jaune Giallo Inti",
    mileage: 8200,
    power_hp: 610,
    description_fr: `${DEMO_MARKER} Lamborghini Huracán EVO, l'expression ultime de la démesure italienne. V10 atmosphérique de 610 chevaux, sonorité enivrante, accélération foudroyante. Vivez l'expérience supercar absolue avec AUTO ROI.`,
    description_en: `${DEMO_MARKER} Lamborghini Huracán EVO, the ultimate expression of Italian excess. Naturally aspirated V10 with 610 hp, intoxicating sound, blistering acceleration. Experience the absolute supercar with AUTO ROI.`,
    price_per_day: 1800,
    price_per_hour: null,
    pricing_tiers: [
      { days_from: 1, days_to: 1, price_per_day: 1800 },
      { days_from: 2, days_to: 3, price_per_day: 1600 },
      { days_from: 4, price_per_day: 1400 },
    ],
    weekend_surcharge: 15,
    holiday_surcharge: 20,
    deposit_amount: 10000,
    deposit_percentage: 30,
    included_km_per_day: 200,
    extra_km_price: 2.50,
    status: "disponible",
    photoKey: "lamborghini",
  },
  {
    brand: "Ferrari",
    model: "F8 Tributo",
    version: "3.9 V8 Biturbo",
    year: 2021,
    vehicle_type: "voiture",
    fuel: "essence",
    transmission: "automatique",
    body: "coupe",
    seats: 2,
    doors: 2,
    color: "Rouge Rosso Corsa",
    mileage: 11500,
    power_hp: 720,
    description_fr: `${DEMO_MARKER} Ferrari F8 Tributo, le summum du V8 turbo de Maranello. 720 chevaux, châssis dérivé de la piste, aérodynamique active. L'émotion Ferrari dans sa forme la plus pure, disponible en location exclusive chez AUTO ROI.`,
    description_en: `${DEMO_MARKER} Ferrari F8 Tributo, the pinnacle of Maranello's turbo V8. 720 hp, track-derived chassis, active aerodynamics. The Ferrari emotion in its purest form, available for exclusive rental at AUTO ROI.`,
    price_per_day: 1500,
    price_per_hour: null,
    pricing_tiers: [
      { days_from: 1, days_to: 1, price_per_day: 1500 },
      { days_from: 2, days_to: 3, price_per_day: 1350 },
      { days_from: 4, price_per_day: 1200 },
    ],
    weekend_surcharge: 15,
    holiday_surcharge: 20,
    deposit_amount: 10000,
    deposit_percentage: 30,
    included_km_per_day: 200,
    extra_km_price: 2.00,
    status: "disponible",
    photoKey: "ferrari",
  },
  {
    brand: "Porsche",
    model: "911 GT3",
    version: "992 4.0 PDK",
    year: 2023,
    vehicle_type: "voiture",
    fuel: "essence",
    transmission: "automatique",
    body: "coupe",
    seats: 2,
    doors: 2,
    color: "Blanc Carrara",
    mileage: 4800,
    power_hp: 510,
    description_fr: `${DEMO_MARKER} Porsche 911 GT3, la quintessence de la sportivité allemande. Flat-6 atmosphérique de 510 chevaux hurlant à 9 000 tr/min, châssis dérivé du Motorsport. La piste à portée de main, en location chez AUTO ROI.`,
    description_en: `${DEMO_MARKER} Porsche 911 GT3, the quintessence of German sportiness. Naturally aspirated Flat-6 screaming to 9,000 rpm, Motorsport-derived chassis. The track at your fingertips, for rent at AUTO ROI.`,
    price_per_day: 900,
    price_per_hour: null,
    pricing_tiers: [
      { days_from: 1, days_to: 1, price_per_day: 900 },
      { days_from: 2, days_to: 3, price_per_day: 800 },
      { days_from: 4, price_per_day: 700 },
    ],
    weekend_surcharge: 10,
    holiday_surcharge: 15,
    deposit_amount: 8000,
    deposit_percentage: 30,
    included_km_per_day: 250,
    extra_km_price: 1.80,
    status: "disponible",
    photoKey: "porsche-gt3",
  },

  // ═══ SPORT & PRESTIGE (4) ═════════════════════════════════════════════════
  {
    brand: "Aston Martin",
    model: "Vantage",
    version: "4.0 V8 Biturbo",
    year: 2022,
    vehicle_type: "voiture",
    fuel: "essence",
    transmission: "automatique",
    body: "coupe",
    seats: 2,
    doors: 2,
    color: "Vert British Racing",
    mileage: 15200,
    power_hp: 510,
    description_fr: `${DEMO_MARKER} Aston Martin Vantage, l'élégance sportive britannique incarnée. V8 biturbo de 510 chevaux, silhouette sculpturale, intérieur sur-mesure. Le charme de James Bond, disponible en location prestige chez AUTO ROI.`,
    description_en: `${DEMO_MARKER} Aston Martin Vantage, British sporting elegance incarnate. 510 hp twin-turbo V8, sculptural silhouette, bespoke interior. James Bond charm, available for prestige rental at AUTO ROI.`,
    price_per_day: 750,
    price_per_hour: null,
    pricing_tiers: [
      { days_from: 1, days_to: 1, price_per_day: 750 },
      { days_from: 2, days_to: 3, price_per_day: 680 },
      { days_from: 4, price_per_day: 600 },
    ],
    weekend_surcharge: 10,
    holiday_surcharge: 15,
    deposit_amount: 7000,
    deposit_percentage: 30,
    included_km_per_day: 250,
    extra_km_price: 1.50,
    status: "disponible",
    photoKey: "aston-martin",
  },
  {
    brand: "Porsche",
    model: "911 Carrera S",
    version: "992 3.0 PDK",
    year: 2023,
    vehicle_type: "voiture",
    fuel: "essence",
    transmission: "automatique",
    body: "coupe",
    seats: 4,
    doors: 2,
    color: "Bleu Gentian",
    mileage: 9800,
    power_hp: 450,
    description_fr: `${DEMO_MARKER} Porsche 911 Carrera S, l'icône sportive par excellence. 450 chevaux de pure adrénaline, transmission PDK ultra-rapide, intérieur cuir luxueux. Le grand tourisme sportif en location premium chez AUTO ROI.`,
    description_en: `${DEMO_MARKER} Porsche 911 Carrera S, the ultimate sports icon. 450 hp of pure adrenaline, ultra-fast PDK transmission, luxurious leather interior. Premium sport GT rental at AUTO ROI.`,
    price_per_day: 550,
    price_per_hour: null,
    pricing_tiers: [
      { days_from: 1, days_to: 1, price_per_day: 550 },
      { days_from: 2, days_to: 3, price_per_day: 490 },
      { days_from: 4, price_per_day: 430 },
    ],
    weekend_surcharge: 10,
    holiday_surcharge: 15,
    deposit_amount: 6000,
    deposit_percentage: 30,
    included_km_per_day: 300,
    extra_km_price: 1.20,
    status: "disponible",
    photoKey: "porsche-911",
  },
  {
    brand: "BMW",
    model: "M4 Competition",
    version: "G82 xDrive",
    year: 2023,
    vehicle_type: "voiture",
    fuel: "essence",
    transmission: "automatique",
    body: "coupe",
    seats: 4,
    doors: 2,
    color: "Noir Saphir",
    mileage: 12400,
    power_hp: 510,
    description_fr: `${DEMO_MARKER} BMW M4 Competition xDrive, la sportive bavaroise à la polyvalence redoutable. 510 chevaux, transmission intégrale, châssis affûté. Performances de supercar au quotidien, en location chez AUTO ROI.`,
    description_en: `${DEMO_MARKER} BMW M4 Competition xDrive, the Bavarian sports car with formidable versatility. 510 hp, all-wheel drive, razor-sharp chassis. Supercar performance for daily use, for rent at AUTO ROI.`,
    price_per_day: 380,
    price_per_hour: null,
    pricing_tiers: [
      { days_from: 1, days_to: 1, price_per_day: 380 },
      { days_from: 2, days_to: 3, price_per_day: 340 },
      { days_from: 4, price_per_day: 300 },
    ],
    weekend_surcharge: 10,
    holiday_surcharge: 15,
    deposit_amount: 4000,
    deposit_percentage: 30,
    included_km_per_day: 300,
    extra_km_price: 0.80,
    status: "disponible",
    photoKey: "bmw-m",
  },
  {
    brand: "Mercedes-Benz",
    model: "AMG C63 S",
    version: "W206 2.0 Turbo E-Performance",
    year: 2022,
    vehicle_type: "voiture",
    fuel: "hybride",
    transmission: "automatique",
    body: "berline",
    seats: 5,
    doors: 4,
    color: "Gris Mojave",
    mileage: 18600,
    power_hp: 476,
    description_fr: `${DEMO_MARKER} Mercedes-AMG C63 S, la berline sportive étoilée par excellence. 476 chevaux hybrides, sonorité AMG distinctive, intérieur cuir Nappa. Puissance et raffinement au quotidien, en location prestige chez AUTO ROI.`,
    description_en: `${DEMO_MARKER} Mercedes-AMG C63 S, the quintessential sporting sedan. 476 hybrid hp, distinctive AMG sound, Nappa leather interior. Power and refinement for daily use, prestige rental at AUTO ROI.`,
    price_per_day: 350,
    price_per_hour: null,
    pricing_tiers: [
      { days_from: 1, days_to: 1, price_per_day: 350 },
      { days_from: 2, days_to: 3, price_per_day: 310 },
      { days_from: 4, price_per_day: 280 },
    ],
    weekend_surcharge: 10,
    holiday_surcharge: 15,
    deposit_amount: 4000,
    deposit_percentage: 30,
    included_km_per_day: 300,
    extra_km_price: 0.75,
    status: "disponible",
    photoKey: "mercedes-amg",
  },

  // ═══ SUV PREMIUM (3) ══════════════════════════════════════════════════════
  {
    brand: "Land Rover",
    model: "Range Rover",
    version: "Autobiography P530 V8",
    year: 2023,
    vehicle_type: "voiture",
    fuel: "essence",
    transmission: "automatique",
    body: "suv",
    seats: 5,
    doors: 5,
    color: "Blanc Fuji",
    mileage: 9800,
    power_hp: 530,
    description_fr: `${DEMO_MARKER} Range Rover Autobiography, le roi incontesté des SUV de luxe. V8 de 530 chevaux, intérieur digne d'un salon privé, technologie de pointe. Le prestige absolu sur route comme en tout-terrain, chez AUTO ROI.`,
    description_en: `${DEMO_MARKER} Range Rover Autobiography, the undisputed king of luxury SUVs. 530 hp V8, interior worthy of a private lounge, cutting-edge technology. Absolute prestige on-road and off, at AUTO ROI.`,
    price_per_day: 480,
    price_per_hour: null,
    pricing_tiers: [
      { days_from: 1, days_to: 1, price_per_day: 480 },
      { days_from: 2, days_to: 3, price_per_day: 430 },
      { days_from: 4, price_per_day: 380 },
    ],
    weekend_surcharge: 10,
    holiday_surcharge: 15,
    deposit_amount: 5000,
    deposit_percentage: 30,
    included_km_per_day: 300,
    extra_km_price: 1.00,
    status: "disponible",
    photoKey: "range-rover",
  },
  {
    brand: "Porsche",
    model: "Cayenne GTS",
    version: "4.0 V8 Tiptronic",
    year: 2022,
    vehicle_type: "voiture",
    fuel: "essence",
    transmission: "automatique",
    body: "suv",
    seats: 5,
    doors: 5,
    color: "Noir",
    mileage: 22100,
    power_hp: 460,
    description_fr: `${DEMO_MARKER} Porsche Cayenne GTS, le SUV sportif qui ne fait aucun compromis. V8 de 460 chevaux, châssis abaissé GTS, freins carbone-céramique. La sportivité Porsche dans un format familial, en location chez AUTO ROI.`,
    description_en: `${DEMO_MARKER} Porsche Cayenne GTS, the sports SUV that makes no compromises. 460 hp V8, lowered GTS chassis, carbon-ceramic brakes. Porsche sportiness in a family format, for rent at AUTO ROI.`,
    price_per_day: 320,
    price_per_hour: null,
    pricing_tiers: [
      { days_from: 1, days_to: 1, price_per_day: 320 },
      { days_from: 2, days_to: 3, price_per_day: 290 },
      { days_from: 4, price_per_day: 260 },
    ],
    weekend_surcharge: 10,
    holiday_surcharge: 15,
    deposit_amount: 4000,
    deposit_percentage: 30,
    included_km_per_day: 300,
    extra_km_price: 0.90,
    status: "disponible",
    photoKey: "porsche-cayenne",
  },
  {
    brand: "BMW",
    model: "X6 M Competition",
    version: "F96 4.4 V8",
    year: 2023,
    vehicle_type: "voiture",
    fuel: "essence",
    transmission: "automatique",
    body: "suv",
    seats: 5,
    doors: 5,
    color: "Gris Donington",
    mileage: 7600,
    power_hp: 625,
    description_fr: `${DEMO_MARKER} BMW X6 M Competition, le SUV coupé le plus puissant de sa catégorie. 625 chevaux, V8 biturbo, silhouette agressive. La performance brute dans un format imposant, en location exclusive chez AUTO ROI.`,
    description_en: `${DEMO_MARKER} BMW X6 M Competition, the most powerful SUV coupe in its class. 625 hp, twin-turbo V8, aggressive silhouette. Raw performance in an imposing format, exclusive rental at AUTO ROI.`,
    price_per_day: 350,
    price_per_hour: null,
    pricing_tiers: [
      { days_from: 1, days_to: 1, price_per_day: 350 },
      { days_from: 2, days_to: 3, price_per_day: 310 },
      { days_from: 4, price_per_day: 280 },
    ],
    weekend_surcharge: 10,
    holiday_surcharge: 15,
    deposit_amount: 4000,
    deposit_percentage: 30,
    included_km_per_day: 300,
    extra_km_price: 0.85,
    status: "disponible",
    photoKey: "bmw-x6",
  },

  // ═══ CABRIOLETS & ROADSTERS (3) ═══════════════════════════════════════════
  {
    brand: "Ferrari",
    model: "Portofino M",
    version: "3.9 V8 Biturbo Spider",
    year: 2022,
    vehicle_type: "voiture",
    fuel: "essence",
    transmission: "automatique",
    body: "cabriolet",
    seats: 4,
    doors: 2,
    color: "Rouge Rosso Corsa",
    mileage: 13200,
    power_hp: 620,
    description_fr: `${DEMO_MARKER} Ferrari Portofino M, le grand tourisme cabriolet signé Maranello. 620 chevaux, toit rétractable rigide, élégance italienne absolue. Le Cavallino Rampante cheveux au vent, en location prestige chez AUTO ROI.`,
    description_en: `${DEMO_MARKER} Ferrari Portofino M, Maranello's grand touring convertible. 620 hp, retractable hardtop, absolute Italian elegance. The Prancing Horse with wind in your hair, prestige rental at AUTO ROI.`,
    price_per_day: 1200,
    price_per_hour: null,
    pricing_tiers: [
      { days_from: 1, days_to: 1, price_per_day: 1200 },
      { days_from: 2, days_to: 3, price_per_day: 1050 },
      { days_from: 4, price_per_day: 950 },
    ],
    weekend_surcharge: 15,
    holiday_surcharge: 20,
    deposit_amount: 9000,
    deposit_percentage: 30,
    included_km_per_day: 200,
    extra_km_price: 2.00,
    status: "disponible",
    photoKey: "ferrari-cab",
  },
  {
    brand: "Porsche",
    model: "718 Boxster GTS",
    version: "4.0 Flat-6",
    year: 2023,
    vehicle_type: "voiture",
    fuel: "essence",
    transmission: "automatique",
    body: "cabriolet",
    seats: 2,
    doors: 2,
    color: "Argent GT",
    mileage: 6400,
    power_hp: 400,
    description_fr: `${DEMO_MARKER} Porsche 718 Boxster GTS 4.0, le roadster mid-engine par excellence. Flat-6 atmosphérique de 400 chevaux, capote souple, équilibre parfait. Le plaisir de conduire à ciel ouvert, en location chez AUTO ROI.`,
    description_en: `${DEMO_MARKER} Porsche 718 Boxster GTS 4.0, the quintessential mid-engine roadster. Naturally aspirated Flat-6 with 400 hp, soft-top, perfect balance. Open-air driving pleasure, for rent at AUTO ROI.`,
    price_per_day: 420,
    price_per_hour: null,
    pricing_tiers: [
      { days_from: 1, days_to: 1, price_per_day: 420 },
      { days_from: 2, days_to: 3, price_per_day: 380 },
      { days_from: 4, price_per_day: 340 },
    ],
    weekend_surcharge: 10,
    holiday_surcharge: 15,
    deposit_amount: 4500,
    deposit_percentage: 30,
    included_km_per_day: 300,
    extra_km_price: 1.00,
    status: "disponible",
    photoKey: "porsche-boxster",
  },
  {
    brand: "Mercedes-Benz",
    model: "SL 63 AMG",
    version: "R232 4.0 V8 4MATIC+",
    year: 2023,
    vehicle_type: "voiture",
    fuel: "essence",
    transmission: "automatique",
    body: "cabriolet",
    seats: 2,
    doors: 2,
    color: "Noir Obsidien",
    mileage: 8900,
    power_hp: 585,
    description_fr: `${DEMO_MARKER} Mercedes-AMG SL 63, la légende décapotable réinventée. V8 biturbo de 585 chevaux, capote souple électrique, technologie AMG Track Pace. Le grand luxe sportif à ciel ouvert, en location chez AUTO ROI.`,
    description_en: `${DEMO_MARKER} Mercedes-AMG SL 63, the convertible legend reinvented. 585 hp twin-turbo V8, electric soft-top, AMG Track Pace technology. Grand sporting luxury under open skies, for rent at AUTO ROI.`,
    price_per_day: 580,
    price_per_hour: null,
    pricing_tiers: [
      { days_from: 1, days_to: 1, price_per_day: 580 },
      { days_from: 2, days_to: 3, price_per_day: 520 },
      { days_from: 4, price_per_day: 460 },
    ],
    weekend_surcharge: 10,
    holiday_surcharge: 15,
    deposit_amount: 6000,
    deposit_percentage: 30,
    included_km_per_day: 300,
    extra_km_price: 1.20,
    status: "disponible",
    photoKey: "mercedes-sl",
  },

  // ═══ BERLINES PRESTIGE (3) ════════════════════════════════════════════════
  {
    brand: "Rolls-Royce",
    model: "Ghost",
    version: "6.75 V12",
    year: 2021,
    vehicle_type: "voiture",
    fuel: "essence",
    transmission: "automatique",
    body: "berline",
    seats: 5,
    doors: 4,
    color: "Blanc Arctic",
    mileage: 16800,
    power_hp: 563,
    description_fr: `${DEMO_MARKER} Rolls-Royce Ghost, le summum du luxe automobile mondial. V12 de 563 chevaux dans un silence absolu, intérieur entièrement personnalisé, ciel étoilé. L'expérience automobile la plus exclusive au monde, chez AUTO ROI.`,
    description_en: `${DEMO_MARKER} Rolls-Royce Ghost, the pinnacle of world automotive luxury. 563 hp V12 in absolute silence, fully bespoke interior, starlight headliner. The most exclusive automotive experience in the world, at AUTO ROI.`,
    price_per_day: 2500,
    price_per_hour: null,
    pricing_tiers: [
      { days_from: 1, days_to: 1, price_per_day: 2500 },
      { days_from: 2, days_to: 3, price_per_day: 2200 },
      { days_from: 4, price_per_day: 1900 },
    ],
    weekend_surcharge: 15,
    holiday_surcharge: 20,
    deposit_amount: 15000,
    deposit_percentage: 30,
    included_km_per_day: 200,
    extra_km_price: 3.00,
    status: "disponible",
    photoKey: "rolls-royce",
  },
  {
    brand: "Bentley",
    model: "Flying Spur",
    version: "W12 6.0 Speed",
    year: 2022,
    vehicle_type: "voiture",
    fuel: "essence",
    transmission: "automatique",
    body: "berline",
    seats: 5,
    doors: 4,
    color: "Bleu Sequin",
    mileage: 14200,
    power_hp: 635,
    description_fr: `${DEMO_MARKER} Bentley Flying Spur Speed, la berline de luxe la plus rapide au monde. W12 de 635 chevaux, cuir pleine fleur, boiseries massives. Le raffinement britannique poussé à son paroxysme, en location chez AUTO ROI.`,
    description_en: `${DEMO_MARKER} Bentley Flying Spur Speed, the fastest luxury sedan in the world. 635 hp W12, full-grain leather, solid wood veneers. British refinement pushed to its peak, for rent at AUTO ROI.`,
    price_per_day: 1800,
    price_per_hour: null,
    pricing_tiers: [
      { days_from: 1, days_to: 1, price_per_day: 1800 },
      { days_from: 2, days_to: 3, price_per_day: 1550 },
      { days_from: 4, price_per_day: 1350 },
    ],
    weekend_surcharge: 15,
    holiday_surcharge: 20,
    deposit_amount: 12000,
    deposit_percentage: 30,
    included_km_per_day: 200,
    extra_km_price: 2.50,
    status: "disponible",
    photoKey: "bentley",
  },
  {
    brand: "Mercedes-Benz",
    model: "Classe S",
    version: "S580 4MATIC L",
    year: 2023,
    vehicle_type: "voiture",
    fuel: "essence",
    transmission: "automatique",
    body: "berline",
    seats: 5,
    doors: 4,
    color: "Noir Obsidien",
    mileage: 11200,
    power_hp: 435,
    description_fr: `${DEMO_MARKER} Mercedes Classe S, la référence mondiale des berlines de luxe. 435 chevaux, empattement long, sièges arrière inclinables, système MBUX hyper-écran. Le voyage en première classe sur quatre roues, chez AUTO ROI.`,
    description_en: `${DEMO_MARKER} Mercedes S-Class, the global benchmark for luxury sedans. 435 hp, long wheelbase, reclining rear seats, MBUX hyperscreen system. First-class travel on four wheels, at AUTO ROI.`,
    price_per_day: 450,
    price_per_hour: null,
    pricing_tiers: [
      { days_from: 1, days_to: 1, price_per_day: 450 },
      { days_from: 2, days_to: 3, price_per_day: 400 },
      { days_from: 4, price_per_day: 350 },
    ],
    weekend_surcharge: 10,
    holiday_surcharge: 15,
    deposit_amount: 5000,
    deposit_percentage: 30,
    included_km_per_day: 300,
    extra_km_price: 1.00,
    status: "disponible",
    photoKey: "mercedes-s",
  },
]

// ── Réservations fictives ────────────────────────────────────────────────────
interface SeedRental {
  vehicleIndex: number // index dans vehicles[]
  client_first_name: string
  client_last_name: string
  client_email: string
  client_phone: string
  start_date: string
  end_date: string
  total_days: number
  status: "pending" | "confirmed" | "deposit_paid" | "completed"
  deposit_paid: boolean
  cgv_accepted: boolean
}

const rentals: SeedRental[] = [
  {
    vehicleIndex: 6, // Mercedes AMG C63 S
    client_first_name: "Jean-Marc",
    client_last_name: "Dubois",
    client_email: "jm.dubois@demo.fr",
    client_phone: "+33612345601",
    start_date: futureDate(1),
    end_date: futureDate(4),
    total_days: 3,
    status: "confirmed",
    deposit_paid: true,
    cgv_accepted: true,
  },
  {
    vehicleIndex: 12, // Mercedes SL 63 AMG
    client_first_name: "Sophie",
    client_last_name: "Laurent",
    client_email: "sophie.laurent@demo.fr",
    client_phone: "+33612345602",
    start_date: futureDate(2),
    end_date: futureDate(7),
    total_days: 5,
    status: "confirmed",
    deposit_paid: true,
    cgv_accepted: true,
  },
  {
    vehicleIndex: 4, // Porsche 911 Carrera S
    client_first_name: "Alexandre",
    client_last_name: "Martin",
    client_email: "a.martin@demo.fr",
    client_phone: "+33612345603",
    start_date: futureDate(7),
    end_date: futureDate(9),
    total_days: 2,
    status: "confirmed",
    deposit_paid: true,
    cgv_accepted: true,
  },
  {
    vehicleIndex: 5, // BMW M4 Competition
    client_first_name: "Thomas",
    client_last_name: "Bernard",
    client_email: "t.bernard@demo.fr",
    client_phone: "+33612345604",
    start_date: pastDate(5),
    end_date: pastDate(2),
    total_days: 3,
    status: "completed",
    deposit_paid: true,
    cgv_accepted: true,
  },
  {
    vehicleIndex: 7, // Range Rover Autobiography
    client_first_name: "Isabelle",
    client_last_name: "Moreau",
    client_email: "i.moreau@demo.fr",
    client_phone: "+33612345605",
    start_date: pastDate(10),
    end_date: pastDate(7),
    total_days: 3,
    status: "completed",
    deposit_paid: true,
    cgv_accepted: true,
  },
  {
    vehicleIndex: 0, // Lamborghini Huracán
    client_first_name: "Pierre",
    client_last_name: "Leclerc",
    client_email: "p.leclerc@demo.fr",
    client_phone: "+33612345606",
    start_date: futureDate(14),
    end_date: futureDate(17),
    total_days: 3,
    status: "pending",
    deposit_paid: false,
    cgv_accepted: true,
  },
  {
    vehicleIndex: 1, // Ferrari F8 Tributo
    client_first_name: "Nathalie",
    client_last_name: "Rousseau",
    client_email: "n.rousseau@demo.fr",
    client_phone: "+33612345607",
    start_date: futureDate(21),
    end_date: futureDate(25),
    total_days: 4,
    status: "confirmed",
    deposit_paid: true,
    cgv_accepted: true,
  },
  {
    vehicleIndex: 13, // Rolls-Royce Ghost
    client_first_name: "Marc",
    client_last_name: "Fontaine",
    client_email: "m.fontaine@demo.fr",
    client_phone: "+33612345608",
    start_date: futureDate(30),
    end_date: futureDate(32),
    total_days: 2,
    status: "confirmed",
    deposit_paid: true,
    cgv_accepted: true,
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
async function main() {
  const isReset = process.argv.includes("--reset")

  console.log("🏎️  Auto Roi — Seed véhicules de location + réservations")
  console.log("─".repeat(55))

  // ── Reset ──────────────────────────────────────────────────────────────
  if (isReset) {
    console.log("🗑️  Mode --reset : suppression des données de démo…")

    const { data: existing } = await supabase
      .from("rental_vehicles")
      .select("id")
      .like("description_fr", `%${DEMO_MARKER}%`)

    if (existing && existing.length > 0) {
      const ids = existing.map((v: { id: string }) => v.id)

      // Supprimer réservations liées (ON DELETE RESTRICT → supprimer d'abord)
      await supabase.from("rentals").delete().in("rental_vehicle_id", ids)
      // Supprimer photos (ON DELETE CASCADE mais on nettoie explicitement)
      await supabase.from("rental_vehicle_photos").delete().in("rental_vehicle_id", ids)
      // Supprimer véhicules
      const { error } = await supabase.from("rental_vehicles").delete().in("id", ids)

      if (error) {
        console.error("❌ Erreur suppression :", error.message)
        process.exit(1)
      }
      console.log(`   ✅ ${existing.length} véhicules location + réservations supprimés`)
    } else {
      console.log("   ℹ️  Aucune donnée de démo trouvée")
    }
  }

  // ── Vérifier doublons ──────────────────────────────────────────────────
  const { data: existingDemo } = await supabase
    .from("rental_vehicles")
    .select("id")
    .like("description_fr", `%${DEMO_MARKER}%`)

  if (existingDemo && existingDemo.length > 0 && !isReset) {
    console.log(`⚠️  ${existingDemo.length} véhicules location démo déjà présents. Utilisez --reset pour recréer.`)
    process.exit(0)
  }

  // ── Insérer les véhicules ──────────────────────────────────────────────
  console.log("\n📦 Insertion de 16 véhicules de location…")

  const insertedVehicles: { id: string; index: number }[] = []

  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i]
    const slug = toSlug(v.brand, v.model, v.year)
    const created_at = staggeredDate(i, 90)

    const photos = (PHOTOS[v.photoKey] || []).map((url, idx) => ({
      url,
      is_cover: idx === 0,
    }))

    const { data, error } = await supabase
      .from("rental_vehicles")
      .insert({
        brand: v.brand,
        model: v.model,
        version: v.version,
        year: v.year,
        vehicle_type: v.vehicle_type,
        fuel: v.fuel,
        transmission: v.transmission,
        body: v.body,
        seats: v.seats,
        doors: v.doors,
        color: v.color,
        mileage: v.mileage,
        power_hp: v.power_hp,
        description_fr: v.description_fr,
        description_en: v.description_en,
        price_per_day: v.price_per_day,
        price_per_hour: v.price_per_hour,
        pricing_tiers: JSON.stringify(v.pricing_tiers),
        weekend_surcharge: v.weekend_surcharge,
        holiday_surcharge: v.holiday_surcharge,
        deposit_amount: v.deposit_amount,
        deposit_percentage: v.deposit_percentage,
        included_km_per_day: v.included_km_per_day,
        extra_km_price: v.extra_km_price,
        status: v.status,
        photos: JSON.stringify(photos),
        cover_photo: photos[0]?.url || null,
        slug,
        created_at,
      } as any)
      .select("id")
      .single()

    if (error) {
      console.error(`   ❌ ${v.brand} ${v.model} : ${error.message}`)
      continue
    }

    insertedVehicles.push({ id: data.id, index: i })

    // ── Photos dans rental_vehicle_photos ─────────────────────────────
    const photoUrls = PHOTOS[v.photoKey] || []
    if (photoUrls.length > 0) {
      const photoInserts = photoUrls.map((url, idx) => ({
        rental_vehicle_id: data.id,
        url,
        storage_path: `demo/rental/${slug}/${idx + 1}.jpg`,
        is_primary: idx === 0,
        sort_order: idx,
      }))

      const { error: photoErr } = await supabase
        .from("rental_vehicle_photos")
        .insert(photoInserts as any)

      if (photoErr) {
        console.error(`   ⚠️  Photos ${v.brand} ${v.model} : ${photoErr.message}`)
      }
    }

    const priceStr = v.price_per_day.toLocaleString("fr-FR")
    console.log(`   🟢 ${v.brand} ${v.model} ${v.year} — ${priceStr}€/jour [${v.status}]`)
  }

  // ── Insérer les réservations ───────────────────────────────────────────
  console.log("\n📋 Insertion de 8 réservations de démo…")

  let rentalCount = 0

  for (const r of rentals) {
    const vehicleEntry = insertedVehicles.find((v) => v.index === r.vehicleIndex)
    if (!vehicleEntry) {
      console.error(`   ❌ Véhicule index ${r.vehicleIndex} non trouvé, skip réservation`)
      continue
    }

    const v = vehicles[r.vehicleIndex]
    const basePricePerDay = v.price_per_day
    const subtotal = basePricePerDay * r.total_days
    const totalAmount = subtotal
    const depositAmount = v.deposit_amount

    const { error } = await supabase.from("rentals").insert({
      rental_vehicle_id: vehicleEntry.id,
      start_date: r.start_date,
      end_date: r.end_date,
      total_days: r.total_days,
      base_price_per_day: basePricePerDay,
      subtotal,
      options_total: 0,
      surcharge_total: 0,
      total_amount: totalAmount,
      deposit_amount: depositAmount,
      deposit_paid: r.deposit_paid,
      deposit_paid_at: r.deposit_paid ? new Date().toISOString() : null,
      selected_options: JSON.stringify([]),
      client_first_name: r.client_first_name,
      client_last_name: r.client_last_name,
      client_email: r.client_email,
      client_phone: r.client_phone,
      client_address: "12 Rue de la Démo",
      client_city: "Metz",
      client_postal_code: "57000",
      is_business: false,
      cgv_accepted: r.cgv_accepted,
      cgv_accepted_at: r.cgv_accepted ? new Date().toISOString() : null,
      status: r.status,
      internal_notes: `${DEMO_MARKER} Réservation de démonstration`,
    } as any)

    if (error) {
      console.error(`   ❌ Résa ${r.client_first_name} ${r.client_last_name} : ${error.message}`)
      continue
    }

    const statusLabel: Record<string, string> = {
      pending: "⏳ en attente",
      confirmed: "✅ confirmée",
      completed: "🏁 terminée",
      deposit_paid: "💳 acompte payé",
    }

    console.log(
      `   ${statusLabel[r.status] || r.status} ${r.client_first_name} ${r.client_last_name} → ${v.brand} ${v.model} (${r.total_days}j)`
    )
    rentalCount++
  }

  // ── Résumé ─────────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(55))
  console.log(`✅ ${insertedVehicles.length}/16 véhicules de location insérés`)
  console.log(`✅ ${rentalCount}/8 réservations de démo créées`)

  const totalPhotos = insertedVehicles.reduce((sum, v) => {
    const key = vehicles[v.index].photoKey
    return sum + (PHOTOS[key]?.length || 0)
  }, 0)
  console.log(`   📸 ${totalPhotos} photos associées`)

  const confirmed = rentals.filter((r) => r.status === "confirmed").length
  const completed = rentals.filter((r) => r.status === "completed").length
  const pending = rentals.filter((r) => r.status === "pending").length
  console.log(`   ✅ ${confirmed} confirmées  🏁 ${completed} terminées  ⏳ ${pending} en attente`)
}

main().catch((err) => {
  console.error("❌ Erreur fatale :", err)
  process.exit(1)
})
