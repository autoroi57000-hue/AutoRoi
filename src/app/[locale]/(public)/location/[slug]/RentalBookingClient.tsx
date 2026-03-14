"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Zap,
  Settings2,
  Check,
  AlertCircle,
  Loader2,
  KeyRound,
  Building2,
  FileText,
  CreditCard,
  Home,
} from "lucide-react"
import { calculateRentalPrice } from "@/lib/rental-pricing"
import { createRentalReservation, getOccupiedDates } from "./actions"
import { MagneticButton } from "@/components/ui/MagneticButton"
import type { RentalVehicle, RentalOption, OccupiedDateRange, RentalPricingResult } from "@/types/rental"
import { localePath } from '@/lib/constants'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  vehicle: RentalVehicle
  options: RentalOption[]
  locale: string
  cancelled?: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GOLD = "#C9A84C"

function generateTimeSlots(start: string, end: string, stepMinutes: number): string[] {
  const slots: string[] = []
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  let mins = sh * 60 + sm
  const endMins = eh * 60 + em
  while (mins <= endMins) {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
    mins += stepMinutes
  }
  return slots
}

const PICKUP_SLOTS = generateTimeSlots("08:00", "19:00", 30)
const RETURN_SLOTS = generateTimeSlots("08:00", "20:00", 30)
const MONTH_NAMES_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"]
const MONTH_NAMES_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const DAYS_FR = ["Lu","Ma","Me","Je","Ve","Sa","Di"]
const DAYS_EN = ["Mo","Tu","We","Th","Fr","Sa","Su"]

// ─── Main Component ───────────────────────────────────────────────────────────

