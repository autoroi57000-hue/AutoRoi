"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Warehouse, Camera, Globe, Phone } from "lucide-react";

interface WhyChooseUsSectionProps {
  locale?: string;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
  inView: boolean;
  index?: number;
}

function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
  inView,
  index = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="group relative flex flex-col items-center rounded-2xl p-8 text-center transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(201,168,76,0.08)',
      }}
    >
      {/* Filigree index number */}
      <span className="feature-index" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Hover top shimmer line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)' }}
      />

      {/* Icon circle */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-ar-gold text-ar-gold transition-all duration-300 group-hover:bg-ar-gold group-hover:text-ar-black">
        {icon}
      </div>

      {/* Title */}
      <h3 className="mb-3 font-display text-xl font-bold text-white md:text-2xl">
        {title}
      </h3>

      {/* Description */}
      <p className="mx-auto max-w-xs text-sm leading-relaxed text-ar-silver/70 md:text-base">
        {description}
      </p>
    </motion.div>
  );
}

export function WhyChooseUsSection({ locale = "fr" }: WhyChooseUsSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const texts = {
    fr: {
      title: "POURQUOI CHOISIR",
      titleHighlight: "AUTO ROI",
      subtitle: "Nos avantages",
      features: [
        {
          icon: <Warehouse className="h-8 w-8" />,
          title: "Stock important",
          description: "Plus de 100 véhicules toutes marques disponibles immédiatement",
        },
        {
          icon: <Camera className="h-8 w-8" />,
          title: "Photos HD",
          description: "Galeries complètes sans limite de photos pour chaque véhicule",
        },
        {
          icon: <Globe className="h-8 w-8" />,
          title: "Service international",
          description: "Site disponible en français et en anglais pour tous nos clients",
        },
        {
          icon: <Phone className="h-8 w-8" />,
          title: "Contact direct",
          description: "WhatsApp, téléphone et formulaire pour une réponse rapide",
        },
      ],
    },
    en: {
      title: "WHY CHOOSE",
      titleHighlight: "AUTO ROI",
      subtitle: "Our advantages",
      features: [
        {
          icon: <Warehouse className="h-8 w-8" />,
          title: "Large inventory",
          description: "Over 100 vehicles of all brands available immediately",
        },
        {
          icon: <Camera className="h-8 w-8" />,
          title: "HD Photos",
          description: "Complete galleries with unlimited photos for each vehicle",
        },
        {
          icon: <Globe className="h-8 w-8" />,
          title: "International service",
          description: "Website available in French and English for all our customers",
        },
        {
          icon: <Phone className="h-8 w-8" />,
          title: "Direct contact",
          description: "WhatsApp, phone and form for a quick response",
        },
      ],
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.fr;

  return (
    <section ref={ref} className="bg-ar-black py-20 md:py-28">
      <div className="container mx-auto px-4">
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
            {t.title}{" "}
            <span className="text-ar-gold">{t.titleHighlight}</span>
          </h2>
        </motion.div>

        {/* Features grid */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {t.features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
              inView={isInView}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
