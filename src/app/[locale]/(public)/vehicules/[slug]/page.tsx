import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import dynamic from "next/dynamic"
import {
  Calendar, Gauge, Fuel, Settings,
  DoorOpen, Zap, Shield, Star, Monitor, Sparkles,
  CheckCircle2, Home, ChevronRight,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/server"
// VehicleGallery lazy-loaded below (framer-motion + heavy image logic)
import { VehicleCard } from "@/components/vehicle/VehicleCard"
import { VehicleContactBlock } from "@/components/contact/VehicleContactBlock"
import { getSiteSettings } from "@/lib/site-settings"
import { formatPrice, formatMileage } from "@/lib/utils"
import {
  FUEL_LABELS, TRANSMISSION_LABELS, BODY_LABELS,
  CONDITION_LABELS, DRIVE_LABELS, SITE_URL,
} from "@/lib/constants"
import { FEATURES_BY_CATEGORY } from "@/lib/validations/vehicle"
import type {
  FuelType, TransmissionType, BodyType, ConditionType,
  CtStatus, VehicleType, DriveType,
} from "@/types/database"
import type { VehicleCard as VehicleCardType } from "@/types/vehicle"

// ─── Dynamic client components ───────────────────────────────────────────────

const VehicleGallery = dynamic(
  () => import("@/components/vehicle/VehicleGallery").then((m) => ({ default: m.VehicleGallery })),
  { ssr: false }
)

const ViewCountIncrementer = dynamic(
  () => import("./ViewCountIncrementer").then((m) => ({ default: m.ViewCountIncrementer })),
  { ssr: false }
)

const DescriptionToggle = dynamic(
  () => import("./DescriptionToggle").then((m) => ({ default: m.DescriptionToggle })),
  { ssr: false }
)

const AnimatedPrice = dynamic(
  () => import("@/components/ui/AnimatedPrice").then((m) => ({ default: m.AnimatedPrice })),
  { ssr: false, loading: () => <span>—</span> }
)

// ─── Types ────────────────────────────────────────────────────────────────────

interface VehicleDetail {
  id: string
  slug: string | null
  brand: string
  model: string
  version: string | null
  year: number
  vehicle_type: VehicleType
  fuel: FuelType
  engine_size: number | null
  power_hp: number | null
  power_kw: number | null
  transmission: TransmissionType | null
  drive: DriveType | null
  body: BodyType | null
  doors: number | null
  seats: number | null
  color_ext: string | null
  color_int: string | null
  mileage: number
  price: number
  price_negotiable: boolean
  first_sale_date: string | null
  condition: ConditionType
  ct_status: CtStatus
  ct_date: string | null
  description_fr: string | null
  description_en: string | null
  status: "publie" | "vendu" | "archive" | "brouillon"
  is_featured: boolean
  views_count: number
  published_at: string | null
  vehicle_photos: { id: string; url: string; is_primary: boolean; sort_order: number }[]
  vehicle_features: { id: string; feature: string; category: string }[]
}

interface PageProps {
  params: { locale: string; slug: string }
}

// ─── Data fetchers ────────────────────────────────────────────────────────────

async function getVehicle(slug: string): Promise<VehicleDetail | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("vehicles")
    .select(`
      id, slug, brand, model, version, year, vehicle_type,
      fuel, engine_size, power_hp, power_kw, transmission, drive,
      body, doors, seats, color_ext, color_int,
      mileage, price, price_negotiable, first_sale_date,
      condition, ct_status, ct_date,
      description_fr, description_en,
      status, is_featured, views_count, published_at,
      vehicle_photos (id, url, is_primary, sort_order),
      vehicle_features (id, feature, category)
    `)
    .eq("slug", slug)
    .in("status", ["publie", "vendu"])
    .single()

  return data as VehicleDetail | null
}