export function RentalBookingClient({ vehicle, options, locale, cancelled }: Props) {
  const isFr = locale !== "en"
  const router = useRouter()

  // Stepper state
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(cancelled ? (isFr ? "Le paiement a été annulé. Vous pouvez réessayer." : "Payment was cancelled. You can try again.") : null)

  // Gallery state
  const photos = Array.isArray(vehicle.photos) && vehicle.photos.length > 0
    ? vehicle.photos.map((p: any) => typeof p === "string" ? p : p?.url).filter(Boolean)
    : vehicle.cover_photo ? [vehicle.cover_photo] : []
  const [photoIdx, setPhotoIdx] = useState(0)

  // Step 1 — Dates & Times
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [pickupTime, setPickupTime] = useState("09:00")
  const [returnTime, setReturnTime] = useState("18:00")
  const [pricing, setPricing] = useState<RentalPricingResult | null>(null)
  const [datesError, setDatesError] = useState<string | null>(null)

  // Step 2 — Options (option_id → quantity)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({})

  // Step 3 — Client info
  const [client, setClient] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    address: "", city: "", postal_code: "",
    birth_date: "", license_number: "",
    is_business: false, business_name: "", business_siret: "",
    cgv_accepted: false,
    website: "", // honeypot
  })

  // Calendar state
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear())
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth() + 1)
  const [occupiedRanges, setOccupiedRanges] = useState<OccupiedDateRange[]>([])
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [calendarRight, setCalendarRight] = useState(() => {
    const d = new Date()
    const m = d.getMonth() + 2
    return m > 12 ? { year: d.getFullYear() + 1, month: 1 } : { year: d.getFullYear(), month: m }
  })
  const [occupiedRangesRight, setOccupiedRangesRight] = useState<OccupiedDateRange[]>([])

  const loadOccupied = useCallback(async (y: number, m: number) => {
    setCalendarLoading(true)
    const [left, right] = await Promise.all([
      getOccupiedDates(vehicle.id, y, m),
      getOccupiedDates(vehicle.id, m === 12 ? y + 1 : y, m === 12 ? 1 : m + 1),
    ])
    setOccupiedRanges(left)
    setOccupiedRangesRight(right)
    setCalendarLoading(false)
  }, [vehicle.id])

  useEffect(() => {
    loadOccupied(calendarYear, calendarMonth)
  }, [calendarYear, calendarMonth, loadOccupied])

  // Recalculate price when dates or options change
  useEffect(() => {
    if (!startDate || !endDate) { setPricing(null); setDatesError(null); return }
    const s = new Date(startDate)
    const e = new Date(endDate)
    if (e <= s) { setDatesError(isFr ? "La date de fin doit être après le début" : "End date must be after start"); setPricing(null); return }
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (s < today) { setDatesError(isFr ? "La date de début ne peut pas être dans le passé" : "Start date cannot be in the past"); setPricing(null); return }
    setDatesError(null)
    try {
      const optionList = options
        .filter(o => (selectedOptions[o.id] ?? 0) > 0)
        .map(o => ({ option: o, quantity: selectedOptions[o.id] }))
      const result = calculateRentalPrice({ vehicle, startDate: s, endDate: e, selectedOptions: optionList })
      setPricing(result)
    } catch {
      setPricing(null)
    }
  }, [startDate, endDate, selectedOptions, vehicle, options, isFr])

  const isDateOccupied = (dateStr: string, ranges: OccupiedDateRange[]): boolean => {
    const d = new Date(dateStr).getTime()
    return ranges.some(r => d >= new Date(r.start_date).getTime() && d <= new Date(r.end_date).getTime())
  }

  const formatDate = (isoStr: string) => {
    if (!isoStr) return ""
    return new Intl.DateTimeFormat(isFr ? "fr-FR" : "en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(isoStr))
  }

  const formatPrice = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n)

  const canGoToStep2 = !!startDate && !!endDate && !datesError && !!pricing
  const canGoToStep3 = true // options are optional
  const canGoToStep4 = !!client.first_name && !!client.last_name && !!client.email && !!client.phone

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    const result = await createRentalReservation(vehicle.slug, {
      vehicle_id: vehicle.id,
      start_date: new Date(`${startDate}T${pickupTime}`).toISOString(),
      end_date: new Date(`${endDate}T${returnTime}`).toISOString(),
      pickup_time: pickupTime,
      return_time: returnTime,
      selected_options: selectedOptions,
      price_total_client: pricing?.total_amount ?? 0,
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
      phone: client.phone,
      address: client.address || undefined,
      city: client.city || undefined,
      postal_code: client.postal_code || undefined,
      birth_date: client.birth_date || undefined,
      license_number: client.license_number || undefined,
      is_business: client.is_business,
      business_name: client.business_name || undefined,
      business_siret: client.business_siret || undefined,
      cgv_accepted: client.cgv_accepted,
      website: client.website || undefined,
      locale: locale as "fr" | "en",
    })

    if (result.success && result.stripeUrl) {
      router.push(result.stripeUrl)
    } else {
      setError(result.error ?? (isFr ? "Une erreur est survenue" : "An error occurred"))
      setSubmitting(false)
    }
  }

  const STEPS = [
    { n: 1, label: isFr ? "Dates" : "Dates" },
    { n: 2, label: isFr ? "Options" : "Options" },
    { n: 3, label: isFr ? "Informations" : "Details" },
    { n: 4, label: isFr ? "Confirmation" : "Review" },
  ]

  return (
    <div className="min-h-screen pt-16">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.05) 0%, transparent 60%)", zIndex: 0 }} />

      <div className="relative container mx-auto px-4 py-8" style={{ zIndex: 1 }}>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
          <Link href={`${localePath(locale)}`} className="hover:text-ar-gold transition-colors flex items-center gap-1">
            <Home className="h-3 w-3" />
          </Link>
          <ChevronRight className="h-3 w-3 opacity-40" />
          <Link href={`${localePath(locale, '/location')}`} className="hover:text-ar-gold transition-colors">
            {isFr ? "Location" : "Rental"}
          </Link>
          <ChevronRight className="h-3 w-3 opacity-40" />
          <span style={{ color: "rgba(255,255,255,0.7)" }}>{vehicle.brand} {vehicle.model}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:items-start">
          {/* ── Colonne gauche : info véhicule ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galerie */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="relative aspect-video bg-ar-dark">
                {photos.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photos[photoIdx]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(201,168,76,0.05)" }}>
                    <KeyRound className="h-16 w-16" style={{ color: "rgba(201,168,76,0.2)" }} />
                  </div>
                )}
                {photos.length > 1 && (
                  <>
                    <button onClick={() => setPhotoIdx(i => Math.max(0, i - 1))} disabled={photoIdx === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
                      style={{ background: "rgba(10,10,10,0.7)", backdropFilter: "blur(8px)" }}>
                      <ChevronLeft className="h-4 w-4 text-white" />
                    </button>
                    <button onClick={() => setPhotoIdx(i => Math.min(photos.length - 1, i + 1))} disabled={photoIdx === photos.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
                      style={{ background: "rgba(10,10,10,0.7)", backdropFilter: "blur(8px)" }}>
                      <ChevronRight className="h-4 w-4 text-white" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {photos.map((_, i) => (
                        <button key={i} onClick={() => setPhotoIdx(i)}
                          className="w-1.5 h-1.5 rounded-full transition-all"
                          style={{ background: i === photoIdx ? GOLD : "rgba(255,255,255,0.4)" }} />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {photos.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto" style={{ background: "rgba(0,0,0,0.4)" }}>
                  {photos.slice(0, 6).map((url, i) => (
                    <button key={i} onClick={() => setPhotoIdx(i)}
                      className="flex-shrink-0 w-16 h-11 rounded-lg overflow-hidden transition-all"
                      style={{ border: i === photoIdx ? `2px solid ${GOLD}` : "2px solid transparent" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Titre + Prix */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-display font-bold text-white text-2xl leading-tight">
                    {vehicle.brand} {vehicle.model}
                  </h1>
                  {vehicle.version && <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{vehicle.version}</p>}
                  {vehicle.year && <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>{vehicle.year}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: "rgba(201,168,76,0.6)" }}>{isFr ? "À partir de" : "From"}</p>
                  <p className="font-bold text-2xl" style={{ color: GOLD }}>{vehicle.price_per_day}€</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>/jour</p>
                </div>
              </div>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3">
              {[
                vehicle.seats && { icon: Users, label: `${vehicle.seats} ${isFr ? "places" : "seats"}` },
                vehicle.transmission && { icon: Settings2, label: vehicle.transmission },
                vehicle.fuel && { icon: Zap, label: vehicle.fuel },
                vehicle.body && { icon: KeyRound, label: vehicle.body },
              ].filter(Boolean).map((spec: any, i) => (
                <div key={i} className="flex items-center gap-2 text-sm rounded-xl px-3 py-2"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <spec.icon className="h-4 w-4 flex-shrink-0" style={{ color: GOLD }} />
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>{spec.label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            {(vehicle.description_fr || vehicle.description_en) && (
              <div className="rounded-xl p-4 text-sm leading-relaxed" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
                {isFr ? vehicle.description_fr : (vehicle.description_en ?? vehicle.description_fr)}
              </div>
            )}

            {/* Inclus */}
            <div className="rounded-xl p-4" style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.12)" }}>
              <p className="text-xs font-bold uppercase mb-3" style={{ color: "rgba(201,168,76,0.7)", letterSpacing: "0.1em" }}>
                {isFr ? "Inclus dans la location" : "Included in rental"}
              </p>
              <div className="space-y-2 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                <p>✓ {vehicle.included_km_per_day} km/jour</p>
                <p>✓ {isFr ? "Assurance tous risques" : "Full insurance"}</p>
                <p>✓ {isFr ? `Km supplémentaire : ${vehicle.extra_km_price}€/km` : `Extra km: ${vehicle.extra_km_price}€/km`}</p>
              </div>
            </div>
          </div>

          {/* ── Colonne droite : formulaire stepper ── */}
          <div className="lg:col-span-3 lg:sticky lg:top-24">
            {/* Stepper header */}
            <div className="flex items-center mb-6">
              {STEPS.map((s, i) => (
                <div key={s.n} className="flex items-center flex-1">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                      style={{
                        background: step >= s.n ? GOLD : "rgba(255,255,255,0.08)",
                        color: step >= s.n ? "#0A0A0A" : "rgba(255,255,255,0.3)",
                        border: step === s.n ? `2px solid ${GOLD}` : "none",
                      }}
                    >
                      {step > s.n ? <Check className="h-4 w-4" /> : s.n}
                    </div>
                    <span className="text-xs font-medium hidden sm:block" style={{ color: step === s.n ? GOLD : "rgba(255,255,255,0.3)" }}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 mx-2 h-0.5 rounded-full transition-all duration-300"
                      style={{ background: step > s.n ? GOLD : "rgba(255,255,255,0.08)" }} />
                  )}
                </div>
              ))}
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl p-4 mb-4 text-sm"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "rgba(255,100,100,1)" }}>
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* ── STEP 1 : Dates ── */}
            {step === 1 && (
              <StepCard title={isFr ? "Choisissez vos dates" : "Choose your dates"}>
                <DatePicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartChange={setStartDate}
                  onEndChange={setEndDate}
                  occupiedLeft={occupiedRanges}
                  occupiedRight={occupiedRangesRight}
                  yearLeft={calendarYear}
                  monthLeft={calendarMonth}
                  yearRight={calendarRight.year}
                  monthRight={calendarRight.month}
                  onPrev={() => {
                    const newM = calendarMonth === 1 ? 12 : calendarMonth - 1
                    const newY = calendarMonth === 1 ? calendarYear - 1 : calendarYear
                    setCalendarYear(newY); setCalendarMonth(newM)
                    setCalendarRight(calendarMonth === 1 ? { year: calendarYear, month: 1 } : { year: calendarYear, month: calendarMonth })
                  }}
                  onNext={() => {
                    const newM = calendarMonth === 12 ? 1 : calendarMonth + 1
                    const newY = calendarMonth === 12 ? calendarYear + 1 : calendarYear
                    setCalendarYear(newY); setCalendarMonth(newM)
                    setCalendarRight(newM === 12 ? { year: newY + 1, month: 1 } : { year: newY, month: newM + 1 })
                  }}
                  loading={calendarLoading}
                  isFr={isFr}
                  isDateOccupied={isDateOccupied}
                />

                {/* Time selectors */}
                {startDate && endDate && !datesError && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium" style={{ color: "rgba(201,168,76,0.7)" }}>
                        {isFr ? "Heure de prise en charge *" : "Pickup time *"}
                      </label>
                      <select
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none transition-all duration-200 appearance-none"
                        style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)", cursor: "pointer" }}
                      >
                        {PICKUP_SLOTS.map((t) => (
                          <option key={t} value={t} style={{ background: "#1a1a1a" }}>{t}</option>
                        ))}
                      </select>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                        {isFr ? "Selon nos horaires d'ouverture" : "Based on our opening hours"}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium" style={{ color: "rgba(201,168,76,0.7)" }}>
                        {isFr ? "Heure de restitution *" : "Return time *"}
                      </label>
                      <select
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none transition-all duration-200 appearance-none"
                        style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)", cursor: "pointer" }}
                      >
                        {RETURN_SLOTS.map((t) => (
                          <option key={t} value={t} style={{ background: "#1a1a1a" }}>{t}</option>
                        ))}
                      </select>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                        {isFr ? "⚠️ Tout dépassement facturé au tarif horaire" : "⚠️ Late returns charged at hourly rate"}
                      </p>
                    </div>
                  </div>
                )}

                {datesError && (
                  <p className="text-sm mt-2" style={{ color: "rgba(239,68,68,0.9)" }}>
                    ⚠ {datesError}
                  </p>
                )}

                {/* Prix en temps réel */}
                {pricing && !datesError && (
                  <PricingBreakdown pricing={pricing} isFr={isFr} formatPrice={formatPrice} />
                )}

                <StepNav
                  canNext={canGoToStep2}
                  onNext={() => setStep(2)}
                  isFr={isFr}
                  nextLabel={isFr ? "Continuer vers les options →" : "Continue to options →"}
                />
              </StepCard>
            )}

            {/* ── STEP 2 : Options ── */}
            {step === 2 && (
              <StepCard title={isFr ? "Options" : "Add-ons"}>
                {options.length === 0 ? (
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {isFr ? "Aucune option disponible pour ce véhicule." : "No options available for this vehicle."}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {options.map((opt) => {
                      const qty = selectedOptions[opt.id] ?? 0
                      const isSelected = qty > 0
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.id]: isSelected ? 0 : 1 }))}
                          className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200"
                          style={{
                            background: isSelected ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${isSelected ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.07)"}`,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                              style={{ background: isSelected ? GOLD : "rgba(255,255,255,0.1)", border: isSelected ? `1px solid ${GOLD}` : "1px solid rgba(255,255,255,0.15)" }}
                            >
                              {isSelected && <Check className="h-3 w-3 text-ar-black" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{opt.name}</p>
                              {opt.description && (
                                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{opt.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <p className="text-sm font-bold" style={{ color: isSelected ? GOLD : "rgba(255,255,255,0.6)" }}>
                              +{opt.price}€
                            </p>
                            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                              {opt.price_type === "per_day" ? (isFr ? "/jour" : "/day") : isFr ? "forfait" : "flat"}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {pricing && (
                  <PricingBreakdown pricing={pricing} isFr={isFr} formatPrice={formatPrice} />
                )}

                <StepNav
                  canPrev onPrev={() => setStep(1)}
                  canNext={canGoToStep3}
                  onNext={() => setStep(3)}
                  isFr={isFr}
                  nextLabel={isFr ? "Mes informations →" : "My details →"}
                />
              </StepCard>
            )}

            {/* ── STEP 3 : Informations client ── */}
            {step === 3 && (
              <StepCard title={isFr ? "Vos informations" : "Your details"}>
                <div className="space-y-4">
                  {/* Honeypot */}
                  <input type="text" name="website" tabIndex={-1} autoComplete="off"
                    value={client.website}
                    onChange={(e) => setClient(prev => ({ ...prev, website: e.target.value }))}
                    style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px" }}
                    aria-hidden="true"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label={isFr ? "Prénom *" : "First name *"}>
                      <FormInput value={client.first_name} onChange={(v) => setClient(p => ({ ...p, first_name: v }))} placeholder={isFr ? "Jean" : "John"} required />
                    </FormField>
                    <FormField label={isFr ? "Nom *" : "Last name *"}>
                      <FormInput value={client.last_name} onChange={(v) => setClient(p => ({ ...p, last_name: v }))} placeholder="Dupont" required />
                    </FormField>
                  </div>

                  <FormField label="Email *">
                    <FormInput type="email" value={client.email} onChange={(v) => setClient(p => ({ ...p, email: v }))} placeholder="jean@email.com" required />
                  </FormField>

                  <FormField label={isFr ? "Téléphone *" : "Phone *"}>
                    <FormInput type="tel" value={client.phone} onChange={(v) => setClient(p => ({ ...p, phone: v }))} placeholder="+33 6 00 00 00 00" required />
                  </FormField>

                  <FormField label={isFr ? "Adresse" : "Address"}>
                    <FormInput value={client.address} onChange={(v) => setClient(p => ({ ...p, address: v }))} placeholder={isFr ? "15 rue de la Paix" : "15 Peace Street"} />
                  </FormField>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label={isFr ? "Ville" : "City"}>
                      <FormInput value={client.city} onChange={(v) => setClient(p => ({ ...p, city: v }))} placeholder="Paris" />
                    </FormField>
                    <FormField label={isFr ? "Code postal" : "Postal code"}>
                      <FormInput value={client.postal_code} onChange={(v) => setClient(p => ({ ...p, postal_code: v }))} placeholder="75001" />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label={isFr ? "Date de naissance" : "Date of birth"}>
                      <FormInput type="date" value={client.birth_date} onChange={(v) => setClient(p => ({ ...p, birth_date: v }))} />
                    </FormField>
                    <FormField label={isFr ? "N° permis" : "License number"}>
                      <FormInput value={client.license_number} onChange={(v) => setClient(p => ({ ...p, license_number: v }))} placeholder="06AA00000" />
                    </FormField>
                  </div>

                  {/* Business toggle */}
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer select-none"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                    onClick={() => setClient(p => ({ ...p, is_business: !p.is_business }))}
                  >
                    <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                      style={{ background: client.is_business ? GOLD : "rgba(255,255,255,0.1)", border: `1px solid ${client.is_business ? GOLD : "rgba(255,255,255,0.15)"}` }}>
                      {client.is_business && <Check className="h-3 w-3 text-ar-black" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" style={{ color: "rgba(255,255,255,0.4)" }} />
                      <span className="text-sm text-white">{isFr ? "Je réserve pour une entreprise" : "Booking for a company"}</span>
                    </div>
                  </div>

                  {client.is_business && (
                    <div className="grid grid-cols-2 gap-3 pl-2" style={{ borderLeft: `2px solid rgba(201,168,76,0.3)` }}>
                      <FormField label={isFr ? "Raison sociale" : "Company name"}>
                        <FormInput value={client.business_name} onChange={(v) => setClient(p => ({ ...p, business_name: v }))} placeholder="SARL Mon Entreprise" />
                      </FormField>
                      <FormField label="SIRET">
                        <FormInput value={client.business_siret} onChange={(v) => setClient(p => ({ ...p, business_siret: v }))} placeholder="123 456 789 00010" />
                      </FormField>
                    </div>
                  )}
                </div>

                <StepNav
                  canPrev onPrev={() => setStep(2)}
                  canNext={canGoToStep4}
                  onNext={() => setStep(4)}
                  isFr={isFr}
                  nextLabel={isFr ? "Récapitulatif →" : "Review →"}
                />
              </StepCard>
            )}

            {/* ── STEP 4 : Récap + CGV + Paiement ── */}
            {step === 4 && (
              <StepCard title={isFr ? "Récapitulatif" : "Review & Pay"}>
                <div className="space-y-4 text-sm">
                  {/* Véhicule */}
                  <RecapRow icon={<KeyRound className="h-4 w-4" style={{ color: GOLD }} />} label={isFr ? "Véhicule" : "Vehicle"}>
                    <span className="font-bold text-white">{vehicle.brand} {vehicle.model} {vehicle.year}</span>
                  </RecapRow>

                  {/* Dates & heures */}
                  <RecapRow icon={<Calendar className="h-4 w-4" style={{ color: GOLD }} />} label={isFr ? "Dates & horaires" : "Dates & times"}>
                    <div>
                      <p className="font-bold text-white">
                        {formatDate(startDate)} {isFr ? "à" : "at"} {pickupTime}
                      </p>
                      <p className="font-bold text-white">
                        → {formatDate(endDate)} {isFr ? "à" : "at"} {returnTime}
                      </p>
                      <p style={{ color: "rgba(255,255,255,0.45)" }}>{pricing?.total_days} {isFr ? "jour" : "day"}{(pricing?.total_days ?? 0) > 1 ? "s" : ""}</p>
                    </div>
                  </RecapRow>

                  {/* Options */}
                  {Object.values(selectedOptions).some(q => q > 0) && (
                    <RecapRow icon={<Settings2 className="h-4 w-4" style={{ color: GOLD }} />} label={isFr ? "Options" : "Add-ons"}>
                      <div className="flex flex-wrap gap-1.5">
                        {options.filter(o => (selectedOptions[o.id] ?? 0) > 0).map(o => (
                          <span key={o.id} className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(201,168,76,0.12)", color: GOLD, border: "1px solid rgba(201,168,76,0.2)" }}>
                            {o.name}
                          </span>
                        ))}
                      </div>
                    </RecapRow>
                  )}

                  {/* Client */}
                  <RecapRow icon={<Users className="h-4 w-4" style={{ color: GOLD }} />} label={isFr ? "Client" : "Client"}>
                    <div>
                      <p className="font-bold text-white">{client.first_name} {client.last_name}</p>
                      <p style={{ color: "rgba(255,255,255,0.45)" }}>{client.email}</p>
                      <p style={{ color: "rgba(255,255,255,0.45)" }}>{client.phone}</p>
                    </div>
                  </RecapRow>

                  {/* Prix */}
                  {pricing && (
                    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                      <PricingBreakdown pricing={pricing} isFr={isFr} formatPrice={formatPrice} showBorder={false} />
                    </div>
                  )}

                  {/* CGV */}
                  <div
                    className="flex items-start gap-3 p-4 rounded-xl cursor-pointer select-none"
                    style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${client.cgv_accepted ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.07)"}` }}
                    onClick={() => setClient(p => ({ ...p, cgv_accepted: !p.cgv_accepted }))}
                  >
                    <div className="mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                      style={{ background: client.cgv_accepted ? GOLD : "rgba(255,255,255,0.1)", border: `1px solid ${client.cgv_accepted ? GOLD : "rgba(255,255,255,0.15)"}` }}>
                      {client.cgv_accepted && <Check className="h-3 w-3 text-ar-black" />}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                      <FileText className="h-3 w-3 inline mr-1 align-text-bottom" style={{ color: GOLD }} />
                      {isFr ? "J'accepte les " : "I accept the "}
                      <Link href="/cgv-location" target="_blank"
                        className="text-[#C9A84C] underline hover:text-[#FFE08A]"
                        onClick={(e) => e.stopPropagation()}>
                        {isFr ? "conditions générales de location" : "rental terms and conditions"}
                      </Link>
                      {isFr ? " et la " : " and the "}
                      <Link href="/confidentialite" target="_blank"
                        className="text-[#C9A84C] underline hover:text-[#FFE08A]"
                        onClick={(e) => e.stopPropagation()}>
                        {isFr ? "politique de confidentialité" : "privacy policy"}
                      </Link>
                      {" *"}
                    </p>
                  </div>

                  {/* CTA Paiement */}
                  <div className="pt-2">
                    <MagneticButton>
                      <button
                        onClick={handleSubmit}
                        disabled={!client.cgv_accepted || submitting}
                        className="group relative w-full py-4 rounded-xl font-bold text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                        style={{
                          background: "linear-gradient(135deg, #C9A84C, #e0c068)",
                          color: "#0A0A0A",
                          boxShadow: client.cgv_accepted ? "0 8px 30px rgba(201,168,76,0.3)" : "none",
                        }}
                      >
                        <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        {submitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            {isFr ? "Redirection..." : "Redirecting..."}
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2 relative">
                            <CreditCard className="h-5 w-5" />
                            {isFr
                              ? `Payer l'acompte de ${formatPrice(pricing?.deposit_amount ?? 0)}`
                              : `Pay deposit of ${formatPrice(pricing?.deposit_amount ?? 0)}`}
                          </span>
                        )}
                      </button>
                    </MagneticButton>

                    <p className="text-center text-xs mt-3" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {isFr
                        ? `Vous allez être redirigé vers Stripe pour payer l'acompte de ${formatPrice(pricing?.deposit_amount ?? 0)}. Le solde de ${formatPrice(pricing?.balance_at_pickup ?? 0)} sera réglé à la remise des clés.`
                        : `You will be redirected to Stripe to pay the ${formatPrice(pricing?.deposit_amount ?? 0)} deposit. The ${formatPrice(pricing?.balance_at_pickup ?? 0)} balance is due at key handover.`}
                    </p>
                  </div>
                </div>

                <StepNav
                  canPrev onPrev={() => setStep(3)}
                  isFr={isFr}
                />
              </StepCard>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── DatePicker Component ─────────────────────────────────────────────────────

function DatePicker({
  startDate, endDate, onStartChange, onEndChange,
  occupiedLeft, occupiedRight,
  yearLeft, monthLeft, yearRight, monthRight,
  onPrev, onNext, loading, isFr, isDateOccupied,
}: {
  startDate: string; endDate: string
  onStartChange: (d: string) => void; onEndChange: (d: string) => void
  occupiedLeft: OccupiedDateRange[]; occupiedRight: OccupiedDateRange[]
  yearLeft: number; monthLeft: number; yearRight: number; monthRight: number
  onPrev: () => void; onNext: () => void
  loading: boolean; isFr: boolean
  isDateOccupied: (d: string, ranges: OccupiedDateRange[]) => boolean
}) {
  const MONTHS = isFr ? MONTH_NAMES_FR : MONTH_NAMES_EN
  const DAYS = isFr ? DAYS_FR : DAYS_EN
  const today = new Date().toISOString().split("T")[0]

  const [selecting, setSelecting] = useState<"start" | "end">("start")
  const [hover, setHover] = useState<string | null>(null)

  function handleDayClick(dateStr: string) {
    if (isDateOccupied(dateStr, occupiedLeft) || isDateOccupied(dateStr, occupiedRight)) return
    if (dateStr < today) return

    if (selecting === "start" || (startDate && endDate)) {
      onStartChange(dateStr); onEndChange(""); setSelecting("end")
    } else {
      if (dateStr <= startDate) {
        onStartChange(dateStr); onEndChange(""); setSelecting("end")
      } else {
        // Check no occupied dates in range
        let s = new Date(startDate); const e = new Date(dateStr)
        let hasOccupied = false
        while (s <= e) {
          const ds = s.toISOString().split("T")[0]
          if (isDateOccupied(ds, occupiedLeft) || isDateOccupied(ds, occupiedRight)) { hasOccupied = true; break }
          s.setDate(s.getDate() + 1)
        }
        if (hasOccupied) { onStartChange(dateStr); onEndChange(""); setSelecting("end"); return }
        onEndChange(dateStr); setSelecting("start")
      }
    }
  }

  function isDayInRange(dateStr: string): boolean {
    if (!startDate) return false
    const end = endDate || hover
    if (!end) return false
    return dateStr > startDate && dateStr < end
  }

  function renderMonth(year: number, month: number, occupied: OccupiedDateRange[]) {
    const daysInMonth = new Date(year, month, 0).getDate()
    const firstDow = new Date(year, month - 1, 1).getDay()
    const offset = (firstDow + 6) % 7 // Monday-based

    return (
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white text-center mb-3">
          {MONTHS[month - 1]} {year}
        </p>
        <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-xs font-medium py-1" style={{ color: "rgba(255,255,255,0.3)" }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const ds = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            const isOcc = isDateOccupied(ds, occupied)
            const isPast = ds < today
            const isStart = ds === startDate
            const isEnd = ds === endDate
            const inRange = isDayInRange(ds)
            const isToday = ds === today
            const disabled = isOcc || isPast

            return (
              <button
                key={day}
                onClick={() => !disabled && handleDayClick(ds)}
                onMouseEnter={() => !disabled && setHover(ds)}
                onMouseLeave={() => setHover(null)}
                disabled={disabled}
                className="relative h-8 w-full rounded text-xs font-medium transition-all duration-150"
                style={{
                  background: isStart || isEnd
                    ? GOLD
                    : inRange
                      ? "rgba(201,168,76,0.15)"
                      : isToday
                        ? "rgba(255,255,255,0.08)"
                        : "transparent",
                  color: isStart || isEnd
                    ? "#0A0A0A"
                    : isPast || isOcc
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(255,255,255,0.8)",
                  textDecoration: isOcc ? "line-through" : "none",
                  cursor: disabled ? "not-allowed" : "pointer",
                  borderRadius: isStart ? "8px 0 0 8px" : isEnd ? "0 8px 8px 0" : inRange ? "0" : "8px",
                  outline: isToday && !isStart && !isEnd ? `1px solid rgba(201,168,76,0.4)` : "none",
                }}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Instruction */}
      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
        {selecting === "start"
          ? (isFr ? "Cliquez pour sélectionner la date de départ" : "Click to select the start date")
          : (isFr ? "Cliquez pour sélectionner la date de retour" : "Click to select the return date")}
      </p>

      {/* Calendar nav */}
      <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={onPrev} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          {loading && <Loader2 className="h-4 w-4 animate-spin" style={{ color: GOLD }} />}
          <button onClick={onNext} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-4">
          {renderMonth(yearLeft, monthLeft, occupiedLeft)}
          <div className="w-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          {renderMonth(yearRight, monthRight, occupiedRight)}
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: "rgba(255,255,255,0.15)", textDecoration: "line-through" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{isFr ? "Indisponible" : "Unavailable"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: GOLD }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{isFr ? "Sélectionné" : "Selected"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: "rgba(201,168,76,0.15)" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{isFr ? "Période" : "Range"}</span>
          </div>
        </div>
      </div>

      {/* Selected dates display */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3" style={{ background: startDate ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${startDate ? "rgba(201,168,76,0.25)" : "rgba(255,255,255,0.07)"}` }}>
          <p className="text-xs font-medium mb-1" style={{ color: "rgba(201,168,76,0.7)" }}>
            {isFr ? "Prise en charge" : "Pickup"}
          </p>
          <p className="text-sm font-bold text-white">
            {startDate
              ? new Intl.DateTimeFormat(isFr ? "fr-FR" : "en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(startDate))
              : "—"}
          </p>
        </div>
        <div className="rounded-xl p-3" style={{ background: endDate ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${endDate ? "rgba(201,168,76,0.25)" : "rgba(255,255,255,0.07)"}` }}>
          <p className="text-xs font-medium mb-1" style={{ color: "rgba(201,168,76,0.7)" }}>
            {isFr ? "Restitution" : "Return"}
          </p>
          <p className="text-sm font-bold text-white">
            {endDate
              ? new Intl.DateTimeFormat(isFr ? "fr-FR" : "en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(endDate))
              : "—"}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
        <h2 className="font-bold text-white">{title}</h2>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  )
}

function StepNav({
  canPrev = false, onPrev,
  canNext = false, onNext,
  nextLabel, isFr,
}: {
  canPrev?: boolean; onPrev?: () => void
  canNext?: boolean; onNext?: () => void
  nextLabel?: string; isFr: boolean
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      {canPrev ? (
        <button onClick={onPrev} className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: "rgba(255,255,255,0.4)" }}>
          <ChevronLeft className="h-4 w-4" />
          {isFr ? "Retour" : "Back"}
        </button>
      ) : <div />}
      {canNext && onNext && (
        <button onClick={onNext}
          className="group relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #C9A84C, #e0c068)", color: "#0A0A0A" }}>
          <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <span className="relative">{nextLabel ?? (isFr ? "Suivant" : "Next")}</span>
        </button>
      )}
    </div>
  )
}

function PricingBreakdown({ pricing, isFr, formatPrice, showBorder = true }: {
  pricing: RentalPricingResult; isFr: boolean; formatPrice: (n: number) => string; showBorder?: boolean
}) {
  return (
    <div className="rounded-xl p-4 space-y-2 text-sm" style={{
      background: "rgba(201,168,76,0.04)",
      ...(showBorder ? { border: "1px solid rgba(201,168,76,0.12)" } : {}),
    }}>
      {pricing.breakdown.filter(b => b.type !== "deposit").map((item, i) => (
        <div key={i} className="flex justify-between">
          <span style={{ color: "rgba(255,255,255,0.55)" }}>{item.label}</span>
          <span style={{ color: "rgba(255,255,255,0.8)" }}>{formatPrice(item.amount)}</span>
        </div>
      ))}
      <div className="flex justify-between font-bold pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ color: "rgba(255,255,255,0.8)" }}>{isFr ? "Total TTC" : "Total"}</span>
        <span style={{ color: GOLD }}>{formatPrice(pricing.total_amount)}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span style={{ color: "rgba(255,255,255,0.4)" }}>{isFr ? "Acompte maintenant" : "Deposit now"} ({Math.round(pricing.deposit_amount / pricing.total_amount * 100)}%)</span>
        <span className="font-bold" style={{ color: GOLD }}>{formatPrice(pricing.deposit_amount)}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span style={{ color: "rgba(255,255,255,0.4)" }}>{isFr ? "Solde à la remise" : "Balance at pickup"}</span>
        <span style={{ color: "rgba(255,255,255,0.6)" }}>{formatPrice(pricing.balance_at_pickup)}</span>
      </div>
    </div>
  )
}

function RecapRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(201,168,76,0.1)" }}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs mb-1 font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
        {children}
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</label>
      {children}
    </div>
  )
}

function FormInput({ value, onChange, placeholder, type = "text", required }: {
  value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; required?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none transition-all duration-200"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        caretColor: GOLD,
      }}
      onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.5)")}
      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
    />
  )
}
