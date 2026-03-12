"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Phone, Mail } from "lucide-react";

interface ContactCTASectionProps {
  locale?: string;
  whatsappNumber: string;
  phoneNumber: string;
  whatsappMessageFr: string;
  whatsappMessageEn: string;
}

export function ContactCTASection({
  locale = "fr",
  whatsappNumber,
  phoneNumber,
  whatsappMessageFr,
  whatsappMessageEn,
}: ContactCTASectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const texts = {
    fr: {
      eyebrow: "Votre prochain véhicule vous attend",
      title: "UN VÉHICULE VOUS INTÉRESSE ?",
      subtitle: "Notre équipe vous répond sous 24h — par WhatsApp, téléphone ou formulaire.",
      buttons: {
        whatsapp: "Contacter via WhatsApp",
        call: "Appeler maintenant",
        form: "Formulaire de contact",
      },
    },
    en: {
      eyebrow: "Your next vehicle awaits you",
      title: "INTERESTED IN A VEHICLE?",
      subtitle: "Our team responds within 24h — via WhatsApp, phone or contact form.",
      buttons: {
        whatsapp: "Contact via WhatsApp",
        call: "Call now",
        form: "Contact form",
      },
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.fr;

  const message = locale === "fr" ? whatsappMessageFr : whatsappMessageEn;

  const phone = whatsappNumber.replace(/\D/g, "");
  const whatsappHref = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <section ref={ref} className="relative overflow-hidden py-28 md:py-36">
      {/* Dark background with deep gold radial */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 60%, rgba(201,168,76,0.08) 0%, transparent 65%), #070707',
        }}
      />

      {/* Animated ambient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute"
          style={{
            top: '-15%', left: '-8%',
            width: 480, height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%)',
            animation: 'float-1 14s ease-in-out infinite',
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: '-15%', right: '-8%',
            width: 380, height: 380,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,168,76,0.055) 0%, transparent 65%)',
            animation: 'float-2 18s ease-in-out infinite',
          }}
        />
      </div>

      {/* Top separator */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.35), transparent)' }}
      />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mb-6 flex items-center justify-center gap-4"
          >
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-ar-gold" />
            <span
              className="text-xs font-medium uppercase tracking-[0.3em]"
              style={{ color: 'rgba(201,168,76,0.65)' }}
            >
              {t.eyebrow}
            </span>
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-ar-gold" />
          </motion.div>

          {/* Shimmer title */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="cta-dark-title mb-5 text-4xl md:text-5xl lg:text-6xl"
            style={{ letterSpacing: '-0.01em', lineHeight: 1.1 }}
          >
            {t.title}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mb-10 max-w-xl text-base leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.38)' }}
          >
            {t.subtitle}
          </motion.p>

          {/* Gold divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mx-auto mb-12 h-px w-20"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.55), transparent)' }}
          />

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center"
          >
            {/* WhatsApp — gold shimmer */}
            <div className="w-full sm:w-auto">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="wa-gold"
              >
                <svg className="h-5 w-5 flex-shrink-0" style={{ fill: '#0A0A0A' }} viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t.buttons.whatsapp}
              </a>
            </div>

            {/* Phone — gold outline */}
            <div className="w-full sm:w-auto">
              <a href={`tel:${phoneNumber}`} className="phone-btn">
                <Phone className="h-4 w-4 flex-shrink-0" />
                {t.buttons.call}
              </a>
            </div>

            {/* Form — subtle */}
            <div className="w-full sm:w-auto">
              <Link href={`/${locale}/contact`} className="msg-btn justify-center">
                <Mail className="h-4 w-4 flex-shrink-0" style={{ color: '#C9A84C' }} />
                {t.buttons.form}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom separator */}
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.35), transparent)' }}
      />
    </section>
  );
}
