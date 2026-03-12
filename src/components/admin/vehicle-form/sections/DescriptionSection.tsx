"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Languages, Sparkles, FileText } from "lucide-react"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { VehicleFormData } from "@/lib/validations/vehicle"

// Nombre maximum de caractères
const MAX_CHARS = 2000

export function DescriptionSection() {
  const {
    register,
    setValue,
    watch,
  } = useFormContext<VehicleFormData>()

  const descriptionFr = watch("description_fr") || ""
  const descriptionEn = watch("description_en") || ""
  const [isTranslating, setIsTranslating] = useState(false)

  const charCountFr = descriptionFr.length
  const charCountEn = descriptionEn.length

  const handleAutoTranslate = async () => {
    if (!descriptionFr.trim()) return

    setIsTranslating(true)
    try {
      // Appel API de traduction (simulé ici)
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: descriptionFr, targetLang: "en" }),
      })

      if (response.ok) {
        const data = await response.json()
        setValue("description_en", data.translation)
      } else {
        // Fallback : copier la description FR avec indication
        setValue("description_en", `[EN] ${descriptionFr}`)
      }
    } catch (error) {
      // Fallback
      setValue("description_en", `[EN] ${descriptionFr}`)
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Description FR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="description_fr" className="text-gray-300 font-medium flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-ar-gold/20 flex items-center justify-center text-ar-gold text-xs font-bold">FR</span>
            Description (Français)
          </Label>
          <span
            className={`text-xs font-medium ${
              charCountFr > MAX_CHARS ? "text-red-400" : "text-gray-500"
            }`}
          >
            {charCountFr} / {MAX_CHARS}
          </span>
        </div>
        <div className="relative">
          <Textarea
            id="description_fr"
            {...register("description_fr")}
            placeholder="Décrivez l'historique, les réparations récentes, les points forts du véhicule..."
            rows={8}
            maxLength={MAX_CHARS}
            className="resize-none bg-ar-dark/50 border-ar-gold/20 focus:border-ar-gold/50 focus:ring-ar-gold/20 text-white placeholder:text-gray-600 transition-all duration-300"
          />
          {/* Indicateur de progression */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-ar-dark/50 rounded-b-lg overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-ar-gold to-ar-gold-light transition-all duration-300"
              style={{ width: `${Math.min((charCountFr / MAX_CHARS) * 100, 100)}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Décrivez l&apos;historique, les réparations récentes, les points forts...
        </p>
      </div>

      {/* Description EN */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="description_en" className="text-gray-300 font-medium flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-ar-gold/20 flex items-center justify-center text-ar-gold text-xs font-bold">EN</span>
            Description (English)
          </Label>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-medium ${
                charCountEn > MAX_CHARS ? "text-red-400" : "text-gray-500"
              }`}
            >
              {charCountEn} / {MAX_CHARS}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoTranslate}
              disabled={isTranslating || !descriptionFr.trim()}
              className="gap-2 border-ar-gold/30 text-ar-gold hover:bg-ar-gold/10 hover:border-ar-gold/50"
            >
              {isTranslating ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Traduction...
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4" />
                  Traduire
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="relative">
          <Textarea
            id="description_en"
            {...register("description_en")}
            placeholder="English description..."
            rows={8}
            maxLength={MAX_CHARS}
            className="resize-none bg-ar-dark/50 border-ar-gold/20 focus:border-ar-gold/50 focus:ring-ar-gold/20 text-white placeholder:text-gray-600 transition-all duration-300"
          />
          {/* Indicateur de progression */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-ar-dark/50 rounded-b-lg overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-ar-gold to-ar-gold-light transition-all duration-300"
              style={{ width: `${Math.min((charCountEn / MAX_CHARS) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
