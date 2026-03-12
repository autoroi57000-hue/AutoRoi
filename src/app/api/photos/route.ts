import { NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"
import { isValidUUID } from "@/lib/utils"
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit"

type Supa = any

const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"]

// ─── GET /api/photos?vehicleId=xxx ──────────────────────────────────────────

export async function GET(request: NextRequest) {
  const vehicleId = request.nextUrl.searchParams.get("vehicleId")
  if (!isValidUUID(vehicleId)) return NextResponse.json({ error: "vehicleId invalide" }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const admin = createAdminClient() as Supa
  const { data: photos, error } = await admin
    .from("vehicle_photos")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("sort_order", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(photos ?? [])
}

// ─── POST /api/photos — upload fichier + insert DB ──────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  // Rate limiting: 50 uploads/hour per IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown"
  const rl = await checkRateLimit(ip, { prefix: "photos", maxRequests: 50 })
  if (!rl.allowed) return rateLimitResponse(rl, "Trop d'uploads. Veuillez réessayer plus tard.")

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "FormData invalide" }, { status: 400 })
  }

  const file = formData.get("file") as File | null
  const vehicleId = formData.get("vehicleId") as string | null
  const sortOrder = Number(formData.get("sortOrder") ?? 0)
  const isPrimary = formData.get("isPrimary") === "true"
  const width = Number(formData.get("width") ?? 0) || null
  const height = Number(formData.get("height") ?? 0) || null
  const sizeBytes = Number(formData.get("sizeBytes") ?? 0) || null

  if (!file || !isValidUUID(vehicleId)) {
    return NextResponse.json({ error: "Fichier et vehicleId valide requis" }, { status: 400 })
  }

  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 415 })
  }

  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: "Fichier trop volumineux" }, { status: 413 })
  }

  const admin = createAdminClient() as Supa

  const filename = `${randomUUID()}.webp`
  const storagePath = `${vehicleId}/${filename}`

  // Upload vers Supabase Storage
  const bytes = await file.arrayBuffer()
  const { error: storageError } = await admin.storage
    .from("vehicle-photos")
    .upload(storagePath, new Uint8Array(bytes), {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    })

  if (storageError) {
    console.error("Storage error:", storageError)
    return NextResponse.json({ error: "Erreur stockage: " + storageError.message }, { status: 500 })
  }

  // URL publique
  const { data: urlData } = admin.storage.from("vehicle-photos").getPublicUrl(storagePath)
  const publicUrl = urlData?.publicUrl ?? ""

  // Si c'est la photo principale, retirer le flag sur les autres
  if (isPrimary) {
    await admin
      .from("vehicle_photos")
      .update({ is_primary: false })
      .eq("vehicle_id", vehicleId)
  }

  // Insérer en base
  const { data: photo, error: dbError } = await admin
    .from("vehicle_photos")
    .insert({
      vehicle_id: vehicleId,
      url: publicUrl,
      storage_path: storagePath,
      is_primary: isPrimary,
      sort_order: sortOrder,
      width,
      height,
      size_bytes: sizeBytes,
    })
    .select()
    .single()

  if (dbError) {
    // Rollback storage
    await admin.storage.from("vehicle-photos").remove([storagePath])
    console.error("DB error:", dbError)
    return NextResponse.json({ error: "Erreur base de données: " + dbError.message }, { status: 500 })
  }

  return NextResponse.json(photo, { status: 201 })
}

// ─── DELETE /api/photos — suppression Storage + DB ─────────────────────────

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const { photoId, storagePath } = await request.json()
  if (!isValidUUID(photoId) || !storagePath || typeof storagePath !== "string") {
    return NextResponse.json({ error: "photoId et storagePath requis" }, { status: 400 })
  }

  if (storagePath.includes("..") || storagePath.startsWith("/")) {
    return NextResponse.json({ error: "storagePath invalide" }, { status: 400 })
  }

  // ── Vérification de propriété ─────────────────────────────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: string }>()

  if (profile?.role !== "admin") {
    const { data: photo } = await supabase
      .from("vehicle_photos")
      .select("vehicle_id")
      .eq("id", photoId)
      .single<{ vehicle_id: string }>()

    if (!photo) return NextResponse.json({ error: "Photo introuvable" }, { status: 404 })

    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("created_by")
      .eq("id", photo.vehicle_id)
      .single<{ created_by: string }>()

    if (!vehicle || vehicle.created_by !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  const admin = createAdminClient() as Supa

  // Supprimer du storage
  const { error: storageError } = await admin.storage
    .from("vehicle-photos")
    .remove([storagePath])

  if (storageError) {
    console.error("Storage delete error:", storageError)
    // Continue — delete from DB anyway
  }

  // Supprimer de la DB
  const { error: dbError } = await admin
    .from("vehicle_photos")
    .delete()
    .eq("id", photoId)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// ─── PATCH /api/photos — reorder ou set primary ─────────────────────────────

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const body = await request.json()
  const admin = createAdminClient() as Supa

  // ── Récupération du rôle (commun aux deux branches) ───────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: string }>()

  const isAdmin = profile?.role === "admin"
  // ─────────────────────────────────────────────────────────────────────────

  // Reorder: { action: "reorder", photos: [{id, sort_order}[]] }
  if (body.action === "reorder") {
    const updates: { id: string; sort_order: number }[] = body.photos ?? []

    if (!isAdmin) {
      if (updates.length === 0) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

      // Déduire le vehicleId depuis la première photo de la liste
      const { data: photo } = await supabase
        .from("vehicle_photos")
        .select("vehicle_id")
        .eq("id", updates[0].id)
        .single<{ vehicle_id: string }>()

      if (!photo) return NextResponse.json({ error: "Photo introuvable" }, { status: 404 })

      const { data: vehicle } = await supabase
        .from("vehicles")
        .select("created_by")
        .eq("id", photo.vehicle_id)
        .single<{ created_by: string }>()

      if (!vehicle || vehicle.created_by !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const promises = updates.map(({ id, sort_order }) =>
      admin.from("vehicle_photos").update({ sort_order }).eq("id", id)
    )
    const results = await Promise.all(promises)
    const failed = results.find((r) => r.error)
    if (failed?.error) {
      return NextResponse.json({ error: failed.error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  // Primary: { action: "primary", photoId, vehicleId }
  if (body.action === "primary") {
    const { photoId, vehicleId } = body
    if (!isValidUUID(photoId) || !isValidUUID(vehicleId)) {
      return NextResponse.json({ error: "photoId et vehicleId UUID valides requis" }, { status: 400 })
    }

    if (!isAdmin) {
      const { data: vehicle } = await supabase
        .from("vehicles")
        .select("created_by")
        .eq("id", vehicleId)
        .single<{ created_by: string }>()

      if (!vehicle || vehicle.created_by !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // Retirer le flag de toutes les photos du véhicule
    await admin
      .from("vehicle_photos")
      .update({ is_primary: false })
      .eq("vehicle_id", vehicleId)

    // Définir la principale
    const { error } = await admin
      .from("vehicle_photos")
      .update({ is_primary: true })
      .eq("id", photoId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 })
}
