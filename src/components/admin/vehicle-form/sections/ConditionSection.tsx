"use client"

import { useFormContext } from "react-hook-form"
import { Shield, ClipboardCheck } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CONDITION_TYPES, CT_STATUS_TYPES } from "@/lib/validations/vehicle"
import type { VehicleFormData } from "@/lib/validations/vehicle"

export function ConditionSection() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<VehicleFormData>()

  const selectedCondition = watch("condition")
  const ctStatus = watch("ct_status")
  const ctDate = watch("ct_date")

  const showCtDate = ctStatus === "valide"

  return (
    <div className="space-y-8">
      {/* État général */}
      <div className="space-y-4">
        <Label className="text-gray-300 font-medium flex items-center gap-2">
          <Shield className="h-4 w-4 text-ar-gold" />
          État général <span className="text-red-400">*</span>
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CONDITION_TYPES.map((condition) => {
            const isSelected = selectedCondition === condition.value
            return (
              <button
                key={condition.value}
                type="button"
                onClick={() =>
                  setValue("condition", condition.value, { shouldValidate: true })
                }
                className={`group relative p-5 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? "border-ar-gold shadow-lg shadow-ar-gold/10"
                    : "border-ar-gold/20 hover:border-ar-gold/40"
                }`}
              >
                {/* Background conditionnel */}
                <div 
                  className="absolute inset-0 transition-opacity duration-300 opacity-20"
                  style={{ backgroundColor: isSelected ? condition.color : undefined }}
                />
                <div className="relative">
                  <span
                    className="font-bold text-sm block"
                    style={{ color: condition.color }}
                  >
                    {condition.label}
                  </span>
                  {isSelected && (
                    <div className="mt-2 w-full h-0.5 rounded-full" style={{ backgroundColor: condition.color }} />
                  )}
                </div>
              </button>
            )
          })}
        </div>
        {errors.condition && (
          <p className="text-sm text-red-400">{errors.condition.message}</p>
        )}
      </div>

      {/* Contrôle Technique */}
      <div className="space-y-4">
        <Label className="text-gray-300 font-medium flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-ar-gold" />
          Contrôle Technique
        </Label>
        <div className="flex flex-wrap gap-3">
          {CT_STATUS_TYPES.map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => setValue("ct_status", status.value)}
              className={`px-6 py-3 rounded-xl border-2 font-semibold transition-all duration-300 ${
                ctStatus === status.value
                  ? "border-ar-gold bg-ar-gold/10 text-ar-gold shadow-lg shadow-ar-gold/10"
                  : "border-ar-gold/20 text-gray-400 hover:border-ar-gold/40 hover:bg-ar-gold/5"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        {/* Date du CT */}
        {showCtDate && (
          <div className="space-y-3 pt-4 animate-in slide-in-from-top-2">
            <Label htmlFor="ct_date" className="text-gray-300 font-medium">
              Date du contrôle technique
            </Label>
            <Input
              id="ct_date"
              type="date"
              value={ctDate || ""}
              onChange={(e) => setValue("ct_date", e.target.value || null)}
              className="bg-ar-dark/50 border-ar-gold/20 focus:border-ar-gold/50 focus:ring-ar-gold/20 text-white placeholder:text-gray-500 transition-all duration-300"
            />
          </div>
        )}
      </div>
    </div>
  )
}
