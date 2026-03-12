"use client"

import { useFormContext } from "react-hook-form"
import { Check, Sparkles } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { FEATURES_BY_CATEGORY } from "@/lib/validations/vehicle"
import type { VehicleFormData } from "@/lib/validations/vehicle"

export function FeaturesSection() {
  const { setValue, watch } = useFormContext<VehicleFormData>()
  const selectedFeatures = watch("features") || []

  const toggleFeature = (featureId: string) => {
    const currentFeatures = selectedFeatures
    if (currentFeatures.includes(featureId)) {
      setValue(
        "features",
        currentFeatures.filter((f) => f !== featureId)
      )
    } else {
      setValue("features", [...currentFeatures, featureId])
    }
  }

  return (
    <div className="space-y-8">
      {Object.entries(FEATURES_BY_CATEGORY).map(
        ([categoryKey, category], index) => (
          <div key={categoryKey}>
            {index > 0 && <Separator className="my-8 bg-ar-gold/10" />}
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="h-4 w-4 text-ar-gold" />
              <h4 className="font-bold text-ar-gold tracking-wide">{category.label}</h4>
              <div className="flex-1 h-px bg-gradient-to-r from-ar-gold/30 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {category.features.map((feature) => {
                const isSelected = selectedFeatures.includes(feature.id)
                return (
                  <div
                    key={feature.id}
                    onClick={() => toggleFeature(feature.id)}
                    className={`group flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? "border-ar-gold bg-ar-gold/10 shadow-lg shadow-ar-gold/5"
                        : "border-ar-gold/10 bg-ar-dark/20 hover:border-ar-gold/30 hover:bg-ar-gold/5"
                    }`}
                  >
                    {/* Checkbox personnalisée */}
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? "bg-ar-gold border-ar-gold"
                        : "border-ar-gold/30 group-hover:border-ar-gold/50"
                    }`}>
                      {isSelected && <Check className="h-4 w-4 text-ar-black" />}
                    </div>
                    
                    <Label
                      htmlFor={feature.id}
                      className={`cursor-pointer flex-1 mb-0 font-medium transition-colors duration-300 ${
                        isSelected ? "text-ar-gold" : "text-gray-300"
                      }`}
                    >
                      {feature.label}
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>
        )
      )}
    </div>
  )
}
