"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import {
  CheckCircle,
  Edit,
  TrendingUp,
  MessageSquare,
  Car,
  ArrowRight,
  AlertTriangle,
  Zap,
  KeyRound,
  CalendarDays,
  CalendarClock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  User,
  ClipboardList,
  LogIn,
  LogOut,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import {
  getRentalDashboardStats,
  getRentalCalendarEvents,
  getUpcomingRentals,
  getCollaboratorTodayTasks,
} from "@/app/[locale]/(admin)/admin/actions"
import dynamic from "next/dynamic"
import ClientProfileModal from "@/components/admin/ClientProfileModal"

const ContractPreviewModal = dynamic(
  () => import("@/components/admin/ContractPreviewModal"),
  { ssr: false }
)

// ─── Types ──────────────────────────────────────────────────────────────────

type DashboardMode = "vente" | "location"

interface SaleStats {
  published: number
  drafts: number
  soldThisMonth: number
  unreadMessages: number
}

interface RentalStats {
  availableVehicles: number
  activeReservations: number
  upcomingReservations: number
  monthlyRevenue: number
}

interface CalendarEvent {
  id: string
  reference: string
  start_date: string
  end_date: string
  status: string
  client_first_name: string
  client_last_name: string
  rental_vehicle: { id: string; brand: string; model: string } | null
}

interface UpcomingRental {
  id: string
  reference: string
  start_date: string
  end_date: string
  status: string
  client_first_name: string
  client_last_name: string
  client_email: string
  client_phone: string
  contract_url: string | null
  rental_vehicle: { id: string; brand: string; model: string; slug: string } | null
}

interface LatestVehicle {
  id: string
  brand: string
  model: string
  price: number
  published_at: string | null
  coverPhoto: string | null
}

interface TodayTask {
  id: string
  reference: string
  start_date: string
  end_date: string
  status: string
  client_first_name: string
  client_last_name: string
  rental_vehicle: { id: string; brand: string; model: string } | null
}

interface DashboardContentProps {
  locale: string
  role: "admin" | "collaborateur"
  saleStats: SaleStats
  latestVehicles: LatestVehicle[]
}

