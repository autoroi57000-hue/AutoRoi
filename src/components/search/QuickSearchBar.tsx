"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VEHICLE_TYPES, FUEL_TYPES, localePath} from '@/lib/constants';
import type { VehicleFilters } from "@/types/vehicle";

interface QuickSearchBarProps {
  locale?: string;
  brands?: string[];
}

const priceRanges = [
  { value: "10000", label: "10 000 €" },
  { value: "20000", label: "20 000 €" },
  { value: "30000", label: "30 000 €" },
  { value: "50000", label: "50 000 €" },
  { value: "100000", label: "100 000 €" },
];

export function QuickSearchBar({
  locale = "fr",
  brands = [],
}: QuickSearchBarProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<VehicleFilters>({});

  const ALL_VALUE: string = "__ALL__";

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.brand && filters.brand !== ALL_VALUE) params.set("brand", filters.brand);
    if (filters.vehicle_type && filters.vehicle_type !== ALL_VALUE) params.set("type", filters.vehicle_type);
    if (filters.max_price) params.set("max_price", filters.max_price.toString());

    const query = params.toString();
    router.push(`${localePath(locale, '/vehicules')}${query ? `?${query}` : ""}`);
  };

  const handleAdvancedSearch = () => {
    handleSearch();
    setIsModalOpen(false);
  };

  const texts = {
    fr: {
      brand: "Marque",
      type: "Type",
      maxPrice: "Prix max",
      search: "Rechercher",
      advancedSearch: "Recherche avancée",
      allBrands: "Toutes les marques",
      allTypes: "Tous les types",
      allPrices: "Prix maximum",
      filters: "Filtres",
      fuel: "Carburant",
      allFuels: "Tous carburants",
    },
    en: {
      brand: "Brand",
      type: "Type",
      maxPrice: "Max price",
      search: "Search",
      advancedSearch: "Advanced search",
      allBrands: "All brands",
      allTypes: "All types",
      allPrices: "Max price",
      filters: "Filters",
      fuel: "Fuel",
      allFuels: "All fuels",
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.fr;

  return (
    <div className="w-full max-w-5xl">
      {/* Desktop search bar */}
      <div className="hidden rounded-xl border border-ar-gold/20 bg-ar-black/50 p-2 shadow-2xl backdrop-blur-xl md:block">
        <div className="flex items-center gap-2">
          {/* Brand */}
          <div className="flex-1">
            <Select
              value={filters.brand || ALL_VALUE}
              onValueChange={(value) =>
                setFilters((f) => ({ ...f, brand: value === ALL_VALUE ? undefined : value }))
              }
            >
              <SelectTrigger className="border-0 bg-transparent text-white focus:ring-0 [&>span]:text-ar-silver">
                <SelectValue placeholder={t.brand} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>{t.allBrands}</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="h-8 w-px bg-ar-gold/20" />

          {/* Type */}
          <div className="flex-1">
            <Select
              value={filters.vehicle_type || ALL_VALUE}
              onValueChange={(value) =>
                setFilters((f) => ({
                  ...f,
                  vehicle_type: value === ALL_VALUE ? undefined : (value as VehicleFilters["vehicle_type"]),
                }))
              }
            >
              <SelectTrigger className="border-0 bg-transparent text-white focus:ring-0 [&>span]:text-ar-silver">
                <SelectValue placeholder={t.type} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>{t.allTypes}</SelectItem>
                {VEHICLE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="h-8 w-px bg-ar-gold/20" />

          {/* Max Price */}
          <div className="flex-1">
            <Select
              value={filters.max_price?.toString() || ALL_VALUE}
              onValueChange={(value) =>
                setFilters((f) => ({
                  ...f,
                  max_price: value === ALL_VALUE ? undefined : parseInt(value),
                }))
              }
            >
              <SelectTrigger className="border-0 bg-transparent text-white focus:ring-0 [&>span]:text-ar-silver">
                <SelectValue placeholder={t.maxPrice} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>{t.allPrices}</SelectItem>
                {priceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="h-8 w-px bg-ar-gold/20" />

          {/* Search button */}
          <Button
            onClick={handleSearch}
            className="bg-ar-gold px-6 text-ar-black hover:bg-ar-gold-dark"
          >
            <Search className="mr-2 h-4 w-4" />
            {t.search}
          </Button>
        </div>

        {/* Advanced search link */}
        <div className="mt-2 flex justify-end border-t border-ar-gold/10 pt-2">
          <button
            onClick={() => router.push(`${localePath(locale, '/vehicules')}`)}
            className="flex items-center gap-1 text-xs font-medium text-ar-gold/70 transition-colors hover:text-ar-gold"
          >
            {t.advancedSearch}
            <ChevronDown className="h-3 w-3 -rotate-90" />
          </button>
        </div>
      </div>

      {/* Mobile search button */}
      <div className="md:hidden">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="w-full bg-ar-gold text-ar-black hover:bg-ar-gold-dark"
            >
              <Search className="mr-2 h-5 w-5" />
              {t.search}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-ar-black">
                {t.filters}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-ar-black">
                  {t.brand}
                </label>
                <Select
                  value={filters.brand || ALL_VALUE}
                  onValueChange={(value) =>
                    setFilters((f) => ({ ...f, brand: value === ALL_VALUE ? undefined : value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.allBrands} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>{t.allBrands}</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-ar-black">
                  {t.type}
                </label>
                <Select
                  value={filters.vehicle_type || ALL_VALUE}
                  onValueChange={(value) =>
                    setFilters((f) => ({
                      ...f,
                      vehicle_type: value === ALL_VALUE ? undefined : (value as VehicleFilters["vehicle_type"]),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.allTypes} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>{t.allTypes}</SelectItem>
                    {VEHICLE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-ar-black">
                  {t.fuel}
                </label>
                <Select
                  value={filters.fuel || ALL_VALUE}
                  onValueChange={(value) =>
                    setFilters((f) => ({
                      ...f,
                      fuel: value === ALL_VALUE ? undefined : (value as VehicleFilters["fuel"]),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.allFuels} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>{t.allFuels}</SelectItem>
                    {FUEL_TYPES.map((fuel) => (
                      <SelectItem key={fuel} value={fuel}>
                        {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-ar-black">
                  {t.maxPrice}
                </label>
                <Select
                  value={filters.max_price?.toString() || ALL_VALUE}
                  onValueChange={(value) =>
                    setFilters((f) => ({
                      ...f,
                      max_price: value === ALL_VALUE ? undefined : parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.allPrices} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>{t.allPrices}</SelectItem>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAdvancedSearch}
                className="mt-2 w-full bg-ar-gold text-ar-black hover:bg-ar-gold-dark"
              >
                <Search className="mr-2 h-4 w-4" />
                {t.search}
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push(`${localePath(locale, '/vehicules')}`)}
                className="w-full"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {t.advancedSearch}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
