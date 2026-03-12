"use client"

import { useFormContext } from "react-hook-form"
import { Eye, EyeOff, CheckCircle2, Archive, Star, FileImage } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VEHICLE_STATUS_TYPES } from "@/lib/validations/vehicle"
import type { VehicleFormData } from "@/lib/validations/vehicle"
import type { VehicleWithAll } from "@/types/vehicle"

interface StatusSectionProps {
  mode: "create" | "edit"
  initialData?: VehicleWithAll
  isAdmin?: boolean
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; bgColor: string }> = {
  publie: { 
    icon: <Eye className="h-4 w-4" />, 
    bgColor: "bg-green-500/10" 
  },
  brouillon: { 
    icon: <EyeOff className="h-4 w-4" />, 
    bgColor: "bg-gray-500/10" 
  },
  vendu: { 
    icon: <CheckCircle2 className="h-4 w-4" />, 
    bgColor: "bg-blue-500/10" 
  },
  archive: { 
    icon: <Archive className="h-4 w-4" />, 
    bgColor: "bg-amber-500/10" 
  },
}

export function StatusSection({ mode, initialData, isAdmin = false }: StatusSectionProps) {
  const { setValue, watch } = useFormContext<VehicleFormData>()

  const status = watch("status")
  const isFeatured = watch("is_featured")

  const selectedStatus = VEHICLE_STATUS_TYPES.find(s => s.value === status)

  return (
    <div className="space-y-8">
      {/* Statut */}
      <div className="space-y-3">
        <Label htmlFor="status" className="text-gray-300 font-medium">
          Statut de l&apos;annonce
        </Label>
        <Select
          value={status}
          onValueChange={(value: string) =>
            setValue("status", value as VehicleFormData["status"])
          }
        >
          <SelectTrigger className="bg-ar-dark/50 border-ar-gold/20 focus:border-ar-gold/50 text-white">
            <SelectValue placeholder="Sélectionner un statut" />
          </SelectTrigger>
          <SelectContent className="bg-ar-gray border-ar-gold/20">
            {VEHICLE_STATUS_TYPES.map((statusType) => {
              const config = STATUS_CONFIG[statusType.value]
              return (
                <SelectItem 
                  key={statusType.value} 
                  value={statusType.value}
                  className="text-gray-300 focus:bg-ar-gold/10 focus:text-ar-gold"
                >
                  <div className="flex items-center gap-2">
                    <span style={{ color: statusType.color }}>
                      {config.icon}
                    </span>
                    <span style={{ color: statusType.color }}>
                      {statusType.label}
                    </span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        
        {/* Badge du statut actuel */}
        {selectedStatus && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: `${selectedStatus.color}20` }}>
            <span style={{ color: selectedStatus.color }}>
              {STATUS_CONFIG[selectedStatus.value].icon}
            </span>
            <span className="text-sm font-medium" style={{ color: selectedStatus.color }}>
              Statut actuel : {selectedStatus.label}
            </span>
          </div>
        )}
      </div>

      {/* Mise en avant - visible admin uniquement */}
      {isAdmin && (
        <div className="flex items-center justify-between rounded-xl border border-ar-gold/30 bg-gradient-to-r from-ar-gold/10 to-transparent p-5 backdrop-blur-sm">
          <div className="space-y-1">
            <Label htmlFor="is_featured" className="cursor-pointer flex items-center gap-2">
              <Star className="h-4 w-4 text-ar-gold" />
              <span className="text-ar-gold font-bold">Mise en avant</span>
              <span className="text-xs bg-ar-gold text-ar-black px-2 py-0.5 rounded-full font-bold">
                Admin
              </span>
            </Label>
            <p className="text-sm text-gray-500">
              Afficher cette annonce en priorité sur la page d&apos;accueil
            </p>
          </div>
          <Switch
            id="is_featured"
            checked={isFeatured}
            onCheckedChange={(checked: boolean) => setValue("is_featured", checked)}
            className="data-[state=checked]:bg-ar-gold"
          />
        </div>
      )}

      {/* Preview miniature */}
      {mode === "edit" && initialData && (
        <div className="mt-6 p-6 rounded-xl border border-ar-gold/20 bg-gradient-to-br from-ar-dark/50 to-ar-gray/30 backdrop-blur-sm">
          <h4 className="font-bold text-white mb-4 flex items-center gap-2">
            <FileImage className="h-4 w-4 text-ar-gold" />
            Aperçu de l&apos;annonce
          </h4>
          <div className="flex gap-5">
            <div className="w-36 h-28 bg-ar-dark/50 rounded-xl flex items-center justify-center text-gray-500 text-sm overflow-hidden border border-ar-gold/10">
              {initialData.vehicle_photos?.[0] ? (
                <img
                  src={initialData.vehicle_photos[0].url}
                  alt=""
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <FileImage className="h-8 w-8 text-gray-600" />
                  <span className="text-xs">Pas d&apos;image</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg text-white">
                {initialData.brand} {initialData.model}
              </p>
              <p className="text-sm text-gray-400">
                {initialData.year} • {initialData.mileage.toLocaleString("fr-FR")} km
              </p>
              <p className="text-ar-gold font-bold text-xl mt-2">
                {initialData.price.toLocaleString("fr-FR")} €
              </p>
              <div className="flex gap-2 mt-3">
                <span
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: `${VEHICLE_STATUS_TYPES.find(
                      (s) => s.value === initialData.status
                    )?.color}30`,
                    color: VEHICLE_STATUS_TYPES.find(
                      (s) => s.value === initialData.status
                    )?.color,
                  }}
                >
                  {VEHICLE_STATUS_TYPES.find((s) => s.value === initialData.status)
                    ?.label}
                </span>
                {initialData.is_featured && (
                  <span className="text-xs px-3 py-1 rounded-full bg-ar-gold text-ar-black font-bold flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    À la une
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
