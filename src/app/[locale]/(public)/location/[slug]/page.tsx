import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getRentalVehicleBySlug } from "@/lib/rentals"
import { getSiteSettings } from "@/lib/site-settings"
import { RentalBookingClient } from "./RentalBookingClient"
import type { RentalVehicle, RentalOption } from "@/types/rental"

interface Props {
  params: { locale: string; slug: string }
  searchParams: { cancelled?: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [result, settings] = await Promise.all([
    getRentalVehicleBySlug(params.slug),
    getSiteSettings(),
  ])
  if (!result) return { title: settings.business_name }

  const { vehicle } = result
  const isFr = params.locale !== "en"
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://autoroi.fr"

  const title = `${isFr ? "Louer" : "Rent"} ${vehicle.brand} ${vehicle.model} ${vehicle.year ?? ""} — ${settings.business_name}`
  const description = isFr
    ? `Réservez le ${vehicle.brand} ${vehicle.model} à ${vehicle.price_per_day}€/jour. Paiement sécurisé.`
    : `Book the ${vehicle.brand} ${vehicle.model} from ${vehicle.price_per_day}€/day. Secure payment.`
  const url = `${siteUrl}/${params.locale}/location/${vehicle.slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url,
      images: vehicle.cover_photo ? [{ url: vehicle.cover_photo, width: 1200, height: 630, alt: `${vehicle.brand} ${vehicle.model}` }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: vehicle.cover_photo ? [vehicle.cover_photo] : [],
    },
  }
}

export default async function RentalVehiclePage({ params, searchParams }: Props) {
  const { locale, slug } = params
  const result = await getRentalVehicleBySlug(slug)

  if (!result) notFound()

  const { vehicle, options } = result
  const cancelled = searchParams.cancelled === "true"

  return (
    <RentalBookingClient
      vehicle={vehicle}
      options={options}
      locale={locale}
      cancelled={cancelled}
    />
  )
}
