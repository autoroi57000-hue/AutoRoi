"use server"

import * as Sentry from "@sentry/nextjs"
import { revalidatePath } from "next/cache"
import { createActionClient } from "@/lib/supabase/server"
import type { VehicleInsert, VehicleUpdate, VehicleStatus } from "@/types/database"
import { LOCALES } from "@/lib/constants"

type AnyClient = any

interface ActionResult {
  success: boolean
  vehicleId?: string
  error?: string
}

async function getAuthedUser(supabase: AnyClient) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { user: null, error: "Non authentifié" }
  return { user, error: null }
}

async function getRole(supabase: AnyClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single()
  const typed = data as { role: string } | null
  if (error || !typed) return { role: null, error: "Profil non trouvé" }
  return { role: typed.role, error: null }
}

// Helper pour déterminer la catégorie d'un équipement
function getFeatureCategory(featureId: string): string {
  const categories: Record<string, string[]> = {
    securite: ["abs", "esp", "airbags_frontaux", "airbags_latéraux", "camera_recul", "capteurs_avant", "capteurs_arriere", "alerte_franchissement", "regulateur_adaptatif"],
    confort: ["clim_manuelle", "clim_auto", "sieges_chauffants", "sieges_electriques", "toit_ouvrant", "toit_panoramique", "volant_chauffant", "demarrage_sans_cle", "acces_sans_cle"],
    multimedia: ["autoradio", "ecran_tactile", "apple_carplay", "android_auto", "gps", "bluetooth", "usb", "camera_360", "head_up_display"],
    exterieur: ["jantes_alliage", "jantes_17plus", "peinture_metallisee", "vitres_teintees", "barres_toit", "attelage", "phares_led", "phares_xenon", "phares_laser"],
  }
  
  for (const [category, features] of Object.entries(categories)) {
    if (features.includes(featureId)) return category
  }
  return "autre"
}

// ─── CREATE ─────────────────────────────────────────────────────────────────

