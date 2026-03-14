"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Mail,
  MessageSquare,
  Check,
  Archive,
  Eye,
  Search,
  ExternalLink,
  Loader2,
  RefreshCw,
  Phone,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getMessages, updateMessageStatus } from "../actions"
import { createClient } from "@/lib/supabase/client"
import { localePath } from '@/lib/constants'

interface Message {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  message: string
  status: "non_lu" | "lu" | "traite" | "archive"
  createdAt: string
  vehicleId: string | null
  vehicleInfo: string | null
}

interface MessagesPageProps {
  params: { locale: string }
}

const STATUS_COLORS = {
  non_lu: "bg-ar-danger/20 text-ar-danger border-ar-danger/50",
  lu: "bg-ar-gold/20 text-ar-gold border-ar-gold/50",
  traite: "bg-ar-success/20 text-ar-success border-ar-success/50",
  archive: "bg-ar-silver/10 text-ar-silver/60 border-ar-silver/20",
}

const STATUS_LABELS = {
  non_lu: "Non lu",
  lu: "Lu",
  traite: "Traité",
  archive: "Archivé",
}

export default function MessagesPage({ params }: MessagesPageProps) {
  const { locale } = params
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const loadMessages = useCallback(async () => {
    setLoading(true)
    const result = await getMessages(
      statusFilter === "all" ? undefined : statusFilter
    )
    if (result.success) {
      setMessages(result.messages as Message[])
    }
    setLoading(false)
  }, [statusFilter])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  // Supabase Realtime — écoute les nouveaux messages en temps réel
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("contact_messages_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_messages" },
        () => {
          loadMessages()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadMessages])

  const handleUpdateStatus = async (
    id: string,
    status: "lu" | "traite" | "archive"
  ) => {
    setIsUpdating(true)
    const result = await updateMessageStatus(id, status)
    if (result.success) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status } : m))
      )
      if (selectedMessage?.id === id) {
        setSelectedMessage((prev) => (prev ? { ...prev, status } : null))
      }
    }
    setIsUpdating(false)
  }

  const filteredMessages = messages.filter(
    (m) =>
      m.firstName.toLowerCase().includes(search.toLowerCase()) ||
      m.lastName.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.phone || "").toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase())
  )

  const unreadCount = messages.filter((m) => m.status === "non_lu").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-ar-gold/20 flex items-center justify-center">
            <Mail className="h-6 w-6 text-ar-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Messages de contact
            </h1>
            <p className="text-ar-silver/60">
              {unreadCount > 0 ? (
                <span className="text-ar-danger">{unreadCount} non lu(s)</span>
              ) : (
                `${messages.length} message(s)`
              )}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={loadMessages}
          className="border-ar-gray-700/50 text-ar-silver/60 hover:text-ar-gold hover:border-ar-gold/30"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ar-silver/40" />
          <Input
            placeholder="Rechercher dans les messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-ar-gray border-ar-gray-700/50 text-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-ar-gray border-ar-gray-700/50 text-white">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="non_lu">Non lus</SelectItem>
            <SelectItem value="lu">Lus</SelectItem>
            <SelectItem value="traite">Traités</SelectItem>
            <SelectItem value="archive">Archivés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tableau */}
      <div className="bg-ar-gray rounded-lg border border-ar-gray-700/30 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-ar-gray-700/30 hover:bg-transparent">
              <TableHead className="text-ar-silver/60">Expéditeur</TableHead>
              <TableHead className="text-ar-silver/60">Message</TableHead>
              <TableHead className="text-ar-silver/60">Véhicule</TableHead>
              <TableHead className="text-ar-silver/60">Statut</TableHead>
              <TableHead className="text-ar-silver/60">Date</TableHead>
              <TableHead className="text-ar-silver/60 w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-ar-gray-700/30">
                  <TableCell colSpan={6}>
                    <Skeleton className="h-12 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredMessages.length === 0 ? (
              <TableRow className="border-ar-gray-700/30">
                <TableCell colSpan={6} className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-ar-silver/30 mx-auto mb-4" />
                  <p className="text-ar-silver/60">Aucun message</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredMessages.map((message) => (
                <TableRow
                  key={message.id}
                  className={`border-ar-gray-700/30 hover:bg-ar-black/50 cursor-pointer ${
                    message.status === "non_lu" ? "bg-ar-danger/5" : ""
                  }`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">
                        {message.firstName} {message.lastName}
                      </p>
                      <p className="text-sm text-ar-silver/40">{message.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-ar-gray-300 line-clamp-2 max-w-xs">
                      {message.message}
                    </p>
                  </TableCell>
                  <TableCell>
                    {message.vehicleInfo ? (
                      <span className="text-ar-gold text-sm">
                        {message.vehicleInfo}
                      </span>
                    ) : (
                      <span className="text-ar-silver/30 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={STATUS_COLORS[message.status]}
                    >
                      {STATUS_LABELS[message.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-ar-silver/60">
                    {new Date(message.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedMessage(message)
                      }}
                    >
                      <Eye className="h-4 w-4 text-ar-silver/60" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal détail message */}
      <Dialog
        open={!!selectedMessage}
        onOpenChange={() => setSelectedMessage(null)}
      >
        <DialogContent className="bg-ar-gray border-ar-gray-700/50 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message de contact</DialogTitle>
            <DialogDescription className="text-ar-silver/60">
              Reçu le{" "}
              {selectedMessage &&
                new Date(selectedMessage.createdAt).toLocaleString("fr-FR")}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6">
              {/* Infos expéditeur */}
              <div className="bg-ar-black p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-ar-silver/40">Nom</p>
                    <p className="text-white font-medium">
                      {selectedMessage.firstName} {selectedMessage.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-ar-silver/40">Email</p>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-ar-gold hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <p className="text-sm text-ar-silver/40">Téléphone</p>
                      <a
                        href={`tel:${selectedMessage.phone}`}
                        className="text-ar-gold hover:underline flex items-center gap-1.5"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {selectedMessage.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Véhicule concerné */}
              {selectedMessage.vehicleInfo && (
                <div>
                  <p className="text-sm text-ar-silver/40 mb-2">
                    Véhicule concerné
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-white">
                      {selectedMessage.vehicleInfo}
                    </span>
                    {selectedMessage.vehicleId && (
                      <a
                        href={`${localePath(locale, `/admin/annonces/${selectedMessage.vehicleId}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 text-ar-gold" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <p className="text-sm text-ar-silver/40 mb-2">Message</p>
                <div className="bg-ar-black p-4 rounded-lg">
                  <p className="text-white whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-ar-gray-700/30">
                {selectedMessage.status !== "lu" &&
                  selectedMessage.status !== "traite" && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleUpdateStatus(selectedMessage.id, "lu")
                      }
                      disabled={isUpdating}
                      className="border-ar-gold/40 text-ar-gold hover:border-ar-gold"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Marquer lu
                    </Button>
                  )}
                {selectedMessage.status !== "traite" && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleUpdateStatus(selectedMessage.id, "traite")
                    }
                    disabled={isUpdating}
                    className="border-ar-success/40 text-ar-success hover:border-ar-success"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Marquer traité
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() =>
                    handleUpdateStatus(selectedMessage.id, "archive")
                  }
                  disabled={isUpdating}
                  className="border-ar-gray-700/50 text-ar-silver/60 hover:border-ar-silver/30"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archiver
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
