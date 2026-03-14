// =============================================================================
// Emails Location — Resend
// Pattern identique à src/app/[locale]/(public)/contact/actions.ts
// =============================================================================

import { Resend } from "resend"
import { createAdminClient } from "@/lib/supabase/server"
import { getSiteSettings, getSenderEmail, type SiteSettings } from "@/lib/site-settings"
import type { Rental, RentalEmailType } from "@/types/rental"

// ─── Échappement HTML (identique à contact/actions.ts) ───────────────────────

const esc = (s: string | null | undefined): string => {
  if (!s) return ""
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

// ─── Envoi email via Resend ─────────────────────────────────────────────────

async function sendEmail({
  from,
  to,
  subject,
  html,
}: {
  from: string
  to: string
  subject: string
  html: string
}): Promise<string | null> {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  })
  if (error) throw new Error(error.message)
  return data?.id ?? null
}

// ─── Formatage ────────────────────────────────────────────────────────────────

function formatDate(isoDate: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate))
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount)
}

// ─── CSS partagé ─────────────────────────────────────────────────────────────

const sharedStyles = `
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
  .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
  .header { background: #0A0A0A; padding: 30px; text-align: center; }
  .header h1 { color: #C9A84C; margin: 0; font-size: 26px; letter-spacing: 1px; }
  .header p { color: #C0C0C0; margin: 8px 0 0 0; font-size: 14px; }
  .content { padding: 32px 30px; }
  .ref-block { text-align: center; margin: 20px 0; }
  .ref-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
  .ref-value { font-size: 28px; font-weight: bold; color: #C9A84C; letter-spacing: 2px; }
  .highlight { background: #FFF8E8; padding: 16px 20px; border-radius: 6px; border-left: 4px solid #C9A84C; margin: 20px 0; }
  .section-title { font-size: 14px; font-weight: bold; color: #888; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 8px; margin: 24px 0 12px 0; }
  .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
  .info-label { color: #666; }
  .info-value { font-weight: bold; color: #333; }
  .price-table { width: 100%; border-collapse: collapse; font-size: 14px; margin: 12px 0; }
  .price-table td { padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
  .price-table .total-row td { border-top: 2px solid #C9A84C; border-bottom: none; font-weight: bold; font-size: 16px; padding-top: 12px; }
  .price-table .deposit-row td { color: #C9A84C; font-weight: bold; }
  .btn { display: inline-block; background: #C9A84C; color: #0A0A0A; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; margin: 8px 0; }
  .btn-outline { display: inline-block; background: transparent; color: #C9A84C; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; border: 2px solid #C9A84C; margin: 8px 0; }
  .steps { counter-reset: steps; list-style: none; padding: 0; margin: 0; }
  .steps li { counter-increment: steps; padding: 10px 0 10px 44px; position: relative; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
  .steps li::before { content: counter(steps); position: absolute; left: 0; top: 8px; background: #C9A84C; color: #0A0A0A; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px; }
  .footer { background: #f8f8f8; text-align: center; padding: 20px; font-size: 12px; color: #888; border-top: 1px solid #eee; }
  .footer a { color: #C9A84C; text-decoration: none; }
`

// ─── Blocs HTML partagés ──────────────────────────────────────────────────────

function htmlHeader(subtitle: string, siteName: string): string {
  return `
  <div class="header">
    <h1>🚗 ${siteName}</h1>
    <p>${subtitle}</p>
  </div>`
}

function htmlFooter(locale: string, siteName: string, siteUrl: string, contactEmail: string): string {
  const isFr = locale !== "en"
  return `
  <div class="footer">
    <p>
      <a href="${siteUrl}">${siteUrl}</a> &nbsp;·&nbsp;
      <a href="mailto:${contactEmail}">${contactEmail}</a>
    </p>
    <p style="margin-top:8px; color:#bbb;">
      ${isFr ? `© ${new Date().getFullYear()} ${siteName}. Tous droits réservés.` : `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`}
    </p>
  </div>`
}

function htmlVehicleBlock(rental: Rental, locale: string): string {
  const v = rental.rental_vehicle
  if (!v) return ""
  const isFr = locale !== "en"
  const label = isFr ? "Véhicule loué" : "Rented vehicle"
  return `
  <p class="section-title">${label}</p>
  ${v.cover_photo ? `<img src="${esc(v.cover_photo)}" alt="${esc(v.brand)} ${esc(v.model)}" style="width:100%;max-height:200px;object-fit:cover;border-radius:6px;margin-bottom:12px;">` : ""}
  <div class="info-row">
    <span class="info-label">${isFr ? "Véhicule" : "Vehicle"}</span>
    <span class="info-value">${esc(v.brand)} ${esc(v.model)}${v.year ? ` (${v.year})` : ""}</span>
  </div>`
}

