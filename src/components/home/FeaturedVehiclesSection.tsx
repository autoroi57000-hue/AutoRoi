"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import type { VehicleCard as VehicleCardType } from "@/types/vehicle";

interface FeaturedVehiclesSectionProps {
  locale?: string;
  vehicles: VehicleCardType[];
}

export function FeaturedVehiclesSection({
  locale = "fr",
  vehicles,
}: FeaturedVehiclesSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const texts = {
    fr: {
      title: "SÉLECTION DU MOMENT",
      subtitle: "Nos véhicules coups de cœur",
      viewAll: "Voir tous les véhicules",
      noVehicles: "Aucun véhicule mis en avant",
    },
    en: {
      title: "FEATURED SELECTION",
      subtitle: "Our favorite vehicles",
      viewAll: "View all vehicles",
      noVehicles: "No featured vehicles",
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.fr;

  return (
    <section ref={ref} className="relative overflow-hidden py-20 md:py-28">
      {/* Subtle background orb */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 80% 50%, rgba(201,168,76,0.04) 0%, transparent 65%)' }}
      />
      <div className="container relative mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-4">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-ar-gold" />
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-ar-gold">
              {t.subtitle}
            </span>
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-ar-gold" />
          </div>
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {t.title}
          </h2>
        </motion.div>

        {/* Vehicles grid */}
        {vehicles.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle, index) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <VehicleCard vehicle={vehicle} locale={locale} />
                </motion.div>
              ))}
            </div>

            {/* View all button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 text-center"
            >
              <Link
                href={`/${locale}/vehicules`}
                className="group inline-flex items-center gap-2 rounded-full border-2 px-8 py-4 font-medium transition-all hover:shadow-[0_4px_24px_rgba(201,168,76,0.25)] hover:-translate-y-0.5"
                style={{ borderColor: 'rgba(201,168,76,0.5)', color: '#C9A84C' }}
              >
                {t.viewAll}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-ar-silver">{t.noVehicles}</p>
          </div>
        )}
      </div>
    </section>
  );
}
