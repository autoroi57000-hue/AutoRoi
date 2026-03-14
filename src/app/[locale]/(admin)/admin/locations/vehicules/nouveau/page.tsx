"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronRight,
  KeyRound,
  Upload,
  X,
  GripVertical,
  Check,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import dynamic from "next/dynamic"

const PhotoUploader = dynamic(
  () => import("@/components/admin/PhotoUploader").then((m) => ({ default: m.PhotoUploader })),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-lg bg-muted" /> }
)
import { createRentalVehicle, getRentalOptions } from "../actions"
import { toast } from "@/hooks/use-toast"
import { localePath } from '@/lib/constants'

interface NouveauVehiculePageProps {
  params: { locale: string }
}

const FUEL_OPTIONS = ["Essence", "Diesel", "Hybride", "Électrique", "GPL"]
const TRANSMISSION_OPTIONS = ["Automatique", "Manuelle"]
const BODY_OPTIONS = ["Berline", "SUV", "Coupé", "Cabriolet", "Break", "Monospace", "Citadine", "Pick-up", "Utilitaire"]
const STATUS_OPTIONS = [
  { value: "disponible", label: "Disponible" },
  { value: "indisponible", label: "Indisponible" },
  { value: "maintenance", label: "En maintenance" },
]

interface PricingTier {
  from_day: number
  to_day: number | null
  price_per_day: number
}

