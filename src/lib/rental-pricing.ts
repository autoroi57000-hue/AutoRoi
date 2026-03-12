// =============================================================================
// Calcul de prix — Feature Location
// Aucune dépendance externe : utilise l'API Date native uniquement.
// =============================================================================

import type {
  RentalVehicle,
  RentalOption,
  RentalPricingResult,
  PricingBreakdownItem,
  PricingTier,
  SelectedOption,
} from "@/types/rental"

// ─── Utilitaires date (pas de date-fns) ──────────────────────────────────────

/** Nombre de jours calendaires entre deux dates (endDate non inclus) */
function differenceInDays(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  const startDay = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
  const endDay = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())
  return Math.round((endDay - startDay) / msPerDay)
}

/** Retourne true si la date est un samedi (6) ou dimanche (0) */
function isWeekendDay(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

/** Liste tous les jours de l'intervalle [start, end[ */
function eachDayOfInterval(start: Date, end: Date): Date[] {
  const days: Date[] = []
  const current = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()))
  const endDay = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())

  while (current.getTime() < endDay) {
    days.push(new Date(current))
    current.setUTCDate(current.getUTCDate() + 1)
  }
  return days
}

// ─── Sélection du palier tarifaire ───────────────────────────────────────────

export function findApplicableTier(
  tiers: PricingTier[],
  days: number
): PricingTier | null {
  // Trier du palier le plus élevé au plus bas pour trouver le plus avantageux
  const sorted = [...tiers].sort((a, b) => b.days_from - a.days_from)
  return sorted.find((t) => days >= t.days_from && (t.days_to == null || days <= t.days_to)) ?? null
}

// ─── Calcul principal ─────────────────────────────────────────────────────────

export interface RentalPricingParams {
  vehicle: Pick<
    RentalVehicle,
    "price_per_day" | "pricing_tiers" | "weekend_surcharge" | "deposit_percentage"
  >
  startDate: Date
  endDate: Date
  selectedOptions: { option: RentalOption; quantity: number }[]
}

export function calculateRentalPrice(params: RentalPricingParams): RentalPricingResult {
  const { vehicle, startDate, endDate, selectedOptions } = params

  const days = differenceInDays(startDate, endDate)
  if (days <= 0) throw new Error("La date de fin doit être postérieure à la date de début.")

  // 1. Palier tarifaire applicable
  const applicableTier = findApplicableTier(vehicle.pricing_tiers, days)
  const pricePerDay = applicableTier?.price_per_day ?? vehicle.price_per_day
  const subtotal = round2(pricePerDay * days)

  // 2. Supplément week-end (en % du tarif journalier, par jour de week-end)
  const allDays = eachDayOfInterval(startDate, endDate)
  const weekendDays = allDays.filter(isWeekendDay).length
  const weekendSurcharge = weekendDays > 0 && vehicle.weekend_surcharge > 0
    ? round2(pricePerDay * weekendDays * (vehicle.weekend_surcharge / 100))
    : 0
  const surchargeTotal = weekendSurcharge

  // 3. Options sélectionnées
  let optionsTotal = 0
  const optionItems: PricingBreakdownItem[] = []

  for (const { option, quantity } of selectedOptions) {
    if (quantity <= 0) continue
    const lineAmount = option.price_type === "per_day"
      ? round2(option.price * days * quantity)
      : round2(option.price * quantity)

    optionsTotal += lineAmount
    optionItems.push({
      label: quantity > 1 ? `${option.name} ×${quantity}` : option.name,
      amount: lineAmount,
      type: "option",
    })
  }
  optionsTotal = round2(optionsTotal)

  // 4. Total et acompte
  const totalAmount = round2(subtotal + surchargeTotal + optionsTotal)
  const depositAmount = round2(totalAmount * (vehicle.deposit_percentage / 100))
  const balanceAtPickup = round2(totalAmount - depositAmount)

  // 5. Breakdown lisible
  const breakdown: PricingBreakdownItem[] = [
    {
      label: `${days} jour${days > 1 ? "s" : ""} × ${formatEur(pricePerDay)}`,
      amount: subtotal,
      type: "base",
    },
  ]

  if (weekendSurcharge > 0) {
    breakdown.push({
      label: `Supplément week-end (${weekendDays} j × ${vehicle.weekend_surcharge}%)`,
      amount: weekendSurcharge,
      type: "surcharge",
    })
  }

  breakdown.push(...optionItems)

  breakdown.push({
    label: `Acompte (${vehicle.deposit_percentage}%)`,
    amount: depositAmount,
    type: "deposit",
  })

  return {
    base_price_per_day: pricePerDay,
    total_days: days,
    subtotal,
    options_total: optionsTotal,
    surcharge_total: surchargeTotal,
    total_amount: totalAmount,
    deposit_amount: depositAmount,
    balance_at_pickup: balanceAtPickup,
    breakdown,
  }
}

// ─── Utilitaire SelectedOption (pour snapshot DB) ────────────────────────────

/** Transforme les options sélectionnées en snapshots à stocker dans la DB */
export function buildSelectedOptionsSnapshot(
  selectedOptions: { option: RentalOption; quantity: number }[],
  days: number
): SelectedOption[] {
  return selectedOptions
    .filter(({ quantity }) => quantity > 0)
    .map(({ option, quantity }) => ({
      option_id: option.id,
      name: option.name,
      price_type: option.price_type,
      price: option.price,
      quantity,
    }))
}

// ─── Helpers privés ──────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function formatEur(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(amount)
}
