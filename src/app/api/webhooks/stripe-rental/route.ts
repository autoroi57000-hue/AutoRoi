import * as Sentry from "@sentry/nextjs"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase/server"
import { sendRentalEmail } from "@/lib/rental-emails"
import { generateRentalContract } from "@/lib/rental-contract"
import type { Rental } from "@/types/rental"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
})

// IMPORTANT : En App Router, on utilise request.text() directement.
// Pas de config bodyParser à désactiver (contrairement aux Pages Routes).
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    console.warn("Webhook Stripe reçu sans signature")
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 })
  }

  // 1. Vérifier la signature Stripe (protège contre les faux webhooks)
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signature invalide"
    console.error("Stripe webhook signature invalide:", message)
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 })
  }

  // 2. Dispatcher selon le type d'événement
  switch (event.type) {
    case "checkout.session.completed": {
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
      break
    }

    case "checkout.session.expired": {
      await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session)
      break
    }

    default:
      // Événement non géré — on accuse réception sans traitement
      break
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

// ─── Handler : paiement réussi ────────────────────────────────────────────────

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const rentalId = session.metadata?.rental_id
  if (!rentalId) {
    Sentry.captureMessage("Stripe webhook: rental_id absent des metadata", {
      level: "error",
      extra: { sessionId: session.id },
    })
    console.error("checkout.session.completed : rental_id absent des metadata", session.id)
    return
  }

  Sentry.setContext("stripe_webhook", { rentalId, sessionId: session.id, event: "checkout.session.completed" })

  const supabase = createAdminClient()

  // 3. Récupérer la réservation avant mise à jour (pour les emails)
  const { data: rentalBefore, error: fetchError } = await supabase
    .from("rentals")
    .select("*, rental_vehicle:rental_vehicles(*)")
    .eq("id", rentalId)
    .single()

  if (fetchError || !rentalBefore) {
    console.error(`handleCheckoutSessionCompleted : réservation ${rentalId} introuvable`, fetchError)
    return
  }

  const rental = rentalBefore as unknown as Rental

  // Idempotence : si déjà traité, ne rien faire
  if (rental.deposit_paid) {
    return
  }

  // 4. Mettre à jour la réservation
  const { error: updateError } = await supabase
    .from("rentals")
    .update({
      status: "deposit_paid",
      deposit_paid: true,
      deposit_paid_at: new Date().toISOString(),
      stripe_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null),
    } as never)
    .eq("id", rentalId)

  if (updateError) {
    Sentry.captureException(updateError, { tags: { action: "stripe_webhook", step: "rental_update" } })
    console.error(`Erreur mise à jour réservation ${rentalId}:`, updateError)
    // On ne retourne pas d'erreur à Stripe pour éviter les retry infinis
    // Le problème est loggué et doit être traité manuellement
    return
  }

  // 5. Construire le rental mis à jour pour les emails
  const updatedRental: Rental = {
    ...(rental as Rental),
    status: "deposit_paid",
    deposit_paid: true,
    deposit_paid_at: new Date().toISOString(),
    stripe_payment_intent_id:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent as Stripe.PaymentIntent)?.id ?? null,
  }

  // 6. Envoyer l'email de confirmation au client
  try {
    await sendRentalEmail("payment_received", updatedRental, { locale: "fr" })
  } catch (emailErr) {
    Sentry.captureException(emailErr, { tags: { action: "sendRentalEmail", type: "payment_received" } })
    console.error(`Email payment_received échoué pour ${rentalId}:`, emailErr)
    // Non bloquant : le paiement est confirmé même si l'email échoue
  }

  // 7. Générer le contrat PDF (arrière-plan — ne bloque pas la réponse webhook)
  // sendRentalEmail('contract_ready') est appelé à l'intérieur de generateRentalContract
  generateRentalContract(rentalId).catch((contractErr) => {
    Sentry.captureException(contractErr, { tags: { action: "generateRentalContract" } })
    console.error(`generateRentalContract échoué pour ${rentalId}:`, contractErr)
  })

}


// ─── Handler : session expirée sans paiement ──────────────────────────────────

async function handleCheckoutSessionExpired(
  session: Stripe.Checkout.Session
): Promise<void> {
  const rentalId = session.metadata?.rental_id
  if (!rentalId) return

  const supabase = createAdminClient()

  // Nettoyer la session expirée pour permettre une nouvelle tentative
  await supabase
    .from("rentals")
    .update({
      stripe_session_id: null,
      stripe_checkout_expires_at: null,
    } as never)
    .eq("id", rentalId)
    .eq("status", "pending") // ne toucher qu'aux pending (pas aux deposit_paid)

}

