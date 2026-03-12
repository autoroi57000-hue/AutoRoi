import { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://autoroi.fr"
  const locales = ["fr", "en"]

  // ── Pages statiques — une entrée par locale ──────────────────────
  const staticRoutes = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/vehicules", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/location", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/mentions-legales", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/confidentialite", priority: 0.3, changeFrequency: "yearly" as const },
  ]

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }))
  )

  // ── Véhicules de vente (table vehicles) ──────────────────────────
  let vehicleEntries: MetadataRoute.Sitemap = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("vehicles")
      .select("slug, updated_at")
      .eq("status", "publie")
      .order("published_at", { ascending: false })

    if (data) {
      vehicleEntries = (data as { slug: string | null; updated_at: string }[])
        .filter((v) => v.slug)
        .flatMap((v) =>
          locales.map((locale) => ({
            url: `${baseUrl}/${locale}/vehicules/${v.slug}`,
            lastModified: new Date(v.updated_at),
            changeFrequency: "weekly" as const,
            priority: 0.8,
          }))
        )
    }
  } catch (e) {
    console.error("Sitemap: erreur fetch vehicles", e)
  }

  // ── Véhicules de location (table rental_vehicles) ────────────────
  let rentalEntries: MetadataRoute.Sitemap = []
  try {
    const supabase = await createClient()
    // rental_vehicles n'est pas dans le type Database → cast via any
    const { data } = await (supabase as any)
      .from("rental_vehicles")
      .select("slug, updated_at")
      .eq("status", "disponible")
      .order("created_at", { ascending: false })

    if (data) {
      rentalEntries = (data as { slug: string | null; updated_at: string }[])
        .filter((v: { slug: string | null }) => v.slug)
        .flatMap((v: { slug: string | null; updated_at: string }) =>
          locales.map((locale) => ({
            url: `${baseUrl}/${locale}/location/${v.slug}`,
            lastModified: new Date(v.updated_at),
            changeFrequency: "weekly" as const,
            priority: 0.8,
          }))
        )
    }
  } catch (e) {
    console.error("Sitemap: erreur fetch rental_vehicles", e)
  }

  return [...staticEntries, ...vehicleEntries, ...rentalEntries]
}
