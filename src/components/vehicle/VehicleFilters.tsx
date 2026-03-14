"use client"

import { useState, useCallback, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react"
import type { FiltersData } from "@/lib/vehicles"
import { FUEL_LABELS, TRANSMISSION_LABELS, BODY_LABELS } from "@/lib/constants"

interface VehicleFiltersProps {
  filtersData: FiltersData
}

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  voiture: "Voiture",
  moto: "Moto",
  utilitaire: "Utilitaire",
  autre: "Autre",
}

const CT_LABELS: Record<string, string> = {
  valide: "Valide",
  a_passer: "À passer",
  non_requis: "Non requis",
}

const FILTER_KEYS = [
  "q", "type", "marque", "carburant",
  "prix_min", "prix_max", "annee_min", "annee_max",
  "km_max", "transmission", "carrosserie", "ct",
]

function countActive(params: URLSearchParams): number {
  return FILTER_KEYS.filter((k) => !!params.get(k)).length
}

// ─── Section collapsible ──────────────────────────────────────────────────────

interface FilterSectionProps {
  label: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}

function FilterSection({ label, open, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-3 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: 'rgba(201,168,76,0.6)' }}>
          {label}
        </span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.25)' }} />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.25)' }} />
        )}
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function VehicleFilters({ filtersData }: VehicleFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [brandSearch, setBrandSearch] = useState("")
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    search: true,
    type: true,
    brand: true,
    price: true,
    year: false,
    km: false,
    fuel: true,
    transmission: false,
    body: false,
    ct: false,
  })

  const activeCount = countActive(searchParams)

  const pushParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("page")
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [searchParams, pathname, router]
  )

  const resetAll = useCallback(() => {
    startTransition(() => {
      router.push(pathname)
    })
  }, [pathname, router])

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredBrands = filtersData.brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  )

  // Key forces remount of inputs when URL params change (so defaultValue resets)
  const filterKey = searchParams.toString()

  const content = (
    <div key={filterKey} className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <span className="font-semibold text-sm text-white">
          Filtres
          {activeCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-ar-black text-xs font-bold" style={{ background: '#C9A84C' }}>
              {activeCount}
            </span>
          )}
        </span>
        {activeCount > 0 && (
          <button
            onClick={resetAll}
            className="text-xs flex items-center gap-1 transition-colors hover:text-ar-gold"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <X className="h-3 w-3" />
            Tout effacer
          </button>
        )}
      </div>

      {/* 1. Recherche texte */}
      <FilterSection
        label="Recherche"
        open={openSections.search}
        onToggle={() => toggleSection("search")}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input
            type="text"
            placeholder="Marque, modèle..."
            defaultValue={searchParams.get("q") ?? ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                pushParam("q", (e.target as HTMLInputElement).value || null)
              }
            }}
            onBlur={(e) => pushParam("q", e.target.value || null)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          />
        </div>
      </FilterSection>

      {/* 2. Type de véhicule */}
      {filtersData.types.length > 0 && (
        <FilterSection
          label="Type de véhicule"
          open={openSections.type}
          onToggle={() => toggleSection("type")}
        >
          <div className="flex flex-wrap gap-2">
            {filtersData.types.map(({ value, count }) => {
              const active = searchParams.get("type") === value
              return (
                <button
                  key={value}
                  onClick={() => pushParam("type", active ? null : value)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={active
                    ? { background: 'linear-gradient(135deg, #C9A84C, #B8972A)', color: '#0A0A0A', border: '1px solid transparent' }
                    : { background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }
                  }
                >
                  {VEHICLE_TYPE_LABELS[value] ?? value}
                  <span className="ml-1 opacity-50">({count})</span>
                </button>
              )
            })}
          </div>
        </FilterSection>
      )}

      {/* 3. Marque */}
      {filtersData.brands.length > 0 && (
        <FilterSection
          label="Marque"
          open={openSections.brand}
          onToggle={() => toggleSection("brand")}
        >
          {filtersData.brands.length > 5 && (
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <input
                type="text"
                placeholder="Rechercher une marque..."
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>
          )}
          <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
            {filteredBrands.map(({ name, count }) => {
              const active = searchParams.get("marque") === name
              return (
                <label
                  key={name}
                  className="flex items-center justify-between gap-2 cursor-pointer group py-0.5"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="marque"
                      checked={active}
                      onChange={() => pushParam("marque", active ? null : name)}
                      className="accent-ar-gold"
                    />
                    <span className={`text-xs transition-colors ${active ? "font-semibold text-ar-gold" : "group-hover:text-ar-gold"}`} style={active ? {} : { color: 'rgba(255,255,255,0.5)' }}>
                      {name}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{count}</span>
                </label>
              )
            })}
          </div>
        </FilterSection>
      )}

      {/* 4. Prix */}
      <FilterSection
        label="Prix (€)"
        open={openSections.price}
        onToggle={() => toggleSection("price")}
      >
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={searchParams.get("prix_min") ?? ""}
            onBlur={(e) => pushParam("prix_min", e.target.value || null)}
            className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          />
          <input
            type="number"
            placeholder="Max"
            defaultValue={searchParams.get("prix_max") ?? ""}
            onBlur={(e) => pushParam("prix_max", e.target.value || null)}
            className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
          <span>{filtersData.priceRange.min.toLocaleString("fr-FR")} €</span>
          <span>{filtersData.priceRange.max.toLocaleString("fr-FR")} €</span>
        </div>
      </FilterSection>

      {/* 5. Année */}
      <FilterSection
        label="Année"
        open={openSections.year}
        onToggle={() => toggleSection("year")}
      >
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={`${filtersData.yearRange.min}`}
            defaultValue={searchParams.get("annee_min") ?? ""}
            onBlur={(e) => pushParam("annee_min", e.target.value || null)}
            className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          />
          <input
            type="number"
            placeholder={`${filtersData.yearRange.max}`}
            defaultValue={searchParams.get("annee_max") ?? ""}
            onBlur={(e) => pushParam("annee_max", e.target.value || null)}
            className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
          <span>{filtersData.yearRange.min}</span>
          <span>{filtersData.yearRange.max}</span>
        </div>
      </FilterSection>

      {/* 6. Kilométrage max */}
      <FilterSection
        label="Kilométrage max"
        open={openSections.km}
        onToggle={() => toggleSection("km")}
      >
        <input
          type="number"
          placeholder="ex: 100 000"
          defaultValue={searchParams.get("km_max") ?? ""}
          onBlur={(e) => pushParam("km_max", e.target.value || null)}
          className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
        />
        <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Max disponible : {filtersData.kmMax.toLocaleString("fr-FR")} km
        </p>
      </FilterSection>

      {/* 7. Carburant */}
      {filtersData.fuels.length > 0 && (
        <FilterSection
          label="Carburant"
          open={openSections.fuel}
          onToggle={() => toggleSection("fuel")}
        >
          <div className="space-y-1.5">
            {filtersData.fuels.map(({ value, count }) => {
              const active = searchParams.get("carburant") === value
              return (
                <label key={value} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => pushParam("carburant", active ? null : value)}
                      className="accent-ar-gold"
                    />
                    <span
                      className={`text-xs transition-colors ${active ? "font-semibold text-ar-gold" : "group-hover:text-ar-gold"}`}
                      style={active ? {} : { color: 'rgba(255,255,255,0.5)' }}
                    >
                      {FUEL_LABELS[value as keyof typeof FUEL_LABELS] ?? value}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{count}</span>
                </label>
              )
            })}
          </div>
        </FilterSection>
      )}

      {/* 8. Transmission */}
      {filtersData.transmissions.length > 0 && (
        <FilterSection
          label="Boîte de vitesses"
          open={openSections.transmission}
          onToggle={() => toggleSection("transmission")}
        >
          <div className="space-y-1.5">
            {filtersData.transmissions.map(({ value, count }) => {
              const active = searchParams.get("transmission") === value
              return (
                <label key={value} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => pushParam("transmission", active ? null : value)}
                      className="accent-ar-gold"
                    />
                    <span
                      className={`text-xs transition-colors ${active ? "font-semibold text-ar-gold" : "group-hover:text-ar-gold"}`}
                      style={active ? {} : { color: 'rgba(255,255,255,0.5)' }}
                    >
                      {TRANSMISSION_LABELS[value as keyof typeof TRANSMISSION_LABELS] ?? value}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{count}</span>
                </label>
              )
            })}
          </div>
        </FilterSection>
      )}

      {/* 9. Carrosserie */}
      {filtersData.bodies.length > 0 && (
        <FilterSection
          label="Carrosserie"
          open={openSections.body}
          onToggle={() => toggleSection("body")}
        >
          <div className="space-y-1.5">
            {filtersData.bodies.map(({ value, count }) => {
              const active = searchParams.get("carrosserie") === value
              return (
                <label key={value} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => pushParam("carrosserie", active ? null : value)}
                      className="accent-ar-gold"
                    />
                    <span
                      className={`text-xs transition-colors ${active ? "font-semibold text-ar-gold" : "group-hover:text-ar-gold"}`}
                      style={active ? {} : { color: 'rgba(255,255,255,0.5)' }}
                    >
                      {BODY_LABELS[value as keyof typeof BODY_LABELS] ?? value}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{count}</span>
                </label>
              )
            })}
          </div>
        </FilterSection>
      )}

      {/* 10. Contrôle technique */}
      <FilterSection
        label="Contrôle technique"
        open={openSections.ct}
        onToggle={() => toggleSection("ct")}
      >
        <div className="space-y-1.5">
          {(["valide", "a_passer", "non_requis"] as const).map((value) => {
            const active = searchParams.get("ct") === value
            return (
              <label key={value} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="ct"
                  checked={active}
                  onChange={() => pushParam("ct", active ? null : value)}
                  className="accent-ar-gold"
                />
                <span
                  className={`text-xs transition-colors ${active ? "font-semibold text-ar-gold" : "group-hover:text-ar-gold"}`}
                  style={active ? {} : { color: 'rgba(255,255,255,0.5)' }}
                >
                  {CT_LABELS[value]}
                </span>
              </label>
            )
          })}
        </div>
      </FilterSection>
    </div>
  )

  return (
    /* ── Desktop sidebar only ── */
    <aside className="hidden lg:block w-[280px] shrink-0">
      <div
        className={`rounded-2xl p-5 sticky top-24 transition-opacity duration-200 ${
          isPending ? "opacity-50 pointer-events-none" : ""
        }`}
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {content}
      </div>
    </aside>
  )
}

