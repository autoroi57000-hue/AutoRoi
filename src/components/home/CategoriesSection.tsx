"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Car, Bike, Truck } from "lucide-react";
import { localePath } from '@/lib/constants'

interface CategoriesSectionProps {
  locale?: string;
  counts?: {
    voiture: number;
    moto: number;
    utilitaire: number;
    total: number;
  };
}

interface CategoryCardProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  href: string;
  delay?: number;
  inView: boolean;
}

function CategoryCard({
  icon,
  title,
  count,
  href,
  delay = 0,
  inView,
}: CategoryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <Link href={href}>
        <div
          ref={cardRef}
          className="group cat-card p-8"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Torchlight cursor glow */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[16px] transition-opacity duration-300"
            style={{
              opacity: hovered ? 1 : 0,
              background: `radial-gradient(circle 130px at ${mouse.x}px ${mouse.y}px, rgba(201,168,76,0.12) 0%, transparent 70%)`,
            }}
          />

          {/* Gold shimmer top on hover */}
          <div className="absolute inset-x-0 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-ar-gold to-transparent transition-transform duration-500 group-hover:scale-x-100" />

          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className="cat-icon mb-5">
              {icon}
            </div>

            {/* Title */}
            <h3 className="mb-2 font-display text-xl font-bold text-white">
              {title}
            </h3>

            {/* Count */}
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <span className="font-bold text-ar-gold">{count}</span>{" "}
              {count > 1 ? "disponibles" : "disponible"}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Grid icon for all vehicles
function GridIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

export function CategoriesSection({
  locale = "fr",
  counts = { voiture: 0, moto: 0, utilitaire: 0, total: 0 },
}: CategoriesSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const texts = {
    fr: {
      title: "NOS CATÉGORIES",
      subtitle: "Parcourez par type de véhicule",
      categories: [
        { key: "voiture", title: "Voitures", icon: Car },
        { key: "moto", title: "Motos", icon: Bike },
        { key: "utilitaire", title: "Utilitaires", icon: Truck },
        { key: "all", title: "Tous véhicules", icon: GridIcon },
      ],
    },
    en: {
      title: "OUR CATEGORIES",
      subtitle: "Browse by vehicle type",
      categories: [
        { key: "voiture", title: "Cars", icon: Car },
        { key: "moto", title: "Motorcycles", icon: Bike },
        { key: "utilitaire", title: "Vans", icon: Truck },
        { key: "all", title: "All vehicles", icon: GridIcon },
      ],
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.fr;

  const getCount = (key: string) => {
    switch (key) {
      case "voiture":
        return counts.voiture;
      case "moto":
        return counts.moto;
      case "utilitaire":
        return counts.utilitaire;
      default:
        return counts.total;
    }
  };

  const getHref = (key: string, locale: string) => {
    if (key === "all") {
      return `${localePath(locale, '/vehicules')}`;
    }
    return `${localePath(locale, `/vehicules?type=${key}`)}`;
  };

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-20 md:py-28"
      style={{ background: 'rgba(255,255,255,0.018)' }}
    >
      {/* Centered gold orb */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(201,168,76,0.05) 0%, transparent 65%)' }}
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

        {/* Categories grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <CategoryCard
                key={category.key}
                icon={<Icon className="h-7 w-7" />}
                title={category.title}
                count={getCount(category.key)}
                href={getHref(category.key, locale)}
                delay={index * 0.1}
                inView={isInView}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
