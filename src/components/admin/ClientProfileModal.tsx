"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  FileText,
  Star,
  Crown,
  Loader2,
  Eye,
  X,
  BadgeCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getClientProfile } from "@/app/[locale]/(admin)/admin/locations/actions"
import { localePath } from '@/lib/constants'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ClientRental {
  id: string
  reference: string
  startDate: string
  endDate: string
  totalAmount: number
  status: string
  createdAt: string
  contractUrl: string | null
  vehicle: string
}

interface ClientData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string | null
  city: string | null
  postalCode: string | null
  birthDate: string | null
  licenseNumber: string | null
  isBusiness: boolean
  businessName: string | null
  businessSiret: string | null
  status: "nouveau" | "regulier" | "vip"
  totalRentals: number
  completedRentals: number
  totalSpent: number
  hideFinancials?: boolean
  rentals: ClientRental[]
}

interface ClientProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientEmail: string | null
  locale: string
  onGenerateContract?: (rentalId: string) => void
}

// ─── Status helpers ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "En attente", color: "text-ar-gold", bg: "bg-ar-gold/10" },
  deposit_paid: { label: "Acompte payé", color: "text-blue-400", bg: "bg-blue-500/10" },
  confirmed: { label: "Confirmé", color: "text-green-400", bg: "bg-green-500/10" },
  in_progress: { label: "En cours", color: "text-purple-400", bg: "bg-purple-500/10" },
  completed: { label: "Terminé", color: "text-gray-300", bg: "bg-gray-500/10" },
  cancelled: { label: "Annulé", color: "text-red-400", bg: "bg-red-500/10" },
  no_show: { label: "No show", color: "text-orange-400", bg: "bg-orange-500/10" },
}

