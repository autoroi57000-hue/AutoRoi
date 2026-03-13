import { redirect } from "next/navigation"
import Link from "next/link"
import { stripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils"
import { SITE_NAME } from "@/lib/constants"
import { CheckCircle2, Calendar, Car, CreditCard, ChevronRight, Home } from "lucide-react"
import type { Rental } from "@/types/rental"

interface PageProps {
  params: { locale: string }
  searchParams: { session_id?: string }
}

function formatDate(isoDate: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate))
}

export default async function RentalConfirmationPage({ params, searchParams }: PageProps) {
  const { locale } = params
  const { session_id } = searchParams
  const isFr = locale !== "en"

  // 1. session_id absent → redirection catalogue
  if (!session_id) {
    redirect(`/${locale}/location`)
  }

  // 2. Vérifier la session Stripe côté serveur
  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent"],
    })
  } catch {
    redirect(`/${locale}/location`)
  }

  // 3. Vérifier que le paiement est bien réussi
  if (session.payment_status !== "paid") {
    redirect(`/${locale}/location`)
  }

  // 4. Récupérer la réservation depuis les metadata
  const rentalId = session.metadata?.rental_id
  if (!rentalId) {
    redirect(`/${locale}/location`)
  }

  const supabase = createAdminClient()
  const { data: rentalData } = await supabase
    .from("rentals")
    .select("*, rental_vehicle:rental_vehicles(id, brand, model, year, cover_photo, slug)")
    .eq("id", rentalId)
    .single()

  if (!rentalData) {
    redirect(`/${locale}/location`)
  }

  const rental = rentalData as unknown as Rental
  const vehicle = rental.rental_vehicle

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent as Stripe.PaymentIntent)?.id

  return (
    <div className="min-h-screen pt-16">
      {/* ── Background décor ── */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 60%)",
          zIndex: 0,
        }}
      />

      <div className="relative container mx-auto px-4 py-12 max-w-2xl" style={{ zIndex: 1 }}>

        {/* ── Breadcrumb ── */}
        <nav
          className="flex items-center gap-1.5 text-xs mb-8"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          <Link href={`/${locale}`} className="hover:text-ar-gold transition-colors flex items-center gap-1">
            <Home className="h-3 w-3" />
            {isFr ? "Accueil" : "Home"}
          </Link>
          <ChevronRight className="h-3 w-3 opacity-40" />
          <Link href={`/${locale}/location`} className="hover:text-ar-gold transition-colors">
            {isFr ? "Location" : "Rental"}
          </Link>
          <ChevronRight className="h-3 w-3 opacity-40" />
          <span style={{ color: "rgba(255,255,255,0.7)" }}>
            {isFr ? "Confirmation" : "Confirmation"}
          </span>
        </nav>

        {/* ── Header succès ── */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)" }}
          >
            <CheckCircle2 className="h-10 w-10" style={{ color: "#C9A84C" }} />
          </div>
          <h1
            className="font-display font-extrabold text-white mb-3"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
          >
            {isFr ? "Acompte reçu ✓" : "Deposit received ✓"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "1rem" }}>
            {isFr
              ? "Votre réservation est définitivement confirmée."
              : "Your booking is definitively confirmed."}
          </p>
        </div>

        {/* ── Référence ── */}
        <div
          className="text-center rounded-2xl p-5 mb-6"
          style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)" }}
        >
          <p
            className="text-xs font-bold uppercase mb-1"
            style={{ color: "rgba(201,168,76,0.6)", letterSpacing: "0.2em" }}
          >
            {isFr ? "Référence de réservation" : "Booking reference"}
          </p>
          <p
            className="font-display font-bold"
            style={{ color: "#C9A84C", fontSize: "2rem", letterSpacing: "0.15em" }}
          >
            {rental.reference}
          </p>
        </div>

        {/* ── Carte récap ── */}
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* Photo véhicule */}
          {vehicle?.cover_photo && (
            <div className="relative h-44 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={vehicle.cover_photo}
                alt={`${vehicle.brand ?? ""} ${vehicle.model ?? ""}`}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(10,10,10,0.8) 0%, transparent 60%)" }}
              />
            </div>
          )}

          <div className="p-6 space-y-4">
            {/* Véhicule */}
            {vehicle && (
              <div className="flex items-center gap-3 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(201,168,76,0.1)" }}
                >
                  <Car className="h-5 w-5" style={{ color: "#C9A84C" }} />
                </div>
                <div>
                  <p className="font-bold text-white">
                    {vehicle.brand} {vehicle.model}
                    {vehicle.year ? ` (${vehicle.year})` : ""}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {isFr ? "Véhicule loué" : "Rented vehicle"}
                  </p>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="flex items-start gap-3 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
                style={{ background: "rgba(201,168,76,0.1)" }}
              >
                <Calendar className="h-5 w-5" style={{ color: "#C9A84C" }} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white">
                  {formatDate(rental.start_date, locale)} → {formatDate(rental.end_date, locale)}
                </p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {rental.total_days} {isFr ? `jour${rental.total_days > 1 ? "s" : ""}` : `day${rental.total_days > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            {/* Paiement */}
            <div className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
                style={{ background: "rgba(201,168,76,0.1)" }}
              >
                <CreditCard className="h-5 w-5" style={{ color: "#C9A84C" }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {isFr ? "Acompte payé" : "Deposit paid"}
                  </span>
                  <span className="font-bold" style={{ color: "#C9A84C" }}>
                    {formatPrice(rental.deposit_amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {isFr ? "Solde à régler le jour J" : "Balance due on pickup"}
                  </span>
                  <span className="font-bold text-white">
                    {formatPrice(rental.total_amount - rental.deposit_amount)}
                  </span>
                </div>
                {paymentIntentId && (
                  <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {isFr ? "Transaction :" : "Transaction:"} <code>{paymentIntentId}</code>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Prochaines étapes ── */}
        <div
          className="rounded-2xl p-6 mb-8"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h2
            className="font-bold text-white mb-4"
            style={{ fontSize: "1rem", letterSpacing: "-0.01em" }}
          >
            {isFr ? "Prochaines étapes" : "What's next"}
          </h2>
          <ol className="space-y-3">
            {[
              isFr
                ? "Un email de confirmation vient d'être envoyé à votre adresse."
                : "A confirmation email has just been sent to your address.",
              isFr
                ? "Votre contrat de location vous sera transmis dans les prochaines heures."
                : "Your rental contract will be sent to you within the next few hours.",
              isFr
                ? `Rendez-vous le ${formatDate(rental.start_date, locale)} pour récupérer votre véhicule.`
                : `Show up on ${formatDate(rental.start_date, locale)} to pick up your vehicle.`,
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C", marginTop: "1px" }}
                >
                  {i + 1}
                </span>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* ── CTA retour ── */}
        <div className="text-center">
          <Link
            href={`/${locale}/location`}
            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
            style={{ color: "rgba(201,168,76,0.7)" }}
          >
            <span>← {isFr ? "Retour au catalogue location" : "Back to rental catalogue"}</span>
          </Link>
        </div>

      </div>
    </div>
  )
}

export function generateMetadata({ params }: { params: { locale: string } }) {
  const isFr = params.locale !== "en"
  return {
    title: isFr
      ? `Réservation confirmée — ${SITE_NAME}`
      : `Booking confirmed — ${SITE_NAME}`,
    robots: { index: false, follow: false },
  }
}
