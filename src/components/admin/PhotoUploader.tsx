"use client"

import { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd"
import {
  Camera,
  Star,
  Trash2,
  AlertCircle,
  RefreshCw,
  GripVertical,
  Loader2,
  ImageOff,
  X,
  Upload,
  Crown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePhotoUploader, type UploadingPhoto } from "@/hooks/usePhotoUploader"
import type { VehiclePhoto } from "@/types/database"

// ─── Props ───────────────────────────────────────────────────────────────────

interface PhotoUploaderProps {
  vehicleId: string | null
  initialPhotos?: VehiclePhoto[]
  onChange?: (photos: VehiclePhoto[]) => void
  apiEndpoint?: string
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function PhotoSkeleton() {
  return (
    <div className="aspect-[4/3] rounded-xl bg-ar-dark/50 border border-ar-gold/10 animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-ar-gold/5 to-transparent animate-shimmer" />
    </div>
  )
}

// ─── Uploading Card ──────────────────────────────────────────────────────────

function UploadingCard({
  item,
  onRetry,
}: {
  item: UploadingPhoto
  onRetry: () => void
}) {
  const progressPct = Math.round(item.progress * 100)

  return (
    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-ar-dark border border-ar-gold/20 shadow-lg shadow-ar-gold/5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.preview} alt="" className="w-full h-full object-cover opacity-50" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ar-dark/60 backdrop-blur-sm">
        {item.status === "error" ? (
          <>
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <p className="text-xs text-red-400 text-center px-2 leading-tight">{item.error}</p>
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 text-xs text-ar-gold hover:text-ar-gold-light transition-all duration-300 px-3 py-1.5 rounded-lg bg-ar-gold/10 hover:bg-ar-gold/20"
            >
              <RefreshCw className="h-3 w-3" />
              Réessayer
            </button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-ar-gold/20 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-ar-gold animate-spin" />
            </div>
            <p className="text-xs text-ar-silver font-medium">
              {item.status === "compressing" ? "Compression…" : `${progressPct}%`}
            </p>
          </>
        )}
      </div>

      {item.status !== "error" && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-ar-dark/50">
          <div
            className="h-full bg-gradient-to-r from-ar-gold to-ar-gold-light transition-all duration-300 rounded-r-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      <div className="absolute top-2 left-2">
        <span className="text-[10px] font-bold bg-ar-gold text-ar-black px-2 py-1 rounded-md shadow-lg shadow-ar-gold/20">
          NOUVEAU
        </span>
      </div>
    </div>
  )
}

// ─── Photo Card ──────────────────────────────────────────────────────────────

function PhotoCard({
  photo,
  index,
  onDelete,
  onSetPrimary,
  isDeleting,
}: {
  photo: VehiclePhoto
  index: number
  onDelete: () => void
  onSetPrimary: () => void
  isDeleting: boolean
}) {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <Draggable draggableId={photo.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "relative aspect-[4/3] rounded-xl overflow-hidden group",
            "border border-ar-gold/20 transition-all duration-300 shadow-lg shadow-black/20",
            snapshot.isDragging &&
              "ring-2 ring-ar-gold shadow-2xl shadow-ar-gold/30 scale-105 z-50 border-ar-gold"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt={`Photo ${index + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Drag handle */}
          <div
            {...provided.dragHandleProps}
            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-grab active:cursor-grabbing"
          >
            <div className="bg-ar-dark/80 backdrop-blur-sm rounded-lg p-1.5 border border-ar-gold/20 shadow-lg">
              <GripVertical className="h-4 w-4 text-ar-gold" />
            </div>
          </div>

          {/* Primary badge */}
          {photo.is_primary && (
            <div className="absolute top-2 right-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold bg-gradient-to-r from-ar-gold to-ar-gold-light text-ar-black px-2.5 py-1 rounded-md shadow-lg shadow-ar-gold/30">
                <Crown className="h-3 w-3" />
                PRINCIPALE
              </span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-ar-dark via-ar-dark/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

          {/* Action buttons */}
          <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            {!photo.is_primary && (
              <button
                onClick={onSetPrimary}
                className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold py-2 rounded-lg bg-gradient-to-r from-ar-gold to-ar-gold-light text-ar-black shadow-lg shadow-ar-gold/30 hover:shadow-ar-gold/50 hover:scale-[1.02] transition-all duration-300"
              >
                <Star className="h-3.5 w-3.5" />
                Principale
              </button>
            )}

            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={isDeleting}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg",
                  "text-[11px] font-bold bg-red-500/80 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300",
                  photo.is_primary && "flex-1"
                )}
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Supprimer
              </button>
            ) : (
              <div className="flex gap-2 flex-1">
                <button
                  onClick={onDelete}
                  className="flex-1 text-[11px] font-bold bg-gradient-to-r from-red-600 to-red-500 text-white py-2 rounded-lg shadow-lg shadow-red-500/30"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 text-[11px] bg-ar-gray/80 text-ar-silver py-2 rounded-lg hover:bg-ar-gold/20 hover:text-ar-gold transition-colors"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function PhotoUploader({ vehicleId, initialPhotos = [], onChange, apiEndpoint = "/api/photos" }: PhotoUploaderProps) {
  const {
    photos,
    uploading,
    isLoading,
    globalProgress,
    uploadPhotos,
    deletePhoto,
    deleteAllPhotos,
    reorderPhotos,
    setPrimaryPhoto,
    retryUpload,
    loadPhotos,
  } = usePhotoUploader(vehicleId, initialPhotos, apiEndpoint)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)
  const [isDeletingAll, setIsDeletingAll] = useState(false)

  useEffect(() => {
    onChange?.(photos)
  }, [photos, onChange])

  useEffect(() => {
    if (vehicleId && initialPhotos.length === 0) {
      loadPhotos()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId])

  // ─── Dropzone ───
  const onDrop = useCallback(
    (acceptedFiles: File[]) => uploadPhotos(acceptedFiles),
    [uploadPhotos]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/heic": [".heic"],
      "image/heif": [".heif"],
    },
    maxSize: 15 * 1024 * 1024,
    multiple: true,
    disabled: !vehicleId,
  })

  // ─── DnD ───
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return
      const src = result.source.index
      const dst = result.destination.index
      if (src === dst) return
      const reordered = [...photos]
      const [moved] = reordered.splice(src, 1)
      reordered.splice(dst, 0, moved)
      reorderPhotos(reordered)
    },
    [photos, reorderPhotos]
  )

  const handleDelete = async (photoId: string, storagePath: string) => {
    setDeletingId(photoId)
    await deletePhoto(photoId, storagePath)
    setDeletingId(null)
  }

  const handleDeleteAll = async () => {
    setIsDeletingAll(true)
    await deleteAllPhotos()
    setIsDeletingAll(false)
    setShowDeleteAllConfirm(false)
  }

  const isUploading = uploading.some((u) => u.status !== "error")
  const totalPhotos = photos.length + uploading.length

  // ─── No vehicleId ───
  if (!vehicleId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-ar-gold/20 rounded-2xl bg-ar-dark/30">
        <div className="w-16 h-16 rounded-full bg-ar-gold/10 flex items-center justify-center mb-4">
          <Camera className="h-8 w-8 text-ar-gold/50" />
        </div>
        <p className="text-sm text-ar-silver/60 max-w-xs">
          Sauvegardez d&apos;abord l&apos;annonce en brouillon pour ajouter des photos
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Global progress bar */}
      {isUploading && (
        <div className="w-full h-2 bg-ar-dark/50 rounded-full overflow-hidden border border-ar-gold/10">
          <div
            className="h-full bg-gradient-to-r from-ar-gold to-ar-gold-light transition-all duration-300 rounded-full shadow-lg shadow-ar-gold/30"
            style={{ width: `${globalProgress}%` }}
          />
        </div>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-10 transition-all duration-300 cursor-pointer overflow-hidden",
          "flex flex-col items-center justify-center text-center gap-4",
          isDragActive
            ? "border-ar-gold bg-ar-gold/10 scale-[1.02] shadow-xl shadow-ar-gold/20"
            : "border-ar-gold/20 hover:border-ar-gold/50 hover:bg-ar-gold/5"
        )}
      >
        {/* Effet de lueur au survol */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r from-ar-gold/5 via-transparent to-ar-gold/5 opacity-0 transition-opacity duration-500",
          !isDragActive && "group-hover:opacity-100"
        )} />
        
        <input {...getInputProps()} capture={false} />

        <div
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
            isDragActive 
              ? "bg-ar-gold/20 shadow-lg shadow-ar-gold/20" 
              : "bg-ar-dark/50 border border-ar-gold/20"
          )}
        >
          <Upload
            className={cn(
              "h-8 w-8 transition-all duration-300",
              isDragActive ? "text-ar-gold scale-110" : "text-ar-silver/50"
            )}
          />
        </div>

        <div className="relative">
          <p className={cn("font-bold text-lg transition-colors duration-300", isDragActive ? "text-ar-gold" : "text-ar-silver")}>
            {isDragActive
              ? "Déposez les photos ici"
              : "Glissez vos photos ici ou cliquez pour sélectionner"}
          </p>
          <p className="text-xs text-ar-silver/50 mt-2">
            JPG, PNG, HEIC — Taille max 15 Mo — Nombre illimité
          </p>
        </div>

        {isUploading && (
          <div className="flex items-center gap-2 text-sm text-ar-silver/60 mt-2">
            <Loader2 className="h-4 w-4 animate-spin text-ar-gold" />
            <span className="font-medium">{uploading.filter((u) => u.status !== "error").length} photo(s) en cours…</span>
          </div>
        )}
      </div>

      {/* Header + delete all */}
      {totalPhotos > 0 && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-ar-silver">
              {photos.length} photo{photos.length !== 1 ? "s" : ""}
            </span>
            {photos.length > 1 && (
              <span className="text-xs text-ar-silver/40 flex items-center gap-1">
                <GripVertical className="h-3 w-3" />
                Glissez pour réorganiser
              </span>
            )}
          </div>

          {photos.length > 0 &&
            (!showDeleteAllConfirm ? (
              <button
                onClick={() => setShowDeleteAllConfirm(true)}
                className="flex items-center gap-2 text-xs font-medium text-red-400/70 hover:text-red-400 transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Tout supprimer
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-ar-dark/50 px-4 py-2 rounded-xl border border-ar-gold/10">
                <span className="text-xs text-ar-silver/60">Supprimer toutes les photos ?</span>
                <button
                  onClick={handleDeleteAll}
                  disabled={isDeletingAll}
                  className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                >
                  {isDeletingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : "Oui, tout"}
                </button>
                <button
                  onClick={() => setShowDeleteAllConfirm(false)}
                  className="text-ar-silver/50 hover:text-ar-silver transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Skeleton loading */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <PhotoSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && totalPhotos === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-ar-gold/10 rounded-2xl bg-ar-dark/20">
          <div className="w-14 h-14 rounded-full bg-ar-gold/5 flex items-center justify-center mb-3">
            <ImageOff className="h-7 w-7 text-ar-silver/30" />
          </div>
          <p className="text-sm text-ar-silver/50 font-medium">Aucune photo pour le moment</p>
          <p className="text-xs mt-1 text-ar-silver/30">Glissez des photos dans la zone ci-dessus</p>
        </div>
      )}

      {/* Photo grid with DnD */}
      {!isLoading && totalPhotos > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="photos" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-wrap gap-4"
              >
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]"
                  >
                    <PhotoCard
                      photo={photo}
                      index={index}
                      onDelete={() => handleDelete(photo.id, photo.storage_path)}
                      onSetPrimary={() => setPrimaryPhoto(photo.id)}
                      isDeleting={deletingId === photo.id}
                    />
                  </div>
                ))}
                {provided.placeholder}

                {uploading.map((item) => (
                  <div
                    key={item.tempId}
                    className="w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]"
                  >
                    <UploadingCard item={item} onRetry={() => retryUpload(item.tempId)} />
                  </div>
                ))}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {photos.length > 0 && (
        <p className="text-[11px] text-ar-silver/30 text-center">
          La photo principale sera utilisée comme vignette dans le catalogue
        </p>
      )}
    </div>
  )
}
