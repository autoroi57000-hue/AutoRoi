import { NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"
import { isValidUUID } from "@/lib/utils"

type Supa = any

const BUCKET = "rental-vehicle-photos"
const TABLE = "rental_vehicle_photos"
const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"]

/** Après chaque opération, synchronise rental_vehicles.cover_photo */
async function syncCoverPhoto(admin: Supa, vehicleId: string) {
  const { data: photos } = await admin
    .from(TABLE)
    .select("url, is_primary")
    .eq("rental_vehicle_id", vehicleId)
    .order("sort_order", { ascending: true })

  const primary = (photos ?? []).find((p: { url: string; is_primary: boolean }) => p.is_primary)
  const coverUrl = primary?.url ?? photos?.[0]?.url ?? null

  await admin
    .from("rental_vehicles")
    .update({ cover_photo: coverUrl })
    .eq("id", vehicleId)
}

// ─── GET /api/rental-photos?vehicleId=xxx ────────────────────────────────────

export async function GET(request: NextRequest) {
  const vehicleId = request.nextUrl.searchParams.get("vehicleId")
  if (!isValidUUID(vehicleId)) return NextResponse.json({ error: "vehicleId invalide" }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const admin = createAdminClient() as Supa
  const { data: photos, error } = await admin
    .from(TABLE)
    .select("*")
    .eq("rental_vehicle_id", vehicleId)
    .order("sort_order", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Retourne des objets compatibles VehiclePhoto (vehicle_id = rental_vehicle_id pour le hook)
  const result = (photos ?? []).map((r: Supa) => ({ ...r, vehicle_id: r.rental_vehicle_id }))
  return NextResponse.json(result)
}

// ─── POST /api/rental-photos — upload fichier + insert DB ───────────────────

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

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

  const bytes = await file.arrayBuffer()
  const { error: storageError } = await admin.storage
    .from(BUCKET)
    .upload(storagePath, new Uint8Array(bytes), {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    })

  if (storageError) {
    console.error("Storage error:", storageError)
    return NextResponse.json({ error: "Erreur stockage: " + storageError.message }, { status: 500 })
  }

  const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(storagePath)
  const publicUrl = urlData?.publicUrl ?? ""

  if (isPrimary) {
    await admin.from(TABLE).update({ is_primary: false }).eq("rental_vehicle_id", vehicleId)
  }

  const { data: photo, error: dbError } = await admin
    .from(TABLE)
    .insert({
      rental_vehicle_id: vehicleId,
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
    await admin.storage.from(BUCKET).remove([storagePath])
    console.error("DB error:", dbError)
    return NextResponse.json({ error: "Erreur base de données: " + dbError.message }, { status: 500 })
  }

  await syncCoverPhoto(admin, vehicleId)

  return NextResponse.json({ ...photo, vehicle_id: vehicleId }, { status: 201 })
}

// ─── DELETE /api/rental-photos ──────────────────────────────────────────────

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

  const { data: profile } = await (supabase as Supa)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const admin = createAdminClient() as Supa

  if (profile?.role !== "admin") {
    const { data: photo } = await admin
      .from(TABLE)
      .select("rental_vehicle_id")
      .eq("id", photoId)
      .single()

    if (!photo) return NextResponse.json({ error: "Photo introuvable" }, { status: 404 })

    const { data: vehicle } = await (supabase as Supa)
      .from("rental_vehicles")
      .select("created_by")
      .eq("id", photo.rental_vehicle_id)
      .single()

    if (!vehicle || vehicle.created_by !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  // Récupérer le vehicleId avant suppression pour sync
  const { data: photoRow } = await admin
    .from(TABLE)
    .select("rental_vehicle_id")
    .eq("id", photoId)
    .single()

  await admin.storage.from(BUCKET).remove([storagePath])

  const { error: dbError } = await admin.from(TABLE).delete().eq("id", photoId)
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  if (photoRow?.rental_vehicle_id) {
    await syncCoverPhoto(admin, photoRow.rental_vehicle_id)
  }

  return NextResponse.json({ success: true })
}

// ─── PATCH /api/rental-photos — reorder ou set primary ──────────────────────

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const body = await request.json()
  const admin = createAdminClient() as Supa

  const { data: profile } = await (supabase as Supa)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const isAdmin = profile?.role === "admin"

  if (body.action === "reorder") {
    const updates: { id: string; sort_order: number }[] = body.photos ?? []

    if (!isAdmin && updates.length > 0) {
      const { data: photo } = await admin
        .from(TABLE)
        .select("rental_vehicle_id")
        .eq("id", updates[0].id)
        .single()

      if (!photo) return NextResponse.json({ error: "Photo introuvable" }, { status: 404 })

      const { data: vehicle } = await (supabase as Supa)
        .from("rental_vehicles")
        .select("created_by")
        .eq("id", photo.rental_vehicle_id)
        .single()

      if (!vehicle || vehicle.created_by !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const promises = updates.map(({ id, sort_order }) =>
      admin.from(TABLE).update({ sort_order }).eq("id", id)
    )
    const results = await Promise.all(promises)
    const failed = results.find((r: Supa) => r.error)
    if (failed?.error) return NextResponse.json({ error: failed.error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (body.action === "primary") {
    const { photoId, vehicleId } = body
    if (!isValidUUID(photoId) || !isValidUUID(vehicleId)) {
      return NextResponse.json({ error: "photoId et vehicleId UUID valides requis" }, { status: 400 })
    }

    if (!isAdmin) {
      const { data: vehicle } = await (supabase as Supa)
        .from("rental_vehicles")
        .select("created_by")
        .eq("id", vehicleId)
        .single()

      if (!vehicle || vehicle.created_by !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    await admin.from(TABLE).update({ is_primary: false }).eq("rental_vehicle_id", vehicleId)

    const { error } = await admin.from(TABLE).update({ is_primary: true }).eq("id", photoId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await syncCoverPhoto(admin, vehicleId)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 })
}
