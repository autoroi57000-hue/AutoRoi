"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Plus,
  ChevronRight,
  KeyRound,
  X,
  Calendar,
  GripVertical,
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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getRentalVehicleForEdit, updateRentalVehicle, getAdminOccupiedRanges } from "../../actions"
import dynamic from "next/dynamic"

const PhotoUploader = dynamic(
  () => import("@/components/admin/PhotoUploader").then((m) => ({ default: m.PhotoUploader })),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-lg bg-muted" /> }
)
import { toast } from "@/hooks/use-toast"
import { localePath } from '@/lib/constants'

interface ModifierVehiculePageProps {
  params: { locale: string; id: string }
}

const FUEL_OPTIONS = ["Essence", "Diesel", "Hybride", "Électrique", "GPL"]
const TRANSMISSION_OPTIONS = ["Automatique", "Manuelle"]
const BODY_OPTIONS = ["Berline", "SUV", "Coupé", "Cabriolet", "Break", "Monospace", "Citadine", "Pick-up", "Utilitaire"]
const STATUS_OPTIONS = [
  { value: "disponible", label: "Disponible" },
  { value: "loue", label: "Loué" },
  { value: "maintenance", label: "En maintenance" },
  { value: "indisponible", label: "Indisponible" },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  disponible: { label: "Disponible", color: "text-green-400", bgColor: "bg-green-500/10", borderColor: "border-green-500/30" },
  loue: { label: "Loué", color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30" },
  maintenance: { label: "Maintenance", color: "text-ar-gold", bgColor: "bg-ar-gold/10", borderColor: "border-ar-gold/30" },
  indisponible: { label: "Indisponible", color: "text-red-400", bgColor: "bg-red-500/10", borderColor: "border-red-500/30" },
}

interface PricingTier {
  from_day: number
  to_day: number | null
  price_per_day: number
}

const MONTH_NAMES_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"]

function OccupiedCalendar({ vehicleId }: { vehicleId: string }) {
  const [occupiedRanges, setOccupiedRanges] = useState<{ start_date: string; end_date: string; reference: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  useEffect(() => {
    setLoading(true)
    getAdminOccupiedRanges(vehicleId, currentMonth.year, currentMonth.month + 1)
      .then((ranges) => { setOccupiedRanges(ranges as any[]); setLoading(false) })
      .catch(() => setLoading(false))
  }, [vehicleId, currentMonth])

  const isOccupied = (date: Date) => {
    const ts = date.getTime()
    return occupiedRanges.some((r) => {
      const start = new Date(r.start_date).getTime()
      const end = new Date(r.end_date).getTime()
      return ts >= start && ts <= end
    })
  }

  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentMonth.year, currentMonth.month, 1).getDay()
  // Monday-based: 0=Mon,...,6=Sun
  const offset = (firstDayOfWeek + 6) % 7

  const prevMonth = () =>
    setCurrentMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 }
      return { year: prev.year, month: prev.month - 1 }
    })

  const nextMonth = () =>
    setCurrentMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 }
      return { year: prev.year, month: prev.month + 1 }
    })

  if (loading) return <Skeleton className="h-48 w-full bg-ar-gold/5" />

  return (
    <div className="bg-ar-dark/50 rounded-xl border border-ar-gold/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-ar-gold/10 text-gray-400 hover:text-ar-gold transition-colors">‹</button>
        <span className="text-white font-medium text-sm">
          {MONTH_NAMES_FR[currentMonth.month]} {currentMonth.year}
        </span>
        <button onClick={nextMonth} className="p-1 rounded hover:bg-ar-gold/10 text-gray-400 hover:text-ar-gold transition-colors">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].map((d) => (
          <div key={d} className="text-xs text-gray-600 font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const date = new Date(currentMonth.year, currentMonth.month, day)
          const occupied = isOccupied(date)
          const isToday =
            date.toDateString() === new Date().toDateString()
          return (
            <div
              key={day}
              className={`
                text-xs rounded py-1 text-center font-medium transition-colors
                ${occupied ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-gray-500 hover:bg-ar-gold/5"}
                ${isToday ? "ring-1 ring-ar-gold/50" : ""}
              `}
            >
              {day}
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-ar-gold/10">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
          <span className="text-xs text-gray-500">Occupé</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border border-ar-gold/30" />
          <span className="text-xs text-gray-500">Disponible</span>
        </div>
      </div>
    </div>
  )
}

export default function ModifierVehiculePage({ params }: ModifierVehiculePageProps) {
  const { locale, id } = params
  const router = useRouter()

  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([])

  const [form, setForm] = useState({
    brand: "", model: "", version: "",
    year: new Date().getFullYear(),
    vehicle_type: "", fuel: "", transmission: "", body: "",
    seats: "", doors: "", color: "", mileage: "", power_hp: "",
    description_fr: "", description_en: "",
    price_per_day: "", price_per_hour: "",
    weekend_surcharge: "0", holiday_surcharge: "0",
    deposit_amount: "0", deposit_percentage: "30",
    included_km_per_day: "200", extra_km_price: "0.25",
    status: "disponible", cover_photo: "",
  })

  useEffect(() => {
    getRentalVehicleForEdit(id).then((result) => {
      if (result.success && result.vehicle) {
        const v = result.vehicle
        setForm({
          brand: v.brand ?? "",
          model: v.model ?? "",
          version: v.version ?? "",
          year: v.year ?? new Date().getFullYear(),
          vehicle_type: v.vehicle_type ?? "",
          fuel: v.fuel ?? "",
          transmission: v.transmission ?? "",
          body: v.body ?? "",
          seats: v.seats?.toString() ?? "",
          doors: v.doors?.toString() ?? "",
          color: v.color ?? "",
          mileage: v.mileage?.toString() ?? "",
          power_hp: v.power_hp?.toString() ?? "",
          description_fr: v.description_fr ?? "",
          description_en: v.description_en ?? "",
          price_per_day: v.price_per_day?.toString() ?? "",
          price_per_hour: v.price_per_hour?.toString() ?? "",
          weekend_surcharge: v.weekend_surcharge?.toString() ?? "0",
          holiday_surcharge: v.holiday_surcharge?.toString() ?? "0",
          deposit_amount: v.deposit_amount?.toString() ?? "0",
          deposit_percentage: v.deposit_percentage?.toString() ?? "30",
          included_km_per_day: v.included_km_per_day?.toString() ?? "200",
          extra_km_price: v.extra_km_price?.toString() ?? "0.25",
          status: v.status ?? "disponible",
          cover_photo: v.cover_photo ?? "",
        })
        setPricingTiers(Array.isArray(v.pricing_tiers) ? v.pricing_tiers : [])
      } else {
        toast({ title: "Erreur", description: "Véhicule introuvable", variant: "destructive" })
        router.push(`${localePath(locale, '/admin/locations/vehicules')}`)
      }
      setPageLoading(false)
    })
  }, [id, locale, router])

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
          ? { ...t, [field]: field === "to_day" ? (value === "" ? null : Number(value)) : Number(value) }
          : t
      )
    )
  }

  const removeTier = (idx: number) => setPricingTiers((prev) => prev.filter((_, i) => i !== idx))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.brand || !form.model || !form.price_per_day) {
      toast({ title: "Champs requis manquants", variant: "destructive" })
      return
    }
    setSaving(true)
    const result = await updateRentalVehicle(id, {
      ...form,
      pricing_tiers: pricingTiers,
    })
    if (result.success) {
      toast({ title: "Véhicule mis à jour", variant: "success" })
    } else {
      toast({ title: "Erreur", description: result.error || "Impossible de mettre à jour", variant: "destructive" })
    }
    setSaving(false)
  }

  const statusCfg = STATUS_CONFIG[form.status] ?? STATUS_CONFIG.disponible

  if (pageLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-20 w-full bg-ar-gold/5" />
        <Skeleton className="h-64 w-full bg-ar-gold/5" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header sticky */}
      <div className="sticky top-0 z-40 -mx-4 lg:-mx-6 -mt-4 lg:-mt-6 px-4 lg:px-6 pt-4 lg:pt-6 pb-4 bg-ar-dark/95 backdrop-blur-2xl border-b border-ar-gold/20 shadow-lg shadow-ar-gold/5 mb-8">
        <nav className="flex items-center text-xs mb-3 text-gray-500">
          <Link href={`${localePath(locale, '/admin')}`} className="hover:text-ar-gold transition-colors">Admin</Link>
          <ChevronRight className="h-3 w-3 mx-2 text-ar-gold/30" />
          <Link href={`${localePath(locale, '/admin/locations/vehicules')}`} className="hover:text-ar-gold transition-colors">Flotte</Link>
          <ChevronRight className="h-3 w-3 mx-2 text-ar-gold/30" />
          <span className="text-ar-gold">Modifier</span>
        </nav>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-ar-gold/30 via-ar-gold/10 to-ar-gold/5 border border-ar-gold/30 flex items-center justify-center shadow-lg shadow-ar-gold/20">
              <div className="absolute inset-0 bg-ar-gold/10 blur-md rounded-xl" />
              <KeyRound className="relative h-5 w-5 text-ar-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {form.brand} {form.model}
                </h1>
                <Badge variant="outline" className={`${statusCfg.bgColor} ${statusCfg.color} ${statusCfg.borderColor} text-xs`}>
                  {statusCfg.label}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">{form.year}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`${localePath(locale, '/admin/locations/vehicules')}`}>
              <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-ar-gold/5">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <Button
              form="vehicle-form"
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-ar-gold to-ar-gold-light text-ar-black font-bold hover:shadow-lg hover:shadow-ar-gold/30"
            >
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire principal */}
        <form id="vehicle-form" onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
          {/* Informations générales */}
          <Section title="Informations générales">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field label="Marque *">
                <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} required className={inputCls} />
              </Field>
              <Field label="Modèle *">
                <Input value={form.model} onChange={(e) => set("model", e.target.value)} required className={inputCls} />
              </Field>
              <Field label="Version">
                <Input value={form.version} onChange={(e) => set("version", e.target.value)} className={inputCls} />
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
                <Input value={form.color} onChange={(e) => set("color", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Places">
                <Input type="number" value={form.seats} onChange={(e) => set("seats", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Portes">
                <Input type="number" value={form.doors} onChange={(e) => set("doors", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Puissance (ch)">
                <Input type="number" value={form.power_hp} onChange={(e) => set("power_hp", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Kilométrage">
                <Input type="number" value={form.mileage} onChange={(e) => set("mileage", e.target.value)} className={inputCls} />
              </Field>
            </div>
          </Section>

          {/* Description */}
          <Section title="Description">
            <div className="space-y-4">
              <Field label="Description FR">
                <Textarea value={form.description_fr} onChange={(e) => set("description_fr", e.target.value)}
                  className={`${inputCls} min-h-[100px] resize-none`} />
              </Field>
              <Field label="Description EN">
                <Textarea value={form.description_en} onChange={(e) => set("description_en", e.target.value)}
                  className={`${inputCls} min-h-[100px] resize-none`} />
              </Field>
            </div>
          </Section>

          {/* Tarification */}
          <Section title="Tarification">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field label="Prix/jour (€) *">
                <Input type="number" step="0.01" value={form.price_per_day}
                  onChange={(e) => handlePrixJourChange(e.target.value)} required className={inputCls} />
              </Field>
              <Field label="Prix/heure (€) — auto">
                <div className="relative">
                  <Input type="number" step="0.01" value={form.price_per_hour}
                    onChange={(e) => set("price_per_hour", e.target.value)} placeholder="—" className={`${inputCls} ${autoCls}`} />
                  <span className={badgeCls}>AUTO</span>
                </div>
              </Field>
              <Field label="Supplément WE (€)">
                <Input type="number" step="0.01" value={form.weekend_surcharge}
                  onChange={(e) => set("weekend_surcharge", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Supplément fériés (€)">
                <Input type="number" step="0.01" value={form.holiday_surcharge}
                  onChange={(e) => set("holiday_surcharge", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Acompte (€) — auto">
                <div className="relative">
                  <Input type="number" step="0.01" value={form.deposit_amount}
                    disabled className={`${inputCls} ${autoCls} cursor-not-allowed`} />
                  <span className={badgeCls}>AUTO</span>
                </div>
              </Field>
              <Field label="Acompte (%) — Politique Auto Roi">
                <div className="relative">
                  <Input type="number" value="30" disabled
                    className={`${inputCls} ${autoCls} cursor-not-allowed`} />
                  <span className={badgeCls}>30% FIXE</span>
                </div>
              </Field>
              <Field label="Km inclus/jour">
                <Input type="number" value={form.included_km_per_day}
                  onChange={(e) => set("included_km_per_day", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Prix km suppl. (€)">
                <Input type="number" step="0.01" value={form.extra_km_price}
                  onChange={(e) => set("extra_km_price", e.target.value)} className={inputCls} />
              </Field>
            </div>

            {/* Paliers */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-gray-300 font-medium">Paliers de tarification</Label>
                <Button type="button" size="sm" variant="outline" onClick={addTier}
                  className="border-ar-gold/30 text-ar-gold hover:bg-ar-gold/10">
                  <Plus className="h-3 w-3 mr-1" /> Ajouter
                </Button>
              </div>
              {pricingTiers.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucun palier — tarif journalier uniforme</p>
              ) : (
                <div className="space-y-2">
                  {pricingTiers.map((tier, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-ar-dark/50 rounded-lg p-3 border border-ar-gold/10">
                      <GripVertical className="h-4 w-4 text-gray-600 flex-shrink-0" />
                      <div className="flex items-center gap-2 flex-1 flex-wrap">
                        <span className="text-gray-500 text-sm">Jour</span>
                        <Input type="number" value={tier.from_day}
                          onChange={(e) => updateTier(idx, "from_day", e.target.value)}
                          className="w-16 bg-ar-dark border-ar-gold/20 text-white text-sm" />
                        <span className="text-gray-500 text-sm">à</span>
                        <Input type="number" value={tier.to_day ?? ""}
                          onChange={(e) => updateTier(idx, "to_day", e.target.value)}
                          placeholder="∞" className="w-16 bg-ar-dark border-ar-gold/20 text-white text-sm" />
                        <span className="text-gray-500 text-sm">→</span>
                        <Input type="number" step="0.01" value={tier.price_per_day}
                          onChange={(e) => updateTier(idx, "price_per_day", e.target.value)}
                          className="w-20 bg-ar-dark border-ar-gold/20 text-white text-sm" />
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
            <PhotoUploader vehicleId={id} apiEndpoint="/api/rental-photos" />
          </Section>

          {/* Statut */}
          <Section title="Statut">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field label="Statut">
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

          {/* Bouton bas */}
          <div className="flex justify-end gap-3 pb-8">
            <Link href={`${localePath(locale, '/admin/locations/vehicules')}`}>
              <Button variant="outline" className="border-ar-gold/20 text-gray-300 hover:text-white hover:border-ar-gold/40 hover:bg-ar-gold/5">
                Annuler
              </Button>
            </Link>
            <Button type="submit" disabled={saving}
              className="bg-gradient-to-r from-ar-gold to-ar-gold-light text-ar-black font-bold hover:shadow-lg hover:shadow-ar-gold/30 px-8">
              {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
            </Button>
          </div>
        </form>

        {/* Colonne latérale : calendrier planning */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 rounded-xl border border-ar-gold/10 p-6 shadow-lg shadow-ar-gold/5 backdrop-blur-sm sticky top-32">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-ar-gold" />
              Planning des réservations
            </h2>
            <OccupiedCalendar vehicleId={id} />
            <Link href={`${localePath(locale, `/admin/locations?vehicle=${id}`)}`} className="block mt-4">
              <Button variant="outline" size="sm" className="w-full border-ar-gold/30 text-ar-gold hover:bg-ar-gold/10">
                Voir toutes les réservations
              </Button>
            </Link>
          </div>
        </div>
      </div>
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
