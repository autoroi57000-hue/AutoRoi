"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Search,
  MoreVertical,
  Eye,
  FileText,
  Send,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getRentalsList, getRentalsStats, sendManualReminder } from "./actions"
import { toast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"
import ClientProfileModal from "@/components/admin/ClientProfileModal"

const ContractPreviewModal = dynamic(
  () => import("@/components/admin/ContractPreviewModal"),
  { ssr: false }
)
import { User } from "lucide-react"

interface LocationsPageProps {
  params: { locale: string }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  pending: {
    label: "En attente",
    color: "text-ar-gold",
    bgColor: "bg-ar-gold/10",
    borderColor: "border-ar-gold/30",
  },
  deposit_paid: {
    label: "Acompte payé",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  confirmed: {
    label: "Confirmé",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  in_progress: {
    label: "En cours",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  completed: {
    label: "Terminé",
    color: "text-gray-300",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/30",
  },
  cancelled: {
    label: "Annulé",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
  no_show: {
    label: "No show",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
}

export default function LocationsPage({ params }: LocationsPageProps) {
  const { locale } = params
  const searchParams = useSearchParams()

  const [rentals, setRentals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [stats, setStats] = useState<any>(null)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Modal states
  const [clientModalEmail, setClientModalEmail] = useState<string | null>(null)
  const [clientModalOpen, setClientModalOpen] = useState(false)
  const [contractModalRentalId, setContractModalRentalId] = useState<string | null>(null)
  const [contractModalOpen, setContractModalOpen] = useState(false)

  const loadStats = useCallback(async () => {
    const result = await getRentalsStats()
    if (result.success) setStats(result.stats)
  }, [])

  const loadRentals = useCallback(async () => {
    setLoading(true)
    const result = await getRentalsList({
      search: search || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      page,
      perPage,
    })
    if (result.success) {
      setRentals(result.rentals)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    }
    setLoading(false)
  }, [search, statusFilter, page, perPage])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadRentals()
  }, [loadRentals])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleResetFilters = () => {
    setSearch("")
    setStatusFilter("all")
    setPage(1)
  }

  const handleSendReminder = async (rentalId: string) => {
    setActionLoading(rentalId)
    const result = await sendManualReminder(rentalId)
    if (result.success) {
      toast({ title: "Rappel envoyé", variant: "success" })
    } else {
      toast({ title: "Erreur", description: result.error || "Impossible d'envoyer le rappel", variant: "destructive" })
    }
    setActionLoading(null)
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Réservations location
          </h1>
          <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-ar-gold to-transparent rounded-full" />
        </div>
        <Link href={`/${locale}/admin/locations/vehicules`}>
          <Button
            variant="outline"
            className="border-ar-gold/30 text-ar-gold hover:bg-ar-gold/10 hover:border-ar-gold/50 w-full sm:w-auto"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Gérer la flotte
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total",
            value: stats?.total ?? "—",
            icon: Calendar,
            color: "text-ar-gold",
            bg: "bg-ar-gold/10",
          },
          {
            label: "En attente",
            value: stats?.pending ?? "—",
            icon: Clock,
            color: "text-ar-gold",
            bg: "bg-ar-gold/10",
          },
          {
            label: "Confirmées",
            value: stats?.confirmed ?? "—",
            icon: CheckCircle,
            color: "text-green-400",
            bg: "bg-green-500/10",
          },
          {
            label: "CA du mois",
            value: stats?.revenue_month != null ? formatPrice(stats.revenue_month) : "—",
            icon: TrendingUp,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 rounded-xl border border-ar-gold/10 p-5 shadow-lg shadow-ar-gold/5 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 backdrop-blur-sm p-3 sm:p-5 rounded-xl border border-ar-gold/10 shadow-lg shadow-ar-gold/5">
        <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ar-gold/50" />
          <Input
            placeholder="Référence, client, véhicule..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-11 bg-ar-dark/50 border-ar-gold/20 focus:border-ar-gold/50 text-white placeholder:text-gray-500"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-[200px] bg-ar-dark/50 border-ar-gold/20 text-white focus:border-ar-gold/50">
            <Filter className="h-4 w-4 mr-2 text-ar-gold/50" />
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent className="bg-ar-gray border-ar-gold/20">
            <SelectItem value="all" className="text-gray-300 focus:bg-ar-gold/10 focus:text-ar-gold">Tous les statuts</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key} className="text-gray-300 focus:bg-ar-gold/10 focus:text-ar-gold">
                {cfg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={handleResetFilters}
          className="border-ar-gold/20 text-gray-400 hover:text-white hover:border-ar-gold/40 hover:bg-ar-gold/5"
        >
          <X className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
      </div>

      {/* Tableau */}
      <div className="bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 rounded-xl border border-ar-gold/10 overflow-hidden shadow-lg shadow-ar-gold/5 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-ar-gold/10 hover:bg-transparent">
              <TableHead className="text-gray-400 font-medium hidden sm:table-cell">Référence</TableHead>
              <TableHead className="text-gray-400 font-medium">Client</TableHead>
              <TableHead className="text-gray-400 font-medium hidden md:table-cell">Véhicule</TableHead>
              <TableHead className="text-gray-400 font-medium hidden lg:table-cell">Dates</TableHead>
              <TableHead className="text-gray-400 font-medium hidden sm:table-cell">Acompte</TableHead>
              <TableHead className="text-gray-400 font-medium">Statut</TableHead>
              <TableHead className="text-gray-400 font-medium w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-ar-gold/10">
                  <TableCell colSpan={7}>
                    <Skeleton className="h-12 w-full bg-ar-gold/5" />
                  </TableCell>
                </TableRow>
              ))
            ) : rentals.length === 0 ? (
              <TableRow className="border-ar-gold/10">
                <TableCell colSpan={7} className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-ar-gold/10 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-ar-gold/50" />
                  </div>
                  <p className="text-gray-400">Aucune réservation trouvée</p>
                </TableCell>
              </TableRow>
            ) : (
              rentals.map((rental) => {
                const cfg = STATUS_CONFIG[rental.status] ?? STATUS_CONFIG.pending
                return (
                  <TableRow key={rental.id} className="border-ar-gold/10 hover:bg-ar-gold/5 transition-colors">
                    <TableCell className="hidden sm:table-cell">
                      <span className="font-mono text-ar-gold font-bold text-sm">{rental.reference}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-white font-medium text-sm">{rental.client_first_name} {rental.client_last_name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-none">{rental.client_email}</p>
                        <p className="text-xs text-gray-500 md:hidden">{rental.rental_vehicle?.brand} {rental.rental_vehicle?.model}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300 hidden md:table-cell">
                      {rental.rental_vehicle?.brand} {rental.rental_vehicle?.model}
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm hidden lg:table-cell">
                      <div>
                        <p>{formatDate(rental.start_date)} →</p>
                        <p>{formatDate(rental.end_date)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-ar-gold font-bold hidden sm:table-cell">
                      {formatPrice(rental.deposit_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${cfg.bgColor} ${cfg.color} ${cfg.borderColor} font-medium`}
                      >
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-ar-gold/10 hover:text-ar-gold transition-colors"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-ar-gray border-ar-gold/20 backdrop-blur-xl shadow-xl shadow-ar-gold/10"
                        >
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/${locale}/admin/locations/${rental.id}`}
                              className="text-white hover:text-ar-gold hover:bg-ar-gold/10 cursor-pointer focus:bg-ar-gold/10 focus:text-ar-gold"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Voir le détail
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setClientModalEmail(rental.client_email)
                              setClientModalOpen(true)
                            }}
                            className="text-white hover:text-ar-gold hover:bg-ar-gold/10 cursor-pointer focus:bg-ar-gold/10 focus:text-ar-gold"
                          >
                            <User className="h-4 w-4 mr-2" />
                            Fiche client
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setContractModalRentalId(rental.id)
                              setContractModalOpen(true)
                            }}
                            className="text-white hover:text-ar-gold hover:bg-ar-gold/10 cursor-pointer focus:bg-ar-gold/10 focus:text-ar-gold"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Générer contrat
                          </DropdownMenuItem>
                          {rental.contract_url && (
                            <DropdownMenuItem asChild>
                              <a
                                href={rental.contract_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white hover:text-ar-gold hover:bg-ar-gold/10 cursor-pointer focus:bg-ar-gold/10 focus:text-ar-gold"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Télécharger contrat PDF
                              </a>
                            </DropdownMenuItem>
                          )}
                          {["deposit_paid", "confirmed"].includes(rental.status) && (
                            <>
                              <DropdownMenuSeparator className="bg-ar-gold/10" />
                              <DropdownMenuItem
                                onClick={() => handleSendReminder(rental.id)}
                                disabled={actionLoading === rental.id}
                                className="text-white hover:text-ar-gold hover:bg-ar-gold/10 cursor-pointer focus:bg-ar-gold/10 focus:text-ar-gold"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                {actionLoading === rental.id ? "Envoi..." : "Envoyer rappel"}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Affichage {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} sur {total} réservations
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border-ar-gold/20 text-gray-400 hover:text-ar-gold hover:border-ar-gold/40 hover:bg-ar-gold/5 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
              .map((p, i, arr) => (
                <span key={p} className="flex items-center">
                  {i > 0 && arr[i - 1] !== p - 1 && <span className="text-gray-500 px-2">...</span>}
                  <Button
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(p)}
                    className={
                      p === page
                        ? "bg-ar-gold text-ar-black font-bold hover:bg-ar-gold-light"
                        : "border-ar-gold/20 text-gray-400 hover:text-ar-gold hover:border-ar-gold/40 hover:bg-ar-gold/5"
                    }
                  >
                    {p}
                  </Button>
                </span>
              ))}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="border-ar-gold/20 text-gray-400 hover:text-ar-gold hover:border-ar-gold/40 hover:bg-ar-gold/5 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ClientProfileModal
        open={clientModalOpen}
        onOpenChange={setClientModalOpen}
        clientEmail={clientModalEmail}
        locale={locale}
        onGenerateContract={(rentalId) => {
          setClientModalOpen(false)
          setContractModalRentalId(rentalId)
          setContractModalOpen(true)
        }}
      />
      <ContractPreviewModal
        open={contractModalOpen}
        onOpenChange={setContractModalOpen}
        rentalId={contractModalRentalId}
        onContractGenerated={() => {
          loadRentals()
          loadStats()
        }}
      />
    </div>
  )
}
