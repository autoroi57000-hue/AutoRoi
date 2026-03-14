"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles, Calendar, Gauge, Fuel } from "lucide-react";
import type { VehicleCard as VehicleCardType } from "@/types/vehicle";
import { formatPrice, formatMileage } from "@/lib/utils";
import { FUEL_LABELS, localePath} from '@/lib/constants';

interface LatestArrivalsSectionProps {
  locale?: string;
  vehicles: VehicleCardType[];
}

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

function isNewVehicle(publishedAt: string | null): boolean {
  return !!publishedAt && new Date(publishedAt) > new Date(Date.now() - SEVEN_DAYS);
}

export function LatestArrivalsSection({
  locale = "fr",
  vehicles,
}: LatestArrivalsSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const texts = {
    fr: {
      title: "NOUVELLES ARRIVÉES",
      subtitle: "Derniers véhicules ajoutés",
      viewAll: "Voir tout le catalogue →",
      viewListing: "Voir l'annonce",
      noVehicles: "Aucun véhicule disponible pour le moment",
      noVehiclesSub: "Revenez bientôt, de nouvelles arrivées sont prévues.",
      noVehiclesCTA: "Voir nos annonces",
    },
    en: {
      title: "NEW ARRIVALS",
      subtitle: "Recently added vehicles",
      viewAll: "View all vehicles →",
      viewListing: "View listing",
      noVehicles: "No vehicles available at the moment",
      noVehiclesSub: "Check back soon, new arrivals are coming.",
      noVehiclesCTA: "View our listings",
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.fr;

  return (
    <section ref={ref} className="relative overflow-hidden py-20 md:py-28">
      {/* CSS animations */}
      <style>{`
        @keyframes shimmer-title {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .latest-shimmer-title {
          background: linear-gradient(135deg, #FFFFFF 0%, #FFE08A 50%, #FFFFFF 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-title 6s linear infinite;
        }
        .arrival-card {
          border: 1px solid rgba(255,255,255,0.08);
          transition: border-color 350ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .arrival-card:hover {
          border-color: rgba(201,168,76,0.4);
        }
        .arrival-card-btn {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 250ms ease 50ms, transform 250ms ease 50ms;
        }
        @media (hover: hover) {
          .arrival-card-btn {
            opacity: 0;
            transform: translateY(8px);
          }
          .arrival-card:hover .arrival-card-btn {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .arrival-card-line {
          opacity: 0;
          transition: opacity 350ms ease;
        }
        .arrival-card:hover .arrival-card-line {
          opacity: 1;
        }
        .arrival-card-img {
          transition: transform 500ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .arrival-card:hover .arrival-card-img {
          transform: scale(1.06);
        }
      `}</style>

      {/* Orbe gauche */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: "-10%",
          top: "50%",
          transform: "translateY(-50%)",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(ellipse, rgba(201,168,76,0.06), transparent 60%)",
        }}
      />
      {/* Orbe droit */}
      <div
        className="pointer-events-none absolute"
        style={{
          right: "-10%",
          top: "50%",
          transform: "translateY(-50%)",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(ellipse, rgba(201,168,76,0.04), transparent 60%)",
          opacity: 0.04,
        }}
      />

      <div className="container relative mx-auto px-4">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-4">
            <span
              className="block h-px"
              style={{
                width: "80px",
                background:
                  "linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)",
              }}
            />
            <span
              className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em]"
              style={{ color: "#C9A84C" }}
            >
              <Sparkles className="h-4 w-4" />
              {t.subtitle}
              <Sparkles className="h-4 w-4" />
            </span>
            <span
              className="block h-px"
              style={{
                width: "80px",
                background:
                  "linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)",
              }}
            />
          </div>

          <h2 className="latest-shimmer-title font-display text-3xl font-bold md:text-4xl lg:text-5xl">
            {t.title}
          </h2>
        </motion.div>

        {vehicles.length > 0 ? (
          <>
            {/* Grille */}
            <div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              style={{ maxWidth: "1200px", margin: "0 auto" }}
            >
              {vehicles.slice(0, 3).map((vehicle, index) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.12,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                >
                  <Link
                    href={`${localePath(locale, `/vehicules/${vehicle.slug}`)}`}
                    className="block"
                    tabIndex={0}
                  >
                    <motion.div
                      className="arrival-card relative cursor-pointer"
                      style={{
                        borderRadius: "20px",
                        background: "rgba(255,255,255,0.03)",
                        overflow: "hidden",
                      }}
                      whileHover={{
                        y: -8,
                        scale: 1.01,
                        boxShadow:
                          "0 0 0 1px rgba(201,168,76,0.15), 0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(201,168,76,0.06)",
                        transition: {
                          duration: 0.35,
                          ease: [0.4, 0, 0.2, 1],
                        },
                      }}
                    >
                      {/* ── Image ── */}
                      <div
                        className="relative overflow-hidden"
                        style={{ height: "220px" }}
                      >
                        {vehicle.cover_url ? (
                          <Image
                            src={vehicle.cover_url}
                            alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
                            fill
                            loading="lazy"
                            quality={75}
                            className="arrival-card-img object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div
                            className="flex h-full items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.02)" }}
                          >
                            <svg
                              width="48"
                              height="48"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{
                                color: "rgba(255,255,255,0.15)",
                              }}
                            >
                              <path d="M19 17H5a2 2 0 0 1-2-2V9l3-4h10l3 4v6a2 2 0 0 1-2 2z" />
                              <circle cx="7.5" cy="17" r="2" />
                              <circle cx="16.5" cy="17" r="2" />
                            </svg>
                          </div>
                        )}

                        {/* Overlay gradient */}
                        <div
                          className="absolute inset-0 z-10"
                          style={{
                            background:
                              "linear-gradient(180deg, transparent 40%, rgba(7,7,7,0.85) 100%)",
                          }}
                        />

                        {/* Badge VENDU */}
                        {vehicle.status === "vendu" && (
                          <div
                            className="absolute left-[14px] top-[14px] z-20"
                            style={{
                              background: "rgba(255,50,50,0.85)",
                              backdropFilter: "blur(8px)",
                              color: "white",
                              fontWeight: 700,
                              fontSize: "0.62rem",
                              letterSpacing: "0.12em",
                              borderRadius: "6px",
                              padding: "4px 10px",
                            }}
                          >
                            VENDU
                          </div>
                        )}

                        {/* Badge NOUVEAU */}
                        {vehicle.status !== "vendu" &&
                          isNewVehicle(vehicle.published_at) && (
                            <div
                              className="absolute left-[14px] top-[14px] z-20"
                              style={{
                                background: "rgba(201,168,76,0.9)",
                                backdropFilter: "blur(8px)",
                                color: "#0A0A0A",
                                fontWeight: 700,
                                fontSize: "0.62rem",
                                letterSpacing: "0.12em",
                                borderRadius: "6px",
                                padding: "4px 10px",
                              }}
                            >
                              NOUVEAU
                            </div>
                          )}

                        {/* Badge prix glassmorphism */}
                        <div
                          className="absolute bottom-4 left-4 z-20"
                          style={{
                            background: "rgba(0,0,0,0.65)",
                            backdropFilter: "blur(12px) saturate(180%)",
                            border: "1px solid rgba(201,168,76,0.3)",
                            borderRadius: "10px",
                            padding: "8px 14px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "1.1rem",
                              background:
                                "linear-gradient(90deg, #C9A84C, #FFE08A)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                            }}
                          >
                            {formatPrice(vehicle.price)}
                          </span>
                          {vehicle.price_negotiable && (
                            <span
                              className="ml-1.5 text-xs"
                              style={{ color: "rgba(255,255,255,0.45)" }}
                            >
                              nég.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ── Contenu ── */}
                      <div className="relative p-5 pb-6">
                        {/* Marque + Modèle */}
                        <h3
                          style={{
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            color: "white",
                            letterSpacing: "-0.01em",
                            lineHeight: 1.3,
                          }}
                        >
                          {vehicle.brand} {vehicle.model}
                        </h3>

                        {vehicle.version && (
                          <p
                            className="mt-0.5 line-clamp-1"
                            style={{
                              fontSize: "0.82rem",
                              color: "rgba(255,255,255,0.4)",
                            }}
                          >
                            {vehicle.version}
                          </p>
                        )}

                        {/* Tags specs */}
                        <div className="mt-[14px] flex flex-wrap gap-2">
                          <span
                            className="flex items-center gap-1"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.09)",
                              borderRadius: "6px",
                              padding: "4px 10px",
                              fontSize: "0.73rem",
                              color: "rgba(255,255,255,0.55)",
                            }}
                          >
                            <Calendar
                              className="h-3 w-3 shrink-0"
                              style={{ color: "#C9A84C" }}
                            />
                            {vehicle.year}
                          </span>
                          <span
                            className="flex items-center gap-1"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.09)",
                              borderRadius: "6px",
                              padding: "4px 10px",
                              fontSize: "0.73rem",
                              color: "rgba(255,255,255,0.55)",
                            }}
                          >
                            <Gauge
                              className="h-3 w-3 shrink-0"
                              style={{ color: "#C9A84C" }}
                            />
                            {formatMileage(vehicle.mileage)}
                          </span>
                          <span
                            className="flex items-center gap-1"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.09)",
                              borderRadius: "6px",
                              padding: "4px 10px",
                              fontSize: "0.73rem",
                              color: "rgba(255,255,255,0.55)",
                            }}
                          >
                            <Fuel
                              className="h-3 w-3 shrink-0"
                              style={{ color: "#C9A84C" }}
                            />
                            {FUEL_LABELS[vehicle.fuel]}
                          </span>
                        </div>

                        {/* Bouton "Voir l'annonce" — apparaît au hover */}
                        <div className="arrival-card-btn mt-4">
                          <div
                            className="flex w-full items-center justify-center gap-2"
                            style={{
                              background:
                                "linear-gradient(135deg, #B8972A, #C9A84C, #FFE08A)",
                              color: "#0A0A0A",
                              fontWeight: 700,
                              borderRadius: "10px",
                              padding: "10px 20px",
                              fontSize: "0.85rem",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {t.viewListing}
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>

                      {/* Ligne décorative bas de carte — apparaît au hover */}
                      <div
                        className="arrival-card-line absolute bottom-0 left-0 right-0"
                        style={{
                          height: "2px",
                          background:
                            "linear-gradient(90deg, transparent, #C9A84C, #FFE08A, #C9A84C, transparent)",
                        }}
                      />
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* CTA "Voir tout le catalogue" */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 text-center"
            >
              <Link href={`${localePath(locale, '/vehicules')}`}>
                <motion.span
                  className="group inline-flex cursor-pointer items-center gap-2"
                  style={{
                    background: "transparent",
                    border: "1.5px solid rgba(201,168,76,0.35)",
                    borderRadius: "14px",
                    padding: "14px 36px",
                    color: "#C9A84C",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    fontSize: "0.9rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  whileHover={{
                    backgroundColor: "rgba(201,168,76,0.07)",
                    borderColor: "#C9A84C",
                    boxShadow: "0 0 30px rgba(201,168,76,0.12)",
                    y: -2,
                    transition: { duration: 0.25 },
                  }}
                >
                  {t.viewAll}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </motion.span>
              </Link>
            </motion.div>
          </>
        ) : (
          /* ── État vide ── */
          <div className="py-16 text-center">
            <div className="mb-6 flex justify-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "#C9A84C", opacity: 0.3 }}
              >
                <path d="M19 17H5a2 2 0 0 1-2-2V9l3-4h10l3 4v6a2 2 0 0 1-2 2z" />
                <circle cx="7.5" cy="17" r="2" />
                <circle cx="16.5" cy="17" r="2" />
                <path d="M5 9h14" />
              </svg>
            </div>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "1rem" }}>
              {t.noVehicles}
            </p>
            <p
              className="mt-2"
              style={{
                color: "rgba(255,255,255,0.18)",
                fontSize: "0.85rem",
              }}
            >
              {t.noVehiclesSub}
            </p>
            <Link
              href={`${localePath(locale, '/vehicules')}`}
              className="mt-6 inline-flex items-center gap-2"
              style={{
                border: "1px solid rgba(201,168,76,0.35)",
                borderRadius: "10px",
                padding: "10px 24px",
                color: "#C9A84C",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              {t.noVehiclesCTA}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
