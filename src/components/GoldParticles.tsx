"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  size: number
  alpha: number
  maxAlpha: number
  speed: number
  drift: number
  phase: number
  life: number
  maxLife: number
  state: "in" | "live" | "out"
}

const FADE_FRAMES = 80

function createParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    size: 1 + Math.random() * 1.5,
    alpha: 0,
    maxAlpha: 0.3 + Math.random() * 0.4,
    speed: 0.15 + Math.random() * 0.25,
    drift: 0.3 + Math.random() * 0.4,
    phase: Math.random() * Math.PI * 2,
    life: 0,
    maxLife: 300 + Math.random() * 400,
    state: "in",
  }
}

interface GoldParticlesProps {
  /** "fixed" for global overlay, "absolute" for within a parent */
  mode?: "fixed" | "absolute"
  /** Number of particles */
  count?: number
}

export function GoldParticles({ mode = "fixed", count = 18 }: GoldParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let rafId: number
    let w = 0
    let h = 0

    const resize = () => {
      if (mode === "fixed") {
        w = window.innerWidth
        h = window.innerHeight
      } else {
        const rect = canvas.parentElement?.getBoundingClientRect()
        if (!rect) return
        w = rect.width
        h = rect.height
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()

    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      const p = createParticle(w, h)
      // Stagger initial life so they don't all appear at once
      p.life = Math.random() * p.maxLife
      p.state = "live"
      p.alpha = p.maxAlpha
      particles.push(p)
    }

    const animate = () => {
      ctx.clearRect(0, 0, w, h)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Movement
        p.y -= p.speed
        p.x += Math.sin(p.phase + p.life * 0.008) * p.drift * 0.3
        p.life++

        // State machine
        if (p.state === "in") {
          p.alpha = Math.min(p.maxAlpha, p.alpha + p.maxAlpha / FADE_FRAMES)
          if (p.alpha >= p.maxAlpha) p.state = "live"
        } else if (p.state === "live") {
          if (p.life >= p.maxLife - FADE_FRAMES) p.state = "out"
        } else if (p.state === "out") {
          p.alpha = Math.max(0, p.alpha - p.maxAlpha / FADE_FRAMES)
          if (p.alpha <= 0) {
            // Reset at bottom
            const np = createParticle(w, h)
            np.y = h + 10
            particles[i] = np
            continue
          }
        }

        // Reset if out of bounds
        if (p.y < -10) {
          const np = createParticle(w, h)
          np.y = h + 10
          particles[i] = np
          continue
        }

        // Draw
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201, 168, 76, ${p.alpha})`
        ctx.fill()
      }

      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)

    if (mode === "fixed") {
      window.addEventListener("resize", resize, { passive: true })
    } else {
      const ro = new ResizeObserver(resize)
      ro.observe(canvas.parentElement!)
      return () => { cancelAnimationFrame(rafId); ro.disconnect() }
    }

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("resize", resize)
    }
  }, [mode, count])

  return (
    <canvas
      ref={canvasRef}
      className={mode === "fixed" ? "fixed inset-0 pointer-events-none" : "absolute inset-0 pointer-events-none"}
      style={{ zIndex: 2 }}
      aria-hidden="true"
    />
  )
}
