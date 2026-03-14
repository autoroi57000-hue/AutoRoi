"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Users, Zap, ArrowRight } from "lucide-react"
import { AnimatedGrid } from "@/components/ui/AnimatedGrid"
import type { RentalVehicle } from "@/types/rental"
import { localePath } from '@/lib/constants'

interface RentalShowcaseSectionProps {
  locale: string
  vehicles: RentalVehicle[]
}

function RentalCard({
  vehicle,
  locale,
  isFr,
}: {
  vehicle: RentalVehicle
  locale: string
  isFr: boolean
}) {
  const href = `${localePath(locale, `/location/${vehicle.slug}`)}`
  const coverUrl = vehicle.cover_photo || vehicle.photos?.[0]?.url

  return (
    <Link
      href={href}
      className="vehicle-card-glow group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Photo */}
      <div className="relative aspect-[16/9] overflow-hidden">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center"
            style={{ background: "rgba(201,168,76,0.05)" }}
          >
            <span style={{ color: "rgba(201,168,76,0.2)" }}>
              {isFr ? "Photo à venir" : "Photo coming soon"}
            </span>
          </div>
        )}

        {/* LOCATION badge */}
        <div className="absolute top-3 left-3">
          <span
            className="text-xs font-bold uppercase px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(201,168,76,0.9)",
              color: "#0A0A0A",
              letterSpacing: "0.1em",
            }}
          >
            LOCATION
          </span>
        </div>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(to top, rgba(201,168,76,0.1) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-bold text-white text-base leading-tight group-hover:text-ar-gold transition-colors duration-200">
              {vehicle.brand} {vehicle.model}
            </h3>
            {vehicle.version && (
              <p
                className="text-xs mt-0.5 line-clamp-1"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {vehicle.version}
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p
              className="text-xs font-medium"
              style={{ color: "rgba(201,168,76,0.6)" }}
            >
              {isFr ? "À partir de" : "From"}
            </p>
            <p
              className="font-bold text-lg leading-tight"
              style={{ color: "#C9A84C" }}
            >
              {vehicle.price_per_day}€
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              /{isFr ? "jour" : "day"}
            </p>
          </div>
        </div>

        {/* Specs */}
        <div
          className="flex flex-wrap gap-3 mt-auto pt-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {vehicle.seats && (
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <Users className="h-3 w-3" />
              {vehicle.seats} {isFr ? "places" : "seats"}
            </span>
          )}
          {vehicle.transmission && (
            <span
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              {vehicle.transmission}
            </span>
          )}
          {vehicle.fuel && (
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <Zap className="h-3 w-3" />
              {vehicle.fuel}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export function RentalShowcaseSection({
  locale,
  vehicles,
}: RentalShowcaseSectionProps) {
  if (!vehicles || vehicles.length === 0) return null

  const isFr = locale === "fr"

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Subtle gold-tinted background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(201,168,76,0.03) 0%, transparent 70%)",
        }}
      />

      <div className="container relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-12 text-center"
        >
          <span
            className="inline-block text-xs font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: "#C9A84C" }}
          >
            {isFr ? "Location premium" : "Premium rental"}
          </span>
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {isFr
              ? "Louez l'excellence"
              : "Rent excellence"}
          </h2>
          <p
            className="mx-auto mt-4 max-w-xl text-base md:text-lg"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {isFr
              ? "Des véhicules premium disponibles à la location, à partir d'une journée."
              : "Premium vehicles available for rent, starting from one day."}
          </p>
        </motion.div>

        {/* Cards grid */}
        <AnimatedGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.slice(0, 3).map((vehicle) => (
            <RentalCard
              key={vehicle.id}
              vehicle={vehicle}
              locale={locale}
              isFr={isFr}
            />
          ))}
        </AnimatedGrid>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.3,
          }}
          className="mt-10 text-center"
        >
          <Link
            href={`${localePath(locale, '/location')}`}
            className="btn-shimmer inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition-all duration-300 hover:shadow-lg"
            style={{
              background: "rgba(201,168,76,0.1)",
              border: "1px solid rgba(201,168,76,0.3)",
              color: "#C9A84C",
            }}
          >
            {isFr ? "Voir tous nos véhicules" : "View all vehicles"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