async function getSimilarVehicles(
  vehicleId: string,
  brand: string,
  fuel: FuelType,
  price: number
): Promise<VehicleCardType[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("vehicles")
    .select(`
      id, slug, brand, model, version, year, fuel, mileage,
      price, price_negotiable, transmission, power_hp, body,
      condition, status, is_featured, published_at,
      vehicle_photos (url, is_primary)
    `)
    .eq("status", "publie")
    .neq("id", vehicleId)
    .or(`brand.eq.${brand},fuel.eq.${fuel}`)
    .gte("price", price * 0.7)
    .lte("price", price * 1.3)
    .order("is_featured", { ascending: false })
    .limit(3)

  return ((data as unknown[]) ?? []).map((v: unknown) => {
    const row = v as Record<string, unknown>
    const photos = (row.vehicle_photos as { url: string; is_primary: boolean }[]) ?? []
    return {
      id: row.id as string,
      slug: row.slug as string | null,
      brand: row.brand as string,
      model: row.model as string,
      version: row.version as string | null,
      year: row.year as number,
      fuel: row.fuel as FuelType,
      mileage: row.mileage as number,
      price: row.price as number,
      price_negotiable: row.price_negotiable as boolean,
      transmission: row.transmission as TransmissionType | null,
      power_hp: row.power_hp as number | null,
      body: row.body as BodyType | null,
      condition: row.condition as ConditionType,
      status: row.status as "publie" | "vendu" | "archive" | "brouillon",
      is_featured: row.is_featured as boolean,
      published_at: row.published_at as string | null,
      cover_url: photos.find((p) => p.is_primary)?.url ?? photos[0]?.url ?? null,
    }
  })
}

// ─── generateStaticParams ─────────────────────────────────────────────────────

export async function generateStaticParams() {
  const admin = createAdminClient()
  const { data } = await admin
    .from("vehicles")
    .select("slug")
    .in("status", ["publie", "vendu"])
    .order("published_at", { ascending: false })
    .limit(50)

  const slugs = ((data ?? []) as { slug: string | null }[])
    .filter((v) => v.slug)
    .map((v) => v.slug as string)

  return ["fr", "en"].flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const vehicle = await getVehicle(params.slug)
  if (!vehicle) return { title: "Véhicule non trouvé — Auto Roi" }

  const { locale } = params
  const rawDesc = locale === "en" ? vehicle.description_en : vehicle.description_fr
  const shortDesc = rawDesc
    ? rawDesc.slice(0, 160)
    : `${vehicle.brand} ${vehicle.model}, ${vehicle.year}, ${formatMileage(vehicle.mileage)}, ${FUEL_LABELS[vehicle.fuel]}`

  const photos = [...vehicle.vehicle_photos].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return a.sort_order - b.sort_order
  })
  const coverUrl = photos[0]?.url
  const title = `${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${formatPrice(vehicle.price)} | Auto Roi`
  const url = `${SITE_URL}/${locale}/vehicules/${vehicle.slug}`

  return {
    title,
    description: shortDesc,
    openGraph: {
      title,
      description: shortDesc,
      type: "article",
      url,
      images: coverUrl
        ? [{ url: coverUrl, width: 1200, height: 630, alt: `${vehicle.brand} ${vehicle.model}` }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: shortDesc,
      images: coverUrl ? [coverUrl] : [],
    },
  }
}

// ─── Static helpers ───────────────────────────────────────────────────────────

const CT_LABELS: Record<CtStatus, string> = {
  valide: "Valide",
  a_passer: "À passer",
  non_requis: "Non requis",
}

const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  voiture: "Voiture",
  moto: "Moto",
  utilitaire: "Utilitaire",
  autre: "Autre",
}

function getFeatureLabel(featureId: string): string {
  for (const cat of Object.values(FEATURES_BY_CATEGORY)) {
    const features = (cat as unknown as { features: { id: string; label: string }[] }).features
    const found = features.find((f) => f.id === featureId)
    if (found) return found.label
  }
  return featureId
}

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; style: React.CSSProperties }> = {
  securite: {
    label: "Sécurité",
    icon: <Shield className="h-3.5 w-3.5" />,
    style: { background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)' },
  },
  confort: {
    label: "Confort",
    icon: <Star className="h-3.5 w-3.5" />,
    style: { background: 'rgba(201,168,76,0.08)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' },
  },
  multimedia: {
    label: "Multimédia",
    icon: <Monitor className="h-3.5 w-3.5" />,
    style: { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.12)' },
  },
  exterieur: {
    label: "Extérieur",
    icon: <Sparkles className="h-3.5 w-3.5" />,
    style: { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)' },
  },
}

// ─── SpecTable ─────────────────────────────────────────────────────────────────

function SpecTable({ rows }: { rows: [string, string | number | null | undefined][] }) {
  const visible = rows.filter(([, v]) => v !== null && v !== undefined && v !== "")
  if (!visible.length) return <p className="text-xs px-5 py-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Aucune donnée</p>
  return (
    <div>
      {visible.map(([label, value]) => (
        <div key={label} className="spec-row">
          <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.85rem', fontWeight: 400 }}>{label}</span>
          <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.85rem', fontWeight: 600, textAlign: 'right', maxWidth: '55%' }}>{String(value)}</span>
        </div>
      ))}
    </div>
  )
}

