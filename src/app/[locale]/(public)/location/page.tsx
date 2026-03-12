import type { Metadata } from "next"
import Link from "next/link"
import { KeyRound, Users, Zap, Filter, Search } from "lucide-react"
import { getRentalVehicles } from "@/lib/rentals"
import type { RentalVehicle } from "@/types/rental"
import { SITE_NAME } from "@/lib/constants"
import { AnimatedGrid } from "@/components/ui/AnimatedGrid"

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocationPageProps {
  params: { locale: string }
  searchParams: Record<string, string | string[] | undefined>
}

function getString(val: string | string[] | undefined): string | undefined {
  if (!val) return undefined
  return Array.isArray(val) ? val[0] : val
}

function getNumber(val: string | string[] | undefined): number | undefined {
  const s = getString(val)
  if (!s) return undefined
  const n = parseInt(s, 10)
  return isNaN(n) ? undefined : n
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const isFr = params.locale !== "en"
  return {
    title: isFr
      ? `Location de véhicules — ${SITE_NAME}`
      : `Vehicle Rental — ${SITE_NAME}`,
    description: isFr
      ? "Louez votre véhicule idéal parmi notre flotte premium. Réservation en ligne, paiement sécurisé."
      : "Rent your ideal vehicle from our premium fleet. Online booking, secure payment.",
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LocationPage({ params, searchParams }: LocationPageProps) {
  const { locale } = params
  const isFr = locale !== "en"

  const filters = {
    vehicle_type: getString(searchParams.type),
    fuel: getString(searchParams.fuel),
    seats: getNumber(searchParams.seats),
  }

  const prixMin = getNumber(searchParams.prix_min)
  const prixMax = getNumber(searchParams.prix_max)

  let vehicles = await getRentalVehicles(filters)

  // Price filter (client-applied after fetch)
  if (prixMin !== undefined) {
    vehicles = vehicles.filter((v) => v.price_per_day >= prixMin)
  }
  if (prixMax !== undefined) {
    vehicles = vehicles.filter((v) => v.price_per_day <= prixMax)
  }

  const typeOptions = [
    { value: "voiture", label: isFr ? "Voiture" : "Car" },
    { value: "SUV", label: "SUV" },
    { value: "utilitaire", label: isFr ? "Utilitaire" : "Van" },
    { value: "moto", label: isFr ? "Moto" : "Motorcycle" },
  ]

  const fuelOptions = [
    { value: "Essence", label: isFr ? "Essence" : "Gasoline" },
    { value: "Diesel", label: "Diesel" },
    { value: "Hybride", label: isFr ? "Hybride" : "Hybrid" },
    { value: "Électrique", label: isFr ? "Électrique" : "Electric" },
  ]

  function buildFilterUrl(newParams: Record<string, string | number | undefined>) {
    const params = new URLSearchParams()
    const merged = {
      type: getString(searchParams.type),
      fuel: getString(searchParams.fuel),
      seats: getString(searchParams.seats),
      prix_min: getString(searchParams.prix_min),
      prix_max: getString(searchParams.prix_max),
      ...newParams,
    }
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== "") params.set(k, String(v))
    }
    const qs = params.toString()
    return `/${locale}/location${qs ? `?${qs}` : ""}`
  }

  const activeFiltersCount = [filters.vehicle_type, filters.fuel, filters.seats, prixMin, prixMax].filter(Boolean).length

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <div
        className="pt-24 pb-10 md:pb-14"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 50%, rgba(201,168,76,0.06) 0%, transparent 70%), linear-gradient(180deg, #0A0A0A 0%, #0f0f0f 60%, #111111 100%)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1 rounded-full"
              style={{
                background: "rgba(201,168,76,0.12)",
                color: "#C9A84C",
                border: "1px solid rgba(201,168,76,0.25)",
                letterSpacing: "0.2em",
              }}
            >
              <KeyRound className="h-3 w-3" />
              LOCATION
            </span>
          </div>
          <h1
            className="font-display font-bold text-white"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
          >
            {isFr ? "Nos véhicules à louer" : "Vehicles for Rent"}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            {vehicles.length} {isFr ? "véhicule" : "vehicle"}{vehicles.length !== 1 ? "s" : ""}{" "}
            {isFr ? "disponible" : "available"}{vehicles.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div
          className="mt-8"
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)",
          }}
        />
      </div>

      {/* ── Filtres ── */}
      <div
        className="sticky top-16 z-30 border-b"
        style={{
          background: "rgba(10,10,10,0.95)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "rgba(201,168,76,0.7)" }}>
              <Filter className="h-3.5 w-3.5" />
              {isFr ? "Filtres" : "Filters"}
              {activeFiltersCount > 0 && (
                <span
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold"
                  style={{ background: "#C9A84C", color: "#0A0A0A" }}
                >
                  {activeFiltersCount}
                </span>
              )}
            </span>

            <div className="flex flex-wrap gap-2">
              {/* Type filter */}
              <FilterGroup label={isFr ? "Type" : "Type"}>
                <Link
                  href={buildFilterUrl({ type: undefined })}
                  className={filterChipCls(!filters.vehicle_type)}
                >
                  {isFr ? "Tous" : "All"}
                </Link>
                {typeOptions.map((t) => (
                  <Link
                    key={t.value}
                    href={buildFilterUrl({ type: t.value })}
                    className={filterChipCls(filters.vehicle_type === t.value)}
                  >
                    {t.label}
                  </Link>
                ))}
              </FilterGroup>

              {/* Fuel filter */}
              <FilterGroup label={isFr ? "Carburant" : "Fuel"}>
                <Link href={buildFilterUrl({ fuel: undefined })} className={filterChipCls(!filters.fuel)}>
                  {isFr ? "Tous" : "All"}
                </Link>
                {fuelOptions.map((f) => (
                  <Link
                    key={f.value}
                    href={buildFilterUrl({ fuel: f.value })}
                    className={filterChipCls(filters.fuel === f.value)}
                  >
                    {f.label}
                  </Link>
                ))}
              </FilterGroup>

              {/* Seats filter */}
              <FilterGroup label={isFr ? "Places min." : "Min seats"}>
                {[undefined, 2, 5, 7].map((s) => (
                  <Link
                    key={s ?? "any"}
                    href={buildFilterUrl({ seats: s })}
                    className={filterChipCls(filters.seats === s)}
                  >
                    {s ? `${s}+` : isFr ? "Toutes" : "Any"}
                  </Link>
                ))}
              </FilterGroup>
            </div>

            {activeFiltersCount > 0 && (
              <Link
                href={`/${locale}/location`}
                className="text-xs transition-colors"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                ✕ {isFr ? "Réinitialiser" : "Reset"}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Grille ── */}
      <div className="container mx-auto px-4 py-10">
        {vehicles.length === 0 ? (
          <EmptyState locale={locale} isFr={isFr} />
        ) : (
          <AnimatedGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vehicles.map((vehicle) => (
              <RentalVehicleCard key={vehicle.id} vehicle={vehicle} locale={locale} isFr={isFr} />
            ))}
          </AnimatedGrid>
        )}
      </div>
    </div>
  )
}

