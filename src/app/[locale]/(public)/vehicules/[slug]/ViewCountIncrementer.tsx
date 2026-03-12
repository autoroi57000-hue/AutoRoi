"use client"

import { useEffect, useRef } from "react"
import { incrementViewsCount } from "./actions"

interface Props {
  vehicleId: string
}

export function ViewCountIncrementer({ vehicleId }: Props) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    // Fire-and-forget — does not block page render
    incrementViewsCount(vehicleId)
  }, [vehicleId])

  return null
}