// ─── Status config ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: "En attente", color: "text-ar-gold", bg: "bg-ar-gold/10", border: "border-ar-gold/30" },
  deposit_paid: { label: "Acompte payé", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  confirmed: { label: "Confirmé", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
  in_progress: { label: "En cours", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  completed: { label: "Terminé", color: "text-gray-300", bg: "bg-gray-500/10", border: "border-gray-500/30" },
}

// ─── Toggle Switch Component ────────────────────────────────────────────────

function ModeToggle({
  mode,
  onToggle,
}: {
  mode: DashboardMode
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="relative flex items-center gap-1 rounded-full bg-ar-dark/80 border border-ar-gold/20 p-1 cursor-pointer transition-all duration-300 hover:border-ar-gold/40 hover:shadow-lg hover:shadow-ar-gold/10"
      aria-label={`Basculer en mode ${mode === "vente" ? "location" : "vente"}`}
    >
      {/* Sliding background pill */}
      <motion.div
        className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-ar-gold to-ar-gold-light"
        initial={false}
        animate={{
          left: mode === "vente" ? "4px" : "calc(50% + 0px)",
          width: mode === "vente" ? "calc(50% - 4px)" : "calc(50% - 4px)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />

      {/* Vente label */}
      <span
        className={`relative z-10 px-4 py-2 text-sm font-bold rounded-full transition-colors duration-300 select-none ${
          mode === "vente" ? "text-ar-black" : "text-ar-silver/60"
        }`}
      >
        <Car className="inline-block h-4 w-4 mr-1.5 -mt-0.5" />
        Vente
      </span>

      {/* Location label */}
      <span
        className={`relative z-10 px-4 py-2 text-sm font-bold rounded-full transition-colors duration-300 select-none ${
          mode === "location" ? "text-ar-black" : "text-ar-silver/60"
        }`}
      >
        <KeyRound className="inline-block h-4 w-4 mr-1.5 -mt-0.5" />
        Location
      </span>
    </button>
  )
}

// ─── Calendar Component ─────────────────────────────────────────────────────

type CalendarView = "week" | "month"

function RentalCalendar({
  locale,
  events,
  loading: externalLoading,
  onDateRangeChange,
}: {
  locale: string
  events: CalendarEvent[]
  loading?: boolean
  onDateRangeChange?: (startDate: string, endDate: string) => void
}) {
  const [view, setView] = useState<CalendarView>("week")
  const [currentDate, setCurrentDate] = useState(new Date())

  // Notify parent when date range changes
  const notifyRange = useCallback(
    (date: Date, v: CalendarView) => {
      if (!onDateRangeChange) return
      let start: Date
      let end: Date
      if (v === "week") {
        start = new Date(date)
        const dayOfWeek = start.getDay()
        start.setDate(start.getDate() - ((dayOfWeek + 6) % 7))
        end = new Date(start)
        end.setDate(start.getDate() + 6)
      } else {
        start = new Date(date.getFullYear(), date.getMonth(), 1)
        start.setDate(start.getDate() - 7)
        end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        end.setDate(end.getDate() + 7)
      }
      onDateRangeChange(start.toISOString(), end.toISOString())
    },
    [onDateRangeChange]
  )

  const navigate = (dir: -1 | 1) => {
    const d = new Date(currentDate)
    if (view === "week") d.setDate(d.getDate() + dir * 7)
    else d.setMonth(d.getMonth() + dir)
    setCurrentDate(d)
    notifyRange(d, view)
  }

  const goToday = () => {
    const now = new Date()
    setCurrentDate(now)
    notifyRange(now, view)
  }

  const changeView = (v: CalendarView) => {
    setView(v)
    notifyRange(currentDate, v)
  }

  // Generate days for the current view
  const days = useMemo(() => {
    const result: Date[] = []
    if (view === "week") {
      const start = new Date(currentDate)
      const dayOfWeek = start.getDay()
      // Start on Monday
      start.setDate(start.getDate() - ((dayOfWeek + 6) % 7))
      for (let i = 0; i < 7; i++) {
        const d = new Date(start)
        d.setDate(start.getDate() + i)
        result.push(d)
      }
    } else {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      // Start from Monday before the first day
      const startOffset = (firstDay.getDay() + 6) % 7
      const start = new Date(firstDay)
      start.setDate(start.getDate() - startOffset)
      // Fill up to include the last day and complete the week
      const totalDays = startOffset + lastDay.getDate()
      const totalCells = Math.ceil(totalDays / 7) * 7
      for (let i = 0; i < totalCells; i++) {
        const d = new Date(start)
        d.setDate(start.getDate() + i)
        result.push(d)
      }
    }
    return result
  }, [view, currentDate])

  // Map events to days
  const getEventsForDay = (day: Date) => {
    const dayStr = day.toISOString().split("T")[0]
    return events.filter((e) => {
      const start = e.start_date.split("T")[0]
      const end = e.end_date.split("T")[0]
      return dayStr >= start && dayStr <= end
    })
  }

  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]
  const currentMonth = currentDate.getMonth()

  const headerLabel =
    view === "week"
      ? `${days[0]?.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} — ${days[6]?.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`
      : currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })

  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

  return (
    <div className="bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 rounded-xl border border-ar-gold/10 overflow-hidden backdrop-blur-sm shadow-lg shadow-ar-gold/5">
      {/* Calendar header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 sm:px-5 py-3 sm:py-4 border-b border-ar-gold/10">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-ar-gold rounded-full" />
          <h2 className="text-base sm:text-lg font-bold text-white">Planning réservations</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={goToday}
            className="border-ar-gold/20 text-ar-gold hover:bg-ar-gold/10 hover:border-ar-gold/40 text-xs h-9 sm:h-7"
          >
            Aujourd&apos;hui
          </Button>
          <div className="hidden sm:flex items-center rounded-lg border border-ar-gold/20 overflow-hidden">
            <button
              onClick={() => changeView("week")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "week"
                  ? "bg-ar-gold text-ar-black"
                  : "text-ar-silver/60 hover:text-white hover:bg-ar-gold/10"
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => changeView("month")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "month"
                  ? "bg-ar-gold text-ar-black"
                  : "text-ar-silver/60 hover:text-white hover:bg-ar-gold/10"
              }`}
            >
              Mois
            </button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9 sm:h-8 sm:w-8 hover:bg-ar-gold/10 hover:text-ar-gold"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs sm:text-sm font-medium text-white min-w-[120px] sm:min-w-[180px] text-center capitalize">
              {headerLabel}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(1)}
              className="h-9 w-9 sm:h-8 sm:w-8 hover:bg-ar-gold/10 hover:text-ar-gold"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Day names header — hidden on mobile */}
      <div className="hidden sm:grid grid-cols-7 border-b border-ar-gold/10">
        {dayNames.map((name) => (
          <div
            key={name}
            className="px-2 py-2 text-center text-xs font-medium text-ar-silver/50 uppercase tracking-wider"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid — hidden on mobile, replaced by list */}
      <div className="hidden sm:grid grid-cols-7 relative">
        {externalLoading && (
          <div className="absolute inset-0 bg-ar-dark/60 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-ar-gold/30 border-t-ar-gold rounded-full animate-spin" />
          </div>
        )}
        {days.map((day, idx) => {
          const dayStr = day.toISOString().split("T")[0]
          const isToday = dayStr === todayStr
          const isCurrentMonth = day.getMonth() === currentMonth
          const dayEvents = getEventsForDay(day)

          return (
            <div
              key={idx}
              className={`${view === "week" ? "min-h-[120px]" : "min-h-[80px]"} p-1.5 border-b border-r border-ar-gold/5 transition-colors ${
                isToday ? "bg-ar-gold/5" : ""
              } ${!isCurrentMonth && view === "month" ? "opacity-40" : ""}`}
            >
              <div
                className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday
                    ? "bg-ar-gold text-ar-black font-bold"
                    : "text-ar-silver/60"
                }`}
              >
                {day.getDate()}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, view === "week" ? 5 : 2).map((event) => {
                  const cfg = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.pending
                  return (
                    <Link
                      key={event.id}
                      href={`/${locale}/admin/locations/${event.id}`}
                      className={`block px-1.5 py-0.5 rounded text-[10px] leading-tight truncate ${cfg.bg} ${cfg.color} hover:opacity-80 transition-opacity`}
                      title={`${event.client_first_name} ${event.client_last_name} — ${event.rental_vehicle?.brand ?? ""} ${event.rental_vehicle?.model ?? ""}`}
                    >
                      <span className="font-semibold">
                        {event.client_last_name}
                      </span>
                      {" · "}
                      {event.rental_vehicle?.brand} {event.rental_vehicle?.model}
                    </Link>
                  )
                })}
                {dayEvents.length > (view === "week" ? 5 : 2) && (
                  <div className="text-[10px] text-ar-silver/40 px-1.5">
                    +{dayEvents.length - (view === "week" ? 5 : 2)} autre(s)
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile list view of events */}
      <div className="sm:hidden divide-y divide-ar-gold/5">
        {days.map((day, idx) => {
          const dayStr = day.toISOString().split("T")[0]
          const isToday = dayStr === todayStr
          const dayEvts = getEventsForDay(day)
          if (dayEvts.length === 0 && !isToday) return null
          return (
            <div key={idx} className={`px-3 py-2.5 ${isToday ? "bg-ar-gold/5" : ""}`}>
              <p className={`text-xs font-semibold mb-1.5 ${isToday ? "text-ar-gold" : "text-ar-silver/60"}`}>
                {day.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                {isToday && " — Aujourd\u2019hui"}
              </p>
              {dayEvts.length === 0 ? (
                <p className="text-xs text-ar-silver/30 italic">Aucune réservation</p>
              ) : (
                <div className="space-y-1">
                  {dayEvts.map((event) => {
                    const cfg = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.pending
                    return (
                      <Link
                        key={event.id}
                        href={`/${locale}/admin/locations/${event.id}`}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 ${cfg.bg} hover:opacity-80 transition-opacity`}
                      >
                        <span className={`text-xs font-medium ${cfg.color} truncate`}>
                          {event.client_first_name} {event.client_last_name}
                          {" · "}
                          {event.rental_vehicle?.brand} {event.rental_vehicle?.model}
                        </span>
                        <span className={`text-[10px] ${cfg.color} shrink-0 ml-2`}>{cfg.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Upcoming Reservations List ─────────────────────────────────────────────

function UpcomingReservationsList({
  locale,
  rentals,
  onViewClient,
  onGenerateContract,
}: {
  locale: string
  rentals: UpcomingRental[]
  onViewClient?: (email: string) => void
  onGenerateContract?: (rentalId: string) => void
}) {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })

  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]
  const tomorrowStr = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    .toISOString()
    .split("T")[0]

  const todayRentals = rentals.filter((r) => {
    const start = r.start_date.split("T")[0]
    const end = r.end_date.split("T")[0]
    return todayStr >= start && todayStr <= end
  })

  const tomorrowRentals = rentals.filter((r) => {
    const start = r.start_date.split("T")[0]
    return start === tomorrowStr
  })

  const RentalRow = ({ rental }: { rental: UpcomingRental }) => {
    const cfg = STATUS_CONFIG[rental.status] ?? STATUS_CONFIG.pending
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 hover:bg-ar-gold/5 transition-colors border-b border-ar-gold/5 last:border-0">
        {/* Client info + status mobile */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate text-sm">
              {rental.client_first_name} {rental.client_last_name}
            </p>
            <p className="text-xs text-ar-silver/50 truncate">
              <span className="md:hidden">{rental.rental_vehicle?.brand} {rental.rental_vehicle?.model} · </span>
              {rental.client_phone}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`${cfg.bg} ${cfg.color} ${cfg.border} font-medium text-xs shrink-0 sm:hidden`}
          >
            {cfg.label}
          </Badge>
        </div>

        {/* Vehicle — tablet+ */}
        <div className="hidden md:block text-sm text-ar-silver/70 min-w-[140px]">
          {rental.rental_vehicle?.brand} {rental.rental_vehicle?.model}
        </div>

        {/* Dates — desktop */}
        <div className="hidden lg:block text-xs text-ar-silver/50 min-w-[180px]">
          {formatDate(rental.start_date)} → {formatDate(rental.end_date)}
        </div>

        {/* Status — tablet+ */}
        <Badge
          variant="outline"
          className={`${cfg.bg} ${cfg.color} ${cfg.border} font-medium text-xs hidden sm:inline-flex`}
        >
          {cfg.label}
        </Badge>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {onViewClient && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-ar-silver/60 hover:text-ar-gold hover:bg-ar-gold/10"
              onClick={() => onViewClient(rental.client_email)}
            >
              <User className="h-3.5 w-3.5 mr-1" />
              Client
            </Button>
          )}
          <Link href={`/${locale}/admin/locations/${rental.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-ar-silver/60 hover:text-ar-gold hover:bg-ar-gold/10"
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              Fiche
            </Button>
          </Link>
          {onGenerateContract ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-ar-silver/60 hover:text-ar-gold hover:bg-ar-gold/10"
              onClick={() => onGenerateContract(rental.id)}
            >
              <FileText className="h-3.5 w-3.5 mr-1" />
              Contrat
            </Button>
          ) : rental.contract_url ? (
            <a href={rental.contract_url} target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-ar-silver/60 hover:text-ar-gold hover:bg-ar-gold/10"
              >
                <FileText className="h-3.5 w-3.5 mr-1" />
                Contrat
              </Button>
            </a>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="h-8 text-xs text-ar-silver/30"
            >
              <FileText className="h-3.5 w-3.5 mr-1" />
              Contrat
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 rounded-xl border border-ar-gold/10 overflow-hidden backdrop-blur-sm shadow-lg shadow-ar-gold/5">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-ar-gold/10">
        <div className="w-1 h-6 bg-ar-gold rounded-full" />
        <h2 className="text-lg font-bold text-white">
          Réservations du jour &amp; demain
        </h2>
      </div>

      {todayRentals.length === 0 && tomorrowRentals.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-full bg-ar-gold/10 flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="h-7 w-7 text-ar-gold/50" />
          </div>
          <p className="text-ar-silver/50 text-sm">
            Aucune réservation aujourd&apos;hui ni demain
          </p>
        </div>
      ) : (
        <>
          {/* Today */}
          {todayRentals.length > 0 && (
            <>
              <div className="px-5 py-2 bg-ar-gold/5 border-b border-ar-gold/10">
                <span className="text-xs font-bold text-ar-gold uppercase tracking-wider">
                  Aujourd&apos;hui — {today.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                </span>
              </div>
              {todayRentals.map((r) => (
                <RentalRow key={r.id} rental={r} />
              ))}
            </>
          )}

          {/* Tomorrow */}
          {tomorrowRentals.length > 0 && (
            <>
              <div className="px-5 py-2 bg-ar-gold/5 border-b border-ar-gold/10">
                <span className="text-xs font-bold text-ar-gold uppercase tracking-wider">
                  Demain — {new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                </span>
              </div>
              {tomorrowRentals.map((r) => (
                <RentalRow key={r.id} rental={r} />
              ))}
            </>
          )}
        </>
      )}
    </div>
  )
}

// ─── Main Dashboard Content ─────────────────────────────────────────────────

export default function DashboardContent({
  locale,
  role,
  saleStats,
  latestVehicles,
}: DashboardContentProps) {
  const isAdmin = role === "admin"
  const [mode, setMode] = useState<DashboardMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("dashboard-mode") as DashboardMode) || "vente"
    }
    return "vente"
  })

  // Rental data (loaded client-side when mode = location)
  const [rentalStats, setRentalStats] = useState<RentalStats | null>(null)
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [upcomingRentals, setUpcomingRentals] = useState<UpcomingRental[]>([])
  const [rentalLoading, setRentalLoading] = useState(false)
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [todayDepartures, setTodayDepartures] = useState<TodayTask[]>([])
  const [todayReturns, setTodayReturns] = useState<TodayTask[]>([])

  // Modal states
  const [clientModalEmail, setClientModalEmail] = useState<string | null>(null)
  const [clientModalOpen, setClientModalOpen] = useState(false)
  const [contractModalRentalId, setContractModalRentalId] = useState<string | null>(null)
  const [contractModalOpen, setContractModalOpen] = useState(false)

  const openClientModal = (email: string) => {
    setClientModalEmail(email)
    setClientModalOpen(true)
  }

  const openContractModal = (rentalId: string) => {
    setContractModalRentalId(rentalId)
    setContractModalOpen(true)
  }

  const toggleMode = () => {
    const next = mode === "vente" ? "location" : "vente"
    setMode(next)
    localStorage.setItem("dashboard-mode", next)
  }

  // Fetch calendar events for a specific date range
  const fetchCalendarEvents = useCallback(async (startDate: string, endDate: string) => {
    setCalendarLoading(true)
    try {
      const calRes = await getRentalCalendarEvents(startDate, endDate)
      if (calRes.success) setCalendarEvents(calRes.events)
    } catch (err) {
      console.error("Failed to load calendar events:", err)
    } finally {
      setCalendarLoading(false)
    }
  }, [])

  // Load rental data when switching to location mode
  const loadRentalData = useCallback(async () => {
    setRentalLoading(true)
    try {
      // Calendar range: current month ± 1 week
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      start.setDate(start.getDate() - 7)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      end.setDate(end.getDate() + 7)

      const [statsRes, calRes, upRes, tasksRes] = await Promise.all([
        getRentalDashboardStats(),
        getRentalCalendarEvents(start.toISOString(), end.toISOString()),
        getUpcomingRentals(),
        getCollaboratorTodayTasks(),
      ])

      if (statsRes.success) setRentalStats(statsRes.stats)
      if (calRes.success) setCalendarEvents(calRes.events)
      if (upRes.success) setUpcomingRentals(upRes.rentals)
      if (tasksRes.success) {
        setTodayDepartures(tasksRes.departures)
        setTodayReturns(tasksRes.returns)
      }
    } catch (err) {
      console.error("Failed to load rental data:", err)
    } finally {
      setRentalLoading(false)
    }
  }, [])

  useEffect(() => {
    if (mode === "location") {
      loadRentalData()
    }
  }, [mode, loadRentalData])

  const stats = saleStats

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.h1
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-ar-gray-300 bg-clip-text text-transparent"
            >
              {mode === "vente" ? "Tableau de bord" : "Tableau de bord — Location"}
            </motion.h1>
          </AnimatePresence>
          <div className="absolute -bottom-2 left-0 w-20 h-1 bg-gradient-to-r from-ar-gold to-transparent rounded-full" />
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle mode={mode} onToggle={toggleMode} />
          <p className="text-ar-silver/60 text-sm hidden lg:block">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Content based on mode */}
      <AnimatePresence mode="wait">
        {mode === "vente" ? (
          <motion.div
            key="vente"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* ─── SALE MODE ───────────────────────────────────────────── */}

            {/* Alerts */}
            {stats.drafts > 5 && (
              <Alert className="bg-ar-gold/10 border-ar-gold/30 text-ar-gold backdrop-blur-sm">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Annonces en attente</AlertTitle>
                <AlertDescription>
                  Vous avez {stats.drafts} annonces en brouillon non publiées.
                  <Link
                    href={`/${locale}/admin/annonces?status=brouillon`}
                    className="ml-2 underline hover:text-ar-gold-light"
                  >
                    Voir les brouillons
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            {stats.unreadMessages > 0 && (
              <Alert className="bg-ar-danger/10 border-ar-danger/30 text-ar-danger backdrop-blur-sm animate-pulse">
                <MessageSquare className="h-4 w-4" />
                <AlertTitle>Nouveaux messages</AlertTitle>
                <AlertDescription>
                  Vous avez {stats.unreadMessages} nouveau(x) message(s) de contact.
                  <Link
                    href={`/${locale}/admin/messages`}
                    className="ml-2 underline hover:text-ar-danger/70"
                  >
                    Voir les messages
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            {/* Sale KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <Card className="group relative bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 border-ar-gold/10 overflow-hidden backdrop-blur-sm hover:border-ar-gold/30 transition-all duration-500 hover:shadow-xl hover:shadow-ar-gold/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ar-success/30 to-transparent" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-ar-silver/60">
                    Annonces publiées
                  </CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-ar-success/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-5 w-5 text-ar-success" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats.published}</div>
                  <p className="text-xs text-ar-silver/40 mt-1">En ligne actuellement</p>
                </CardContent>
              </Card>

              <Card className="group relative bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 border-ar-gold/10 overflow-hidden backdrop-blur-sm hover:border-ar-gold/30 transition-all duration-500 hover:shadow-xl hover:shadow-ar-gold/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ar-gold/30 to-transparent" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-ar-silver/60">
                    En brouillon
                  </CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-ar-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Edit className="h-5 w-5 text-ar-gold" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats.drafts}</div>
                  <p className="text-xs text-ar-silver/40 mt-1">En cours de rédaction</p>
                </CardContent>
              </Card>

              <Card className="group relative bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 border-ar-gold/10 overflow-hidden backdrop-blur-sm hover:border-ar-gold/30 transition-all duration-500 hover:shadow-xl hover:shadow-ar-gold/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ar-silver/20 to-transparent" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-ar-silver/60">
                    Vendus ce mois
                  </CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-ar-silver/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-5 w-5 text-ar-silver" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats.soldThisMonth}</div>
                  <p className="text-xs text-ar-silver/40 mt-1">
                    {new Date().toLocaleDateString("fr-FR", { month: "long" })}
                  </p>
                </CardContent>
              </Card>

              <Card className="group relative bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 border-ar-gold/10 overflow-hidden backdrop-blur-sm hover:border-ar-gold/30 transition-all duration-500 hover:shadow-xl hover:shadow-ar-gold/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ar-danger/30 to-transparent" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-ar-silver/60">
                    Messages non lus
                  </CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-ar-danger/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare
                      className={`h-5 w-5 text-ar-danger ${stats.unreadMessages > 0 ? "animate-pulse" : ""}`}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats.unreadMessages}</div>
                  <p className="text-xs text-ar-silver/40 mt-1">En attente de réponse</p>
                </CardContent>
              </Card>
            </div>

            {/* CTA Principal */}
            <div className="flex justify-center py-6">
              <Link href={`/${locale}/admin/annonces/nouvelle`}>
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-ar-gold via-ar-gold-light to-ar-gold hover:from-ar-gold-light hover:via-ar-gold hover:to-ar-gold-light text-ar-black font-bold px-10 py-7 text-lg shadow-xl shadow-ar-gold/30 transition-all duration-500 hover:shadow-2xl hover:shadow-ar-gold/40 hover:-translate-y-0.5"
                >
                  <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <Car className="relative h-6 w-6 mr-3 transition-transform duration-300 group-hover:scale-110" />
                  <span className="relative">+ Nouvelle annonce</span>
                </Button>
              </Link>
            </div>

            {/* Dernières annonces */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-ar-gold rounded-full" />
                  <h2 className="text-xl font-bold text-white">
                    Dernières annonces publiées
                  </h2>
                </div>
                <Link
                  href={`/${locale}/admin/annonces`}
                  className="group text-ar-gold hover:text-ar-gold-light flex items-center text-sm font-medium transition-colors"
                >
                  Voir toutes
                  <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-5">
                {latestVehicles.map((vehicle) => (
                  <Link
                    key={vehicle.id}
                    href={`/${locale}/admin/annonces/${vehicle.id}`}
                    className="group"
                  >
                    <Card className="relative bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 border-ar-gold/10 overflow-hidden backdrop-blur-sm transition-all duration-500 hover:border-ar-gold/30 hover:shadow-xl hover:shadow-ar-gold/10 group-hover:-translate-y-1">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ar-gold/30 to-transparent" />
                      <div className="aspect-video bg-ar-dark relative overflow-hidden">
                        {vehicle.coverPhoto ? (
                          <img
                            src={vehicle.coverPhoto}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-ar-silver/20">
                            <Car className="h-12 w-12" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-ar-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-white truncate group-hover:text-ar-gold transition-colors">
                          {vehicle.brand} {vehicle.model}
                        </h3>
                        <p className="text-ar-gold font-bold text-lg mt-1">
                          {formatPrice(vehicle.price)}
                        </p>
                        <p className="text-xs text-ar-silver/40 mt-2">
                          {new Date(vehicle.published_at || "").toLocaleDateString("fr-FR")}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {latestVehicles.length === 0 && (
                <div className="text-center py-16 bg-gradient-to-br from-ar-gray/50 to-ar-dark/50 rounded-2xl border border-ar-gold/10 backdrop-blur-sm">
                  <div className="w-20 h-20 rounded-full bg-ar-gold/10 flex items-center justify-center mx-auto mb-6">
                    <Car className="h-10 w-10 text-ar-gold/50" />
                  </div>
                  <p className="text-ar-silver/60 mb-4">Aucune annonce publiée</p>
                  <Link href={`/${locale}/admin/annonces/nouvelle`}>
                    <Button
                      variant="outline"
                      className="border-ar-gold/30 text-ar-gold hover:bg-ar-gold/10 hover:border-ar-gold/50"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Créer la première annonce
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="location"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* ─── LOCATION MODE ───────────────────────────────────────── */}

            {/* Rental KPI Cards */}
            {rentalLoading && !rentalStats ? (
              <div className={`grid grid-cols-2 md:grid-cols-2 ${isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-3 sm:gap-6`}>
                {Array.from({ length: isAdmin ? 4 : 3 }).map((_, i) => (
                  <Card
                    key={i}
                    className="bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 border-ar-gold/10 overflow-hidden backdrop-blur-sm"
                  >
                    <CardHeader className="pb-2">
                      <div className="h-4 w-24 bg-ar-gold/10 rounded animate-pulse" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-9 w-16 bg-ar-gold/10 rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className={`grid grid-cols-2 md:grid-cols-2 ${isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-3 sm:gap-6`}>
                {/* Véhicules disponibles */}
                <Card className="group relative bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 border-ar-gold/10 overflow-hidden backdrop-blur-sm hover:border-ar-gold/30 transition-all duration-500 hover:shadow-xl hover:shadow-ar-gold/10">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ar-success/30 to-transparent" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-ar-silver/60">
                      Véhicules disponibles
                    </CardTitle>
                    <div className="w-10 h-10 rounded-xl bg-ar-success/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Car className="h-5 w-5 text-ar-success" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">
                      {rentalStats?.availableVehicles ?? 0}
                    </div>
                    <p className="text-xs text-ar-silver/40 mt-1">Prêts à louer</p>
                  </CardContent>
                </Card>

                {/* Réservations actives */}
                <Card className="group relative bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 border-ar-gold/10 overflow-hidden backdrop-blur-sm hover:border-ar-gold/30 transition-all duration-500 hover:shadow-xl hover:shadow-ar-gold/10">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-ar-silver/60">
                      Réservations actives
                    </CardTitle>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <CalendarDays className="h-5 w-5 text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">
                      {rentalStats?.activeReservations ?? 0}
                    </div>
                    <p className="text-xs text-ar-silver/40 mt-1">En cours aujourd&apos;hui</p>
                  </CardContent>
                </Card>

                {/* Réservations à venir */}
                <Card className="group relative bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 border-ar-gold/10 overflow-hidden backdrop-blur-sm hover:border-ar-gold/30 transition-all duration-500 hover:shadow-xl hover:shadow-ar-gold/10">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-ar-silver/60">
                      Réservations à venir
                    </CardTitle>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <CalendarClock className="h-5 w-5 text-blue-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">
                      {rentalStats?.upcomingReservations ?? 0}
                    </div>
                    <p className="text-xs text-ar-silver/40 mt-1">Dans les 7 prochains jours</p>
                  </CardContent>
                </Card>

                {/* CA location ce mois — admin only */}
                {isAdmin && (
                  <Card className="group relative bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 border-ar-gold/10 overflow-hidden backdrop-blur-sm hover:border-ar-gold/30 transition-all duration-500 hover:shadow-xl hover:shadow-ar-gold/10">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ar-gold/30 to-transparent" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-ar-silver/60">
                        CA location ce mois
                      </CardTitle>
                      <div className="w-10 h-10 rounded-xl bg-ar-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <DollarSign className="h-5 w-5 text-ar-gold" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">
                        {formatPrice(rentalStats?.monthlyRevenue ?? 0)}
                      </div>
                      <p className="text-xs text-ar-silver/40 mt-1">
                        {new Date().toLocaleDateString("fr-FR", { month: "long" })}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* CTA Location */}
            <div className="flex justify-center py-6">
              <Link href={`/${locale}/admin/locations`}>
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-ar-gold via-ar-gold-light to-ar-gold hover:from-ar-gold-light hover:via-ar-gold hover:to-ar-gold-light text-ar-black font-bold px-10 py-7 text-lg shadow-xl shadow-ar-gold/30 transition-all duration-500 hover:shadow-2xl hover:shadow-ar-gold/40 hover:-translate-y-0.5"
                >
                  <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <CalendarDays className="relative h-6 w-6 mr-3 transition-transform duration-300 group-hover:scale-110" />
                  <span className="relative">Voir toutes les réservations</span>
                </Button>
              </Link>
            </div>

            {/* Mes tâches du jour */}
            {(todayDepartures.length > 0 || todayReturns.length > 0) && (
              <div className="bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 rounded-xl border border-ar-gold/10 overflow-hidden backdrop-blur-sm shadow-lg shadow-ar-gold/5">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-ar-gold/10">
                  <div className="w-1 h-6 bg-ar-gold rounded-full" />
                  <ClipboardList className="h-5 w-5 text-ar-gold" />
                  <h2 className="text-lg font-bold text-white">
                    Mes t&acirc;ches du jour
                  </h2>
                  <Badge variant="outline" className="ml-auto bg-ar-gold/10 text-ar-gold border-ar-gold/30 text-xs font-bold">
                    {todayDepartures.length + todayReturns.length} t&acirc;che{(todayDepartures.length + todayReturns.length) > 1 ? "s" : ""}
                  </Badge>
                </div>

                {/* Departures */}
                {todayDepartures.length > 0 && (
                  <>
                    <div className="px-5 py-2.5 bg-green-500/5 border-b border-ar-gold/5">
                      <div className="flex items-center gap-2">
                        <LogOut className="h-4 w-4 text-green-400" />
                        <span className="text-xs font-bold text-green-400 uppercase tracking-wider">
                          D&eacute;parts ({todayDepartures.length})
                        </span>
                      </div>
                    </div>
                    {todayDepartures.map((task) => (
                      <Link
                        key={`dep-${task.id}`}
                        href={`/${locale}/admin/locations/${task.id}`}
                        className="flex items-center gap-4 px-5 py-3 hover:bg-ar-gold/5 transition-colors border-b border-ar-gold/5 last:border-0 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <LogOut className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">
                            {task.client_first_name} {task.client_last_name}
                          </p>
                          <p className="text-xs text-ar-silver/50 truncate">
                            {task.rental_vehicle?.brand} {task.rental_vehicle?.model} &middot; Prise en charge 09:00
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-[10px] font-bold">
                          D&eacute;part
                        </Badge>
                      </Link>
                    ))}
                  </>
                )}

                {/* Returns */}
                {todayReturns.length > 0 && (
                  <>
                    <div className="px-5 py-2.5 bg-blue-500/5 border-b border-ar-gold/5">
                      <div className="flex items-center gap-2">
                        <LogIn className="h-4 w-4 text-blue-400" />
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                          Retours ({todayReturns.length})
                        </span>
                      </div>
                    </div>
                    {todayReturns.map((task) => (
                      <Link
                        key={`ret-${task.id}`}
                        href={`/${locale}/admin/locations/${task.id}`}
                        className="flex items-center gap-4 px-5 py-3 hover:bg-ar-gold/5 transition-colors border-b border-ar-gold/5 last:border-0 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <LogIn className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">
                            {task.client_first_name} {task.client_last_name}
                          </p>
                          <p className="text-xs text-ar-silver/50 truncate">
                            {task.rental_vehicle?.brand} {task.rental_vehicle?.model} &middot; Restitution 18:00
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px] font-bold">
                          Retour
                        </Badge>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Calendar */}
            <RentalCalendar
              locale={locale}
              events={calendarEvents}
              loading={calendarLoading}
              onDateRangeChange={fetchCalendarEvents}
            />

            {/* Upcoming Reservations */}
            <UpcomingReservationsList
              locale={locale}
              rentals={upcomingRentals}
              onViewClient={openClientModal}
              onGenerateContract={openContractModal}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <ClientProfileModal
        open={clientModalOpen}
        onOpenChange={setClientModalOpen}
        clientEmail={clientModalEmail}
        locale={locale}
        onGenerateContract={openContractModal}
      />
      <ContractPreviewModal
        open={contractModalOpen}
        onOpenChange={setContractModalOpen}
        rentalId={contractModalRentalId}
        readOnly={!isAdmin}
        onContractGenerated={() => {
          if (mode === "location") loadRentalData()
        }}
      />
    </div>
  )
}
