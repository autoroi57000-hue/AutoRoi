"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Search,
  Edit2,
  Eye,
  ShoppingCart,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  Car,
  X,
  Plus,
  Filter,
  Loader2,
  EyeOff,
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  getVehiclesList,
  exportVehiclesToCSV,
} from "../actions"
import {
  duplicateVehicleAction,
  markAsSoldAction,
  deleteVehicleAction,
} from "./actions"
import { formatPrice, formatMileage } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import type { VehicleStatus } from "@/types/database"

interface AnnoncesPageProps {
  params: { locale: string }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  publie: { label: "Publié", color: "text-green-400", bgColor: "bg-green-500/10", borderColor: "border-green-500/30" },
  brouillon: { label: "Brouillon", color: "text-gray-400", bgColor: "bg-gray-500/10", borderColor: "border-gray-500/30" },
  vendu: { label: "Vendu", color: "text-red-400", bgColor: "bg-red-500/10", borderColor: "border-red-500/30" },
  archive: { label: "Archivé", color: "text-ar-gold", bgColor: "bg-ar-gold/10", borderColor: "border-ar-gold/30" },
}

export default function AnnoncesPage({ params }: AnnoncesPageProps) {
  const { locale } = params
  const router = useRouter()
  const searchParams = useSearchParams()

  // États
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [totalPages, setTotalPages] = useState(0)

  // Filtres
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  )

  // Actions
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null)

  // Chargement des données
  const loadVehicles = useCallback(async () => {
    setLoading(true)
    const result = await getVehiclesList({
      search: search || undefined,
      status: statusFilter as VehicleStatus | "all",
      page,
      perPage,
    })

    if (result.success) {
      setVehicles(result.vehicles)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    }
    setLoading(false)
  }, [search, statusFilter, page, perPage])

  useEffect(() => {
    loadVehicles()
  }, [loadVehicles])

  // Handlers
  const handleResetFilters = () => {
    setSearch("")
    setStatusFilter("all")
    setPage(1)
  }

  const handleExportCSV = async () => {
    const result = await exportVehiclesToCSV({
      search: search || undefined,
      status: statusFilter as VehicleStatus | "all",
    })

    if (result.success && result.csv) {
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `annonces-${new Date().toISOString().split("T")[0]}.csv`
      link.click()
    }
  }

  // Actions individuelles
  const handleDuplicate = async (id: string) => {
    setActionLoading(id)
    const result = await duplicateVehicleAction(id)
    if (result.success) {
      toast({ title: "Annonce dupliquée", description: "Redirection vers le brouillon...", variant: "success" })
      router.push(`/${locale}/admin/annonces/${result.vehicleId}`)
    } else {
      toast({ title: "Erreur", description: result.error || "Erreur lors de la duplication", variant: "destructive" })
    }
    setActionLoading(null)
  }

  const handleMarkAsSold = async (id: string) => {
    setActionLoading(id)
    const result = await markAsSoldAction(id)
    if (result.success) {
      toast({ title: "Marqué comme vendu", variant: "success" })
      loadVehicles()
    } else {
      toast({ title: "Erreur", description: result.error || "Erreur lors du changement de statut", variant: "destructive" })
    }
    setActionLoading(null)
  }

  const confirmDelete = async () => {
    if (!vehicleToDelete) return
    setActionLoading(vehicleToDelete)
    const result = await deleteVehicleAction(vehicleToDelete)
    if (result.success) {
      toast({ title: "Annonce supprimée", variant: "success" })
      setVehicleToDelete(null)
      loadVehicles()
    } else {
      toast({ title: "Erreur", description: result.error || "Erreur lors de la suppression", variant: "destructive" })
    }
    setActionLoading(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Gestion des annonces
          </h1>
          <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-ar-gold to-transparent rounded-full" />
        </div>
        <Link href={`/${locale}/admin/annonces/nouvelle`}>
          <Button className="group relative overflow-hidden bg-gradient-to-r from-ar-gold via-ar-gold-light to-ar-gold hover:from-ar-gold-light hover:via-ar-gold hover:to-ar-gold-light text-ar-black font-bold shadow-lg shadow-ar-gold/20 hover:shadow-xl hover:shadow-ar-gold/30 hover:-translate-y-0.5 transition-all duration-300">
            <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Plus className="relative h-4 w-4 mr-2" />
            <span className="relative">Nouvelle annonce</span>
          </Button>
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 backdrop-blur-sm p-3 sm:p-5 rounded-xl border border-ar-gold/10 shadow-lg shadow-ar-gold/5">
        <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ar-gold/50" />
          <Input
            placeholder="Marque, modèle, année..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
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

        <Button
          variant="outline"
          onClick={handleExportCSV}
          className="border-ar-gold/20 text-gray-400 hover:text-ar-gold hover:border-ar-gold/40 hover:bg-ar-gold/5 transition-all duration-300"
        >
          <Download className="h-4 w-4 mr-2" />
          CSV
        </Button>
      </div>

      {/* Grille de cartes */}
      {loading ? (
        <div className="grid gap-3 sm:gap-5 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl bg-ar-gold/5" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed"
          style={{ borderColor: "rgba(201,168,76,0.2)", background: "rgba(201,168,76,0.03)" }}
        >
          <div className="w-16 h-16 rounded-full bg-ar-gold/10 flex items-center justify-center mb-4">
            <Car className="h-8 w-8 text-ar-gold/50" />
          </div>
          <p className="text-gray-400 mb-4">Aucune annonce trouvée</p>
          <Link href={`/${locale}/admin/annonces/nouvelle`}>
            <Button size="sm" className="bg-ar-gold text-ar-black hover:bg-ar-gold-light font-bold">
              <Plus className="h-4 w-4 mr-2" />
              Créer la première annonce
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-5 sm:grid-cols-2">
          {vehicles.map((vehicle) => {
            const cfg = STATUS_CONFIG[vehicle.status] ?? STATUS_CONFIG.brouillon
            const isActing = actionLoading === vehicle.id
            return (
              <div
                key={vehicle.id}
                className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-ar-gold/10"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {/* Photo */}
                <div className="relative aspect-[16/9] overflow-hidden bg-ar-dark/50">
                  {vehicle.coverPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={vehicle.coverPhoto}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="h-10 w-10" style={{ color: "rgba(201,168,76,0.15)" }} />
                    </div>
                  )}
                  {/* Badge statut */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.bgColor} ${cfg.color} ${cfg.borderColor}`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  {/* Overlay gradient */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(to top, rgba(10,10,10,0.6) 0%, transparent 50%)" }}
                  />
                </div>

                {/* Infos */}
                <div className="flex flex-col flex-1 p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-white leading-tight truncate">
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {vehicle.year}
                        {vehicle.fuel ? ` · ${vehicle.fuel}` : ""}
                        {vehicle.transmission ? ` · ${vehicle.transmission}` : ""}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-lg leading-tight" style={{ color: "#C9A84C" }}>
                        {formatPrice(vehicle.price)}
                      </p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>/vente</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div
                    className="flex items-center gap-3 pt-3 mb-4"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      <Eye className="h-3 w-3" />
                      {vehicle.views_count ?? 0} vue{(vehicle.views_count ?? 0) > 1 ? "s" : ""}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      <Car className="h-3 w-3" />
                      {formatMileage(vehicle.mileage)}
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex items-center gap-2 mt-auto">
                    {/* Modifier — bouton principal */}
                    <button
                      onClick={() => router.push(`/${locale}/admin/annonces/${vehicle.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:shadow-lg hover:shadow-ar-gold/20 hover:brightness-110 active:scale-95"
                      style={{ background: "linear-gradient(135deg, #C9A84C, #e0c068)", color: "#0A0A0A" }}
                      title="Modifier"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Modifier
                    </button>

                    {/* Voir public */}
                    {vehicle.status === "publie" && vehicle.slug ? (
                      <Link
                        href={`/${locale}/vehicules/${vehicle.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "rgba(255,255,255,0.6)",
                        }}
                        title="Voir sur le site"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="flex items-center justify-center w-10 h-10 rounded-xl opacity-30 cursor-not-allowed"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "rgba(255,255,255,0.6)",
                        }}
                        title="Non publié"
                      >
                        <EyeOff className="h-4 w-4" />
                      </button>
                    )}

                    {/* Marquer vendu */}
                    {vehicle.status !== "vendu" ? (
                      <button
                        onClick={() => handleMarkAsSold(vehicle.id)}
                        disabled={isActing}
                        className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          color: "#f87171",
                        }}
                        title="Marquer vendu"
                      >
                        {isActing
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <ShoppingCart className="h-4 w-4" />
                        }
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex items-center justify-center w-10 h-10 rounded-xl opacity-30 cursor-not-allowed"
                        style={{
                          background: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.15)",
                          color: "rgba(239,68,68,0.7)",
                        }}
                        title="Déjà vendu"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    )}

                    {/* Supprimer */}
                    <button
                      onClick={() => setVehicleToDelete(vehicle.id)}
                      disabled={isActing}
                      className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                      style={{
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.15)",
                        color: "rgba(239,68,68,0.7)",
                      }}
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Affichage {Math.min((page - 1) * perPage + 1, total)}-{Math.min(page * perPage, total)}{" "}
            sur {total} annonces
          </span>
          <Select
            value={perPage.toString()}
            onValueChange={(v) => {
              setPerPage(Number(v))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[100px] bg-ar-dark/50 border-ar-gold/20 text-white focus:border-ar-gold/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-ar-gray border-ar-gold/20">
              <SelectItem value="10" className="text-gray-300 focus:bg-ar-gold/10 focus:text-ar-gold">10</SelectItem>
              <SelectItem value="20" className="text-gray-300 focus:bg-ar-gold/10 focus:text-ar-gold">20</SelectItem>
              <SelectItem value="50" className="text-gray-300 focus:bg-ar-gold/10 focus:text-ar-gold">50</SelectItem>
              <SelectItem value="100" className="text-gray-300 focus:bg-ar-gold/10 focus:text-ar-gold">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

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

      {/* Dialog confirmation suppression */}
      <Dialog open={!!vehicleToDelete} onOpenChange={(open) => !open && setVehicleToDelete(null)}>
        <DialogContent className="bg-gradient-to-br from-ar-gray to-ar-dark border-ar-gold/20 text-white backdrop-blur-xl shadow-2xl shadow-ar-gold/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Êtes-vous sûr de vouloir supprimer cette annonce ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setVehicleToDelete(null)}
              className="border-ar-gold/20 text-gray-300 hover:text-white hover:border-ar-gold/40 hover:bg-ar-gold/5"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={!!actionLoading}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/20"
            >
              {actionLoading ? "Suppression..." : "Supprimer définitivement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
