"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Users,
  Plus,
  MoreVertical,
  Mail,
  UserCheck,
  UserX,
  Shield,
  User,
  Search,
  Loader2,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"
import { getCollaborators, toggleCollaboratorStatus, changeCollaboratorRole, deleteCollaborator } from "../actions"
import { toast } from "@/hooks/use-toast"

interface Collaborateur {
  id: string
  email: string
  full_name: string | null
  role: "admin" | "collaborateur"
  is_active: boolean
  created_at: string
  last_sign_in_at: string | null
  vehicleCount: number
}

interface CollaborateursPageProps {
  params: { locale: string }
}

export default function CollaborateursPage({ params }: CollaborateursPageProps) {
  const { locale } = params
  const [collaborators, setCollaborators] = useState<Collaborateur[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [collaboratorToDelete, setCollaboratorToDelete] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteName, setInviteName] = useState("")
  const [invitePassword, setInvitePassword] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "collaborateur">("collaborateur")
  const [isInviting, setIsInviting] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const loadCollaborators = useCallback(async () => {
    setLoading(true)
    const result = await getCollaborators()
    if (result.success) {
      setCollaborators(result.collaborators as Collaborateur[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadCollaborators()
  }, [loadCollaborators])

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setIsActionLoading(true)
    const result = await toggleCollaboratorStatus(userId, !currentStatus)
    if (result.success) {
      toast({ title: !currentStatus ? "Compte activé" : "Compte désactivé", variant: "success" })
      loadCollaborators()
    } else {
      toast({ title: "Erreur", description: result.error, variant: "destructive" })
    }
    setIsActionLoading(false)
  }

  const handleChangeRole = async (userId: string, currentRole: "admin" | "collaborateur") => {
    const newRole = currentRole === "admin" ? "collaborateur" : "admin"
    setIsActionLoading(true)
    const result = await changeCollaboratorRole(userId, newRole)
    if (result.success) {
      toast({ title: `Rôle changé en ${newRole}`, variant: "success" })
      loadCollaborators()
    } else {
      toast({ title: "Erreur", description: result.error, variant: "destructive" })
    }
    setIsActionLoading(false)
  }

  const handleDeleteConfirm = async () => {
    if (!collaboratorToDelete) return
    setIsActionLoading(true)
    const result = await deleteCollaborator(collaboratorToDelete)
    if (result.success) {
      toast({ title: "Collaborateur supprimé", variant: "success" })
      setShowDeleteConfirm(false)
      setCollaboratorToDelete(null)
      loadCollaborators()
    } else {
      toast({ title: "Erreur", description: result.error, variant: "destructive" })
    }
    setIsActionLoading(false)
  }

  const handleInvite = async () => {
    if (!inviteEmail || !invitePassword) return
    if (invitePassword.length < 8) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 8 caractères", variant: "destructive" })
      return
    }
    setIsInviting(true)
    try {
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, password: invitePassword, full_name: inviteName || undefined }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Erreur lors de la création")
      toast({ title: "Collaborateur créé", description: `Le compte ${inviteEmail} est prêt`, variant: "success" })
      setShowInviteModal(false)
      setInviteEmail("")
      setInviteName("")
      setInvitePassword("")
      loadCollaborators()
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" })
    } finally {
      setIsInviting(false)
    }
  }

  const filteredCollaborators = collaborators.filter(
    (c) =>
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-ar-gold/20 flex items-center justify-center">
            <Users className="h-6 w-6 text-ar-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Gestion des collaborateurs
            </h1>
            <p className="text-ar-silver/60">
              {collaborators.length} collaborateur(s)
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowInviteModal(true)}
          className="bg-ar-gold hover:bg-ar-gold-dark text-black font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Créer un collaborateur
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ar-silver/40" />
          <Input
            placeholder="Rechercher un collaborateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-ar-gray border-ar-gray-700/50 text-white placeholder:text-ar-silver/30"
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-ar-gray rounded-lg border border-ar-gray-700/30 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-ar-gray-700/30 hover:bg-transparent">
              <TableHead className="text-ar-silver/60">Collaborateur</TableHead>
              <TableHead className="text-ar-silver/60">Rôle</TableHead>
              <TableHead className="text-ar-silver/60">Statut</TableHead>
              <TableHead className="text-ar-silver/60">Annonces</TableHead>
              <TableHead className="text-ar-silver/60">Dernière connexion</TableHead>
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
            ) : filteredCollaborators.length === 0 ? (
              <TableRow className="border-ar-gray-700/30">
                <TableCell colSpan={6} className="text-center py-12">
                  <Users className="h-12 w-12 text-ar-silver/30 mx-auto mb-4" />
                  <p className="text-ar-silver/60">Aucun collaborateur trouvé</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredCollaborators.map((collab) => (
                <TableRow
                  key={collab.id}
                  className="border-ar-gray-700/30 hover:bg-ar-black/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-ar-gray-700 flex items-center justify-center">
                        <User className="h-5 w-5 text-ar-silver/60" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {collab.full_name || "-"}
                        </p>
                        <p className="text-sm text-ar-silver/40">{collab.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        collab.role === "admin"
                          ? "bg-ar-gold/20 text-ar-gold border-ar-gold/50"
                          : "bg-ar-silver/10 text-ar-silver border-ar-silver/30"
                      }
                    >
                      {collab.role === "admin" ? (
                        <Shield className="h-3 w-3 mr-1" />
                      ) : (
                        <User className="h-3 w-3 mr-1" />
                      )}
                      {collab.role === "admin" ? "Admin" : "Collaborateur"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        collab.is_active
                          ? "bg-ar-success/20 text-ar-success border-ar-success/50"
                          : "bg-ar-danger/20 text-ar-danger border-ar-danger/50"
                      }
                    >
                      {collab.is_active ? (
                        <UserCheck className="h-3 w-3 mr-1" />
                      ) : (
                        <UserX className="h-3 w-3 mr-1" />
                      )}
                      {collab.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">
                    {collab.vehicleCount} annonces
                  </TableCell>
                  <TableCell className="text-ar-silver/60">
                    {collab.last_sign_in_at
                      ? new Date(collab.last_sign_in_at).toLocaleDateString(
                          "fr-FR"
                        )
                      : "Jamais"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4 text-ar-silver/60" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-ar-gray border-ar-gray-700/50"
                      >
                        <DropdownMenuItem
                          asChild
                          className="text-white hover:text-ar-gold cursor-pointer"
                        >
                          <a href={`mailto:${collab.email}`}>
                            <Mail className="h-4 w-4 mr-2" />
                            Envoyer un email
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleChangeRole(collab.id, collab.role)}
                          disabled={isActionLoading}
                          className="text-white hover:text-ar-gold cursor-pointer"
                        >
                          {collab.role === "admin" ? (
                            <>
                              <User className="h-4 w-4 mr-2" />
                              Passer collaborateur
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4 mr-2" />
                              Passer admin
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(collab.id, collab.is_active)}
                          disabled={isActionLoading}
                          className="text-white hover:text-ar-gold cursor-pointer"
                        >
                          {collab.is_active ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Désactiver
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activer
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-ar-gray-700/50" />
                        <DropdownMenuItem
                          onClick={() => { setCollaboratorToDelete(collab.id); setShowDeleteConfirm(true) }}
                          disabled={isActionLoading}
                          className="text-ar-danger hover:text-ar-danger/80 hover:bg-ar-danger/10 cursor-pointer focus:bg-ar-danger/10 focus:text-ar-danger/80"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog suppression collaborateur */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-ar-gray border-ar-gray-700/50 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-ar-danger/10 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-ar-danger" />
              </div>
              Supprimer le collaborateur
            </DialogTitle>
            <DialogDescription className="text-ar-silver/60">
              Cette action est irréversible. Le compte sera définitivement supprimé.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => { setShowDeleteConfirm(false); setCollaboratorToDelete(null) }}
              className="border-ar-gray-700/50 text-ar-gray-300"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isActionLoading}
              className="bg-ar-danger hover:bg-ar-danger/80"
            >
              {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal créer collaborateur */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="bg-ar-gray border-ar-gray-700/50 text-white">
          <DialogHeader>
            <DialogTitle>Créer un collaborateur</DialogTitle>
            <DialogDescription className="text-ar-silver/60">
              Le collaborateur pourra se connecter immédiatement avec ces identifiants.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="Jean Dupont"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="bg-ar-black border-ar-gray-700/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="collaborateur@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-ar-black border-ar-gray-700/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe temporaire</Label>
              <Input
                id="password"
                type="text"
                placeholder="Min. 8 caractères"
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                className="bg-ar-black border-ar-gray-700/50 font-mono"
              />
              <p className="text-xs text-ar-silver/40">
                Communiquez ce mot de passe au collaborateur. Il pourra le modifier dans son profil.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select
                value={inviteRole}
                onValueChange={(v) =>
                  setInviteRole(v as "admin" | "collaborateur")
                }
              >
                <SelectTrigger className="bg-ar-black border-ar-gray-700/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collaborateur">Collaborateur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInviteModal(false)}
              className="border-ar-gray-700/50"
            >
              Annuler
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail || !invitePassword || invitePassword.length < 8 || isInviting}
              className="bg-ar-gold text-black hover:bg-ar-gold-light"
            >
              {isInviting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Créer le compte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