// ─── Mobile filter button (used inside CatalogToolbar) ───────────────────────

export function MobileFilterButton({ filtersData }: VehicleFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [brandSearch, setBrandSearch] = useState("")
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    search: true,
    type: true,
    brand: true,
    price: true,
    year: false,
    km: false,
    fuel: true,
    transmission: false,
    body: false,
    ct: false,
  })

  const activeCount = countActive(searchParams)

  const pushParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("page")
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [searchParams, pathname, router]
  )

  const resetAll = useCallback(() => {
    startTransition(() => {
      router.push(pathname)
    })
  }, [pathname, router])

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredBrands = filtersData.brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  )

  const filterKey = searchParams.toString()

  const content = (
    <MobileFilterContent
      filterKey={filterKey}
      activeCount={activeCount}
      resetAll={resetAll}
      openSections={openSections}
      toggleSection={toggleSection}
      searchParams={searchParams}
      pushParam={pushParam}
      filtersData={filtersData}
      brandSearch={brandSearch}
      setBrandSearch={setBrandSearch}
      filteredBrands={filteredBrands}
    />
  )

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setMobileOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:border-ar-gold"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <SlidersHorizontal className="h-4 w-4 text-ar-gold" />
        Filtres
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-ar-black text-xs font-bold" style={{ background: '#C9A84C' }}>
            {activeCount}
          </span>
        )}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-ar-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="font-semibold text-white">
                Filtres
                {activeCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-ar-black text-xs font-bold" style={{ background: '#C9A84C' }}>
                    {activeCount}
                  </span>
                )}
              </span>
              <button onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" style={{ color: 'rgba(255,255,255,0.4)' }} />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-2 flex-1">{content}</div>
            <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full py-3 rounded-xl text-ar-black font-semibold text-sm transition-colors hover:brightness-110"
                style={{ background: '#C9A84C' }}
              >
                Voir les résultats
                {activeCount > 0 && ` (${activeCount} filtre${activeCount > 1 ? "s" : ""})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Extracted to avoid duplicating the full filter content JSX
function MobileFilterContent({
  filterKey,
  activeCount,
  resetAll,
  openSections,
  toggleSection,
  searchParams,
  pushParam,
  filtersData,
  brandSearch,
  setBrandSearch,
  filteredBrands,
}: {
  filterKey: string
  activeCount: number
  resetAll: () => void
  openSections: Record<string, boolean>
  toggleSection: (key: string) => void
  searchParams: URLSearchParams
  pushParam: (key: string, value: string | null) => void
  filtersData: FiltersData
  brandSearch: string
  setBrandSearch: (v: string) => void
  filteredBrands: { name: string; count: number }[]
}) {
  return (
    <div key={filterKey} className="space-y-0">
      <div className="flex items-center justify-between pb-3 mb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <span className="font-semibold text-sm text-white">
          Filtres
          {activeCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-ar-black text-xs font-bold" style={{ background: '#C9A84C' }}>
              {activeCount}
            </span>
          )}
        </span>
        {activeCount > 0 && (
          <button onClick={resetAll} className="text-xs flex items-center gap-1 transition-colors hover:text-ar-gold" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <X className="h-3 w-3" />
            Tout effacer
          </button>
        )}
      </div>

      <FilterSection label="Recherche" open={openSections.search} onToggle={() => toggleSection("search")}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input
            type="text"
            placeholder="Marque, modèle..."
            defaultValue={searchParams.get("q") ?? ""}
            onKeyDown={(e) => { if (e.key === "Enter") pushParam("q", (e.target as HTMLInputElement).value || null) }}
            onBlur={(e) => pushParam("q", e.target.value || null)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          />
        </div>
      </FilterSection>

      {filtersData.types.length > 0 && (
        <FilterSection label="Type de véhicule" open={openSections.type} onToggle={() => toggleSection("type")}>
          <div className="flex flex-wrap gap-2">
            {filtersData.types.map(({ value, count }) => {
              const active = searchParams.get("type") === value
              return (
                <button
                  key={value}
                  onClick={() => pushParam("type", active ? null : value)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={active
                    ? { background: 'linear-gradient(135deg, #C9A84C, #B8972A)', color: '#0A0A0A', border: '1px solid transparent' }
                    : { background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }
                  }
                >
                  {VEHICLE_TYPE_LABELS[value] ?? value}
                  <span className="ml-1 opacity-50">({count})</span>
                </button>
              )
            })}
          </div>
        </FilterSection>
      )}

      {filtersData.brands.length > 0 && (
        <FilterSection label="Marque" open={openSections.brand} onToggle={() => toggleSection("brand")}>
          {filtersData.brands.length > 5 && (
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <input type="text" placeholder="Rechercher une marque..." value={brandSearch} onChange={(e) => setBrandSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>
          )}
          <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
            {filteredBrands.map(({ name, count }) => {
              const active = searchParams.get("marque") === name
              return (
                <label key={name} className="flex items-center justify-between gap-2 cursor-pointer group py-0.5">
                  <div className="flex items-center gap-2">
                    <input type="radio" name="marque" checked={active} onChange={() => pushParam("marque", active ? null : name)} className="accent-ar-gold" />
                    <span className={`text-xs transition-colors ${active ? "font-semibold text-ar-gold" : "group-hover:text-ar-gold"}`} style={active ? {} : { color: 'rgba(255,255,255,0.5)' }}>{name}</span>
                  </div>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{count}</span>
                </label>
              )
            })}
          </div>
        </FilterSection>
      )}

      <FilterSection label="Prix (€)" open={openSections.price} onToggle={() => toggleSection("price")}>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" defaultValue={searchParams.get("prix_min") ?? ""} onBlur={(e) => pushParam("prix_min", e.target.value || null)}
            className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          <input type="number" placeholder="Max" defaultValue={searchParams.get("prix_max") ?? ""} onBlur={(e) => pushParam("prix_max", e.target.value || null)}
            className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
        </div>
        <div className="flex justify-between text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
          <span>{filtersData.priceRange.min.toLocaleString("fr-FR")} €</span>
          <span>{filtersData.priceRange.max.toLocaleString("fr-FR")} €</span>
        </div>
      </FilterSection>

      <FilterSection label="Carburant" open={openSections.fuel} onToggle={() => toggleSection("fuel")}>
        <div className="space-y-1.5">
          {filtersData.fuels.map(({ value, count }) => {
            const active = searchParams.get("carburant") === value
            return (
              <label key={value} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={active} onChange={() => pushParam("carburant", active ? null : value)} className="accent-ar-gold" />
                  <span className={`text-xs transition-colors ${active ? "font-semibold text-ar-gold" : "group-hover:text-ar-gold"}`} style={active ? {} : { color: 'rgba(255,255,255,0.5)' }}>
                    {FUEL_LABELS[value as keyof typeof FUEL_LABELS] ?? value}
                  </span>
                </div>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{count}</span>
              </label>
            )
          })}
        </div>
      </FilterSection>
    </div>
  )
}
