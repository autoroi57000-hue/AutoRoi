"use client"

import { useRef, useCallback, type ReactNode } from "react"
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion"

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  /** Max attraction distance in px (default 10) */
  strength?: number
}

/**
 * Wraps children with a subtle magnetic pull effect on hover.
 * Desktop only — disabled on touch devices and when prefers-reduced-motion.
 */
export function MagneticButton({
  children,
  className,
  strength = 0.25,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const canHover = useRef<boolean | null>(null)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 200, damping: 18 })
  const y = useSpring(rawY, { stiffness: 200, damping: 18 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion) return
      if (canHover.current === null) {
        canHover.current = window.matchMedia("(hover: hover)").matches
      }
      if (!canHover.current) return

      const rect = ref.current?.getBoundingClientRect()
      if (!rect) return

      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distX = e.clientX - centerX
      const distY = e.clientY - centerY

      // Clamp to max 10px
      const moveX = Math.max(-10, Math.min(10, distX * strength))
      const moveY = Math.max(-10, Math.min(10, distY * strength))

      rawX.set(moveX)
      rawY.set(moveY)
    },
    [prefersReducedMotion, strength, rawX, rawY]
  )

  const handleMouseLeave = useCallback(() => {
    rawX.set(0)
    rawY.set(0)
  }, [rawX, rawY])

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  )
}
