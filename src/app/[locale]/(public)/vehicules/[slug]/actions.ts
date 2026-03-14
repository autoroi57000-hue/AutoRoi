"use server"

import { Resend } from "resend"
import { createAdminClient } from "@/lib/supabase/server"
import { getSiteSettings, getSenderEmail } from "@/lib/site-settings"

// ─── Envoi d'une demande de contact pour un véhicule ─────────────────────────

interface VehicleInquiryInput {
  vehicleId: string
  vehicleRef: string
  name: string
  email: string
  phone?: string
  message: string
}

// Échappement HTML
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

function buildAdminAlertEmail(
  settings: { business_name: string },
  firstName: string,
  lastName: string,
  email: string,
  phone: string | undefined,
  vehicleRef: string,
  message: string,
  siteUrl: string
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #0A0A0A; }
    .wrapper { max-width: 600px; margin: 0 auto; }
    .header { background: #0A0A0A; padding: 32px 30px 24px; text-align: center; border-bottom: 2px solid #C9A84C; }
    .header h1 { color: #C9A84C; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { color: #888; margin: 8px 0 0; font-size: 13px; }
    .body { background: #111111; padding: 30px; }
    .card { background: #1A1A1A; border: 1px solid #222; border-radius: 8px; padding: 20px; margin-bottom: 16px; }
    .card-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #C9A84C; margin: 0 0 12px; }
    .row { display: flex; margin-bottom: 10px; }
    .label { color: #777; font-size: 13px; min-width: 90px; }
    .value { color: #E5E5E5; font-size: 14px; }
    .value a { color: #C9A84C; text-decoration: none; }
    .value a:hover { text-decoration: underline; }
    .message-box { background: #0A0A0A; border-left: 3px solid #C9A84C; padding: 16px; border-radius: 4px; color: #DDD; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
    .cta { text-align: center; margin: 24px 0 8px; }
    .cta a { display: inline-block; background: #C9A84C; color: #0A0A0A; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 14px; }
    .footer { text-align: center; padding: 20px 30px; font-size: 11px; color: #555; }
    .footer a { color: #C9A84C; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>${esc(settings.business_name)}</h1>
      <p>Nouveau message — fiche véhicule</p>
    </div>
    <div class="body">
      <div class="card">
        <p class="card-title">Expéditeur</p>
        <div class="row"><span class="label">Nom</span><span class="value">${esc(firstName)} ${esc(lastName)}</span></div>
        <div class="row"><span class="label">Email</span><span class="value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>
        <div class="row"><span class="label">Téléphone</span><span class="value">${phone ? `<a href="tel:${esc(phone)}">${esc(phone)}</a>` : '<span style="color:#555">Non renseigné</span>'}</span></div>
      </div>
      <div class="card">
        <p class="card-title">Véhicule concerné</p>
        <div class="value" style="font-size:15px;font-weight:600;color:#fff;">${esc(vehicleRef)}</div>
      </div>
      <div class="card">
        <p class="card-title">Message</p>
        <div class="message-box">${esc(message)}</div>
      </div>
      <div class="cta">
        <a href="${siteUrl}/admin/messages">Voir dans l'admin</a>
      </div>
    </div>
    <div class="footer">
      <p>Email envoyé automatiquement par <a href="${siteUrl}">${esc(settings.business_name)}</a></p>
    </div>
  </div>
</body>
</html>`
}

export async function submitVehicleInquiry(data: VehicleInquiryInput) {
  // Split name into first + last
  const parts = data.name.trim().split(/\s+/)
  const firstName = parts[0] ?? data.name
  const lastName = parts.slice(1).join(" ") || "."

  try {
    const admin = createAdminClient()
    const { error } = await (admin.from("contact_messages") as any).insert({
      vehicle_id: data.vehicleId,
      vehicle_ref: data.vehicleRef,
      first_name: firstName,
      last_name: lastName,
      email: data.email,
      phone: data.phone || null,
      message: data.message,
      status: "non_lu",
    })
    if (error) throw error

    // ── Email alerte admin (non-bloquant) ──
    try {
      const settings = await getSiteSettings()
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://autoroi.fr"
      const resend = new Resend(process.env.RESEND_API_KEY)

      await resend.emails.send({
        from: getSenderEmail(settings),
        to: settings.email_notifications,
        subject: `💬 Nouveau message — ${firstName} ${lastName} · ${data.vehicleRef}`,
        html: buildAdminAlertEmail(
          settings,
          firstName,
          lastName,
          data.email,
          data.phone,
          data.vehicleRef,
          data.message,
          siteUrl
        ),
      })
    } catch (emailErr) {
      console.error("submitVehicleInquiry email error:", emailErr)
      // Non-bloquant — le message est déjà en base
    }

    return { success: true }
  } catch (err) {
    console.error("submitVehicleInquiry error:", err)
    return { success: false, error: "Une erreur est survenue lors de l'envoi." }
  }
}

// ─── Incrémente views_count (non-bloquant, depuis client component) ───────────

export async function incrementViewsCount(vehicleId: string) {
  try {
    const admin = createAdminClient()
    // Atomic increment via raw RPC if available, else fallback to read-then-write
    const { error: rpcError } = await admin.rpc("increment_vehicle_views" as never, {
      p_vehicle_id: vehicleId,
    } as never)

    if (rpcError) {
      // Fallback: read then increment
      const { data } = await admin
        .from("vehicles")
        .select("views_count")
        .eq("id", vehicleId)
        .single()
      if (data) {
        await (admin
          .from("vehicles") as any)
          .update({ views_count: ((data as any).views_count ?? 0) + 1 })
          .eq("id", vehicleId)
      }
    }
  } catch {
    // Silent fail — views count is non-critical
  }
}