function htmlDatesBlock(rental: Rental, locale: string): string {
  const isFr = locale !== "en"
  const pickupTime = rental.pickup_time || "09:00"
  const returnTime = rental.return_time || "18:00"
  return `
  <div class="info-row">
    <span class="info-label">${isFr ? "📅 Prise en charge" : "📅 Pickup"}</span>
    <span class="info-value">${formatDate(rental.start_date, locale)} ${isFr ? "à" : "at"} ${pickupTime}</span>
  </div>
  <div class="info-row">
    <span class="info-label">${isFr ? "📅 Restitution" : "📅 Return"}</span>
    <span class="info-value">${formatDate(rental.end_date, locale)} ${isFr ? "à" : "at"} ${returnTime}</span>
  </div>
  <div class="info-row">
    <span class="info-label">${isFr ? "Durée" : "Duration"}</span>
    <span class="info-value">${rental.total_days} ${isFr ? `jour${rental.total_days > 1 ? "s" : ""}` : `day${rental.total_days > 1 ? "s" : ""}`}</span>
  </div>`
}

function htmlPriceTable(rental: Rental, locale: string): string {
  const isFr = locale !== "en"
  const options = rental.selected_options ?? []
  const optionsRows = options.map((o) => `
    <tr>
      <td style="color:#555;">${esc(o.name)}${o.quantity > 1 ? ` ×${o.quantity}` : ""}</td>
      <td style="text-align:right;">${formatPrice(
        o.price_type === "per_day" ? o.price * rental.total_days * o.quantity : o.price * o.quantity
      )}</td>
    </tr>`).join("")

  return `
  <table class="price-table">
    <tr>
      <td>${rental.total_days} ${isFr ? "jour" : "day"}${rental.total_days > 1 ? "s" : ""} × ${formatPrice(rental.base_price_per_day)}</td>
      <td style="text-align:right;">${formatPrice(rental.subtotal)}</td>
    </tr>
    ${optionsRows}
    ${rental.surcharge_total > 0 ? `
    <tr>
      <td style="color:#555;">${isFr ? "Supplément week-end" : "Weekend surcharge"}</td>
      <td style="text-align:right;">${formatPrice(rental.surcharge_total)}</td>
    </tr>` : ""}
    <tr class="total-row">
      <td>${isFr ? "Total" : "Total"}</td>
      <td style="text-align:right;color:#C9A84C;">${formatPrice(rental.total_amount)}</td>
    </tr>
    <tr class="deposit-row">
      <td>${isFr ? "Acompte à régler" : "Deposit due"}</td>
      <td style="text-align:right;">${formatPrice(rental.deposit_amount)}</td>
    </tr>
    <tr>
      <td style="color:#555;font-size:13px;">${isFr ? "Solde à la remise des clés" : "Balance at key handover"}</td>
      <td style="text-align:right;font-size:13px;">${formatPrice(rental.total_amount - rental.deposit_amount)}</td>
    </tr>
  </table>`
}

// =============================================================================
// TEMPLATES (all receive settings for dynamic values)
// =============================================================================

// ─── 1. confirmation_client ───────────────────────────────────────────────────

