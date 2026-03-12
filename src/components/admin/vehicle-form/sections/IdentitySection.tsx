"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Car, Bike, Truck, Circle } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BRANDS, VEHICLE_TYPES } from "@/lib/validations/vehicle"
import type { VehicleFormData } from "@/lib/validations/vehicle"

const VEHICLE_TYPE_ICONS = {
  voiture: Car,
  moto: Bike,
  utilitaire: Truck,
  autre: Circle,
}

export function IdentitySection() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<VehicleFormData>()

  const [brandSearch, setBrandSearch] = useState("")
  const [showBrandDropdown, setShowBrandDropdown] = useState(false)
  const selectedBrand = watch("brand")
  const selectedVehicleType = watch("vehicle_type")

  const filteredBrands = BRANDS.filter((brand) =>
    brand.toLowerCase().includes(brandSearch.toLowerCase())
  )

  const handleBrandSelect = (brand: string) => {
    setValue("brand", brand, { shouldValidate: true })
    setShowBrandDropdown(false)
    setBrandSearch("")
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-8">
      {/* Marque */}
      <div className="space-y-3">
        <Label htmlFor="brand" className="text-gray-300 font-medium">
          Marque <span className="text-red-400">*</span>
        </Label>
        <div className="relative">
          <Input
            id="brand"
            value={selectedBrand || brandSearch}
            onChange={(e) => {
              setBrandSearch(e.target.value)
              setValue("brand", e.target.value, { shouldValidate: true })
              setShowBrandDropdown(true)
            }}
            onFocus={() => setShowBrandDropdown(true)}
            placeholder="Rechercher une marque..."
            className={`bg-ar-dark/50 border-ar-gold/20 focus:border-ar-gold/50 focus:ring-ar-gold/20 text-white placeholder:text-gray-500 transition-all duration-300 ${
              errors.brand ? "border-red-500/50 ring-1 ring-red-500/20" : ""
            }`}
          />
          {showBrandDropdown && (
            <div className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-ar-gold/20 bg-ar-gray/95 backdrop-blur-xl shadow-xl shadow-ar-gold/10">
              {filteredBrands.length > 0 ? (
                filteredBrands.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => handleBrandSelect(brand)}
                    className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-ar-gold/10 hover:text-ar-gold transition-colors"
                  >
                    {brand}
                  </button>
                ))
              ) : (
                <button
                  type="button"
                  onClick={() => handleBrandSelect(brandSearch)}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-ar-gold/10 text-ar-gold font-medium transition-colors"
                >
                  Utiliser &quot;{brandSearch}&quot;
                </button>
              )}
            </div>
          )}
        </div>
        {errors.brand && (
          <p className="text-sm text-red-400">{errors.brand.message}</p>
        )}
      </div>

      {/* Modèle */}
      <div className="space-y-3">
        <Label htmlFor="model" className="text-gray-300 font-medium">
          Modèle <span className="text-red-400">*</span>
        </Label>
        <Input
          id="model"
          {...register("model")}
          placeholder="ex: Clio, Golf, 308..."
          className={`bg-ar-dark/50 border-ar-gold/20 focus:border-ar-gold/50 focus:ring-ar-gold/20 text-white placeholder:text-gray-500 transition-all duration-300 ${
            errors.model ? "border-red-500/50 ring-1 ring-red-500/20" : ""
          }`}
        />
        {errors.model && (
          <p className="text-sm text-red-400">{errors.model.message}</p>
        )}
      </div>

      {/* Version/Finition */}
      <div className="space-y-3">
        <Label htmlFor="version" className="text-gray-300 font-medium">
          Version / Finition
        </Label>
        <Input
          id="version"
          {...register("version")}
          placeholder="ex: GTI, S-line, Prestige..."
          className="bg-ar-dark/50 border-ar-gold/20 focus:border-ar-gold/50 focus:ring-ar-gold/20 text-white placeholder:text-gray-500 transition-all duration-300"
        />
      </div>

      {/* Année */}
      <div className="space-y-3">
        <Label htmlFor="year" className="text-gray-300 font-medium">
          Année <span className="text-red-400">*</span>
        </Label>
        <Select
          value={watch("year")?.toString()}
          onValueChange={(value: string) =>
            setValue("year", parseInt(value), { shouldValidate: true })
          }
        >
          <SelectTrigger className={`bg-ar-dark/50 border-ar-gold/20 focus:border-ar-gold/50 text-white ${
            errors.year ? "border-red-500/50 ring-1 ring-red-500/20" : ""
          }`}>
            <SelectValue placeholder="Sélectionner une année" />
          </SelectTrigger>
          <SelectContent className="bg-ar-gray border-ar-gold/20">
            {years.map((year) => (
              <SelectItem 
                key={year} 
                value={year.toString()}
                className="text-gray-300 focus:bg-ar-gold/10 focus:text-ar-gold"
              >
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.year && (
          <p className="text-sm text-red-400">{errors.year.message}</p>
        )}
      </div>

      {/* Type de véhicule */}
      <div className="space-y-4">
        <Label className="text-gray-300 font-medium">
          Type de véhicule <span className="text-red-400">*</span>
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {VEHICLE_TYPES.map((type) => {
            const Icon = VEHICLE_TYPE_ICONS[type.value]
            const isSelected = selectedVehicleType === type.value
            return (
              <button
                key={type.value}
                type="button"
                onClick={() =>
                  setValue("vehicle_type", type.value, { shouldValidate: true })
                }
                className={`group relative flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? "border-ar-gold bg-gradient-to-br from-ar-gold/20 to-ar-gold/5 shadow-lg shadow-ar-gold/20"
                    : "border-ar-gold/20 bg-ar-dark/30 hover:border-ar-gold/40 hover:bg-ar-gold/5"
                }`}
              >
                {/* Effet de lueur */}
                {isSelected && (
                  <div className="absolute inset-0 bg-ar-gold/5 blur-xl" />
                )}
                
                <Icon
                  className={`relative h-7 w-7 transition-all duration-300 ${
                    isSelected 
                      ? "text-ar-gold scale-110" 
                      : "text-gray-500 group-hover:text-ar-gold/70"
                  }`}
                />
                <span
                  className={`relative text-sm font-semibold transition-colors duration-300 ${
                    isSelected ? "text-ar-gold" : "text-gray-400 group-hover:text-gray-300"
                  }`}
                >
                  {type.label}
                </span>
              </button>
            )
          })}
        </div>
        {errors.vehicle_type && (
          <p className="text-sm text-red-400">{errors.vehicle_type.message}</p>
        )}
      </div>
    </div>
  )
}
