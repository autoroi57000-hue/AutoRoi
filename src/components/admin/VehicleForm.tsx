"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { useRouter, useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Car,
  Gauge,
  Palette,
  Tag,
  ClipboardCheck,
  List,
  FileText,
  Settings,
  Save,
  Send,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  ShoppingCart,
  Trash2,
  Camera,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import {
  vehicleFormSchema,
  type VehicleFormData,
  formDataToVehicleInsert,
} from "@/lib/validations/vehicle"
import type { VehicleWithAll } from "@/types/vehicle"

// Sections
import { IdentitySection } from "./vehicle-form/sections/IdentitySection"
import { EngineSection } from "./vehicle-form/sections/EngineSection"
import { BodySection } from "./vehicle-form/sections/BodySection"
import { PriceSection } from "./vehicle-form/sections/PriceSection"
import { ConditionSection } from "./vehicle-form/sections/ConditionSection"
import { FeaturesSection } from "./vehicle-form/sections/FeaturesSection"
import { DescriptionSection } from "./vehicle-form/sections/DescriptionSection"
import { StatusSection } from "./vehicle-form/sections/StatusSection"
import dynamic from "next/dynamic"

const PhotoUploader = dynamic(
  () => import("./PhotoUploader").then((m) => ({ default: m.PhotoUploader })),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-lg bg-muted" /> }
)

// Actions
import {
  createVehicleAction,
  updateVehicleAction,
  deleteVehicleAction,
  duplicateVehicleAction,
  markAsSoldAction,
} from "@/app/[locale]/(admin)/admin/annonces/actions"
import { localePath } from '@/lib/constants'

interface VehicleFormProps {
  mode: "create" | "edit"
  initialData?: VehicleWithAll
  onSuccess?: (vehicleId: string) => void
  isAdmin?: boolean
}

const SECTIONS = [
  { id: "identity", label: "Identité", icon: Car },
  { id: "engine", label: "Motorisation", icon: Gauge },
  { id: "body", label: "Carrosserie", icon: Palette },
  { id: "price", label: "Kilométrage & Prix", icon: Tag },
  { id: "condition", label: "État & CT", icon: ClipboardCheck },
  { id: "features", label: "Équipements", icon: List },
  { id: "description", label: "Description", icon: FileText },
  { id: "status", label: "Statut", icon: Settings },
  { id: "photos", label: "Photos", icon: Camera },
] as const

// Valeurs par défaut du formulaire
const defaultValues: VehicleFormData = {
  brand: "",
  model: "",
  version: "",
  year: new Date().getFullYear(),
  vehicle_type: "voiture",
  fuel: "essence",
  engine_size: null,
  power_hp: null,
  power_kw: null,
  transmission: null,
  drive: null,
  body: null,
  doors: null,
  seats: null,
  color_ext: null,
  color_int: null,
  mileage: 0,
  price: 0,
  price_negotiable: false,
  first_sale_date: null,
  condition: "bon",
  ct_status: "valide",
  ct_date: null,
  features: [],
  description_fr: "",
  description_en: "",
  status: "brouillon",
  is_featured: false,
}

