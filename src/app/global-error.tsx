"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen bg-ar-black text-white flex items-center justify-center">
        <div className="text-center space-y-6 px-6">
          <h1 className="text-4xl font-playfair font-bold text-ar-gold">
            Erreur inattendue
          </h1>
          <p className="text-ar-silver/70 max-w-md mx-auto">
            Une erreur est survenue. Notre équipe a été notifiée automatiquement.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-ar-gold text-ar-black font-semibold rounded-lg hover:bg-ar-gold/90 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  )
}
