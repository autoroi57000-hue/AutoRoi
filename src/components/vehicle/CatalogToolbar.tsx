"use client"

import { useCallback, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { LayoutGrid, List } from "lucide-react"
import type { VehicleSortKey } from "@/types/vehicle"
import type { FiltersData } from "@/lib/vehicles"
import { MobileFilterButton } from "@/components/vehicle/VehicleFilters"

interface CatalogToolbarProps {
  total: number
  currentPage: number
  perPage: number
  filtersData?: FiltersData
}

const SORT_OPTIONS: { value: VehicleSortKey | ""; label: string }[] = [
  { value: "", label: "Pertinence" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "year_desc", label: "Année (récent)" },
  { value: "year_asc", label: "Année (ancien)" },
  { value: "mileage_asc", label: "Km le moins élevé" },
]

export function CatalogToolbar({ total, currentPage, perPage, filtersData }: CatalogToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const currentSort = searchParams.get("sort") ?? ""
  const currentView = searchParams.get("view") ?? "grid"

  const pushParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
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

  const from = (currentPage - 1) * perPage + 1
  const to = Math.min(currentPage * perPage, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      {/* Mobile filter button + Result count */}
      <div className="flex items-center gap-3">
        {filtersData && <MobileFilterButton filtersData={filtersData} />}
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {total === 0 ? (
            "Aucun résultat"
          ) : (
            <>
              <span className="font-semibold text-white">{from}–{to}</span>
              {" "}sur{" "}
              <span className="font-semibold text-white">{total}</span>
              {" "}véhicule{total > 1 ? "s" : ""}
            </>
          )}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Sort */}
        <select
          value={currentSort}
          onChange={(e) => pushParam("sort", e.target.value || null)}
          className="text-sm rounded-lg px-3 py-2 focus:outline-none text-white"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: '#111111' }}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* View toggle */}
        <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => pushParam("view", "grid")}
            className="p-2 transition-colors"
            style={currentView === "grid"
              ? { background: '#C9A84C', color: '#0A0A0A' }
              : { background: 'transparent', color: 'rgba(255,255,255,0.4)' }
            }
            title="Vue grille"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => pushParam("view", "list")}
            className="p-2 transition-colors"
            style={currentView === "list"
              ? { background: '#C9A84C', color: '#0A0A0A' }
              : { background: 'transparent', color: 'rgba(255,255,255,0.4)' }
            }
            title="Vue liste"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
