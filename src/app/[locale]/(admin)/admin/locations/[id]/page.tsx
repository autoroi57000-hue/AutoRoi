"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  FileText,
  Send,
  RefreshCw,
  Calendar,
  User,
  Car,
  CreditCard,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Banknote,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  getRentalDetail,
  updateRentalStatus,
  updateRentalNotes,
  regenerateContract,
  sendManualReminder,
  markDepositPaid,
} from "../actions"
import { toast } from "@/hooks/use-toast"
import type { RentalStatus } from "@/types/rental"
import dynamic from "next/dynamic"
import ClientProfileModal from "@/components/admin/ClientProfileModal"

const ContractPreviewModal = dynamic(
  () => import("@/components/admin/ContractPreviewModal"),
  { ssr: false }
)

interface RentalDetailPageProps {
  params: { locale: string; id: string }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  pending: { label: "En attente", color: "text-ar-gold", bgColor: "bg-ar-gold/10", borderColor: "border-ar-gold/30" },
  deposit_paid: { label: "Acompte payé", color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30" },
  confirmed: { label: "Confirmé", color: "text-green-400", bgColor: "bg-green-500/10", borderColor: "border-green-500/30" },
  in_progress: { label: "En cours", color: "text-purple-400", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/30" },
  completed: { label: "Terminé", color: "text-gray-300", bgColor: "bg-gray-500/10", borderColor: "border-gray-500/30" },
  cancelled: { label: "Annulé", color: "text-red-400", bgColor: "bg-red-500/10", borderColor: "border-red-500/30" },
  no_show: { label: "No show", color: "text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/30" },
}

export default function RentalDetailPage({ params }: RentalDetailPageProps) {
  const { locale, id } = params
  const router = useRouter()

  const [rental, setRental] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [clientModalOpen, setClientModalOpen] = useState(false)
  const [contractModalOpen, setContractModalOpen] = useState(false)

  const loadRental = async () => {
    setLoading(true)
    const result = await getRentalDetail(id)
    if (result.success && result.rental) {
      setRental(result.rental)
      setNotes(result.rental.internal_notes ?? "")
    } else {
      toast({ title: "Erreur", description: "Réservation introuvable", variant: "destructive" })
      router.push(`/${locale}/admin/locations`)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadRental()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleSaveNotes = async () => {
    setActionLoading(true)
    const result = await updateRentalNotes(id, notes)
    if (result.success) {
      toast({ title: "Notes sauvegardées", variant: "success" })
    } else {
      toast({ title: "Erreur", description: "Impossible de sauvegarder les notes", variant: "destructive" })
    }
    setActionLoading(false)
  }

  const handleStatusChange = async () => {
    if (!newStatus) return
    setActionLoading(true)
    const result = await updateRentalStatus(id, newStatus as RentalStatus)
    if (result.success) {
      toast({ title: "Statut mis à jour", variant: "success" })
      setShowStatusConfirm(false)
      loadRental()
    } else {
      toast({ title: "Erreur", description: result.error || "Impossible de mettre à jour le statut", variant: "destructive" })
    }
    setActionLoading(false)
  }

  const handleRegenerateContract = async () => {
    setActionLoading(true)
    const result = await regenerateContract(id)
    if (result.success) {
      toast({ title: "Contrat régénéré", description: "Le PDF a été recréé et envoyé au client.", variant: "success" })
      loadRental()
    } else {
      toast({ title: "Erreur", description: result.error || "Impossible de régénérer le contrat", variant: "destructive" })
    }
    setActionLoading(false)
  }

  const handleSendReminder = async () => {
    setActionLoading(true)
    const result = await sendManualReminder(id)
    if (result.success) {
      toast({ title: "Rappel envoyé", variant: "success" })
    } else {
      toast({ title: "Erreur", description: result.error || "Impossible d'envoyer le rappel", variant: "destructive" })
    }
    setActionLoading(false)
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n)

  const cfg = rental ? (STATUS_CONFIG[rental.status] ?? STATUS_CONFIG.pending) : null

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 bg-ar-gold/5" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 bg-ar-gold/5 lg:col-span-2" />
          <Skeleton className="h-64 bg-ar-gold/5" />
        </div>
      </div>
    )
  }

  if (!rental) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/admin/locations`}>
            <Button variant="ghost" size="icon" className="hover:bg-ar-gold/10 hover:text-ar-gold">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{rental.reference}</h1>
              {cfg && (
                <Badge variant="outline" className={`${cfg.bgColor} ${cfg.color} ${cfg.borderColor}`}>
                  {cfg.label}
                </Badge>
              )}
            </div>
            <p className="text-gray-400 text-sm mt-0.5">
              Créée le {formatDate(rental.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {rental.contract_url && (
            <a href={rental.contract_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-ar-gold/30 text-ar-gold hover:bg-ar-gold/10">
                <FileText className="h-4 w-4 mr-2" />
                Contrat PDF
              </Button>
            </a>
          )}
          {["deposit_paid", "confirmed"].includes(rental.status) && (
            <Button
              variant="outline"
              onClick={handleSendReminder}
              disabled={actionLoading}
              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            >
              <Send className="h-4 w-4 mr-2" />
              Envoyer rappel
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setContractModalOpen(true)}
            className="border-ar-gold/30 text-ar-gold hover:bg-ar-gold/10"
          >
            <FileText className="h-4 w-4 mr-2" />
            Générer contrat
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Infos client */}
          <div className="bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 rounded-xl border border-ar-gold/10 p-6 shadow-lg shadow-ar-gold/5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="h-5 w-5 text-ar-gold" />
                Client
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setClientModalOpen(true)}
                className="border-ar-gold/30 text-ar-gold hover:bg-ar-gold/10 text-xs"
              >
                <User className="h-3.5 w-3.5 mr-1.5" />
                Voir fiche complète
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Nom</p>
                <p className="text-white font-medium">{rental.client_first_name} {rental.client_last_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-white">{rental.client_email}</p>
              </div>
              {rental.client_phone && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                  <p className="text-white">{rental.client_phone}</p>
                </div>
              )}
              {rental.client_address && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Adresse</p>
                  <p className="text-white text-sm">{rental.client_address}</p>
                </div>
              )}
              {rental.client_license_number && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Permis</p>
                  <p className="text-white">{rental.client_license_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Véhicule & dates */}
          <div className="bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 rounded-xl border border-ar-gold/10 p-6 shadow-lg shadow-ar-gold/5 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Car className="h-5 w-5 text-ar-gold" />
              Véhicule & Réservation
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-xs text-gray-500 mb-1">Véhicule</p>
                <p className="text-white font-bold text-lg">
                  {rental.rental_vehicle?.brand} {rental.rental_vehicle?.model} {rental.rental_vehicle?.year}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Prise en charge
                </p>
                <p className="text-white font-medium">
                  {formatDate(rental.start_date)} à {rental.pickup_time || "09:00"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Restitution
                </p>
                <p className="text-white font-medium">
                  {formatDate(rental.end_date)} à {rental.return_time || "18:00"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Durée</p>
                <p className="text-white">{rental.total_days} jours</p>
              </div>
              {rental.pickup_location && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Lieu de prise en charge</p>
                  <p className="text-white text-sm">{rental.pickup_location}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tarification */}
          <div className="bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 rounded-xl border border-ar-gold/10 p-6 shadow-lg shadow-ar-gold/5 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-ar-gold" />
              Tarification
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Prix de base</span>
                <span className="text-white">{formatPrice(rental.subtotal ?? 0)}</span>
              </div>
              {rental.options_total > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Options</span>
                  <span className="text-white">{formatPrice(rental.options_total)}</span>
                </div>
              )}
              {rental.surcharge_total > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Suppléments (WE/fériés)</span>
                  <span className="text-white">{formatPrice(rental.surcharge_total)}</span>
                </div>
              )}
              <div className="border-t border-ar-gold/10 pt-2 mt-2 flex justify-between font-bold">
                <span className="text-gray-300">Total TTC</span>
                <span className="text-ar-gold text-lg">{formatPrice(rental.total_amount)}</span>
              </div>
              <div className="flex justify-between text-sm pt-1">
                <span className="text-gray-400">Acompte demandé</span>
                <span className="text-white">{formatPrice(rental.deposit_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Acompte payé</span>
                <span className={rental.deposit_paid ? "text-green-400 font-bold" : "text-gray-400"}>
                  {rental.deposit_paid ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Oui
                    </span>
                  ) : "Non"}
                </span>
              </div>
            </div>

            {/* Options sélectionnées */}
            {Array.isArray(rental.selected_options) && rental.selected_options.length > 0 && (
              <div className="mt-4 pt-4 border-t border-ar-gold/10">
                <p className="text-xs text-gray-500 mb-2">Options incluses</p>
                <div className="flex flex-wrap gap-2">
                  {rental.selected_options.map((opt: any, i: number) => (
                    <Badge key={i} variant="outline" className="bg-ar-gold/5 text-ar-gold border-ar-gold/20 text-xs">
                      {opt.name ?? opt.option_id}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Changer le statut */}
          <div className="bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 rounded-xl border border-ar-gold/10 p-6 shadow-lg shadow-ar-gold/5 backdrop-blur-sm">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              Changer le statut
            </h2>
            <Select
              value={newStatus || rental.status}
              onValueChange={(v) => { setNewStatus(v); setShowStatusConfirm(true) }}
            >
              <SelectTrigger className="bg-ar-dark/50 border-ar-gold/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-ar-gray border-ar-gold/20">
                {Object.entries(STATUS_CONFIG).map(([key, scfg]) => (
                  <SelectItem key={key} value={key} className="text-gray-300 focus:bg-ar-gold/10 focus:text-ar-gold">
                    {scfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Paiement */}
          <div className="bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 rounded-xl border border-ar-gold/10 p-6 shadow-lg shadow-ar-gold/5 backdrop-blur-sm">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Paiement</h2>
            <div className="space-y-3 text-sm">
              {/* Montants */}
              <div className="space-y-2 pb-3 border-b border-ar-gold/10">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total TTC</span>
                  <span className="text-white font-bold">
                    {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(rental.total_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Acompte</span>
                  <span className={rental.deposit_paid ? "text-green-400 font-bold" : "text-ar-gold font-bold"}>
                    {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(rental.deposit_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Solde restant</span>
                  <span className="text-white font-bold">
                    {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(rental.total_amount - rental.deposit_amount)}
                  </span>
                </div>
              </div>

              {/* Statut paiement */}
              <div className="flex items-center gap-2">
                {rental.deposit_paid ? (
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-ar-gold flex-shrink-0" />
                )}
                <span className={rental.deposit_paid ? "text-green-400" : "text-ar-gold"}>
                  {rental.deposit_paid ? "Acompte encaissé" : "En attente de paiement"}
                </span>
              </div>
              {rental.deposit_paid_at && (
                <p className="text-gray-500 text-xs ml-6">
                  Payé le {new Date(rental.deposit_paid_at).toLocaleString("fr-FR")}
                </p>
              )}
              {rental.stripe_payment_intent_id && (
                <p className="text-gray-600 text-xs ml-6 font-mono break-all">
                  {rental.stripe_payment_intent_id}
                </p>
              )}

              {/* Bouton marquer comme payé */}
              {!rental.deposit_paid && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2 border-green-500/30 text-green-400 hover:bg-green-500/10"
                  disabled={actionLoading}
                  onClick={async () => {
                    setActionLoading(true)
                    const result = await markDepositPaid(rental.id)
                    if (result.success) {
                      toast({ title: "Acompte marqué comme payé", variant: "success" })
                      loadRental()
                    } else {
                      toast({ title: "Erreur", description: result.error, variant: "destructive" })
                    }
                    setActionLoading(false)
                  }}
                >
                  <Banknote className="h-4 w-4 mr-2" />
                  Marquer l&apos;acompte comme payé
                </Button>
              )}
            </div>
          </div>

          {/* Contrat */}
          <div className="bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 rounded-xl border border-ar-gold/10 p-6 shadow-lg shadow-ar-gold/5 backdrop-blur-sm">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Contrat</h2>
            {rental.contract_url ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  Contrat généré
                </div>
                {rental.contract_generated_at && (
                  <p className="text-gray-500 text-xs ml-6">
                    {new Date(rental.contract_generated_at).toLocaleString("fr-FR")}
                  </p>
                )}
                <a href={rental.contract_url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="w-full mt-2 border-ar-gold/30 text-ar-gold hover:bg-ar-gold/10">
                    <FileText className="h-4 w-4 mr-2" />
                    Télécharger PDF
                  </Button>
                </a>
              </div>
            ) : (
              <div className="text-gray-400 text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-ar-gold" />
                Pas encore généré
              </div>
            )}
          </div>

          {/* Notes admin */}
          <div className="bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 rounded-xl border border-ar-gold/10 p-6 shadow-lg shadow-ar-gold/5 backdrop-blur-sm">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Notes internes
            </h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes visibles uniquement par l'admin..."
              className="bg-ar-dark/50 border-ar-gold/20 text-white placeholder:text-gray-600 min-h-[100px] resize-none"
            />
            <Button
              size="sm"
              onClick={handleSaveNotes}
              disabled={actionLoading}
              className="w-full mt-3 bg-ar-gold text-ar-black hover:bg-ar-gold-light font-bold"
            >
              Sauvegarder
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog confirmation changement de statut */}
      <Dialog open={showStatusConfirm} onOpenChange={setShowStatusConfirm}>
        <DialogContent className="bg-gradient-to-br from-ar-gray to-ar-dark border-ar-gold/20 text-white backdrop-blur-xl shadow-2xl shadow-ar-gold/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-ar-gold/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-ar-gold" />
              </div>
              Confirmer le changement
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Passer la réservation en statut{" "}
              <span className="text-ar-gold font-bold">
                {STATUS_CONFIG[newStatus]?.label}
              </span>{" "}
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => { setShowStatusConfirm(false); setNewStatus("") }}
              className="border-ar-gold/20 text-gray-300 hover:text-white hover:border-ar-gold/40 hover:bg-ar-gold/5"
            >
              Annuler
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={actionLoading}
              className="bg-ar-gold text-ar-black hover:bg-ar-gold-light font-bold"
            >
              {actionLoading ? "En cours..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Profile Modal */}
      <ClientProfileModal
        open={clientModalOpen}
        onOpenChange={setClientModalOpen}
        clientEmail={rental?.client_email ?? null}
        locale={locale}
        onGenerateContract={(rid) => {
          setClientModalOpen(false)
          setContractModalOpen(true)
        }}
      />

      {/* Contract Preview Modal */}
      <ContractPreviewModal
        open={contractModalOpen}
        onOpenChange={setContractModalOpen}
        rentalId={id}
        onContractGenerated={loadRental}
      />
    </div>
  )
}
