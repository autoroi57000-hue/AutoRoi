import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { Search } from "lucide-react"
import { getVehicles, getVehicleFiltersData } from "@/lib/vehicles"
import type { CatalogFilters } from "@/lib/vehicles"
import type { VehicleSortKey } from "@/types/vehicle"
import type { FuelType, TransmissionType, BodyType, CtStatus, VehicleType } from "@/types/database"
import { VehicleCard } from "@/components/vehicle/VehicleCard"
import { VehicleListItem } from "@/components/vehicle/VehicleListItem"
import { VehicleFilters } from "@/components/vehicle/VehicleFilters"
import { CatalogToolbar } from "@/components/vehicle/CatalogToolbar"
import { AnimatedGrid } from "@/components/ui/AnimatedGrid"

// ─── Types ────────────────────────────────────────────────────────────────────

interface VehiclesPageProps {
  params: { locale: string }
  searchParams: Record<string, string | string[] | undefined>
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: VehiclesPageProps): Promise<Metadata> {
  const { locale } = params
  const title = locale === "en" ? "Our Catalogue — Auto Roi" : "Notre Catalogue — Auto Roi"
  const description =
    locale === "en"
      ? "Browse our carefully selected premium vehicles. Find your ideal vehicle at Auto Roi."
      : "Parcourez notre catalogue de véhicules premium sélectionnés avec soin. Trouvez votre véhicule idéal chez Auto Roi."

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/vehicules`,
      languages: {
        fr: "/fr/vehicules",
        en: "/en/vehicules",
        "x-default": "/fr/vehicules",
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/${locale}/vehicules`,
    },
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const PER_PAGE = 20

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function VehiclesPage({ params, searchParams }: VehiclesPageProps) {
  const { locale } = params

  // Parse URL params → CatalogFilters
  const filters: CatalogFilters = {
    q: getString(searchParams.q),
    type: getString(searchParams.type) as VehicleType | undefined,
    marque: getString(searchParams.marque),
    carburant: getString(searchParams.carburant) as FuelType | undefined,
    prix_min: getNumber(searchParams.prix_min),
    prix_max: getNumber(searchParams.prix_max),
    annee_min: getNumber(searchParams.annee_min),
    annee_max: getNumber(searchParams.annee_max),
    km_max: getNumber(searchParams.km_max),
    transmission: getString(searchParams.transmission) as TransmissionType | undefined,
    carrosserie: getString(searchParams.carrosserie) as BodyType | undefined,
    ct: getString(searchParams.ct) as CtStatus | undefined,
    sort: getString(searchParams.sort) as VehicleSortKey | undefined,
  }

  const page = getNumber(searchParams.page) ?? 1
  const view = getString(searchParams.view) ?? "grid"

  // Parallel data fetching
  const [result, filtersData] = await Promise.all([
    getVehicles(filters, page, PER_PAGE),
    getVehicleFiltersData(),
  ])

  const { vehicles, total, pages } = result

  return (
    <div className="min-h-screen">
      {/* ── Hero header ── */}
      <div
        className="pt-24 pb-10 md:pb-14"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 20% 50%, rgba(201,168,76,0.06) 0%, transparent 70%), linear-gradient(180deg, #0A0A0A 0%, #0f0f0f 60%, #111111 100%)',
        }}
      >
        <div className="container mx-auto px-4">
          <p className="text-xs font-semibold uppercase mb-2" style={{ letterSpacing: '0.3em', color: 'rgba(201,168,76,0.7)' }}>
            {locale === "en" ? "All our vehicles" : "Tous nos véhicules"}
          </p>
          <h1 className="catalogue-title font-display font-bold" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
            {locale === "en" ? "Our Catalogue" : "Notre Catalogue"}
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {filtersData.total} véhicule{filtersData.total !== 1 ? "s" : ""} disponible{filtersData.total !== 1 ? "s" : ""}
          </p>
        </div>
        {/* Séparateur doré */}
        <div className="mt-8" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }} />
      </div>

      {/* ── Main layout ── */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6 items-start">

          {/* Sidebar filters (desktop) + mobile button */}
          <Suspense fallback={<div className="hidden lg:block w-[280px] shrink-0" />}>
            <VehicleFilters filtersData={filtersData} />
          </Suspense>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Mobile filter button row + toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Mobile filters button is rendered inside VehicleFilters, shown only on mobile */}
              <div className="flex-1 lg:flex-none lg:w-full">
                <Suspense fallback={<div className="h-12 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />}>
                  <CatalogToolbar total={total} currentPage={page} perPage={PER_PAGE} />
                </Suspense>
              </div>
            </div>

            {/* Results */}
            {vehicles.length === 0 ? (
              <EmptyState locale={locale} />
            ) : view === "list" ? (
              <div className="space-y-3">
                {vehicles.map((vehicle) => (
                  <VehicleListItem key={vehicle.id} vehicle={vehicle} locale={locale} />
                ))}
              </div>
            ) : (
              <AnimatedGrid className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} locale={locale} animated={false} />
                ))}
              </AnimatedGrid>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={pages}
                searchParams={searchParams}
                locale={locale}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ locale }: { locale: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: 'rgba(201,168,76,0.1)' }}>
        <Search className="h-10 w-10" style={{ color: 'rgba(201,168,76,0.5)' }} />
      </div>
      <h3 className="font-display text-xl font-bold text-white mb-2">
        Aucun véhicule trouvé
      </h3>
      <p className="text-sm mb-6 max-w-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Aucun véhicule ne correspond à vos critères de recherche. Essayez de modifier vos filtres.
      </p>
      <Link
        href={`/${locale}/vehicules`}
        className="px-6 py-2.5 rounded-xl text-ar-black font-semibold text-sm transition-colors hover:brightness-110"
        style={{ background: '#C9A84C' }}
      >
        Voir tous les véhicules
      </Link>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  searchParams,
  locale,
}: {
  currentPage: number
  totalPages: number
  searchParams: Record<string, string | string[] | undefined>
  locale: string
}) {
  function buildPageUrl(page: number) {
    const params = new URLSearchParams()
    for (const [key, val] of Object.entries(searchParams)) {
      if (key === "page") continue
      const v = Array.isArray(val) ? val[0] : val
      if (v) params.set(key, v)
    }
    if (page > 1) params.set("page", String(page))
    const qs = params.toString()
    return `/${locale}/vehicules${qs ? `?${qs}` : ""}`
  }

  // Show at most 5 page numbers around current
  const delta = 2
  const pages: (number | "…")[] = []
  const lo = Math.max(1, currentPage - delta)
  const hi = Math.min(totalPages, currentPage + delta)
  if (lo > 1) { pages.push(1); if (lo > 2) pages.push("…") }
  for (let i = lo; i <= hi; i++) pages.push(i)
  if (hi < totalPages) { if (hi < totalPages - 1) pages.push("…"); pages.push(totalPages) }

  return (
    <div className="flex items-center justify-center gap-1.5 pt-4">
      {currentPage > 1 && (
        <Link
          href={buildPageUrl(currentPage - 1)}
          className="px-3 py-2 text-sm rounded-lg transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
        >
          ←
        </Link>
      )}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>…</span>
        ) : (
          <Link
            key={p}
            href={buildPageUrl(p)}
            className={`w-9 h-9 flex items-center justify-center text-sm rounded-lg transition-colors ${
              p === currentPage ? "font-semibold text-ar-black" : ""
            }`}
            style={p === currentPage
              ? { background: '#C9A84C', border: '1px solid #C9A84C' }
              : { border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }
            }
          >
            {p}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link
          href={buildPageUrl(currentPage + 1)}
          className="px-3 py-2 text-sm rounded-lg transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
        >
          →
        </Link>
      )}
    </div>
  )
}
