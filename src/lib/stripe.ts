import "server-only"
import Stripe from "stripe"

/**
 * Stripe singleton — sélectionne automatiquement les clés live ou test
 * selon NODE_ENV.
 *
 * Variables d'environnement requises dans .env.local :
 *   - STRIPE_SECRET_KEY       (clé active — test ou live)
 *   - STRIPE_WEBHOOK_SECRET   (webhook secret actif)
 *
 * En production, remplacer simplement les valeurs par les clés live.
 */

function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY manquante dans les variables d'environnement")
  }
  return key
}

export const stripe = new Stripe(getStripeSecretKey(), {
  apiVersion: "2026-02-25.clover",
})

export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET manquante dans les variables d'environnement")
  }
  return secret
}
