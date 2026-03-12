"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react"

interface Photo {
  id: string
  url: string
}

interface VehicleGalleryProps {
  photos: Photo[]
  alt: string
  isSold?: boolean
}

// ─── Animation variants ───────────────────────────────────────────────────────

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0, scale: 0.98 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0, scale: 0.98 }),
}

const EASE = [0.25, 0.1, 0.25, 1] as const

const slideTx = { duration: 0.32, ease: EASE }

const thumbVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE, delay: i * 0.04 },
  }),
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VehicleGallery({ photos, alt, isSold = false }: VehicleGalleryProps) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const total = photos.length

  const navigate = useCallback(
    (idx: number, dir: number) => {
      setDirection(dir)
      setCurrent(idx)
      setZoomed(false)
    },
    []
  )

  const prev = useCallback(
    () => navigate((current - 1 + total) % total, -1),
    [current, total, navigate]
  )
  const next = useCallback(
    () => navigate((current + 1) % total, 1),
    [current, total, navigate]
  )
  const goTo = useCallback(
    (idx: number) => navigate(idx, idx > current ? 1 : -1),
    [current, navigate]
  )

  // Keyboard nav in lightbox
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev()
      else if (e.key === "ArrowRight") next()
      else if (e.key === "Escape") {
        setLightboxOpen(false)
        setZoomed(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [lightboxOpen, prev, next])

  // Lock body scroll when lightbox open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
      setZoomed(false)
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [lightboxOpen])

  // Drag end handler (shared between main photo and lightbox)
  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      if (Math.abs(info.offset.x) > 50 || Math.abs(info.velocity.x) > 300) {
        if (info.offset.x > 0) prev()
        else next()
      }
    },
    [prev, next]
  )

  if (!total) {
    return (
      <div
        className="aspect-video rounded-2xl flex items-center justify-center"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
          Aucune photo disponible
        </span>
      </div>
    )
  }

  // Use reduced-motion: disable slide, just crossfade
  const activeSlideVariants = prefersReducedMotion
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : slideVariants

  return (
    <>
      {/* ── Main photo ── */}
      <div className="relative select-none">
        <div
          className="relative aspect-video overflow-hidden rounded-2xl cursor-pointer gallery-shadow"
          style={{ background: "rgba(7,7,7,0.9)" }}
          onClick={() => setLightboxOpen(true)}
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              variants={activeSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTx}
              className="absolute inset-0"
              drag={total > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.08}
              onDragEnd={total > 1 ? handleDragEnd : undefined}
            >
              <Image
                src={photos[current].url}
                alt={`${alt} — photo ${current + 1}/${total}`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 66vw"
              />
            </motion.div>
          </AnimatePresence>

          {/* Bottom gradient fade */}
          <div
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              background:
                "linear-gradient(180deg, transparent 50%, rgba(7,7,7,0.4) 80%, rgba(7,7,7,0.85) 100%)",
            }}
          />

          {/* Subtle scanlines */}
          <div
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.008) 2px, rgba(255,255,255,0.008) 4px)",
            }}
          />

          {/* VENDU diagonal overlay */}
          {isSold && (
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              style={{ zIndex: 5 }}
            >
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="rotate-[-25deg] border-4 border-red-500 px-10 py-3 font-display font-black text-3xl uppercase tracking-widest text-red-500">
                  Vendu
                </span>
              </div>
            </div>
          )}

          {/* Photo counter */}
          {total > 1 && (
            <div
              className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-white z-[4]"
              style={{
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {current + 1} / {total}
            </div>
          )}

          {/* Agrandir badge */}
          <button
            className="gallery-zoom-badge z-[4]"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxOpen(true)
            }}
            aria-label="Agrandir"
          >
            <ZoomIn className="h-3.5 w-3.5" />
            Agrandir
          </button>

          {/* Arrow navigation */}
          {total > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prev()
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-2.5 text-white transition-all z-[4]"
                style={{
                  background: "rgba(0,0,0,0.55)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
                aria-label="Photo précédente"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  next()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2.5 text-white transition-all z-[4]"
                style={{
                  background: "rgba(0,0,0,0.55)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
                aria-label="Photo suivante"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {total > 1 && total <= 12 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-[4]">
              {photos.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation()
                    goTo(i)
                  }}
                  className="rounded-full"
                  animate={{
                    width: i === current ? 20 : 6,
                    backgroundColor:
                      i === current
                        ? "#C9A84C"
                        : "rgba(255,255,255,0.3)",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                  style={{ height: 6 }}
                  aria-label={`Photo ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Thumbnails ── */}
        {total > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {photos.map((photo, i) => (
              <motion.button
                key={photo.id}
                custom={i}
                variants={thumbVariants}
                initial="hidden"
                animate="visible"
                onClick={() => goTo(i)}
                className={`relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                  i === current
                    ? "border-ar-gold shadow-md shadow-ar-gold/20"
                    : "opacity-60 hover:opacity-90"
                }`}
                style={
                  i !== current
                    ? { borderColor: "rgba(255,255,255,0.12)" }
                    : undefined
                }
                whileHover={i !== current ? { scale: 1.05, opacity: 1 } : undefined}
                aria-label={`Voir photo ${i + 1}`}
              >
                <Image
                  src={photo.url}
                  alt={`${alt} miniature ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.95)" }}
            onClick={() => {
              setLightboxOpen(false)
              setZoomed(false)
            }}
          >
            {/* Close */}
            <button
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/25 transition-colors"
              onClick={() => setLightboxOpen(false)}
              aria-label="Fermer"
            >
              <X size={22} />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white">
              {current + 1} / {total}
            </div>

            {/* Zoom toggle */}
            <button
              className="absolute right-4 bottom-24 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/25 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setZoomed((z) => !z)
              }}
              aria-label={zoomed ? "Dézoomer" : "Zoomer"}
            >
              {zoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
            </button>

            {/* Image with AnimatePresence */}
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={
                  prefersReducedMotion
                    ? {
                        enter: { opacity: 0 },
                        center: { opacity: 1 },
                        exit: { opacity: 0 },
                      }
                    : {
                        enter: (d: number) => ({
                          x: d > 0 ? 80 : -80,
                          opacity: 0,
                          scale: 0.95,
                        }),
                        center: { x: 0, opacity: 1, scale: 1 },
                        exit: (d: number) => ({
                          x: d > 0 ? -80 : 80,
                          opacity: 0,
                          scale: 0.95,
                        }),
                      }
                }
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTx}
                className={`relative w-[90vw] h-[78vh] transition-transform duration-300 ${
                  zoomed ? "scale-[2] cursor-zoom-out" : "cursor-zoom-in"
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  setZoomed((z) => !z)
                }}
                drag={!zoomed && total > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.08}
                onDragEnd={!zoomed && total > 1 ? handleDragEnd : undefined}
              >
                <Image
                  src={photos[current].url}
                  alt={`${alt} — ${current + 1}/${total}`}
                  fill
                  className="object-contain"
                  sizes="90vw"
                />
              </motion.div>
            </AnimatePresence>

            {/* Arrows */}
            {total > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/25 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    prev()
                  }}
                  aria-label="Photo précédente"
                >
                  <ChevronLeft size={26} />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/25 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    next()
                  }}
                  aria-label="Photo suivante"
                >
                  <ChevronRight size={26} />
                </button>
              </>
            )}

            {/* Thumbnail strip at bottom */}
            {total > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 overflow-x-auto max-w-[80vw] z-10">
                {photos.map((photo, i) => (
                  <button
                    key={photo.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      goTo(i)
                    }}
                    className={`relative h-12 w-16 flex-shrink-0 overflow-hidden rounded border-2 transition-all ${
                      i === current
                        ? "border-ar-gold"
                        : "border-white/20 opacity-50 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={photo.url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