// ─── Card ──────────────────────────────────────────────────────────────────────

function RentalVehicleCard({
  vehicle,
  locale,
  isFr,
}: {
  vehicle: RentalVehicle
  locale: string
  isFr: boolean
}) {
  const href = `/${locale}/location/${vehicle.slug}`

  return (
    <Link
      href={href}
      className="vehicle-card-glow group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Photo */}
      <div className="relative aspect-[16/9] overflow-hidden">
        {vehicle.cover_photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vehicle.cover_photo}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "rgba(201,168,76,0.05)" }}
          >
            <KeyRound className="h-12 w-12" style={{ color: "rgba(201,168,76,0.2)" }} />
          </div>
        )}

        {/* Badge LOCATION */}
        <div className="absolute top-3 left-3">
          <span
            className="text-xs font-bold uppercase px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(201,168,76,0.9)",
              color: "#0A0A0A",
              letterSpacing: "0.1em",
            }}
          >
            LOCATION
          </span>
        </div>

        {/* Overlay gradient */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "linear-gradient(to top, rgba(201,168,76,0.1) 0%, transparent 60%)" }}
        />
      </div>

      {/* Infos */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-bold text-white text-base leading-tight">
              {vehicle.brand} {vehicle.model}
            </h3>
            {vehicle.version && (
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                {vehicle.version}
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-medium" style={{ color: "rgba(201,168,76,0.6)" }}>
              {isFr ? "À partir de" : "From"}
            </p>
            <p className="font-bold text-lg leading-tight" style={{ color: "#C9A84C" }}>
              {vehicle.price_per_day}€
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              /jour
            </p>
          </div>
        </div>

        {/* Specs */}
        <div className="flex flex-wrap gap-3 mt-auto pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {vehicle.seats && (
            <span className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
              <Users className="h-3 w-3" />
              {vehicle.seats} {isFr ? "places" : "seats"}
            </span>
          )}
          {vehicle.transmission && (
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
              {vehicle.transmission}
            </span>
          )}
          {vehicle.fuel && (
            <span className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
              <Zap className="h-3 w-3" />
              {vehicle.fuel}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="mt-4">
          <span
            className="btn-shimmer block w-full text-center py-2.5 rounded-xl text-sm font-bold transition-all duration-300 group-hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, #C9A84C, #e0c068)",
              color: "#0A0A0A",
            }}
          >
            {isFr ? "Réserver" : "Book now"}
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs hidden sm:block" style={{ color: "rgba(255,255,255,0.3)" }}>
        {label}:
      </span>
      {children}
    </div>
  )
}

function filterChipCls(active: boolean): string {
  return active
    ? "text-xs px-3 py-1 rounded-full font-semibold transition-all"
    + " bg-ar-gold text-ar-black"
    : "text-xs px-3 py-1 rounded-full font-medium transition-all"
    + " text-white/50 hover:text-white"
    + " border border-white/10 hover:border-white/20"
}

function EmptyState({ locale, isFr }: { locale: string; isFr: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 text-center rounded-2xl"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background: "rgba(201,168,76,0.1)" }}
      >
        <Search className="h-10 w-10" style={{ color: "rgba(201,168,76,0.5)" }} />
      </div>
      <h3 className="font-display text-xl font-bold text-white mb-2">
        {isFr ? "Aucun véhicule trouvé" : "No vehicles found"}
      </h3>
      <p className="text-sm mb-6 max-w-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
        {isFr
          ? "Aucun véhicule ne correspond à vos critères. Modifiez vos filtres."
          : "No vehicle matches your criteria. Try adjusting your filters."}
      </p>
      <Link
        href={`/${locale}/location`}
        className="px-6 py-2.5 rounded-xl text-ar-black font-semibold text-sm transition-colors hover:brightness-110"
        style={{ background: "#C9A84C" }}
      >
        {isFr ? "Voir tous les véhicules" : "View all vehicles"}
      </Link>
    </div>
  )
}
