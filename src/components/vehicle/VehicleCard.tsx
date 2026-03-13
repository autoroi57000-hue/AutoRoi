"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { VehicleCard as VehicleCardType } from "@/types/vehicle";
import { formatPrice, formatMileage } from "@/lib/utils";
import { FUEL_LABELS } from "@/lib/constants";
import { Fuel, Gauge, Calendar, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, imageZoom, cardHover } from "@/lib/animations";

interface VehicleCardProps {
  vehicle: VehicleCardType;
  locale?: string;
  showBadge?: boolean;
  index?: number;
  /** Set to false when inside an AnimatedGrid (stagger parent handles reveal) */
  animated?: boolean;
}

export function VehicleCard({
  vehicle,
  locale = "fr",
  showBadge = true,
  index = 0,
  animated = true,
}: VehicleCardProps) {
  const t = useTranslations();
  const isUnavailable =
    vehicle.status === "vendu" || vehicle.status === "archive";
  const isNew =
    vehicle.published_at &&
    new Date(vehicle.published_at) >
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const prefersReducedMotion = useReducedMotion();
  const canHover = useRef<boolean | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion) return;
      if (canHover.current === null) {
        canHover.current = window.matchMedia("(hover: hover)").matches;
      }
      if (!canHover.current) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      e.currentTarget.style.transform = `perspective(1000px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateZ(4px)`;
      e.currentTarget.style.setProperty("--glow-x", `${(x + 0.5) * 100}%`);
      e.currentTarget.style.setProperty("--glow-y", `${(y + 0.5) * 100}%`);
    },
    [prefersReducedMotion]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)";
    },
    []
  );

  const Wrapper = animated ? motion.article : "article";
  const wrapperProps = animated
    ? {
        variants: fadeInUp,
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: { once: true, margin: "-50px" },
        transition: { delay: index * 0.1 },
        whileHover: "hover" as const,
      }
    : {};

  return (
    <Wrapper {...wrapperProps}>
      <Link href={`/${locale}/vehicules/${vehicle.slug}`}>
        <motion.div
          {...(animated ? { variants: cardHover } : {})}
          className="vehicle-card-glow vehicle-card-3d group relative overflow-hidden rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Image container - 4:3 aspect ratio */}
          <div className="relative aspect-[4/3] overflow-hidden bg-ar-gray-900">
            {vehicle.cover_url ? (
              <motion.div variants={imageZoom} className="h-full w-full">
                <Image
                  src={vehicle.cover_url}
                  alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
                  fill
                  quality={75}
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </motion.div>
            ) : (
              <div className="flex h-full items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {t("vehicle.noPhotos")}
                </span>
              </div>
            )}

            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-ar-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Status badges */}
            {showBadge && (
              <div className="absolute left-3 top-3 flex flex-col gap-2">
                {isUnavailable ? (
                  <span className="rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm" style={{ background: 'rgba(30,30,30,0.9)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    {vehicle.status === "vendu"
                      ? t("vehicle.sold")
                      : t("vehicle.archive")}
                  </span>
                ) : (
                  <>
                    {isNew && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-md px-3 py-1.5 text-xs font-bold uppercase backdrop-blur-sm"
                        style={{ letterSpacing: '0.1em', background: 'rgba(201,168,76,0.9)', color: '#0A0A0A' }}
                      >
                        {t("vehicle.new")}
                      </motion.span>
                    )}
                    {vehicle.is_featured && !isNew && (
                      <span className="rounded-md px-3 py-1.5 text-xs font-bold uppercase backdrop-blur-sm" style={{ letterSpacing: '0.1em', background: 'rgba(201,168,76,0.9)', color: '#0A0A0A' }}>
                        {t("vehicle.featured")}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Sold overlay */}
            {isUnavailable && (
              <div className="absolute inset-0 flex items-center justify-center bg-ar-black/50 backdrop-blur-sm">
                <span className="rounded-lg border-2 border-ar-silver/50 bg-ar-black/80 px-6 py-3 text-lg font-bold uppercase tracking-widest text-ar-silver">
                  {vehicle.status === "vendu"
                    ? t("vehicle.sold")
                    : t("vehicle.archive")}
                </span>
              </div>
            )}

            {/* View details button — always visible on touch, hover reveal on desktop */}
            <div className="absolute bottom-4 right-4 opacity-100 sm:opacity-0 transition-opacity duration-300 sm:group-hover:opacity-100">
              <span className="flex items-center gap-1.5 rounded-full bg-ar-gold px-4 py-2.5 text-xs font-semibold text-ar-black shadow-lg">
                {t("vehicle.viewDetails")}
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="relative p-5">
            {/* Price */}
            <div className="mb-2 flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold md:text-3xl" style={{ color: '#C9A84C' }}>
                {formatPrice(vehicle.price)}
              </span>
              {vehicle.price_negotiable && (
                <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {t("vehicle.negotiable")}
                </span>
              )}
            </div>

            {/* Brand & Model */}
            <h3 className="mb-1 font-display text-lg font-bold text-white transition-colors duration-200 group-hover:text-ar-gold">
              {vehicle.brand} {vehicle.model}
            </h3>
            {vehicle.version && (
              <p className="mb-3 line-clamp-1 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {vehicle.version}
              </p>
            )}

            {/* Specs — tags style dark */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 rounded-md px-2 py-1 text-xs" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                <Calendar className="h-3 w-3" style={{ color: '#C9A84C' }} />
                {vehicle.year}
              </span>
              <span className="flex items-center gap-1 rounded-md px-2 py-1 text-xs" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                <Gauge className="h-3 w-3" style={{ color: '#C9A84C' }} />
                {formatMileage(vehicle.mileage)}
              </span>
              <span className="flex items-center gap-1 rounded-md px-2 py-1 text-xs" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                <Fuel className="h-3 w-3" style={{ color: '#C9A84C' }} />
                {FUEL_LABELS[vehicle.fuel]}
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </Wrapper>
  );
}
