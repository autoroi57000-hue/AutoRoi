"use client"

import { useFormContext } from "react-hook-form"
import { Wallet, Tag, Calendar } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { VehicleFormData } from "@/lib/validations/vehicle"

// Formatte les nombres avec espaces
function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return ""
  return value.toLocaleString("fr-FR")
}

export function PriceSection() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<VehicleFormData>()

  const mileage = watch("mileage")
  const price = watch("price")
  const priceNegotiable = watch("price_negotiable")
  const firstSaleDate = watch("first_sale_date")

  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "")
    const numValue = value === "" ? 0 : parseInt(value, 10)
    setValue("mileage", numValue, { shouldValidate: true })
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "")
    const numValue = value === "" ? 0 : parseInt(value, 10)
    setValue("price", numValue, { shouldValidate: true })
  }

  return (
    <div className="space-y-8">
      {/* Kilométrage */}
      <div className="space-y-3">
        <Label htmlFor="mileage" className="text-gray-300 font-medium flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-ar-gold/10 flex items-center justify-center">
            <span className="text-ar-gold text-xs font-bold">KM</span>
          </span>
          Kilométrage <span className="text-red-400">*</span>
        </Label>
        <div className="relative">
          <Input
            id="mileage"
            type="text"
            value={formatNumber(mileage)}
            onChange={handleMileageChange}
            placeholder="ex: 45 000"
            className={`bg-ar-dark/50 border-ar-gold/20 focus:border-ar-gold/50 focus:ring-ar-gold/20 text-white placeholder:text-gray-500 pr-16 transition-all duration-300 ${
              errors.mileage ? "border-red-500/50 ring-1 ring-red-500/20" : ""
            }`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ar-gold/70 font-medium">
            km
          </span>
        </div>
        {errors.mileage && (
          <p className="text-sm text-red-400">{errors.mileage.message}</p>
        )}
      </div>

      {/* Prix */}
      <div className="space-y-3">
        <Label htmlFor="price" className="text-gray-300 font-medium flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-ar-gold/10 flex items-center justify-center">
            <span className="text-ar-gold text-sm font-bold">€</span>
          </span>
          Prix <span className="text-red-400">*</span>
        </Label>
        <div className="relative">
          <Input
            id="price"
            type="text"
            value={formatNumber(price)}
            onChange={handlePriceChange}
            placeholder="ex: 8 500"
            className={`bg-ar-dark/50 border-ar-gold/20 focus:border-ar-gold/50 focus:ring-ar-gold/20 text-white placeholder:text-gray-500 pr-16 transition-all duration-300 ${
              errors.price ? "border-red-500/50 ring-1 ring-red-500/20" : ""
            }`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ar-gold/70 font-medium">
            EUR
          </span>
        </div>
        {errors.price && (
          <p className="text-sm text-red-400">{errors.price.message}</p>
        )}
      </div>

      {/* Prix négociable */}
      <div className="flex items-center justify-between rounded-xl border border-ar-gold/20 bg-ar-dark/30 p-5 backdrop-blur-sm">
        <div className="space-y-1">
          <Label htmlFor="price_negotiable" className="cursor-pointer text-white font-medium flex items-center gap-2">
            <Tag className="h-4 w-4 text-ar-gold" />
            Prix négociable
          </Label>
          <p className="text-sm text-gray-500">
            Indiquer que le prix est ouvert à la négociation
          </p>
        </div>
        <Switch
          id="price_negotiable"
          checked={priceNegotiable}
          onCheckedChange={(checked: boolean) => setValue("price_negotiable", checked)}
          className="data-[state=checked]:bg-ar-gold"
        />
      </div>

      {/* Première mise en vente */}
      <div className="space-y-3">
        <Label htmlFor="first_sale_date" className="text-gray-300 font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4 text-ar-gold" />
          Première mise en circulation
        </Label>
        <Input
          id="first_sale_date"
          type="date"
          value={firstSaleDate || ""}
          onChange={(e) => setValue("first_sale_date", e.target.value || null)}
          className="bg-ar-dark/50 border-ar-gold/20 focus:border-ar-gold/50 focus:ring-ar-gold/20 text-white placeholder:text-gray-500 transition-all duration-300"
        />
        <p className="text-xs text-gray-500">
          Date de première mise en circulation
        </p>
      </div>
    </div>
  )
}
