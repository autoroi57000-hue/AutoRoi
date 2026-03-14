"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Filter,
  X,
  Plus,
  Eye,
  EyeOff,
  Calendar,
  Loader2,
  Zap,
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
import { Badge } from "@/components/ui/badge"
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
  getRentalVehiclesList,
  deleteRentalVehicle,
  toggleRentalVehicleStatus,
} from "./actions"
import { toast } from "@/hooks/use-toast"
import type { RentalVehicleStatus } from "@/types/rental"
import { localePath } from '@/lib/constants'

interface VehiculesPageProps {
  params: { locale: string }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  disponible: { label: "Disponible", color: "text-green-400", bgColor: "bg-green-500/10", borderColor: "border-green-500/30" },
  loue: { label: "Loué", color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30" },
  maintenance: { label: "Maintenance", color: "text-ar-gold", bgColor: "bg-ar-gold/10", borderColor: "border-ar-gold/30" },
  indisponible: { label: "Indisponible", color: "text-red-400", bgColor: "bg-red-500/10", borderColor: "border-red-500/30" },
}

export default function VehiculesPage({ params }: VehiculesPageProps) {
  const { locale } = params
  const router = useRouter()

  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage] = useState(20)
  const [totalPages, setTotalPages] = useState(0)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null)

  const loadVehicles = useCallback(async () => {
    setLoading(true)
    const result = await getRentalVehiclesList({
      status: statusFilter !== "all" ? statusFilter : undefined,
      page,
      perPage,
    })
    if (result.success) {
      // client-side search filter (server doesn't have search yet)
      const filtered = search
        ? result.vehicles.filter((v: any) =>
            `${v.brand} ${v.model} ${v.year}`.toLowerCase().includes(search.toLowerCase())
          )
        : result.vehicles
      setVehicles(filtered)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    }
    setLoading(false)
  }, [statusFilter, page, perPage, search])

  useEffect(() => {
    loadVehicles()
  }, [loadVehicles])

  const handleToggleStatus = async (id: string, current: RentalVehicleStatus) => {
    const next: RentalVehicleStatus = current === "disponible" ? "indisponible" : "disponible"
    setActionLoading(id)
    const result = await toggleRentalVehicleStatus(id, next)
    if (result.success) {
      toast({ title: `Véhicule marqué ${STATUS_CONFIG[next]?.label}`, variant: "success" })
      loadVehicles()
    } else {
      toast({ title: "Erreur", description: result.error, variant: "destructive" })
    }
    setActionLoading(null)
  }

  const confirmDelete = async () => {
    if (!vehicleToDelete) return
    setActionLoading(vehicleToDelete)
    const result = await deleteRentalVehicle(vehicleToDelete)
    if (result.success) {
      toast({ title: "Véhicule supprimé", variant: "success" })
      setVehicleToDelete(null)
      loadVehicles()
    } else {
      toast({ title: "Impossible de supprimer", description: result.error, variant: "destructive" })
    }
    setActionLoading(null)
  }

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Flotte location
          </h1>
          <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-ar-gold to-transparent rounded-full" />
        </div>
        <Link href={`${localePath(locale, '/admin/locations/vehicules/nouveau')}`}>
          <Button className="group relative overflow-hidden bg-gradient-to-r from-ar-gold via-ar-gold-light to-ar-gold hover:from-ar-gold-light hover:via-ar-gold hover:to-ar-gold-light text-ar-black font-bold shadow-lg shadow-ar-gold/20 hover:shadow-xl hover:shadow-ar-gold/30 hover:-translate-y-0.5 transition-all duration-300">
            <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Plus className="relative h-4 w-4 mr-2" />
            <span className="relative">Ajouter un véhicule</span>
          </Button>
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 items-center bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 backdrop-blur-sm p-5 rounded-xl border border-ar-gold/10 shadow-lg shadow-ar-gold/5">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ar-gold/50" />
          <Input
            placeholder="Marque, modèle, année..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-11 bg-ar-dark/50 border-ar-gold/20 focus:border-ar-gold/50 text-white placeholder:text-gray-500"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[200px] bg-ar-dark/50 border-ar-gold/20 text-white focus:border-ar-gold/50">
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
          onClick={() => { setSearch(""); setStatusFilter("all"); setPage(1) }}
          className="border-ar-gold/20 text-gray-400 hover:text-white hover:border-ar-gold/40 hover:bg-ar-gold/5"
        >
          <X className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
      </div>

      {/* Grille de cartes */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl bg-ar-gold/5" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed"
          style={{ borderColor: "rgba(201,168,76,0.2)", background: "rgba(201,168,76,0.03)" }}
        >
          <div className="w-16 h-16 rounded-full bg-ar-gold/10 flex items-center justify-center mb-4">
            <KeyRound className="h-8 w-8 text-ar-gold/50" />
          </div>
          <p className="text-gray-400 mb-4">Aucun véhicule dans la flotte</p>
          <Link href={`${localePath(locale, '/admin/locations/vehicules/nouveau')}`}>
            <Button size="sm" className="bg-ar-gold text-ar-black hover:bg-ar-gold-light font-bold">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter le premier véhicule
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vehicles.map((vehicle) => {
            const effectiveStatus = vehicle.display_status ?? vehicle.status
            const cfg = STATUS_CONFIG[effectiveStatus] ?? STATUS_CONFIG.disponible
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
                  {vehicle.cover_photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={vehicle.cover_photo}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <KeyRound className="h-10 w-10" style={{ color: "rgba(201,168,76,0.15)" }} />
                    </div>
                  )}
                  {/* Badge statut */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.bgColor} ${cfg.color} ${cfg.borderColor}`}
                    >
                      {cfg.label}
                    </span>
                    {vehicle.has_upcoming_48h && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Départ imminent
                      </span>
                    )}
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
                        {formatPrice(vehicle.price_per_day)}
                      </p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>/jour</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div
                    className="flex items-center gap-3 pt-3 mb-4"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      <Calendar className="h-3 w-3" />
                      {vehicle.total_rentals ?? 0} résa
                    </div>
                    {(vehicle.active_rentals ?? 0) > 0 && (
                      <span className="text-xs font-medium text-blue-400">
                        {vehicle.active_rentals} active{vehicle.active_rentals > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex items-center gap-2 mt-auto">
                    {/* Modifier — bouton principal */}
                    <button
                      onClick={() => router.push(`${localePath(locale, `/admin/locations/vehicules/${vehicle.id}/modifier`)}`)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:shadow-lg hover:shadow-ar-gold/20 hover:brightness-110 active:scale-95"
                      style={{ background: "linear-gradient(135deg, #C9A84C, #e0c068)", color: "#0A0A0A" }}
                      title="Modifier"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Modifier
                    </button>

                    {/* Voir public */}
                    <Link
                      href={`${localePath(locale, `/location/${vehicle.slug}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.6)",
                      }}
                      title="Voir la page publique"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>

                    {/* Toggle dispo */}
                    <button
                      onClick={() => handleToggleStatus(vehicle.id, vehicle.status)}
                      disabled={isActing}
                      className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                      style={{
                        background: vehicle.status === "disponible"
                          ? "rgba(239,68,68,0.1)"
                          : "rgba(34,197,94,0.1)",
                        border: vehicle.status === "disponible"
                          ? "1px solid rgba(239,68,68,0.2)"
                          : "1px solid rgba(34,197,94,0.2)",
                        color: vehicle.status === "disponible" ? "#f87171" : "#4ade80",
                      }}
                      title={vehicle.status === "disponible" ? "Rendre indisponible" : "Rendre disponible"}
                    >
                      {isActing
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : vehicle.status === "disponible"
                          ? <EyeOff className="h-4 w-4" />
                          : <Eye className="h-4 w-4" />
                      }
                    </button>

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
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">
            {total} véhicule{total > 1 ? "s" : ""}
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

      {/* Dialog suppression */}
      <Dialog open={!!vehicleToDelete} onOpenChange={(open) => !open && setVehicleToDelete(null)}>
        <DialogContent className="bg-gradient-to-br from-ar-gray to-ar-dark border-ar-gold/20 text-white backdrop-blur-xl shadow-2xl shadow-ar-gold/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              Supprimer le véhicule
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Cette action est irréversible. Le véhicule ne peut pas être supprimé s&apos;il possède des réservations actives.
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
