"use client"

import { useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { Zap, Droplets } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  DRIVE_TYPES,
} from "@/lib/validations/vehicle"
import type { VehicleFormData } from "@/lib/validations/vehicle"

const FUEL_CONFIG: Record<string, { color: string; bgColor: string; icon: React.ReactNode }> = {
  essence: { 
    color: "text-red-400", 
    bgColor: "bg-red-500/10",
    icon: <Droplets className="w-4 h-4" />
  },
  diesel: { 
    color: "text-blue-400", 
    bgColor: "bg-blue-500/10",
    icon: <Droplets className="w-4 h-4" />
  },
  hybride: { 
    color: "text-emerald-400", 
    bgColor: "bg-emerald-500/10",
    icon: <div className="w-3 h-3 rounded-full bg-emerald-400" />
  },
  electrique: { 
    color: "text-violet-400", 
    bgColor: "bg-violet-500/10",
    icon: <Zap className="w-4 h-4" />
  },
  gpl: { 
    color: "text-amber-400", 
    bgColor: "bg-amber-500/10",
    icon: <div className="w-3 h-3 rounded-full bg-amber-400" />
  },
}

export function EngineSection() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<VehicleFormData>()

  const selectedFuel = watch("fuel")
  const powerHp = watch("power_hp")

  // Calcul automatique kW depuis ch (arrondi à l'entier pour la base de données)
  useEffect(() => {
    if (powerHp && powerHp > 0) {
      const kw = Math.round(powerHp * 0.7355)
      setValue("power_kw", kw)
    } else {
      setValue("power_kw", null)
    }
  }, [powerHp, setValue])

  const isElectric = selectedFuel === "electrique"

  return (
    <div className="space-y-8">
      {/* Carburant */}
      <div className="space-y-4">
        <Label className="text-gray-300 font-medium">
          Carburant <span className="text-red-400">*</span>
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {FUEL_TYPES.map((fuel) => {
            const isSelected = selectedFuel === fuel.value
            const config = FUEL_CONFIG[fuel.value]
            return (
              <button
                key={fuel.value}
                type="button"
                onClick={() =>
                  setValue("fuel", fuel.value, { shouldValidate: true })
                }
                className={`group relative flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? "border-ar-gold shadow-lg shadow-ar-gold/10"
                    : "border-ar-gold/20 hover:border-ar-gold/40"
                }`}
              >
                {/* Background coloré */}
                <div className={`absolute inset-0 transition-opacity duration-300 ${
                  isSelected ? config.bgColor : "bg-ar-dark/30 group-hover:bg-ar-gold/5"
                }`} />
                
                <span className={`relative ${config.color}`}>
                  {config.icon}
                </span>
                <span
                  className={`relative text-sm font-semibold transition-colors duration-300 ${
                    isSelected ? config.color : "text-gray-400 group-hover:text-gray-300"
                  }`}
                >
                  {fuel.label}
                </span>
              </button>
            )
          })}
        </div>
        {errors.fuel && (
          <p className="text-sm text-red-400">{errors.fuel.message}</p>
        )}
      </div>

      {/* Cylindrée - masquée si électrique */}
      {!isElectric && (
        <div className="space-y-3">
          <Label htmlFor="engine_size" className="text-gray-300 font-medium">
            Cylindrée (cm³)
          </Label>
          <Input
            id="engine_size"
            type="number"
            {...register("engine_size", { valueAsNumber: true })}
            placeholder="ex: 1998"
            className="bg-ar-dark/50 border-ar-gold/20 focus:border-ar-gold/50 focus:ring-ar-gold/20 text-white placeholder:text-gray-500 transition-all duration-300"
          />
        </div>
      )}

      {/* Puissances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="power_hp" className="text-gray-300 font-medium">
            Puissance (ch)
          </Label>
          <Input
            id="power_hp"
            type="number"
            {...register("power_hp", { valueAsNumber: true })}
            placeholder="ex: 150"
            className="bg-ar-dark/50 border-ar-gold/20 focus:border-ar-gold/50 focus:ring-ar-gold/20 text-white placeholder:text-gray-500 transition-all duration-300"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="power_kw" className="text-gray-300 font-medium">
            Puissance (kW)
          </Label>
          <Input
            id="power_kw"
            type="number"
            {...register("power_kw", { valueAsNumber: true })}
            disabled
            className="bg-ar-dark/30 border-ar-gold/10 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500">Calculée automatiquement</p>
        </div>
      </div>

      {/* Boîte de vitesses */}
      <div className="space-y-3">
        <Label htmlFor="transmission" className="text-gray-300 font-medium">
          Boîte de vitesses
        </Label>
        <Select
          value={watch("transmission") || ""}
          onValueChange={(value: string) =>
            setValue("transmission", value as VehicleFormData["transmission"])
          }
        >
          <SelectTrigger className="bg-ar-dark/50 border-ar-gold/20 focus:border-ar-gold/50 text-white">
            <SelectValue placeholder="Sélectionner" />
          </SelectTrigger>
          <SelectContent className="bg-ar-gray border-ar-gold/20">
            {TRANSMISSION_TYPES.map((type) => (
              <SelectItem 
                key={type.value} 
                value={type.value}
                className="text-gray-300 focus:bg-ar-gold/10 focus:text-ar-gold"
              >
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Traction */}
      <div className="space-y-3">
        <Label htmlFor="drive" className="text-gray-300 font-medium">
          Traction
        </Label>
        <Select
          value={watch("drive") || ""}
          onValueChange={(value: string) =>
            setValue("drive", value as VehicleFormData["drive"])
          }
        >
          <SelectTrigger className="bg-ar-dark/50 border-ar-gold/20 focus:border-ar-gold/50 text-white">
            <SelectValue placeholder="Sélectionner" />
          </SelectTrigger>
          <SelectContent className="bg-ar-gray border-ar-gold/20">
            {DRIVE_TYPES.map((type) => (
              <SelectItem 
                key={type.value} 
                value={type.value}
                className="text-gray-300 focus:bg-ar-gold/10 focus:text-ar-gold"
              >
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
