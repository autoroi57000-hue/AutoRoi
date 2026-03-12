"use client"

import Link from "next/link"
import Image from "next/image"
import { Calendar, Gauge, Fuel, Zap, ArrowRight } from "lucide-react"
import type { VehicleCard } from "@/types/vehicle"
import { formatPrice, formatMileage } from "@/lib/utils"
import { FUEL_LABELS, TRANSMISSION_LABELS, VEHICLE_STATUS_LABELS } from "@/lib/constants"

interface VehicleListItemProps {
  vehicle: VehicleCard
  locale?: string
}

export function VehicleListItem({ vehicle, locale = "fr" }: VehicleListItemProps) {
  const isUnavailable = vehicle.status === "vendu" || vehicle.status === "archive"
  const isNew =
    vehicle.published_at &&
    new Date(vehicle.published_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  return (
    <Link href={`/${locale}/vehicules/${vehicle.slug}`}>
      <article className="group flex gap-4 rounded-xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-ar-gold/30 transition-all duration-300 p-0">
        {/* Photo */}
        <div className="relative w-[200px] shrink-0 overflow-hidden bg-ar-gray/10">
          {vehicle.cover_url ? (
            <Image
              src={vehicle.cover_url}
              alt={`${vehicle.brand} ${vehicle.model}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="200px"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-ar-silver/30 text-xs">
              Pas de photo
            </div>
          )}
          {isUnavailable && (
            <div className="absolute inset-0 bg-ar-black/50 backdrop-blur-sm flex items-center justify-center">
              <span className="text-xs font-bold uppercase tracking-widest text-white border border-white/50 rounded px-2 py-1">
                {VEHICLE_STATUS_LABELS[vehicle.status]}
              </span>
            </div>
          )}
          {!isUnavailable && isNew && (
            <span className="absolute top-2 left-2 rounded-md bg-ar-gold px-2 py-1 text-xs font-bold uppercase tracking-wide text-ar-black">
              Nouveau
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between py-4 pr-4">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-ar-black text-lg group-hover:text-ar-gold transition-colors">
                  {vehicle.brand} {vehicle.model}
                </h3>
                {vehicle.version && (
                  <p className="text-sm text-ar-silver/60 mt-0.5 line-clamp-1">
                    {vehicle.version}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="font-display text-2xl font-bold text-ar-gold">
                  {formatPrice(vehicle.price)}
                </span>
                {vehicle.price_negotiable && (
                  <p className="text-xs text-ar-silver/50 mt-0.5">Négociable</p>
                )}
              </div>
            </div>

            {/* Specs row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-ar-silver">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-ar-gold" />
                {vehicle.year}
              </span>
              <span className="text-ar-silver/30">•</span>
              <span className="flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-ar-gold" />
                {formatMileage(vehicle.mileage)}
              </span>
              <span className="text-ar-silver/30">•</span>
              <span className="flex items-center gap-1.5">
                <Fuel className="h-3.5 w-3.5 text-ar-gold" />
                {FUEL_LABELS[vehicle.fuel]}
              </span>
              {vehicle.transmission && (
                <>
                  <span className="text-ar-silver/30">•</span>
                  <span className="text-ar-silver/70">
                    {TRANSMISSION_LABELS[vehicle.transmission]}
                  </span>
                </>
              )}
              {vehicle.power_hp && (
                <>
                  <span className="text-ar-silver/30">•</span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-ar-gold" />
                    {vehicle.power_hp} ch
                  </span>
                </>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-end mt-3">
            <span className="flex items-center gap-1 text-sm font-semibold text-ar-gold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Voir le détail
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