export function VehicleForm({
  mode,
  initialData,
  onSuccess,
  isAdmin = false,
}: VehicleFormProps) {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || "fr"
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdVehicleId, setCreatedVehicleId] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [openSections, setOpenSections] = useState<string[]>(["identity"])

  const autoSaveRef = useRef<NodeJS.Timeout | null>(null)

  // Préparer les valeurs initiales
  const getInitialValues = useCallback((): VehicleFormData => {
    if (!initialData) return defaultValues

    return {
      brand: initialData.brand,
      model: initialData.model,
      version: initialData.version || "",
      year: initialData.year,
      vehicle_type: initialData.vehicle_type,
      fuel: initialData.fuel,
      engine_size: initialData.engine_size,
      power_hp: initialData.power_hp,
      power_kw: initialData.power_kw,
      transmission: initialData.transmission,
      drive: initialData.drive,
      body: initialData.body,
      doors: initialData.doors,
      seats: initialData.seats,
      color_ext: initialData.color_ext,
      color_int: initialData.color_int,
      mileage: initialData.mileage,
      price: initialData.price,
      price_negotiable: initialData.price_negotiable,
      first_sale_date: initialData.first_sale_date,
      condition: initialData.condition,
      ct_status: initialData.ct_status,
      ct_date: initialData.ct_date,
      features:
        initialData.vehicle_features?.map((f) => f.feature) || [],
      description_fr: initialData.description_fr || "",
      description_en: initialData.description_en || "",
      status: initialData.status,
      is_featured: initialData.is_featured,
    }
  }, [initialData])

  const methods = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema) as any,
    defaultValues: getInitialValues(),
    mode: "onChange",
  })

  const {
    handleSubmit,
    formState: { isDirty },
    watch,
  } = methods

  // Détecter les modifications
  useEffect(() => {
    setHasUnsavedChanges(isDirty)
  }, [isDirty])

  // Sauvegarde automatique en brouillon
  useEffect(() => {
    if (mode === "edit" && initialData?.id) {
      autoSaveRef.current = setInterval(async () => {
        if (isDirty && !isSubmitting) {
          await handleAutoSave()
        }
      }, 30000) // 30 secondes
    }

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current)
      }
    }
  }, [isDirty, isSubmitting, mode, initialData])

  const handleAutoSave = async () => {
    if (!initialData?.id) return

    const data = watch()
    const formData = formDataToVehicleInsert(data)

    try {
      const result = await updateVehicleAction(initialData.id, {
        ...formData,
        status: "brouillon",
      })

      if (result.success) {
        setLastSaved(new Date())
      }
    } catch (error) {
      console.error("Auto-save failed:", error)
    }
  }

  const processSubmit = async (data: VehicleFormData, publish = false) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = formDataToVehicleInsert(data)
      const status = publish ? "publie" : data.status

      if (mode === "create") {
        const result = await createVehicleAction({
          ...formData,
          status,
        })

        if (result.success && result.vehicleId) {
          setCreatedVehicleId(result.vehicleId)
          setSuccess(
            publish
              ? "Annonce publiée ! Ajoutez maintenant des photos."
              : "Brouillon sauvegardé. Vous pouvez maintenant ajouter des photos."
          )
          // Ouvrir automatiquement la section photos
          setOpenSections((prev) =>
            prev.includes("photos") ? prev : [...prev, "photos"]
          )
          // Scroll vers la section photos après un court délai
          setTimeout(() => {
            document.getElementById("section-photos")?.scrollIntoView({ behavior: "smooth", block: "start" })
          }, 300)
          if (onSuccess) {
            onSuccess(result.vehicleId)
          }
          // On reste sur la page pour permettre l'ajout de photos
        } else {
          setError(result.error || "Une erreur est survenue")
        }
      } else if (mode === "edit" && initialData?.id) {
        const result = await updateVehicleAction(initialData.id, {
          ...formData,
          status,
        })

        if (result.success) {
          setSuccess(publish ? "Annonce publiée avec succès !" : "Modifications sauvegardées")
          setHasUnsavedChanges(false)
          if (onSuccess) {
            onSuccess(initialData.id)
          } else if (publish) {
            // Si publication, redirection vers la liste après 2s
            setTimeout(() => router.push(`${localePath(locale, '/admin/annonces')}`), 2000)
          }
          // En mode brouillon, on reste sur la page
        } else {
          setError(result.error || "Une erreur est survenue")
        }
      }
    } catch (err) {
      setError("Une erreur inattendue est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDuplicate = async () => {
    if (!initialData?.id) return

    setIsSubmitting(true)
    try {
      const result = await duplicateVehicleAction(initialData.id)
      if (result.success && result.vehicleId) {
        setSuccess("Annonce dupliquée avec succès !")
        if (onSuccess) {
          onSuccess(result.vehicleId)
        } else {
          setTimeout(() => router.push(`${localePath(locale, `/admin/annonces/${result.vehicleId}`)}`), 1500)
        }
      } else {
        setError(result.error || "Erreur lors de la duplication")
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la duplication")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMarkAsSold = async () => {
    if (!initialData?.id) return

    setIsSubmitting(true)
    try {
      const result = await markAsSoldAction(initialData.id)
      if (result.success) {
        setSuccess("Véhicule marqué comme vendu !")
        if (onSuccess) {
          onSuccess(initialData.id)
        } else {
          setTimeout(() => router.push(`${localePath(locale, '/admin/annonces')}`), 1500)
        }
      } else {
        setError(result.error || "Erreur lors du changement de statut")
      }
    } catch (err) {
      setError("Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData?.id) return

    setIsSubmitting(true)
    try {
      const result = await deleteVehicleAction(initialData.id)
      if (result.success) {
        setSuccess("Annonce supprimée avec succès")
        if (onSuccess) {
          onSuccess(initialData.id)
        } else {
          setTimeout(() => router.push(`${localePath(locale, '/admin/annonces')}`), 1500)
        }
      } else {
        setError(result.error || "Erreur lors de la suppression")
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la suppression")
    } finally {
      setIsSubmitting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?"
      )
      if (!confirmed) return
    }
    window.history.back()
  }

  const onValidSubmit = (data: VehicleFormData) => {
    processSubmit(data, false)
  }

  const onPublishSubmit = (data: VehicleFormData) => {
    processSubmit(data, true)
  }

  return (
    <FormProvider {...methods}>
      <form className="relative pb-32" onSubmit={(e) => e.preventDefault()}>
        
        {/* ===== BADGES DE STATUT FLOTTANTS (discret, en haut à droite) ===== */}
        <div className="absolute top-0 right-0 z-20 flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 backdrop-blur-sm animate-pulse shadow-lg">
              <AlertCircle className="h-3 w-3 mr-1.5" />
              Non sauvegardé
            </Badge>
          )}
          {lastSaved && !hasUnsavedChanges && (
            <Badge className="bg-green-500/10 text-green-400 border border-green-500/30 backdrop-blur-sm shadow-lg">
              <CheckCircle className="h-3 w-3 mr-1.5" />
              {lastSaved.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </Badge>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 backdrop-blur-sm shadow-lg animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 backdrop-blur-sm shadow-lg animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {success}
            </div>
          </div>
        )}

        {/* Sections accordéon - Design futuriste 2027 */}
        <Accordion type="multiple" value={openSections} onValueChange={setOpenSections} className="space-y-5">
          {SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <AccordionItem
                key={section.id}
                value={section.id}
                id={`section-${section.id}`}
                className="group relative bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 backdrop-blur-xl rounded-2xl border border-ar-gold/10 overflow-hidden transition-all duration-500 hover:border-ar-gold/30 hover:shadow-xl hover:shadow-ar-gold/5"
              >
                {/* Ligne lumineuse supérieure */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ar-gold/30 to-transparent" />
                
                <AccordionTrigger className="px-6 py-5 hover:no-underline group-hover:bg-ar-gold/5 transition-all duration-300 [&[data-state=open]>div>div:first-child]:bg-ar-gold group-data-[state=open]:bg-ar-gold/5">
                  <div className="flex items-center gap-4 w-full">
                    {/* Icône avec effet lumineux */}
                    <div className="relative w-12 h-12 rounded-xl bg-ar-dark border border-ar-gold/20 flex items-center justify-center transition-all duration-300 group-hover:border-ar-gold/40 group-hover:shadow-lg group-hover:shadow-ar-gold/20">
                      <div className="absolute inset-0 bg-ar-gold/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Icon className="relative h-5 w-5 text-ar-gold transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    
                    {/* Titre */}
                    <div className="flex-1 text-left">
                      <span className="text-lg font-semibold text-white group-hover:text-ar-gold-light transition-colors duration-300 tracking-wide">
                        {section.label}
                      </span>
                    </div>
                    
                    {/* Indicateur d'état */}
                    <div className="w-2 h-2 rounded-full bg-ar-gold/30 group-data-[state=open]:bg-ar-gold group-data-[state=open]:shadow-lg group-data-[state=open]:shadow-ar-gold/50 transition-all duration-300" />
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-6 pb-6 pt-2">
                  <div className="relative pt-4 border-t border-ar-gold/10">
                    {section.id === "identity" && <IdentitySection />}
                    {section.id === "engine" && <EngineSection />}
                    {section.id === "body" && <BodySection />}
                    {section.id === "price" && <PriceSection />}
                    {section.id === "condition" && <ConditionSection />}
                    {section.id === "features" && <FeaturesSection />}
                    {section.id === "description" && <DescriptionSection />}
                    {section.id === "status" && (
                      <StatusSection
                        mode={mode}
                        initialData={initialData}
                        isAdmin={isAdmin}
                      />
                    )}
                    {section.id === "photos" && (
                      <PhotoUploader
                        vehicleId={initialData?.id || createdVehicleId || null}
                        initialPhotos={initialData?.vehicle_photos || []}
                      />
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>

        {/* ===== BARRE D'ACTIONS FLOTTANTE 2027 ===== */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-4">
          <div className="flex items-center justify-between gap-4 px-6 py-4 bg-ar-dark/80 backdrop-blur-2xl rounded-2xl border border-ar-gold/20 shadow-2xl shadow-ar-gold/20">

            {/* ── Post-création : barre simplifiée avec bouton Terminer ── */}
            {mode === "create" && createdVehicleId ? (
              <>
                <p className="text-sm text-ar-silver/70 hidden sm:block">
                  <CheckCircle className="inline h-4 w-4 text-green-400 mr-1.5 -mt-0.5" />
                  Annonce créée — ajoutez vos photos puis terminez
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => router.push(`${localePath(locale, `/admin/annonces/${createdVehicleId}`)}`)}
                  className="relative overflow-hidden bg-gradient-to-r from-ar-gold via-ar-gold-light to-ar-gold hover:from-ar-gold-light hover:via-ar-gold hover:to-ar-gold-light text-ar-black font-bold shadow-lg shadow-ar-gold/30 transition-all duration-300 hover:shadow-xl hover:shadow-ar-gold/40"
                >
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Terminer
                </Button>
              </>
            ) : (
              <>
                {/* Bouton Annuler - plus discret */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-300"
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Annuler
                </Button>

                {/* Groupe d'actions principales */}
                <div className="flex items-center gap-2">
                  {mode === "edit" && initialData && (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleDuplicate}
                        disabled={isSubmitting}
                        className="hidden sm:flex text-ar-gold/70 hover:text-ar-gold hover:bg-ar-gold/10 transition-all duration-300"
                      >
                        <Copy className="h-4 w-4 mr-1.5" />
                        Dupliquer
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isSubmitting}
                        className="hidden sm:flex text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Supprimer
                      </Button>

                      <div className="w-px h-6 bg-ar-gold/20 hidden sm:block" />
                    </>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => methods.handleSubmit(onValidSubmit)()}
                    disabled={isSubmitting}
                    className="border-ar-gold/30 bg-ar-dark/50 text-ar-gold hover:bg-ar-gold/10 hover:border-ar-gold/50 backdrop-blur-sm transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-1.5" />
                    )}
                    <span className="hidden sm:inline">Sauvegarder</span>
                    <span className="sm:hidden">Brouillon</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => methods.handleSubmit(onPublishSubmit)()}
                    disabled={isSubmitting}
                    className="relative overflow-hidden bg-gradient-to-r from-ar-gold via-ar-gold-light to-ar-gold hover:from-ar-gold-light hover:via-ar-gold hover:to-ar-gold-light text-ar-black font-bold shadow-lg shadow-ar-gold/30 transition-all duration-300 hover:shadow-xl hover:shadow-ar-gold/40"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-1.5" />
                    )}
                    {mode === "create" ? "Publier" : "Enregistrer"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dialog de confirmation suppression - Design futuriste */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative bg-gradient-to-br from-ar-gray to-ar-dark rounded-2xl p-8 max-w-md w-full mx-4 border border-red-500/30 shadow-2xl shadow-red-500/20 animate-in zoom-in-95 duration-200">
              {/* Effet de lueur rouge */}
              <div className="absolute -inset-px bg-gradient-to-r from-red-500/20 via-transparent to-red-500/20 rounded-2xl blur-sm" />
              
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <Trash2 className="h-8 w-8 text-red-400" />
                </div>
                
                <h3 className="text-xl font-bold text-white text-center mb-2">
                  Confirmer la suppression
                </h3>
                <p className="text-gray-400 text-center mb-6">
                  Êtes-vous sûr de vouloir supprimer cette annonce ?
                  <br />
                  <span className="text-red-400">Cette action est irréversible.</span>
                </p>
                
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isSubmitting}
                    className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-300"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/20 transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Supprimer définitivement
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </FormProvider>
  )
}