const CLIENT_STATUS_CONFIG = {
  nouveau: { label: "Nouveau", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: User },
  regulier: { label: "Régulier", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", icon: BadgeCheck },
  vip: { label: "VIP", color: "text-ar-gold", bg: "bg-ar-gold/10", border: "border-ar-gold/30", icon: Crown },
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ClientProfileModal({
  open,
  onOpenChange,
  clientEmail,
  locale,
  onGenerateContract,
}: ClientProfileModalProps) {
  const [client, setClient] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(false)

  const loadClient = useCallback(async () => {
    if (!clientEmail) return
    setLoading(true)
    const result = await getClientProfile(clientEmail)
    if (result.success && result.client) {
      setClient(result.client as ClientData)
    }
    setLoading(false)
  }, [clientEmail])

  useEffect(() => {
    if (open && clientEmail) {
      loadClient()
    } else {
      setClient(null)
    }
  }, [open, clientEmail, loadClient])

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n)

  const statusCfg = client ? CLIENT_STATUS_CONFIG[client.status] : null
  const StatusIcon = statusCfg?.icon ?? User

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-ar-gray to-ar-dark border-ar-gold/20 text-white backdrop-blur-xl shadow-2xl shadow-ar-gold/10 max-w-[95vw] md:max-w-2xl lg:max-w-3xl max-h-[85vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-ar-gold animate-spin" />
          </div>
        ) : !client ? (
          <div className="text-center py-16 text-gray-400">
            Client introuvable
          </div>
        ) : (
          <>
            {/* Header */}
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-ar-gold/10 flex items-center justify-center border-2 border-ar-gold/30">
                    <User className="h-7 w-7 text-ar-gold" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white">
                      {client.firstName} {client.lastName}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {statusCfg && (
                        <Badge
                          variant="outline"
                          className={`${statusCfg.bg} ${statusCfg.color} ${statusCfg.border} text-xs font-bold`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusCfg.label}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {client.totalRentals} location{client.totalRentals > 1 ? "s" : ""}
                        {!client.hideFinancials && <> · {formatPrice(client.totalSpent)} dépensés</>}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 mt-4">
              {/* Informations personnelles */}
              <div className="bg-ar-dark/50 rounded-xl p-5 border border-ar-gold/10">
                <h3 className="text-sm font-bold text-ar-gold uppercase tracking-wider mb-4">
                  Informations personnelles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2.5">
                    <Mail className="h-4 w-4 text-ar-gold/60 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-white">{client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone className="h-4 w-4 text-ar-gold/60 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Téléphone</p>
                      <p className="text-sm text-white">{client.phone || "—"}</p>
                    </div>
                  </div>
                  {(client.address || client.city) && (
                    <div className="flex items-start gap-2.5 col-span-2">
                      <MapPin className="h-4 w-4 text-ar-gold/60 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Adresse</p>
                        <p className="text-sm text-white">
                          {[client.address, client.postalCode, client.city]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  )}
                  {client.birthDate && (
                    <div className="flex items-start gap-2.5">
                      <Calendar className="h-4 w-4 text-ar-gold/60 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Date de naissance</p>
                        <p className="text-sm text-white">{formatDate(client.birthDate)}</p>
                      </div>
                    </div>
                  )}
                  {client.licenseNumber && (
                    <div className="flex items-start gap-2.5">
                      <CreditCard className="h-4 w-4 text-ar-gold/60 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Permis de conduire</p>
                        <p className="text-sm text-white font-mono">{client.licenseNumber}</p>
                      </div>
                    </div>
                  )}
                </div>

                {client.isBusiness && client.businessName && (
                  <div className="mt-4 pt-4 border-t border-ar-gold/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Société</p>
                        <p className="text-sm text-white font-medium">{client.businessName}</p>
                      </div>
                      {client.businessSiret && (
                        <div>
                          <p className="text-xs text-gray-500">SIRET</p>
                          <p className="text-sm text-white font-mono">{client.businessSiret}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Historique des locations */}
              <div className="bg-ar-dark/50 rounded-xl p-5 border border-ar-gold/10">
                <h3 className="text-sm font-bold text-ar-gold uppercase tracking-wider mb-4">
                  Historique des locations ({client.totalRentals})
                </h3>
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {client.rentals.map((rental) => {
                    const cfg = STATUS_CONFIG[rental.status] ?? STATUS_CONFIG.pending
                    return (
                      <div
                        key={rental.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ar-gold/5 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-ar-gold font-bold">
                              {rental.reference}
                            </span>
                            <Badge
                              variant="outline"
                              className={`${cfg.bg} ${cfg.color} text-[10px] px-1.5 py-0`}
                            >
                              {cfg.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {rental.vehicle} · {formatDate(rental.startDate)} → {formatDate(rental.endDate)}
                          </p>
                        </div>

                        {!client.hideFinancials && (
                          <span className="text-sm font-bold text-white whitespace-nowrap">
                            {formatPrice(rental.totalAmount)}
                          </span>
                        )}

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`${localePath(locale, `/admin/locations/${rental.id}`)}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-ar-gold/10 hover:text-ar-gold"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          {onGenerateContract && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-ar-gold/10 hover:text-ar-gold"
                              onClick={() => onGenerateContract(rental.id)}
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {client.rentals.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-6">
                      Aucune location enregistrée
                    </p>
                  )}
                </div>
              </div>

              {/* Stats résumé */}
              <div className={`grid grid-cols-2 ${client.hideFinancials ? "sm:grid-cols-2" : "sm:grid-cols-3"} gap-3`}>
                <div className="bg-ar-dark/50 rounded-xl p-4 border border-ar-gold/10 text-center">
                  <p className="text-2xl font-bold text-white">{client.totalRentals}</p>
                  <p className="text-xs text-gray-500 mt-1">Locations totales</p>
                </div>
                <div className="bg-ar-dark/50 rounded-xl p-4 border border-ar-gold/10 text-center">
                  <p className="text-2xl font-bold text-green-400">{client.completedRentals}</p>
                  <p className="text-xs text-gray-500 mt-1">Terminées</p>
                </div>
                {!client.hideFinancials && (
                  <div className="bg-ar-dark/50 rounded-xl p-4 border border-ar-gold/10 text-center">
                    <p className="text-2xl font-bold text-ar-gold">{formatPrice(client.totalSpent)}</p>
                    <p className="text-xs text-gray-500 mt-1">Total dépensé</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