export default function NouveauVehiculePage({ params }: NouveauVehiculePageProps) {
  const { locale } = params
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [rentalOptions, setRentalOptions] = useState<any[]>([])
  const [createdVehicleId, setCreatedVehicleId] = useState<string | null>(null)
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([])

  const [form, setForm] = useState({
    brand: "",
    model: "",
    version: "",
    year: new Date().getFullYear(),
    vehicle_type: "",
    fuel: "",
    transmission: "",
    body: "",
    seats: "",
    doors: "",
    color: "",
    mileage: "",
    power_hp: "",
    description_fr: "",
    description_en: "",
    price_per_day: "",
    price_per_hour: "",
    weekend_surcharge: "0",
    holiday_surcharge: "0",
    deposit_amount: "0",
    deposit_percentage: "30",
    included_km_per_day: "200",
    extra_km_price: "0.25",
    status: "disponible",
  })

  useEffect(() => {
    getRentalOptions().then((r) => {
      if (r.success) setRentalOptions(r.options)
    })
  }, [])

  const set = (key: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handlePrixJourChange = (value: string) => {
    const prixJour = parseFloat(value) || 0
    const prixHeure = Math.round((prixJour / 8) * 100) / 100
    const acompte = Math.round(prixJour * 0.30 * 100) / 100
    setForm((prev) => ({
      ...prev,
      price_per_day: value,
      price_per_hour: prixHeure ? prixHeure.toString() : "",
      deposit_amount: acompte ? acompte.toString() : "0",
    }))
  }

  const addTier = () => {
    setPricingTiers((prev) => [
      ...prev,
      { from_day: (prev[prev.length - 1]?.to_day ?? 0) + 1, to_day: null, price_per_day: 0 },
    ])
  }

  const updateTier = (idx: number, field: keyof PricingTier, value: string) => {
    setPricingTiers((prev) =>
      prev.map((t, i) =>
        i === idx
          ? {
              ...t,
              [field]: field === "to_day" ? (value === "" ? null : Number(value)) : Number(value),
            }
          : t
      )
    )
  }

  const removeTier = (idx: number) => setPricingTiers((prev) => prev.filter((_, i) => i !== idx))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (createdVehicleId) return
    if (!form.brand || !form.model || !form.price_per_day) {
      toast({ title: "Champs requis manquants", description: "Marque, modèle et prix/jour sont obligatoires.", variant: "destructive" })
      return
    }
    setLoading(true)
    const result = await createRentalVehicle({
      ...form,
      photos: [],
      cover_photo: null,
      pricing_tiers: pricingTiers,
    })
    if (result.success && result.vehicleId) {
      setCreatedVehicleId(result.vehicleId)
      toast({ title: "Véhicule créé", description: "Ajoutez maintenant les photos du véhicule.", variant: "success" })
    } else {
      toast({ title: "Erreur", description: result.error || "Impossible de créer le véhicule", variant: "destructive" })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header sticky */}
      <div className="sticky top-0 z-40 -mx-3 sm:-mx-4 lg:-mx-6 -mt-3 sm:-mt-4 lg:-mt-6 px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-6 pb-3 sm:pb-4 bg-ar-dark/95 backdrop-blur-2xl border-b border-ar-gold/20 shadow-lg shadow-ar-gold/5 mb-6 sm:mb-8">
        <nav className="flex items-center text-xs mb-3 text-gray-500">
          <Link href={`${localePath(locale, '/admin')}`} className="hover:text-ar-gold transition-colors">Admin</Link>
          <ChevronRight className="h-3 w-3 mx-2 text-ar-gold/30" />
          <Link href={`${localePath(locale, '/admin/locations/vehicules')}`} className="hover:text-ar-gold transition-colors">Flotte</Link>
          <ChevronRight className="h-3 w-3 mx-2 text-ar-gold/30" />
          <span className="text-ar-gold">Nouveau</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-ar-gold/30 via-ar-gold/10 to-ar-gold/5 border border-ar-gold/30 flex items-center justify-center shadow-lg shadow-ar-gold/20 shrink-0">
              <div className="absolute inset-0 bg-ar-gold/10 blur-md rounded-xl" />
              <KeyRound className="relative h-5 w-5 text-ar-gold" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Nouveau véhicule de location
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">Ajoutez un véhicule à la flotte</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`${localePath(locale, '/admin/locations/vehicules')}`}>
              <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-ar-gold/5">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            {createdVehicleId ? (
              <Button
                type="button"
                onClick={() => router.push(`${localePath(locale, '/admin/locations/vehicules')}`)}
                className="bg-gradient-to-r from-ar-gold to-ar-gold-light text-ar-black font-bold hover:shadow-lg hover:shadow-ar-gold/30"
              >
                <Check className="h-4 w-4 mr-2" />
                Terminer
              </Button>
            ) : (
              <Button
                form="vehicle-form"
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-ar-gold to-ar-gold-light text-ar-black font-bold hover:shadow-lg hover:shadow-ar-gold/30"
              >
                {loading ? "Création..." : "Créer le véhicule"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <form id="vehicle-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Informations générales */}
        <Section title="Informations générales">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label="Marque *">
              <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="BMW" required className={inputCls} />
            </Field>
            <Field label="Modèle *">
              <Input value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="Série 3" required className={inputCls} />
            </Field>
            <Field label="Version">
              <Input value={form.version} onChange={(e) => set("version", e.target.value)} placeholder="320d M Sport" className={inputCls} />
            </Field>
            <Field label="Année">
              <Input type="number" value={form.year} onChange={(e) => set("year", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Carburant">
              <Select value={form.fuel} onValueChange={(v) => set("fuel", v)}>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent className="bg-ar-gray border-ar-gold/20">
                  {FUEL_OPTIONS.map((f) => (
                    <SelectItem key={f} value={f} className="text-gray-300 focus:bg-ar-gold/10 focus:text-ar-gold">{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Transmission">
              <Select value={form.transmission} onValueChange={(v) => set("transmission", v)}>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent className="bg-ar-gray border-ar-gold/20">
                  {TRANSMISSION_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t} className="text-gray-300 focus:bg-ar-gold/10 focus:text-ar-gold">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Carrosserie">
              <Select value={form.body} onValueChange={(v) => set("body", v)}>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent className="bg-ar-gray border-ar-gold/20">
                  {BODY_OPTIONS.map((b) => (
                    <SelectItem key={b} value={b} className="text-gray-300 focus:bg-ar-gold/10 focus:text-ar-gold">{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Couleur">
              <Input value={form.color} onChange={(e) => set("color", e.target.value)} placeholder="Noir" className={inputCls} />
            </Field>
            <Field label="Places">
              <Input type="number" value={form.seats} onChange={(e) => set("seats", e.target.value)} placeholder="5" className={inputCls} />
            </Field>
            <Field label="Portes">
              <Input type="number" value={form.doors} onChange={(e) => set("doors", e.target.value)} placeholder="4" className={inputCls} />
            </Field>
            <Field label="Puissance (ch)">
              <Input type="number" value={form.power_hp} onChange={(e) => set("power_hp", e.target.value)} placeholder="184" className={inputCls} />
            </Field>
            <Field label="Kilométrage actuel">
              <Input type="number" value={form.mileage} onChange={(e) => set("mileage", e.target.value)} placeholder="25000" className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* Description */}
        <Section title="Description">
          <div className="space-y-4">
            <Field label="Description FR">
              <Textarea
                value={form.description_fr}
                onChange={(e) => set("description_fr", e.target.value)}
                placeholder="Décrivez le véhicule en français..."
                className={`${inputCls} min-h-[100px] resize-none`}
              />
            </Field>
            <Field label="Description EN">
              <Textarea
                value={form.description_en}
                onChange={(e) => set("description_en", e.target.value)}
                placeholder="Describe the vehicle in English..."
                className={`${inputCls} min-h-[100px] resize-none`}
              />
            </Field>
          </div>
        </Section>

        {/* Tarification */}
        <Section title="Tarification">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label="Prix/jour (€) *">
              <Input type="number" step="0.01" value={form.price_per_day} onChange={(e) => handlePrixJourChange(e.target.value)} placeholder="89" required className={inputCls} />
            </Field>
            <Field label="Prix/heure (€) — auto">
              <div className="relative">
                <Input type="number" step="0.01" value={form.price_per_hour} onChange={(e) => set("price_per_hour", e.target.value)} placeholder="—" className={`${inputCls} ${autoCls}`} />
                <span className={badgeCls}>AUTO</span>
              </div>
            </Field>
            <Field label="Supplément week-end (€)">
              <Input type="number" step="0.01" value={form.weekend_surcharge} onChange={(e) => set("weekend_surcharge", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Supplément jours fériés (€)">
              <Input type="number" step="0.01" value={form.holiday_surcharge} onChange={(e) => set("holiday_surcharge", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Acompte (€) — auto">
              <div className="relative">
                <Input type="number" step="0.01" value={form.deposit_amount} disabled className={`${inputCls} ${autoCls} cursor-not-allowed`} />
                <span className={badgeCls}>AUTO</span>
              </div>
            </Field>
            <Field label="Acompte (%) — Politique Auto Roi">
              <div className="relative">
                <Input type="number" value="30" disabled className={`${inputCls} ${autoCls} cursor-not-allowed`} />
                <span className={badgeCls}>30% FIXE</span>
              </div>
            </Field>
            <Field label="Km inclus/jour">
              <Input type="number" value={form.included_km_per_day} onChange={(e) => set("included_km_per_day", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Prix km supplémentaire (€)">
              <Input type="number" step="0.01" value={form.extra_km_price} onChange={(e) => set("extra_km_price", e.target.value)} className={inputCls} />
            </Field>
          </div>

          {/* Paliers de tarification */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-gray-300 font-medium">Paliers de tarification</Label>
              <Button type="button" size="sm" variant="outline" onClick={addTier}
                className="border-ar-gold/30 text-ar-gold hover:bg-ar-gold/10">
                <Plus className="h-3 w-3 mr-1" /> Ajouter un palier
              </Button>
            </div>
            {pricingTiers.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun palier — tarif journalier uniforme</p>
            ) : (
              <div className="space-y-2">
                {pricingTiers.map((tier, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-ar-dark/50 rounded-lg p-3 border border-ar-gold/10">
                    <GripVertical className="h-4 w-4 text-gray-600 flex-shrink-0" />
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-gray-500 text-sm">Du jour</span>
                      <Input type="number" value={tier.from_day} onChange={(e) => updateTier(idx, "from_day", e.target.value)}
                        className="w-20 bg-ar-dark border-ar-gold/20 text-white text-sm" />
                      <span className="text-gray-500 text-sm">au</span>
                      <Input type="number" value={tier.to_day ?? ""} onChange={(e) => updateTier(idx, "to_day", e.target.value)}
                        placeholder="∞" className="w-20 bg-ar-dark border-ar-gold/20 text-white text-sm" />
                      <span className="text-gray-500 text-sm">→</span>
                      <Input type="number" step="0.01" value={tier.price_per_day}
                        onChange={(e) => updateTier(idx, "price_per_day", e.target.value)}
                        className="w-24 bg-ar-dark border-ar-gold/20 text-white text-sm" />
                      <span className="text-gray-500 text-sm">€/j</span>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeTier(idx)}
                      className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* Photos */}
        <Section title="Photos">
          {createdVehicleId ? (
            <PhotoUploader
              vehicleId={createdVehicleId}
              apiEndpoint="/api/rental-photos"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-ar-gold/20 rounded-2xl bg-ar-dark/30">
              <div className="w-14 h-14 rounded-full bg-ar-gold/10 flex items-center justify-center mb-3">
                <Upload className="h-7 w-7 text-ar-gold/50" />
              </div>
              <p className="text-sm text-gray-400">
                Créez d&apos;abord le véhicule pour pouvoir ajouter des photos
              </p>
              <p className="text-xs text-gray-600 mt-1">
                JPG, PNG, WEBP, HEIC — Max 15 Mo par photo
              </p>
            </div>
          )}
        </Section>

        {/* Statut */}
        <Section title="Statut">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label="Statut initial">
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-ar-gray border-ar-gold/20">
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="text-gray-300 focus:bg-ar-gold/10 focus:text-ar-gold">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Section>

        {/* Bouton bas de page */}
        <div className="flex justify-end gap-3 pb-8">
          <Link href={`${localePath(locale, '/admin/locations/vehicules')}`}>
            <Button variant="outline" className="border-ar-gold/20 text-gray-300 hover:text-white hover:border-ar-gold/40 hover:bg-ar-gold/5">
              {createdVehicleId ? "Retour à la flotte" : "Annuler"}
            </Button>
          </Link>
          {createdVehicleId ? (
            <Button
              type="button"
              onClick={() => router.push(`${localePath(locale, '/admin/locations/vehicules')}`)}
              className="bg-gradient-to-r from-ar-gold to-ar-gold-light text-ar-black font-bold hover:shadow-lg hover:shadow-ar-gold/30 px-8"
            >
              <Check className="h-4 w-4 mr-2" />
              Terminer
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-ar-gold to-ar-gold-light text-ar-black font-bold hover:shadow-lg hover:shadow-ar-gold/30 px-8"
            >
              {loading ? "Création..." : "Créer le véhicule"}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const inputCls =
  "bg-ar-dark/50 border-ar-gold/20 focus:border-ar-gold/50 text-white placeholder:text-gray-600"

const autoCls = "opacity-75 pr-16"

const badgeCls =
  "absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-wider text-ar-gold bg-ar-gold/10 border border-ar-gold/20 px-1.5 py-0.5 rounded pointer-events-none"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 rounded-xl border border-ar-gold/10 p-6 shadow-lg shadow-ar-gold/5 backdrop-blur-sm">
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
        <div className="w-1 h-4 bg-ar-gold rounded-full" />
        {title}
      </h2>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-gray-400 text-sm">{label}</Label>
      {children}
    </div>
  )
}
