"use client"

import { useEffect, useRef, useState, useCallback } from "react"

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

type CursorState = "default" | "pointer" | "view"

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const mouse = useRef({ x: -1000, y: -1000 })
  const ring = useRef({ x: -1000, y: -1000 })
  const rafId = useRef<number>(0)
  const [visible, setVisible] = useState(false)
  const [cursorState, setCursorState] = useState<CursorState>("default")

  // Detect if we should show custom cursor at all
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    // Only enable on devices with fine pointer + no reduced motion preference
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    // Also skip touch-primary devices
    const isTouchPrimary = "ontouchstart" in window && !hasFinePointer

    if (hasFinePointer && !prefersReducedMotion && !isTouchPrimary) {
      setEnabled(true)
    }
  }, [])

  const hasMovedOnce = useRef(false)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouse.current.x = e.clientX
    mouse.current.y = e.clientY
    if (!hasMovedOnce.current) {
      // Snap ring to mouse on first move (no lerp from -1000)
      ring.current.x = e.clientX
      ring.current.y = e.clientY
      hasMovedOnce.current = true
    }
    if (!visible) setVisible(true)
  }, [visible])

  const handleMouseLeave = useCallback(() => {
    setVisible(false)
  }, [])

  const handleMouseEnter = useCallback(() => {
    setVisible(true)
  }, [])

  // Detect hover targets
  const handleElementDetection = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target) return

    // Check if hovering a clickable element
    const clickable = target.closest(
      'a, button, [role="button"], input[type="submit"], [data-cursor="pointer"], label[for], select, summary'
    )
    // Check if hovering a vehicle card link (has vehicle-card-glow or vehicle-card-3d)
    const vehicleCard = target.closest(
      '.vehicle-card-glow, .vehicle-card-3d, [data-cursor="view"]'
    )

    if (vehicleCard) {
      setCursorState("view")
    } else if (clickable) {
      setCursorState("pointer")
    } else {
      setCursorState("default")
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    // Add cursor-hidden class to html element
    document.documentElement.classList.add("custom-cursor-active")

    document.addEventListener("mousemove", handleMouseMove, { passive: true })
    document.addEventListener("mousemove", handleElementDetection, { passive: true })
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseenter", handleMouseEnter)

    // Animation loop
    const animate = () => {
      ring.current.x = lerp(ring.current.x, mouse.current.x, 0.12)
      ring.current.y = lerp(ring.current.y, mouse.current.y, 0.12)

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y}px) translate(-50%, -50%)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px) translate(-50%, -50%)`
      }

      rafId.current = requestAnimationFrame(animate)
    }
    rafId.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafId.current)
      document.documentElement.classList.remove("custom-cursor-active")
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mousemove", handleElementDetection)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, [enabled, handleMouseMove, handleElementDetection, handleMouseLeave, handleMouseEnter])

  if (!enabled) return null

  const isPointer = cursorState === "pointer"
  const isView = cursorState === "view"

  return (
    <>
      {/* Ring — follows with lerp delay */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: isView ? 64 : isPointer ? 48 : 28,
          height: isView ? 64 : isPointer ? 48 : 28,
          borderRadius: "50%",
          border: `1px solid ${
            isView
              ? "rgba(201,168,76,0.7)"
              : isPointer
                ? "rgba(201,168,76,0.6)"
                : "rgba(201,168,76,0.5)"
          }`,
          background: isView
            ? "rgba(201,168,76,0.08)"
            : isPointer
              ? "rgba(201,168,76,0.05)"
              : "transparent",
          pointerEvents: "none",
          zIndex: 99999,
          opacity: visible ? 1 : 0,
          transition:
            "width 0.3s cubic-bezier(0.25,0.1,0.25,1), height 0.3s cubic-bezier(0.25,0.1,0.25,1), border-color 0.25s ease, background 0.25s ease, opacity 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          willChange: "transform",
        }}
      >
        {/* "VOIR" label inside ring */}
        <span
          ref={labelRef}
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.55rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase" as const,
            color: "#C9A84C",
            opacity: isView ? 1 : 0,
            transform: isView ? "scale(1)" : "scale(0.5)",
            transition: "opacity 0.2s ease, transform 0.2s ease",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          VOIR
        </span>
      </div>

      {/* Dot — follows instantly */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: isPointer || isView ? 0 : 4,
          height: isPointer || isView ? 0 : 4,
          borderRadius: "50%",
          background: "#C9A84C",
          pointerEvents: "none",
          zIndex: 99999,
          opacity: visible ? 1 : 0,
          transition:
            "width 0.2s ease, height 0.2s ease, opacity 0.2s ease",
          willChange: "transform",
        }}
      />
    </>
  )
}
