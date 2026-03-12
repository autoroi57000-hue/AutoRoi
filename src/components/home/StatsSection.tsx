"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface StatsSectionProps {
  locale?: string;
}

interface StatItemProps {
  value: string;
  label: string;
  delay?: number;
}

function AnimatedNumber({ value, inView }: { value: string; inView: boolean }) {
  const [displayValue, setDisplayValue] = useState("0");
  const [isAnimating, setIsAnimating] = useState(false);
  const numericPart = value.replace(/\D/g, "");
  const suffix = value.replace(/[0-9]/g, "");
  const numValue = parseInt(numericPart) || 0;

  useEffect(() => {
    if (!inView) return;
    setIsAnimating(true);
    const glowTimer = setTimeout(() => setIsAnimating(false), 2200);

    let startTime: number;
    let animationFrame: number;
    const duration = 2000;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * numValue).toString());

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(numericPart);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(animationFrame); clearTimeout(glowTimer); };
  }, [inView, numValue, numericPart]);

  return (
    <span
      style={isAnimating ? {
        textShadow: '0 0 30px rgba(201,168,76,0.65), 0 0 60px rgba(201,168,76,0.25)',
        transition: 'text-shadow 400ms ease',
      } : {
        textShadow: 'none',
        transition: 'text-shadow 800ms ease',
      }}
    >
      {displayValue}
      {suffix}
    </span>
  );
}

function StatItem({ value, label, delay = 0 }: StatItemProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center"
    >
      <span className="font-display text-5xl font-bold text-ar-gold md:text-6xl lg:text-7xl">
        <AnimatedNumber value={value} inView={isInView} />
      </span>
      <span className="mt-2 text-sm uppercase tracking-[0.2em] text-ar-silver/70 md:text-base">
        {label}
      </span>
    </motion.div>
  );
}

export function StatsSection({ locale = "fr" }: StatsSectionProps) {
  const texts = {
    fr: {
      stats: [
        { value: "100+", label: "Véhicules en stock" },
        { value: "2", label: "Langues (FR & EN)" },
        { value: "7j/7", label: "Disponible" },
      ],
    },
    en: {
      stats: [
        { value: "100+", label: "Vehicles in stock" },
        { value: "2", label: "Languages (FR & EN)" },
        { value: "7/7", label: "Available" },
      ],
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.fr;

  return (
    <section id="stats-section" className="relative bg-ar-black py-16 md:py-24">
      {/* Top gold separator */}
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)' }} />
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-12 md:flex-row md:gap-0">
          {t.stats.map((stat, index) => (
            <Fragment key={stat.label}>
              <div className="flex-1">
                <StatItem
                  value={stat.value}
                  label={stat.label}
                  delay={index * 0.2}
                />
              </div>
              {index < t.stats.length - 1 && (
                <div className="hidden h-16 w-px md:block" style={{ background: 'linear-gradient(180deg, transparent, rgba(201,168,76,0.25), transparent)' }} />
              )}
            </Fragment>
          ))}
        </div>
      </div>
      {/* Bottom gold separator */}
      <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)' }} />
    </section>
  );
}