// ─── SectionHeader ─────────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="h-5 w-0.5 rounded-full" style={{ background: 'linear-gradient(180deg, #C9A84C, rgba(201,168,76,0.2))' }} />
      <h2 className="font-display font-bold text-white text-lg">{children}</h2>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function VehiclePage({ params }: PageProps) {
  const { locale, slug } = params

  const vehicle = await getVehicle(slug)

  if (!vehicle || vehicle.status === "archive" || vehicle.status === "brouillon") {
    notFound()
  }

  const isSold = vehicle.status === "vendu"

  const photos = [...vehicle.vehicle_photos].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return a.sort_order - b.sort_order
  })

  const description = locale === "en" ? vehicle.description_en : vehicle.description_fr

  const featuresByCategory: Record<string, string[]> = {}
  for (const f of vehicle.vehicle_features) {
    if (!featuresByCategory[f.category]) featuresByCategory[f.category] = []
    featuresByCategory[f.category].push(f.feature)
  }

  const [similar, siteSettings] = await Promise.all([
    getSimilarVehicles(vehicle.id, vehicle.brand, vehicle.fuel, vehicle.price),
    getSiteSettings(),
  ])

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
    brand: { "@type": "Brand", name: vehicle.brand },
    model: vehicle.model,
    modelDate: String(vehicle.year),
    description: description ?? undefined,
    vehicleIdentificationNumber: vehicle.id,
    fuelType: FUEL_LABELS[vehicle.fuel],
    mileageFromOdometer: { "@type": "QuantitativeValue", value: vehicle.mileage, unitCode: "KMT" },
    vehicleTransmission: vehicle.transmission ? TRANSMISSION_LABELS[vehicle.transmission] : undefined,
    driveWheelConfiguration: vehicle.drive ? DRIVE_LABELS[vehicle.drive] : undefined,
    offers: {
      "@type": "Offer",
      price: vehicle.price,
      priceCurrency: "EUR",
      availability: isSold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      url: `${SITE_URL}/${locale}/vehicules/${vehicle.slug}`,
    },
    image: photos.map((p) => p.url),
    numberOfDoors: vehicle.doors ?? undefined,
    seatingCapacity: vehicle.seats ?? undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewCountIncrementer vehicleId={vehicle.id} />

      <div className="min-h-screen pt-16">

        {/* ── Breadcrumb ── */}
        <div className="py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }} aria-label="Fil d'Ariane">
              <Link href={`/${locale}`} className="hover:text-ar-gold transition-colors flex items-center gap-1">
                <Home className="h-3 w-3" />
                Accueil
              </Link>
              <ChevronRight className="h-3 w-3 opacity-40" />
              <Link href={`/${locale}/vehicules`} className="hover:text-ar-gold transition-colors">
                Véhicules
              </Link>
              {vehicle.body && (
                <>
                  <ChevronRight className="h-3 w-3 opacity-40" />
                  <Link href={`/${locale}/vehicules?carrosserie=${vehicle.body}`} className="hover:text-ar-gold transition-colors">
                    {BODY_LABELS[vehicle.body]}
                  </Link>
                </>
              )}
              <ChevronRight className="h-3 w-3 opacity-40" />
              <span className="truncate max-w-[200px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {vehicle.brand} {vehicle.model}
              </span>
            </nav>
          </div>
        </div>

        {/* ── VENDU banner ── */}
        {isSold && (
          <div className="py-2.5 text-center" style={{ background: 'rgba(139,26,26,0.65)', borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
            <p className="text-white font-semibold text-sm tracking-wide">
              Ce véhicule est vendu — Contactez-nous pour un véhicule similaire.
            </p>
          </div>
        )}

        {/* ── Main grid ── */}
        <div className="container mx-auto px-4 py-8">
          {/* Decorative orb behind gallery */}
          <div className="pointer-events-none absolute left-0 top-0 overflow-hidden" style={{ width: '60%', height: '600px', zIndex: 0 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.04) 0%, transparent 70%)' }} />
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" style={{ zIndex: 1 }}>

            {/* ══ LEFT COLUMN (8/12) ══ */}
            <div className="lg:col-span-8 space-y-5">

              {/* 1. Gallery */}
              <div className="detail-s1">
                <VehicleGallery
                  photos={photos}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  isSold={isSold}
                />
              </div>

              {/* 2. Identity — brand, model, price, badges */}
              <div
                className="detail-s2 card-left-accent rounded-2xl p-6 pl-8"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    {/* Eyebrow — gradient gold text */}
                    <p
                      className="shimmer-text-gold text-xs font-semibold uppercase mb-2"
                      style={{ letterSpacing: '0.2em', backgroundSize: '200% auto' }}
                    >
                      {FUEL_LABELS[vehicle.fuel]} · {vehicle.year}
                    </p>
                    {/* Brand + Model */}
                    <h1
                      className="font-display font-extrabold text-white leading-tight"
                      style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', letterSpacing: '-0.02em' }}
                    >
                      {vehicle.brand}{" "}
                      <span style={{ color: 'rgba(255,255,255,0.9)' }}>{vehicle.model}</span>
                    </h1>
                    {vehicle.version && (
                      <p className="mt-1 text-base" style={{ color: 'rgba(255,255,255,0.45)' }}>{vehicle.version}</p>
                    )}
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {vehicle.transmission && (
                        <span className="vehicle-tag">{TRANSMISSION_LABELS[vehicle.transmission]}</span>
                      )}
                      {vehicle.body && (
                        <span className="vehicle-tag">{BODY_LABELS[vehicle.body]}</span>
                      )}
                      <span className="vehicle-tag">{VEHICLE_TYPE_LABELS[vehicle.vehicle_type]}</span>
                      {vehicle.is_featured && (
                        <span className="vehicle-tag" style={{ borderColor: 'rgba(201,168,76,0.35)', color: '#C9A84C', background: 'rgba(201,168,76,0.08)' }}>
                          ★ À la une
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="shrink-0 text-right">
                    {isSold ? (
                      <>
                        <p className="font-display text-3xl font-bold line-through" style={{ color: 'rgba(255,255,255,0.2)' }}>
                          {formatPrice(vehicle.price)}
                        </p>
                        <p className="text-sm font-bold mt-1" style={{ color: '#ef4444', letterSpacing: '0.1em' }}>VENDU</p>
                      </>
                    ) : (
                      <>
                        <AnimatedPrice
                          price={vehicle.price}
                          className="shimmer-text-gold font-display font-bold block"
                          style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', lineHeight: 1.1 }}
                        />
                        {vehicle.price_negotiable && (
                          <span className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full text-xs"
                            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(201,168,76,0.8)' }}>
                            Prix négociable
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {vehicle.published_at && (
                  <p className="text-xs mt-4 pt-3" style={{ color: 'rgba(255,255,255,0.25)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    Publié le {new Date(vehicle.published_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    {vehicle.views_count > 0 && (
                      <> <span style={{ color: 'rgba(201,168,76,0.3)' }}>·</span> {vehicle.views_count} vue{vehicle.views_count > 1 ? "s" : ""}</>
                    )}
                  </p>
                )}
              </div>

              {/* 3. Key specs — 6 cards */}
              <div className="detail-s3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: <Gauge className="h-5 w-5" />, label: "Kilométrage", value: formatMileage(vehicle.mileage) },
                  { icon: <Calendar className="h-5 w-5" />, label: "Année", value: String(vehicle.year) },
                  { icon: <Fuel className="h-5 w-5" />, label: "Carburant", value: FUEL_LABELS[vehicle.fuel] },
                  { icon: <Settings className="h-5 w-5" />, label: "Boîte", value: vehicle.transmission ? TRANSMISSION_LABELS[vehicle.transmission] : "N/A" },
                  { icon: <Zap className="h-5 w-5" />, label: "Puissance", value: vehicle.power_hp ? `${vehicle.power_hp} ch` : "N/A" },
                  { icon: <DoorOpen className="h-5 w-5" />, label: "Portes", value: vehicle.doors ? `${vehicle.doors} portes` : "N/A" },
                ].map(({ icon, label, value }) => (
                  <div
                    key={label}
                    className="spec-card rounded-[14px] flex items-center gap-3"
                    style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)', padding: '18px 20px' }}
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)' }}>
                      <span style={{ color: '#C9A84C', opacity: 0.9 }}>{icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium" style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
                      <p className="font-bold text-white truncate mt-1" style={{ fontSize: '1rem' }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 4. Full specs accordion */}
              <div className="detail-s4 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {/* Header */}
                <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="h-5 w-0.5 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(180deg, #C9A84C, rgba(201,168,76,0.2))' }} />
                  <h2 className="font-display font-bold text-white text-lg">Caractéristiques complètes</h2>
                </div>

                {[
                  {
                    title: "Identité",
                    defaultOpen: true,
                    rows: [
                      ["Marque", vehicle.brand],
                      ["Modèle", vehicle.model],
                      ["Version", vehicle.version],
                      ["Année", vehicle.year],
                      ["Type", VEHICLE_TYPE_LABELS[vehicle.vehicle_type]],
                    ] as [string, string | number | null | undefined][],
                  },
                  {
                    title: "Motorisation",
                    defaultOpen: true,
                    rows: [
                      ["Carburant", FUEL_LABELS[vehicle.fuel]],
                      ["Cylindrée", vehicle.engine_size ? `${vehicle.engine_size} cm³` : null],
                      ["Puissance", vehicle.power_hp ? `${vehicle.power_hp} ch${vehicle.power_kw ? ` / ${vehicle.power_kw} kW` : ""}` : null],
                      ["Boîte de vitesses", vehicle.transmission ? TRANSMISSION_LABELS[vehicle.transmission] : null],
                      ["Traction", vehicle.drive ? DRIVE_LABELS[vehicle.drive] : null],
                    ] as [string, string | number | null | undefined][],
                  },
                  {
                    title: "Carrosserie",
                    defaultOpen: false,
                    rows: [
                      ["Type", vehicle.body ? BODY_LABELS[vehicle.body] : null],
                      ["Portes", vehicle.doors],
                      ["Places", vehicle.seats],
                      ["Couleur extérieure", vehicle.color_ext],
                      ["Couleur intérieure", vehicle.color_int],
                    ] as [string, string | number | null | undefined][],
                  },
                  {
                    title: "Kilométrage & État",
                    defaultOpen: false,
                    rows: [
                      ["Kilométrage", formatMileage(vehicle.mileage)],
                      ["Première mise en vente", vehicle.first_sale_date ? new Date(vehicle.first_sale_date).toLocaleDateString("fr-FR") : null],
                      ["État", CONDITION_LABELS[vehicle.condition]],
                      ["Contrôle technique", CT_LABELS[vehicle.ct_status]],
                      ["Date CT", vehicle.ct_date ? new Date(vehicle.ct_date).toLocaleDateString("fr-FR") : null],
                    ] as [string, string | number | null | undefined][],
                  },
                ].map(({ title, defaultOpen, rows }, i, arr) => (
                  <details
                    key={title}
                    className="group"
                    open={defaultOpen}
                    style={i < arr.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.06)' } : undefined}
                  >
                    <summary className="detail-summary">
                      <span className="font-semibold text-white" style={{ fontSize: '0.9rem' }}>{title}</span>
                      <ChevronRight className="h-4 w-4 transition-transform duration-300 group-open:rotate-90 flex-shrink-0" style={{ color: '#C9A84C', opacity: 0.7 }} />
                    </summary>
                    <div>
                      <SpecTable rows={rows} />
                    </div>
                  </details>
                ))}
              </div>

              {/* 5. Equipment */}
              {Object.keys(featuresByCategory).length > 0 && (
                <div className="detail-s5 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <SectionHeader>Équipements &amp; Options</SectionHeader>
                  <div className="space-y-5">
                    {Object.entries(featuresByCategory).map(([category, featureIds]) => {
                      const meta = CATEGORY_META[category] ?? {
                        label: category,
                        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
                        style: { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)' },
                      }
                      return (
                        <div key={category}>
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={meta.style}>
                              {meta.icon}
                              {meta.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {featureIds.map((fid) => (
                              <span
                                key={fid}
                                className="equip-chip px-3 py-1.5 rounded-full text-xs"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.65)' }}
                              >
                                {getFeatureLabel(fid)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 6. Description */}
              {description && (
                <div className="detail-s6 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <SectionHeader>Description</SectionHeader>
                  <Suspense
                    fallback={
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {description.slice(0, 400)}
                      </p>
                    }
                  >
                    <DescriptionToggle text={description} />
                  </Suspense>
                </div>
              )}
            </div>

            {/* ══ RIGHT COLUMN (4/12) STICKY ══ */}
            <div className="lg:col-span-4 detail-right">
              <div className="sticky top-20">
                <VehicleContactBlock
                  vehicleId={vehicle.id}
                  brand={vehicle.brand}
                  model={vehicle.model}
                  year={vehicle.year}
                  price={vehicle.price}
                  isSold={isSold}
                  phoneNumber={siteSettings.phone_number}
                  whatsappNumber={siteSettings.whatsapp_number}
                />
              </div>
            </div>
          </div>

          {/* ── Annonces similaires ── */}
          {similar.length > 0 && (
            <section className="mt-20 pt-10" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.4), transparent)' }} />
                  <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: 'rgba(201,168,76,0.7)' }}>
                    Annonces similaires
                  </span>
                  <span className="h-px flex-1" style={{ background: 'linear-gradient(270deg, rgba(201,168,76,0.4), transparent)' }} />
                </div>
                <h2 className="font-display text-2xl font-bold text-white text-center">
                  Vous aimerez aussi
                </h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} locale={locale} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