function templateConfirmationClient(
  rental: Rental,
  locale: string,
  s: SiteSettings,
  siteUrl: string,
  stripeUrl?: string
): { subject: string; html: string } {
  const isFr = locale !== "en"
  const contactEmail = s.email_public || s.contact_email
  const subject = isFr
    ? `Réservation confirmée ${rental.reference} — ${s.business_name}`
    : `Booking confirmed ${rental.reference} — ${s.business_name}`

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${sharedStyles}</style></head><body>
  <div class="container">
    ${htmlHeader(isFr ? "Réservation confirmée ✓" : "Booking confirmed ✓", s.business_name)}
    <div class="content">
      <h2 style="color:#0A0A0A;margin-top:0;">
        ${isFr ? `Bonjour ${esc(rental.client_first_name)},` : `Hello ${esc(rental.client_first_name)},`}
      </h2>
      <div class="highlight">
        <p style="margin:0;">
          ${isFr
            ? "Votre réservation a bien été enregistrée. Finalisez-la en réglant l'acompte ci-dessous."
            : "Your booking has been recorded. Please pay the deposit below to finalize it."}
        </p>
      </div>

      <div class="ref-block">
        <div class="ref-label">${isFr ? "Référence de réservation" : "Booking reference"}</div>
        <div class="ref-value">${esc(rental.reference)}</div>
      </div>

      ${htmlVehicleBlock(rental, locale)}
      <p class="section-title">${isFr ? "Période de location" : "Rental period"}</p>
      ${htmlDatesBlock(rental, locale)}

      <p class="section-title">${isFr ? "Détail du tarif" : "Price breakdown"}</p>
      ${htmlPriceTable(rental, locale)}

      ${stripeUrl ? `
      <div style="text-align:center;margin:32px 0 16px;">
        <a href="${stripeUrl}" class="btn">
          ${isFr ? `💳 Payer l'acompte — ${formatPrice(rental.deposit_amount)}` : `💳 Pay deposit — ${formatPrice(rental.deposit_amount)}`}
        </a>
        <p style="font-size:12px;color:#888;margin-top:8px;">
          ${isFr ? "Paiement 100% sécurisé via Stripe" : "100% secure payment via Stripe"}
        </p>
      </div>` : ""}

      <p class="section-title">${isFr ? "Prochaines étapes" : "Next steps"}</p>
      <ol class="steps">
        <li>${isFr ? `Payez l'acompte de <strong>${formatPrice(rental.deposit_amount)}</strong> pour confirmer définitivement votre réservation.` : `Pay the <strong>${formatPrice(rental.deposit_amount)}</strong> deposit to definitively confirm your booking.`}</li>
        <li>${isFr ? "Vous recevrez votre contrat de location par email dans les 24h." : "You will receive your rental contract by email within 24 hours."}</li>
        <li>${isFr ? `Rendez-vous le <strong>${formatDate(rental.start_date, locale)} à ${rental.pickup_time || "09:00"}</strong> pour récupérer le véhicule.` : `Show up on <strong>${formatDate(rental.start_date, locale)} at ${rental.pickup_time || "09:00"}</strong> to pick up the vehicle.`}</li>
      </ol>

      <div style="margin-top:32px;padding-top:20px;border-top:1px solid #eee;font-size:13px;color:#666;">
        <p>
          ${isFr ? "Une question ? Contactez-nous :" : "Any question? Contact us:"}
          <a href="mailto:${contactEmail}" style="color:#C9A84C;">${contactEmail}</a>
        </p>
      </div>

      <p style="margin-top:24px;">
        ${isFr ? "Cordialement," : "Kind regards,"}<br>
        <strong style="color:#C9A84C;">${isFr ? "L'équipe" : "The team"} ${s.business_name}</strong>
      </p>
    </div>
    ${htmlFooter(locale, s.business_name, siteUrl, contactEmail)}
  </div>
</body></html>`

  return { subject, html }
}

// ─── 1b. admin_confirmed (email client après validation admin) ────────────

function templateAdminConfirmed(
  rental: Rental,
  locale: string,
  s: SiteSettings,
  siteUrl: string
): { subject: string; html: string } {
  const isFr = locale !== "en"
  const contactEmail = s.email_public || s.contact_email
  const address = s.business_address || ""
  const phone = s.phone_number || ""

  const subject = isFr
    ? `✅ Réservation ${rental.reference} confirmée — ${s.business_name}`
    : `✅ Booking ${rental.reference} confirmed — ${s.business_name}`

  const balanceAtPickup = rental.total_amount - rental.deposit_amount

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${sharedStyles}</style></head><body>
  <div class="container">
    ${htmlHeader(isFr ? "Votre réservation est confirmée ✅" : "Your booking is confirmed ✅", s.business_name)}
    <div class="content">
      <h2 style="color:#0A0A0A;margin-top:0;">
        ${isFr ? `Bonjour ${esc(rental.client_first_name)},` : `Hello ${esc(rental.client_first_name)},`}
      </h2>
      <div class="highlight">
        <p style="margin:0;">
          ${isFr
            ? `Bonne nouvelle ! Votre réservation <strong style="color:#C9A84C;">${esc(rental.reference)}</strong> a été <strong>confirmée</strong> par notre équipe.`
            : `Great news! Your booking <strong style="color:#C9A84C;">${esc(rental.reference)}</strong> has been <strong>confirmed</strong> by our team.`}
        </p>
      </div>

      <div class="ref-block">
        <div class="ref-label">${isFr ? "Référence de réservation" : "Booking reference"}</div>
        <div class="ref-value">${esc(rental.reference)}</div>
      </div>

      ${htmlVehicleBlock(rental, locale)}
      <p class="section-title">${isFr ? "Votre réservation" : "Your booking"}</p>
      ${htmlDatesBlock(rental, locale)}

      <p class="section-title">${isFr ? "Récapitulatif financier" : "Financial summary"}</p>
      <div class="info-row">
        <span class="info-label">${isFr ? "Acompte réglé" : "Deposit paid"}</span>
        <span class="info-value" style="color:#C9A84C;">${rental.deposit_paid ? formatPrice(rental.deposit_amount) : formatPrice(0)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">${isFr ? "Solde à payer (remise des clés)" : "Balance due (at key handover)"}</span>
        <span class="info-value">${formatPrice(balanceAtPickup)}</span>
      </div>
      <div class="info-row" style="border-bottom:2px solid #C9A84C;">
        <span class="info-label" style="font-weight:bold;">${isFr ? "Total" : "Total"}</span>
        <span class="info-value" style="color:#C9A84C;font-size:16px;">${formatPrice(rental.total_amount)}</span>
      </div>

      <p class="section-title">${isFr ? "Prochaines étapes" : "Next steps"}</p>
      <ol class="steps">
        <li>${isFr
          ? `Présentez-vous ${address ? `à <strong>${esc(address)}</strong>` : ""} le <strong>${formatDate(rental.start_date, locale)} à ${rental.pickup_time || "09:00"}</strong>.`
          : `Show up ${address ? `at <strong>${esc(address)}</strong>` : ""} on <strong>${formatDate(rental.start_date, locale)} at ${rental.pickup_time || "09:00"}</strong>.`}</li>
        <li>${isFr
          ? "Munissez-vous de votre <strong>permis de conduire</strong> et d'une <strong>pièce d'identité</strong>."
          : "Bring your <strong>driving license</strong> and an <strong>ID document</strong>."}</li>
        <li>${isFr
          ? `Le solde de <strong>${formatPrice(balanceAtPickup)}</strong> sera réglé à la remise des clés.`
          : `The balance of <strong>${formatPrice(balanceAtPickup)}</strong> will be due at key handover.`}</li>
      </ol>

      <div style="text-align:center;margin:32px 0 16px;">
        <a href="${siteUrl}/${locale}/location" class="btn">
          ${isFr ? "Voir ma réservation" : "View my booking"}
        </a>
      </div>

      <div style="margin-top:32px;padding-top:20px;border-top:1px solid #eee;font-size:13px;color:#666;">
        <p>
          ${isFr ? "Des questions ? Contactez-nous :" : "Questions? Contact us:"}
          <a href="mailto:${contactEmail}" style="color:#C9A84C;">${contactEmail}</a>
          ${phone ? ` · <a href="tel:${esc(phone)}" style="color:#C9A84C;">${esc(phone)}</a>` : ""}
        </p>
      </div>

      <p style="margin-top:24px;">
        ${isFr ? "Cordialement," : "Kind regards,"}<br>
        <strong style="color:#C9A84C;">${isFr ? "L'équipe" : "The team"} ${s.business_name}</strong>
      </p>
    </div>
    ${htmlFooter(locale, s.business_name, siteUrl, contactEmail)}
  </div>
</body></html>`

  return { subject, html }
}

// ─── 2. confirmation_admin ────────────────────────────────────────────────────

function templateConfirmationAdmin(
  rental: Rental,
  s: SiteSettings,
  siteUrl: string
): { subject: string; html: string } {
  const contactEmail = s.email_public || s.contact_email
  const subject = `🚗 Nouvelle réservation ${rental.reference} — Action requise`
  const v = rental.rental_vehicle

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${sharedStyles}</style></head><body>
  <div class="container">
    ${htmlHeader("Nouvelle réservation — Action requise", s.business_name)}
    <div class="content">
      <div class="ref-block">
        <div class="ref-label">Référence</div>
        <div class="ref-value">${esc(rental.reference)}</div>
      </div>

      <p class="section-title">Véhicule</p>
      ${v ? `
      <div class="info-row"><span class="info-label">Véhicule</span><span class="info-value">${esc(v.brand)} ${esc(v.model)}${v.year ? ` (${v.year})` : ""}</span></div>` : ""}
      ${htmlDatesBlock(rental, "fr")}

      <p class="section-title">Client</p>
      <div class="info-row"><span class="info-label">Nom</span><span class="info-value">${esc(rental.client_first_name)} ${esc(rental.client_last_name)}</span></div>
      <div class="info-row"><span class="info-label">Email</span><span class="info-value">${esc(rental.client_email)}</span></div>
      <div class="info-row"><span class="info-label">Téléphone</span><span class="info-value">${esc(rental.client_phone)}</span></div>
      ${rental.client_address ? `<div class="info-row"><span class="info-label">Adresse</span><span class="info-value">${esc(rental.client_address)}${rental.client_city ? `, ${esc(rental.client_city)}` : ""}${rental.client_postal_code ? ` ${esc(rental.client_postal_code)}` : ""}</span></div>` : ""}
      ${rental.is_business && rental.business_name ? `<div class="info-row"><span class="info-label">Société</span><span class="info-value">${esc(rental.business_name)}${rental.business_siret ? ` — SIRET : ${esc(rental.business_siret)}` : ""}</span></div>` : ""}

      <p class="section-title">Montant</p>
      <div class="info-row"><span class="info-label">Total</span><span class="info-value" style="color:#C9A84C;">${formatPrice(rental.total_amount)}</span></div>
      <div class="info-row"><span class="info-label">Acompte attendu</span><span class="info-value">${formatPrice(rental.deposit_amount)}</span></div>
      <div class="info-row"><span class="info-label">Statut</span><span class="info-value">${esc(rental.status)}</span></div>

      <div style="text-align:center;margin:32px 0;">
        <a href="${siteUrl}/admin/locations/${esc(rental.id)}" class="btn">
          Voir dans le dashboard →
        </a>
      </div>
    </div>
    ${htmlFooter("fr", s.business_name, siteUrl, contactEmail)}
  </div>
</body></html>`

  return { subject, html }
}

// ─── 3. payment_received ──────────────────────────────────────────────────────

function templatePaymentReceived(
  rental: Rental,
  locale: string,
  s: SiteSettings,
  siteUrl: string,
  contractUrl?: string
): { subject: string; html: string } {
  const isFr = locale !== "en"
  const contactEmail = s.email_public || s.contact_email
  const subject = isFr
    ? `Acompte reçu — Réservation ${rental.reference} confirmée`
    : `Deposit received — Booking ${rental.reference} confirmed`

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${sharedStyles}</style></head><body>
  <div class="container">
    ${htmlHeader(isFr ? "Acompte reçu ✓" : "Deposit received ✓", s.business_name)}
    <div class="content">
      <h2 style="color:#0A0A0A;margin-top:0;">
        ${isFr ? `Bonjour ${esc(rental.client_first_name)},` : `Hello ${esc(rental.client_first_name)},`}
      </h2>
      <div class="highlight">
        <p style="margin:0;">
          ${isFr
            ? `Votre acompte de <strong style="color:#C9A84C;">${formatPrice(rental.deposit_amount)}</strong> a bien été encaissé. Votre réservation est définitivement confirmée.`
            : `Your deposit of <strong style="color:#C9A84C;">${formatPrice(rental.deposit_amount)}</strong> has been received. Your booking is definitively confirmed.`}
        </p>
      </div>

      <div class="ref-block">
        <div class="ref-label">${isFr ? "Référence" : "Reference"}</div>
        <div class="ref-value">${esc(rental.reference)}</div>
      </div>

      ${htmlVehicleBlock(rental, locale)}
      <p class="section-title">${isFr ? "Période de location" : "Rental period"}</p>
      ${htmlDatesBlock(rental, locale)}

      <p class="section-title">${isFr ? "Récapitulatif financier" : "Financial summary"}</p>
      <div class="info-row"><span class="info-label">${isFr ? "Acompte payé" : "Deposit paid"}</span><span class="info-value" style="color:#C9A84C;">${formatPrice(rental.deposit_amount)}</span></div>
      <div class="info-row"><span class="info-label">${isFr ? "Solde à régler le jour J" : "Balance due on pickup day"}</span><span class="info-value">${formatPrice(rental.total_amount - rental.deposit_amount)}</span></div>

      ${rental.stripe_payment_intent_id ? `
      <p style="font-size:12px;color:#888;margin-top:4px;">
        ${isFr ? "Référence transaction :" : "Transaction reference:"} <code>${esc(rental.stripe_payment_intent_id)}</code>
      </p>` : ""}

      ${contractUrl ? `
      <div style="text-align:center;margin:32px 0;">
        <a href="${contractUrl}" class="btn">
          📄 ${isFr ? "Télécharger votre contrat" : "Download your contract"}
        </a>
        <p style="font-size:12px;color:#888;margin-top:8px;">
          ${isFr ? "Ce lien est valable 7 jours." : "This link is valid for 7 days."}
        </p>
      </div>` : `
      <div class="highlight" style="margin-top:20px;">
        <p style="margin:0;font-size:14px;">
          ${isFr ? "Votre contrat de location vous sera envoyé par email dans les prochaines heures." : "Your rental contract will be sent to you by email in the next few hours."}
        </p>
      </div>`}

      <p style="margin-top:24px;">
        ${isFr ? "Cordialement," : "Kind regards,"}<br>
        <strong style="color:#C9A84C;">${isFr ? "L'équipe" : "The team"} ${s.business_name}</strong>
      </p>
    </div>
    ${htmlFooter(locale, s.business_name, siteUrl, contactEmail)}
  </div>
</body></html>`

  return { subject, html }
}

// ─── 4. contract_ready ────────────────────────────────────────────────────────

function templateContractReady(
  rental: Rental,
  locale: string,
  s: SiteSettings,
  siteUrl: string,
  contractUrl?: string
): { subject: string; html: string } {
  const isFr = locale !== "en"
  const contactEmail = s.email_public || s.contact_email
  const subject = isFr
    ? `Votre contrat de location est prêt — ${rental.reference}`
    : `Your rental contract is ready — ${rental.reference}`

  const v = rental.rental_vehicle

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${sharedStyles}</style></head><body>
  <div class="container">
    ${htmlHeader(isFr ? "Votre contrat est prêt" : "Your contract is ready", s.business_name)}
    <div class="content">
      <h2 style="color:#0A0A0A;margin-top:0;">
        ${isFr ? `Bonjour ${esc(rental.client_first_name)},` : `Hello ${esc(rental.client_first_name)},`}
      </h2>
      <p>
        ${isFr
          ? `Votre contrat de location pour la réservation <strong>${esc(rental.reference)}</strong> est disponible en téléchargement.`
          : `Your rental contract for booking <strong>${esc(rental.reference)}</strong> is available for download.`}
      </p>

      ${contractUrl ? `
      <div style="text-align:center;margin:32px 0;">
        <a href="${contractUrl}" class="btn">
          📄 ${isFr ? "Télécharger le contrat PDF" : "Download PDF contract"}
        </a>
        <p style="font-size:12px;color:#888;margin-top:8px;">
          ${isFr ? "Ce lien expire dans 7 jours." : "This link expires in 7 days."}
        </p>
      </div>` : ""}

      <p class="section-title">${isFr ? "Conditions importantes à retenir" : "Important conditions to remember"}</p>
      ${v ? `
      <div class="info-row"><span class="info-label">${isFr ? "Kilométrage inclus" : "Included mileage"}</span><span class="info-value">${v.included_km_per_day} km/${isFr ? "jour" : "day"}</span></div>
      <div class="info-row"><span class="info-label">${isFr ? "Km supplémentaire" : "Extra km"}</span><span class="info-value">${String(v.extra_km_price).replace(".", ",")} €/km</span></div>` : ""}
      <div class="info-row"><span class="info-label">${isFr ? "Caution bloquée" : "Security deposit"}</span><span class="info-value">${formatPrice(rental.deposit_amount)}</span></div>
      <div class="info-row"><span class="info-label">${isFr ? "Solde à régler le jour J" : "Balance due on pickup"}</span><span class="info-value">${formatPrice(rental.total_amount - rental.deposit_amount)}</span></div>

      <div class="highlight" style="margin-top:20px;">
        <p style="margin:0;font-size:14px;">
          🛢️ ${isFr ? "Le véhicule vous sera remis avec le plein. Merci de le restituer dans le même état." : "The vehicle will be handed over with a full tank. Please return it in the same condition."}
        </p>
      </div>

      <p style="margin-top:24px;">
        ${isFr ? "Cordialement," : "Kind regards,"}<br>
        <strong style="color:#C9A84C;">${isFr ? "L'équipe" : "The team"} ${s.business_name}</strong>
      </p>
    </div>
    ${htmlFooter(locale, s.business_name, siteUrl, contactEmail)}
  </div>
</body></html>`

  return { subject, html }
}

// ─── 5. reminder_24h ─────────────────────────────────────────────────────────

function templateReminder24h(
  rental: Rental,
  locale: string,
  s: SiteSettings,
  siteUrl: string
): { subject: string; html: string } {
  const isFr = locale !== "en"
  const contactEmail = s.email_public || s.contact_email
  const subject = isFr
    ? `Rappel — Votre location commence demain (${rental.reference})`
    : `Reminder — Your rental starts tomorrow (${rental.reference})`

  const v = rental.rental_vehicle

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${sharedStyles}</style></head><body>
  <div class="container">
    ${htmlHeader(isFr ? "Votre location commence demain 🗓️" : "Your rental starts tomorrow 🗓️", s.business_name)}
    <div class="content">
      <h2 style="color:#0A0A0A;margin-top:0;">
        ${isFr ? `Bonjour ${esc(rental.client_first_name)},` : `Hello ${esc(rental.client_first_name)},`}
      </h2>
      <div class="highlight">
        <p style="margin:0;">
          ${isFr
            ? `Votre location <strong>${esc(rental.reference)}</strong> commence <strong>demain le ${formatDate(rental.start_date, locale)} à ${rental.pickup_time || "09:00"}</strong>.`
            : `Your rental <strong>${esc(rental.reference)}</strong> starts <strong>tomorrow on ${formatDate(rental.start_date, locale)} at ${rental.pickup_time || "09:00"}</strong>.`}
        </p>
      </div>

      ${v ? `
      <p class="section-title">${isFr ? "Véhicule" : "Vehicle"}</p>
      <div class="info-row"><span class="info-label">${isFr ? "Véhicule" : "Vehicle"}</span><span class="info-value">${esc(v.brand)} ${esc(v.model)}${v.year ? ` (${v.year})` : ""}</span></div>` : ""}

      <p class="section-title">${isFr ? "Rendez-vous" : "Appointment"}</p>
      <div class="info-row"><span class="info-label">${isFr ? "📅 Prise en charge" : "📅 Pickup"}</span><span class="info-value">${formatDate(rental.start_date, locale)} ${isFr ? "à" : "at"} ${rental.pickup_time || "09:00"}</span></div>
      <div class="info-row"><span class="info-label">${isFr ? "⏰ Restitution prévue" : "⏰ Planned return"}</span><span class="info-value">${formatDate(rental.end_date, locale)} ${isFr ? "à" : "at"} ${rental.return_time || "18:00"}</span></div>
      <div class="info-row"><span class="info-label">${isFr ? "Contact" : "Contact"}</span><span class="info-value"><a href="mailto:${contactEmail}" style="color:#C9A84C;">${contactEmail}</a></span></div>

      <p class="section-title">${isFr ? "Documents à apporter" : "Documents to bring"}</p>
      <ul style="font-size:14px;color:#444;line-height:2;padding-left:20px;margin:0;">
        <li>${isFr ? "Permis de conduire valide" : "Valid driving license"}</li>
        <li>${isFr ? "Carte d'identité ou passeport" : "Identity card or passport"}</li>
        <li>${isFr ? "Carte bancaire au nom du conducteur (pour la caution)" : "Bank card in driver's name (for security deposit)"}</li>
        ${rental.is_business ? `<li>${isFr ? "Extrait Kbis ou justificatif d'entreprise" : "Company registration document"}</li>` : ""}
      </ul>

      <p class="section-title">${isFr ? "Solde à régler" : "Balance due"}</p>
      <div class="info-row"><span class="info-label">${isFr ? "Montant" : "Amount"}</span><span class="info-value" style="color:#C9A84C;">${formatPrice(rental.total_amount - rental.deposit_amount)}</span></div>

      ${v?.price_per_hour ? `
      <div class="highlight" style="margin-top:16px;">
        <p style="margin:0;font-size:13px;">
          ⚠️ ${isFr
            ? `Tout dépassement de l'heure de restitution (${rental.return_time || "18:00"}) sera facturé <strong>${formatPrice(v.price_per_hour)}/heure</strong> entamée.`
            : `Any return after the scheduled time (${rental.return_time || "18:00"}) will be charged at <strong>${formatPrice(v.price_per_hour)}/hour</strong>.`}
        </p>
      </div>` : ""}

      <div style="text-align:center;margin-top:24px;">
        <p style="font-size:13px;color:#666;">
          ${isFr ? "Une urgence ?" : "An emergency?"} <a href="mailto:${contactEmail}" style="color:#C9A84C;">${contactEmail}</a>
        </p>
      </div>

      <p style="margin-top:24px;">
        ${isFr ? "À demain !" : "See you tomorrow!"}<br>
        <strong style="color:#C9A84C;">${isFr ? "L'équipe" : "The team"} ${s.business_name}</strong>
      </p>
    </div>
    ${htmlFooter(locale, s.business_name, siteUrl, contactEmail)}
  </div>
</body></html>`

  return { subject, html }
}

// ─── 6. cancellation ─────────────────────────────────────────────────────────

function templateCancellation(
  rental: Rental,
  locale: string,
  s: SiteSettings,
  siteUrl: string
): { subject: string; html: string } {
  const isFr = locale !== "en"
  const contactEmail = s.email_public || s.contact_email
  const subject = isFr
    ? `Réservation ${rental.reference} annulée — ${s.business_name}`
    : `Booking ${rental.reference} cancelled — ${s.business_name}`

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${sharedStyles}</style></head><body>
  <div class="container">
    ${htmlHeader(isFr ? "Réservation annulée" : "Booking cancelled", s.business_name)}
    <div class="content">
      <h2 style="color:#0A0A0A;margin-top:0;">
        ${isFr ? `Bonjour ${esc(rental.client_first_name)},` : `Hello ${esc(rental.client_first_name)},`}
      </h2>
      <p>
        ${isFr
          ? `Nous vous informons que votre réservation <strong>${esc(rental.reference)}</strong> a été annulée.`
          : `We inform you that your booking <strong>${esc(rental.reference)}</strong> has been cancelled.`}
      </p>

      ${rental.cancellation_reason ? `
      <div class="highlight">
        <p style="margin:0;font-size:14px;">
          <strong>${isFr ? "Motif :" : "Reason:"}</strong> ${esc(rental.cancellation_reason)}
        </p>
      </div>` : ""}

      ${rental.deposit_paid ? `
      <p class="section-title">${isFr ? "Remboursement de l'acompte" : "Deposit refund"}</p>
      <div class="info-row">
        <span class="info-label">${isFr ? "Montant à rembourser" : "Amount to be refunded"}</span>
        <span class="info-value" style="color:#C9A84C;">${formatPrice(rental.deposit_amount)}</span>
      </div>
      <p style="font-size:13px;color:#666;margin-top:8px;">
        ${isFr
          ? "Le remboursement sera effectué sur votre moyen de paiement d'origine sous 5 à 10 jours ouvrés."
          : "The refund will be processed to your original payment method within 5 to 10 business days."}
      </p>` : ""}

      <p class="section-title">${isFr ? "Réserver à nouveau" : "Book again"}</p>
      <p style="font-size:14px;color:#555;">
        ${isFr
          ? "Notre catalogue de véhicules de location reste disponible. N'hésitez pas à refaire une réservation."
          : "Our rental vehicle catalogue remains available. Feel free to make a new booking."}
      </p>
      <div style="text-align:center;margin:20px 0;">
        <a href="${siteUrl}/location" class="btn-outline">
          ${isFr ? "Voir les véhicules disponibles" : "View available vehicles"}
        </a>
      </div>

      <div style="margin-top:32px;padding-top:20px;border-top:1px solid #eee;font-size:13px;color:#666;">
        <p>
          ${isFr ? "Des questions ? Contactez-nous :" : "Questions? Contact us:"}
          <a href="mailto:${contactEmail}" style="color:#C9A84C;">${contactEmail}</a>
        </p>
      </div>

      <p style="margin-top:24px;">
        ${isFr ? "Cordialement," : "Kind regards,"}<br>
        <strong style="color:#C9A84C;">${isFr ? "L'équipe" : "The team"} ${s.business_name}</strong>
      </p>
    </div>
    ${htmlFooter(locale, s.business_name, siteUrl, contactEmail)}
  </div>
</body></html>`

  return { subject, html }
}

// =============================================================================
// EXPORT PRINCIPAL
// =============================================================================

export async function sendRentalEmail(
  type: RentalEmailType,
  rental: Rental,
  extras: {
    stripeUrl?: string
    contractUrl?: string
    locale?: string
  } = {}
): Promise<void> {
  const locale = extras.locale ?? "fr"

  // Charger les paramètres dynamiques
  const settings = await getSiteSettings()
  const senderEmail = getSenderEmail(settings)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://autoroi.fr"
  const adminEmail = settings.email_notifications

  let template: { subject: string; html: string }
  let recipient: string

  switch (type) {
    case "confirmation_client":
      template = templateConfirmationClient(rental, locale, settings, siteUrl, extras.stripeUrl)
      recipient = rental.client_email
      break

    case "admin_confirmed":
      template = templateAdminConfirmed(rental, locale, settings, siteUrl)
      recipient = rental.client_email
      break

    case "confirmation_admin":
      template = templateConfirmationAdmin(rental, settings, siteUrl)
      recipient = adminEmail
      break

    case "payment_received":
      template = templatePaymentReceived(rental, locale, settings, siteUrl, extras.contractUrl)
      recipient = rental.client_email
      break

    case "contract_ready":
      template = templateContractReady(rental, locale, settings, siteUrl, extras.contractUrl)
      recipient = rental.client_email
      break

    case "reminder_24h":
    case "reminder_pickup":
      template = templateReminder24h(rental, locale, settings, siteUrl)
      recipient = rental.client_email
      break

    case "cancellation":
      template = templateCancellation(rental, locale, settings, siteUrl)
      recipient = rental.client_email
      break

    case "no_show":
      // Email interne uniquement — réutilise le template admin
      template = {
        subject: `⚠️ No-show — ${rental.reference}`,
        html: templateConfirmationAdmin(rental, settings, siteUrl).html.replace(
          "Nouvelle réservation — Action requise",
          `No-show signalé — ${rental.reference}`
        ),
      }
      recipient = adminEmail
      break

    default:
      throw new Error(`Type d'email inconnu : ${type satisfies never}`)
  }

  let resendMessageId: string | null = null
  let emailStatus: "sent" | "failed" = "sent"

  try {
    resendMessageId = await sendEmail({
      from: senderEmail,
      to: recipient,
      subject: template.subject,
      html: template.html,
    })
  } catch (err) {
    console.error(`sendRentalEmail [${type}] error:`, err)
    emailStatus = "failed"
  }

  // Log dans rental_emails_log (non bloquant)
  try {
    const supabase = createAdminClient()
    await supabase.from("rental_emails_log").insert({
      rental_id: rental.id,
      type,
      sent_to: recipient,
      resend_message_id: resendMessageId,
      status: emailStatus,
    } as never)
  } catch (logErr) {
    console.error(`sendRentalEmail log error:`, logErr)
  }

  // Relancer l'erreur après le log pour que l'appelant puisse gérer l'échec
  if (emailStatus === "failed") {
    throw new Error(`Échec envoi email [${type}] à ${recipient}`)
  }
}