export async function createVehicleAction(
  formData: VehicleInsert & { status: VehicleStatus }
): Promise<ActionResult> {
  try {
    const supabase = await createActionClient()

    const { user, error: authError } = await getAuthedUser(supabase)
    if (!user) return { success: false, error: authError ?? "Non authentifié" }

    const { role, error: roleError } = await getRole(supabase, user.id)
    if (!role) return { success: false, error: roleError ?? "Profil non trouvé" }
    if (role !== "admin" && role !== "collaborateur") {
      return { success: false, error: "Accès non autorisé" }
    }

    Sentry.setUser({ id: user.id })
    Sentry.setContext("vehicle", { action: "create", brand: formData.brand, model: formData.model })

    const slug = generateSlug(formData.brand, formData.model, formData.year)
    const now = new Date().toISOString()
    const publishedAt = formData.status === "publie" ? now : null

    const { data: vehicle, error: insertError } = await (supabase as AnyClient)
      .from("vehicles")
      .insert({
        brand: formData.brand,
        model: formData.model,
        version: formData.version,
        year: formData.year,
        vehicle_type: formData.vehicle_type,
        fuel: formData.fuel,
        engine_size: formData.engine_size,
        power_hp: formData.power_hp,
        power_kw: formData.power_kw,
        transmission: formData.transmission,
        drive: formData.drive,
        body: formData.body,
        doors: formData.doors,
        seats: formData.seats,
        color_ext: formData.color_ext,
        color_int: formData.color_int,
        mileage: formData.mileage,
        price: formData.price,
        price_negotiable: formData.price_negotiable,
        first_sale_date: formData.first_sale_date,
        condition: formData.condition,
        ct_status: formData.ct_status,
        ct_date: formData.ct_date,
        description_fr: formData.description_fr,
        description_en: formData.description_en,
        status: formData.status,
        is_featured: formData.is_featured,
        slug,
        created_by: user.id,
        published_at: publishedAt,
      })
      .select("id")
      .single()

    const typedVehicle = vehicle as { id: string } | null

    if (insertError) {
      console.error("Error creating vehicle:", insertError)
      return { success: false, error: "Erreur lors de la création du véhicule" }
    }

    // Insérer les features (équipements) si présentes
    const features = (formData as unknown as { features?: string[] }).features
    if (features && features.length > 0 && typedVehicle) {
      const { error: featuresError } = await (supabase as AnyClient)
        .from("vehicle_features")
        .insert(
          features.map((feature) => ({
            vehicle_id: typedVehicle.id,
            feature: feature,
            category: getFeatureCategory(feature),
          }))
        )
      
      if (featuresError) {
        console.error("Error inserting features:", featuresError)
        // On continue quand même, le véhicule est créé
      }
    }

    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin/annonces`)
      revalidatePath(`/${locale}/vehicules`)
      revalidatePath(`/${locale}`)
    })

    return { success: true, vehicleId: typedVehicle!.id }
  } catch (error) {
    Sentry.captureException(error, { tags: { action: "createVehicle" } })
    console.error("Unexpected error:", error)
    return { success: false, error: "Une erreur inattendue est survenue" }
  }
}

// ─── UPDATE ─────────────────────────────────────────────────────────────────

export async function updateVehicleAction(
  id: string,
  formData: VehicleUpdate & { status: VehicleStatus }
): Promise<ActionResult> {
  try {
    const supabase = await createActionClient()

    const { user, error: authError } = await getAuthedUser(supabase)
    if (!user) return { success: false, error: authError ?? "Non authentifié" }

    const { role, error: roleError } = await getRole(supabase, user.id)
    if (!role) return { success: false, error: roleError ?? "Profil non trouvé" }
    if (role !== "admin" && role !== "collaborateur") {
      return { success: false, error: "Accès non autorisé" }
    }

    let vehicleFetchQuery = supabase
      .from("vehicles")
      .select("status, brand, model, year")
      .eq("id", id)

    if (role === "collaborateur") {
      vehicleFetchQuery = vehicleFetchQuery.eq("created_by", user.id)
    }

    const { data: existingVehicle, error: fetchError } = await vehicleFetchQuery
      .single<{ status: VehicleStatus; brand: string; model: string; year: number }>()

    if (fetchError || !existingVehicle) {
      return { success: false, error: "Vous n'êtes pas autorisé à modifier cette annonce" }
    }

    let slug: string | undefined = undefined
    if (
      formData.brand !== undefined ||
      formData.model !== undefined ||
      formData.year !== undefined
    ) {
      slug = generateSlug(
        formData.brand || existingVehicle.brand,
        formData.model || existingVehicle.model,
        formData.year || existingVehicle.year
      )
    }

    let publishedAt: string | undefined = undefined
    if (formData.status === "publie" && existingVehicle.status !== "publie") {
      publishedAt = new Date().toISOString()
    }

    // Extraire les features et created_by avant le spread — ces champs n'existent pas dans la table vehicles
    const { features, created_by, ...vehicleFields } = formData as unknown as { features?: string[]; created_by?: string; [key: string]: unknown }

    const updateData: Record<string, unknown> = {
      ...vehicleFields,
      updated_at: new Date().toISOString(),
    }
    if (slug) updateData.slug = slug
    if (publishedAt) updateData.published_at = publishedAt

    const { error: updateError } = await (supabase as AnyClient)
      .from("vehicles")
      .update(updateData)
      .eq("id", id)

    if (updateError) {
      console.error("Error updating vehicle:", updateError)
      return { success: false, error: "Erreur lors de la mise à jour" }
    }

    // Mise à jour des features (équipements) si fournies
    if (features !== undefined) {
      // Supprimer les anciennes features
      await (supabase as AnyClient)
        .from("vehicle_features")
        .delete()
        .eq("vehicle_id", id)
      
      // Insérer les nouvelles features
      if (features.length > 0) {
        const { error: featuresError } = await (supabase as AnyClient)
          .from("vehicle_features")
          .insert(
            features.map((feature) => ({
              vehicle_id: id,
              feature: feature,
              category: getFeatureCategory(feature),
            }))
          )
        
        if (featuresError) {
          console.error("Error updating features:", featuresError)
          // On continue quand même, le véhicule est mis à jour
        }
      }
    }

    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin/annonces`)
      revalidatePath(`/${locale}/admin/annonces/${id}`)
      revalidatePath(`/${locale}/vehicules`)
      revalidatePath(`/${locale}`)
    })

    return { success: true, vehicleId: id }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Une erreur inattendue est survenue" }
  }
}

// ─── DELETE ─────────────────────────────────────────────────────────────────

