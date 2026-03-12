"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Car, Truck, Caravan, Users, Package, Bike, Circle } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BODY_TYPES, PREDEFINED_COLORS } from "@/lib/validations/vehicle"
import type { VehicleFormData } from "@/lib/validations/vehicle"

const BODY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  berline: Car,
  suv: Truck,
  break: Caravan,
  coupe: Car,
  cabriolet: Car,
  monospace: Users,
  pickup: Truck,
  utilitaire: Package,
  moto: Bike,
  autre: Circle,
}

export function BodySection() {
  const {
    register,
    setValue,
    watch,
  } = useFormContext<VehicleFormData>()

  const selectedBody = watch("body")
  const selectedColor = watch("color_ext")
  const selectedDoors = watch("doors")
  const [customColor, setCustomColor] = useState(selectedColor || "")
  const [isCustomColor, setIsCustomColor] = useState(
    selectedColor ? !PREDEFINED_COLORS.find((c) => c.name === selectedColor) : false
  )

  const handleColorSelect = (colorName: string) => {
    if (colorName === "Autre") {
      setIsCustomColor(true)
      setValue("color_ext", customColor || "")
    } else {
      setIsCustomColor(false)
      setValue("color_ext", colorName)
    }
  }

  const handleCustomColorChange = (value: string) => {
    setCustomColor(value)
    setValue("color_ext", value)
  }

  return (
    <div className="space-y-8">
      {/* Type de carrosserie */}
      <div className="space-y-4">
        <Label className="text-gray-300 font-medium">Type de carrosserie</Label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {BODY_TYPES.map((body) => {
            const Icon = BODY_ICONS[body.value]
            const isSelected = selectedBody === body.value
            return (
              <button
                key={body.value}
                type="button"
                onClick={() => setValue("body", body.value)}
                className={`group relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? "border-ar-gold bg-gradient-to-br from-ar-gold/20 to-ar-gold/5 shadow-lg shadow-ar-gold/10"
                    : "border-ar-gold/20 bg-ar-dark/30 hover:border-ar-gold/40 hover:bg-ar-gold/5"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-all duration-300 ${
                    isSelected ? "text-ar-gold scale-110" : "text-gray-500 group-hover:text-ar-gold/70"
                  }`}
                />
                <span
                  className={`text-xs font-semibold transition-colors duration-300 ${
                    isSelected ? "text-ar-gold" : "text-gray-400 group-hover:text-gray-300"
                  }`}
                >
                  {body.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Nombre de portes */}
      <div className="space-y-4">
        <Label className="text-gray-300 font-medium">Nombre de portes</Label>
        <div className="flex gap-3">
          {[2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setValue("doors", num)}
              className={`w-14 h-14 rounded-xl border-2 font-bold text-lg transition-all duration-300 ${
                selectedDoors === num
                  ? "border-ar-gold bg-ar-gold text-ar-black shadow-lg shadow-ar-gold/30"
                  : "border-ar-gold/20 text-gray-400 hover:border-ar-gold/40 hover:bg-ar-gold/5"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Nombre de places */}
      <div className="space-y-3">
        <Label htmlFor="seats" className="text-gray-300 font-medium">
          Nombre de places
        </Label>
        <Input
          id="seats"
          type="number"
          min={1}
          max={9}
          {...register("seats", { valueAsNumber: true })}
          placeholder="ex: 5"
          className="bg-ar-dark/50 border-ar-gold/20 focus:border-ar-gold/50 focus:ring-ar-gold/20 text-white placeholder:text-gray-500 transition-all duration-300"
        />
      </div>

      {/* Couleur extérieure */}
      <div className="space-y-4">
        <Label className="text-gray-300 font-medium">Couleur extérieure</Label>
        <div className="flex flex-wrap gap-3">
          {PREDEFINED_COLORS.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => handleColorSelect(color.name)}
              title={color.name}
              className={`group relative w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                selectedColor === color.name && !isCustomColor
                  ? "border-ar-gold shadow-lg shadow-ar-gold/30 scale-110"
                  : "border-ar-gold/30 hover:border-ar-gold/50 hover:scale-105"
              }`}
              style={{
                backgroundColor: color.hex,
                backgroundImage:
                  color.name === "Autre"
                    ? "repeating-linear-gradient(45deg, transparent, transparent 5px, #666 5px, #666 10px)"
                    : undefined,
              }}
            >
              {/* Indicateur de sélection */}
              {selectedColor === color.name && !isCustomColor && (
                <div className="absolute inset-0 rounded-full border-2 border-white/50" />
              )}
            </button>
          ))}
        </div>
        {isCustomColor && (
          <Input
            value={customColor}
            onChange={(e) => handleCustomColorChange(e.target.value)}
            placeholder="Précisez la couleur..."
            className="bg-ar-dark/50 border-ar-gold/20 focus:border-ar-gold/50 focus:ring-ar-gold/20 text-white placeholder:text-gray-500 transition-all duration-300 mt-3"
          />
        )}
        {selectedColor && !isCustomColor && (
          <p className="text-sm text-ar-gold/70">Couleur sélectionnée : {selectedColor}</p>
        )}
      </div>

      {/* Couleur intérieure */}
      <div className="space-y-3">
        <Label htmlFor="color_int" className="text-gray-300 font-medium">
          Couleur intérieure
        </Label>
        <Input
          id="color_int"
          {...register("color_int")}
          placeholder="ex: Cuir noir, Tissu gris..."
          className="bg-ar-dark/50 border-ar-gold/20 focus:border-ar-gold/50 focus:ring-ar-gold/20 text-white placeholder:text-gray-500 transition-all duration-300"
        />
      </div>
    </div>
  )
}
