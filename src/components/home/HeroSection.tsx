"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { QuickSearchBar } from "@/components/search/QuickSearchBar";
import { createClient } from "@/lib/supabase/client";
import { localePath } from '@/lib/constants'

interface HeroSectionProps {
  locale?: string;
  brands?: string[];
}

// Crown SVG icon
function CrownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V18H19V19Z" />
    </svg>
  );
}

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
}

export function HeroSection({ locale = "fr", brands = [] }: HeroSectionProps) {
  const [vehicleCount, setVehicleCount] = useState(0);
  const [counterFlash, setCounterFlash] = useState(false);
  const animatedCount = useAnimatedCounter(vehicleCount, 2000);

  useEffect(() => {
    async function fetchCount() {
      const supabase = createClient();
      const { count } = await supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .eq("status", "publie");
      setVehicleCount(count || 0);
    }
    fetchCount();
  }, []);

  // Flash the counter when it reaches the final value
  useEffect(() => {
    if (animatedCount > 0 && animatedCount === vehicleCount) {
      setCounterFlash(true);
    }
  }, [animatedCount, vehicleCount]);

  const texts = {
    fr: {
      title: "AUTO ROI",
      services: [
        { label: "Achat", href: `${localePath(locale, '/vehicules')}` },
        { label: "Vente", href: `${localePath(locale, '/vehicules')}` },
        { label: "Reprise", href: `${localePath(locale, '/contact')}` },
        { label: "Location", href: `${localePath(locale, '/location')}` },
      ],
      suffix: "Automobile",
      vehiclesAvailable: "véhicules disponibles",
      scrollDown: "Découvrir",
    },
    en: {
      title: "AUTO ROI",
      services: [
        { label: "Purchase", href: `${localePath(locale, '/vehicules')}` },
        { label: "Sale", href: `${localePath(locale, '/vehicules')}` },
        { label: "Trade-in", href: `${localePath(locale, '/contact')}` },
        { label: "Rental", href: `${localePath(locale, '/location')}` },
      ],
      suffix: "Vehicle",
      vehiclesAvailable: "vehicles available",
      scrollDown: "Discover",
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.fr;

  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], [0, -80]);
  const textY = useTransform(scrollY, [0, 600], [0, -30]);

  const scrollToContent = () => {
    const element = document.getElementById("stats-section");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background image with parallax */}
      <motion.div
        className="absolute inset-0"
        style={prefersReducedMotion ? undefined : { y: bgY }}
      >
        <Image
          src="/hero.jpg"
          alt="Luxury sports car"
          fill
          className="object-cover"
          priority
          quality={75}
          sizes="100vw"
        />
        {/* Gradient overlay from bottom to top */}
        <div className="absolute inset-0 bg-gradient-to-t from-ar-black/65 via-ar-black/40 to-ar-black/30" />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 flex h-full flex-col items-center justify-center px-4"
        style={prefersReducedMotion ? undefined : { y: textY }}
      >
        <div className="flex flex-col items-center text-center">
          {/* Crown icon with animation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <CrownIcon className="h-12 w-12 text-ar-gold" />
          </motion.div>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-display text-5xl font-bold tracking-[0.3em] text-white sm:text-6xl md:text-7xl lg:text-8xl"
          >
            {t.title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-4 flex flex-wrap items-center justify-center gap-x-1 text-sm font-light tracking-[0.2em] text-ar-silver sm:text-base md:text-lg"
          >
            {t.services.map((s, i) => (
              <span key={s.label} className="inline-flex items-center">
                <Link
                  href={s.href}
                  className="transition-colors hover:text-ar-gold"
                >
                  {s.label}
                </Link>
                {i < t.services.length - 1 && (
                  <span className="mx-1.5 sm:mx-2">&mdash;</span>
                )}
              </span>
            ))}
            <span className="ml-1">{t.suffix}</span>
          </motion.p>

          {/* Gold decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="my-8 h-1 w-28 bg-ar-gold"
          />

          {/* Animated vehicle counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mb-12"
          >
            <span
              className={`font-display text-3xl font-bold text-ar-gold md:text-4xl ${counterFlash ? "counter-flash-anim" : ""}`}
            >
              {animatedCount}
            </span>
            <span className="ml-2 text-sm tracking-wider text-ar-silver/80">
              {t.vehiclesAvailable}
            </span>
          </motion.div>
        </div>

        {/* Quick search bar - positioned at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="absolute bottom-24 left-4 right-4 md:bottom-32 md:left-8 md:right-8"
        >
          <div className="mx-auto max-w-5xl">
            <QuickSearchBar locale={locale} brands={brands} />
          </div>
        </motion.div>

        {/* Scroll down indicator */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ar-silver/60 transition-colors hover:text-ar-gold"
          aria-label={t.scrollDown}
        >
          <span className="text-xs uppercase tracking-widest">{t.scrollDown}</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </motion.button>
      </motion.div>
    </section>
  );
}