export async function deleteVehicleAction(id: string): Promise<ActionResult> {
  try {
    const supabase = await createActionClient()

    const { user, error: authError } = await getAuthedUser(supabase)
    if (!user) return { success: false, error: authError ?? "Non authentifié" }

    const { role, error: roleError } = await getRole(supabase, user.id)
    if (!role) return { success: false, error: roleError ?? "Profil non trouvé" }
    if (role !== "admin") {
      return { success: false, error: "Accès non autorisé - Admin requis" }
    }

    const { data: photos } = await supabase
      .from("vehicle_photos")
      .select("storage_path")
      .eq("vehicle_id", id)
      .returns<{ storage_path: string }[]>()

    if (photos && photos.length > 0) {
      const storagePaths = photos.map((p) => p.storage_path)
      await supabase.storage.from("vehicle-photos").remove(storagePaths)
    }

    const { error: deleteError } = await (supabase as AnyClient)
      .from("vehicles")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Error deleting vehicle:", deleteError)
      return { success: false, error: "Erreur lors de la suppression" }
    }

    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin/annonces`)
      revalidatePath(`/${locale}/vehicules`)
      revalidatePath(`/${locale}`)
    })

    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Une erreur inattendue est survenue" }
  }
}

// ─── DUPLICATE ──────────────────────────────────────────────────────────────

export async function duplicateVehicleAction(id: string): Promise<ActionResult> {
  try {
    const supabase = await createActionClient()

    const { user, error: authError } = await getAuthedUser(supabase)
    if (!user) return { success: false, error: authError ?? "Non authentifié" }

    const { role, error: roleError } = await getRole(supabase, user.id)
    if (!role) return { success: false, error: roleError ?? "Profil non trouvé" }
    if (role !== "admin" && role !== "collaborateur") {
      return { success: false, error: "Accès non autorisé" }
    }

    let vehicleFetchQuery = supabase
      .from("vehicles")
      .select("*")
      .eq("id", id)

    if (role === "collaborateur") {
      vehicleFetchQuery = vehicleFetchQuery.eq("created_by", user.id)
    }

    const { data: vehicle, error: fetchError } = await vehicleFetchQuery
      .single<Record<string, unknown>>()

    if (fetchError || !vehicle) {
      return { success: false, error: "Vous n'êtes pas autorisé à modifier cette annonce" }
    }

    const { data: newVehicle, error: insertError } = await (supabase as AnyClient)
      .from("vehicles")
      .insert({
        brand: vehicle.brand,
        model: vehicle.model,
        version: vehicle.version,
        year: vehicle.year,
        vehicle_type: vehicle.vehicle_type,
        fuel: vehicle.fuel,
        engine_size: vehicle.engine_size,
        power_hp: vehicle.power_hp,
        power_kw: vehicle.power_kw,
        transmission: vehicle.transmission,
        drive: vehicle.drive,
        body: vehicle.body,
        doors: vehicle.doors,
        seats: vehicle.seats,
        color_ext: vehicle.color_ext,
        color_int: vehicle.color_int,
        mileage: vehicle.mileage,
        price: vehicle.price,
        price_negotiable: vehicle.price_negotiable,
        first_sale_date: vehicle.first_sale_date,
        condition: vehicle.condition,
        ct_status: vehicle.ct_status,
        ct_date: vehicle.ct_date,
        description_fr: vehicle.description_fr,
        description_en: vehicle.description_en,
        status: "brouillon",
        is_featured: false,
        created_by: user.id,
        slug: generateSlug(String(vehicle.brand), String(vehicle.model), Number(vehicle.year)) + "-copy",
      })
      .select("id")
      .single()

    const typedNewVehicle = newVehicle as { id: string } | null

    if (insertError) {
      console.error("Error duplicating vehicle:", insertError)
      return { success: false, error: "Erreur lors de la duplication" }
    }

    const { data: features } = await (supabase as AnyClient)
      .from("vehicle_features")
      .select("feature, category")
      .eq("vehicle_id", id)

    if (features && features.length > 0) {
      await (supabase as AnyClient).from("vehicle_features").insert(
        (features as { feature: string; category: string }[]).map((f) => ({
          vehicle_id: typedNewVehicle!.id,
          feature: f.feature,
          category: f.category,
        }))
      )
    }

    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin/annonces`)
    })

    return { success: true, vehicleId: typedNewVehicle!.id }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Une erreur inattendue est survenue" }
  }
}

// ─── MARK AS SOLD ───────────────────────────────────────────────────────────

export async function markAsSoldAction(id: string): Promise<ActionResult> {
  try {
    const supabase = await createActionClient()

    const { user, error: authError } = await getAuthedUser(supabase)
    if (!user) return { success: false, error: authError ?? "Non authentifié" }

    const { role, error: roleError } = await getRole(supabase, user.id)
    if (!role) return { success: false, error: roleError ?? "Profil non trouvé" }
    if (role !== "admin" && role !== "collaborateur") {
      return { success: false, error: "Accès non autorisé" }
    }

    if (role === "collaborateur") {
      const { data: owned } = await supabase
        .from("vehicles")
        .select("id")
        .eq("id", id)
        .eq("created_by", user.id)
        .single<{ id: string }>()

      if (!owned) {
        return { success: false, error: "Vous n'êtes pas autorisé à modifier cette annonce" }
      }
    }

    const { error: updateError } = await (supabase as AnyClient)
      .from("vehicles")
      .update({
        status: "vendu",
        sold_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      console.error("Error marking as sold:", updateError)
      return { success: false, error: "Erreur lors de la mise à jour" }
    }

    LOCALES.forEach((locale) => {
      revalidatePath(`/${locale}/admin/annonces`)
      revalidatePath(`/${locale}/vehicules`)
      revalidatePath(`/${locale}`)
    })

    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Une erreur inattendue est survenue" }
  }
}

// ─── HELPER FUNCTIONS ───────────────────────────────────────────────────────

function generateSlug(brand: string, model: string, year: number): string {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

  const timestamp = Date.now().toString(36)
  return `${normalize(brand)}-${normalize(model)}-${year}-${timestamp}`
}
