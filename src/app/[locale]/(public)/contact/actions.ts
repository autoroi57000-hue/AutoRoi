"use server";

import { Resend } from "resend";
import { z } from "zod";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings, getSenderEmail } from "@/lib/site-settings";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ContactMessageInsert } from "@/types/database";

// Schéma de validation
const contactFormSchema = z.object({
  first_name: z.string().min(2, "Le prénom est requis").max(50),
  last_name: z.string().min(2, "Le nom est requis").max(50),
  email: z.string().email("Format d'email invalide"),
  phone: z.string().optional().nullable(),
  subject: z.enum([
    "vehicle_info",
    "trade_in",
    "pricing",
    "other",
  ]),
  vehicle_ref: z.string().optional().nullable(),
  message: z
    .string()
    .min(20, "Le message doit contenir au moins 20 caractères")
    .max(2000, "Le message ne doit pas dépasser 2000 caractères"),
  rgpd_consent: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions",
  }),
  // Honeypot field - doit rester vide
  website: z.string().optional().nullable(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

interface ActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function getClientIP(): string {
  const headersList = headers();
  const forwarded = headersList.get("x-forwarded-for");
  const realIP = headersList.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIP || "unknown";
}


// Échappement HTML — protège contre XSS dans les templates email
const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Template email admin
function getAdminEmailTemplate(
  data: ContactFormInput,
  siteName: string,
  siteUrl: string,
  adminEmail: string
): string {
  const subjectLabels: Record<string, string> = {
    vehicle_info: "Information sur un véhicule",
    trade_in: "Reprise de véhicule",
    pricing: "Demande de prix",
    other: "Autre",
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0A0A0A; padding: 30px; text-align: center; }
    .header h1 { color: #C9A84C; margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 30px; }
    .field { margin-bottom: 20px; }
    .field-label { font-weight: bold; color: #C9A84C; margin-bottom: 5px; }
    .field-value { color: #333; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    .button { display: inline-block; background: #C9A84C; color: #0A0A0A; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 ${siteName}</h1>
      <p style="color: #C0C0C0; margin: 10px 0 0 0;">Nouveau message de contact</p>
    </div>

    <div class="content">
      <h2 style="color: #0A0A0A; margin-top: 0;">
        Message de ${esc(data.first_name)} ${esc(data.last_name)}
      </h2>

      <div class="field">
        <div class="field-label">Objet</div>
        <div class="field-value">${subjectLabels[data.subject]}</div>
      </div>

      <div class="field">
        <div class="field-label">Contact</div>
        <div class="field-value">
          📧 ${esc(data.email)}<br>
          📞 ${data.phone ? esc(data.phone) : "Non renseigné"}
        </div>
      </div>

      ${data.vehicle_ref ? `
      <div class="field">
        <div class="field-label">Véhicule concerné</div>
        <div class="field-value">${esc(data.vehicle_ref)}</div>
      </div>
      ` : ""}

      <div class="field">
        <div class="field-label">Message</div>
        <div class="field-value" style="white-space: pre-wrap; background: #fff; padding: 15px; border-radius: 4px; border-left: 3px solid #C9A84C;">${esc(data.message)}</div>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${siteUrl}/fr/admin/messages" class="button">
          Voir dans l'admin
        </a>
      </div>
    </div>

    <div class="footer">
      <p>Ce message a été envoyé via le formulaire de contact ${siteName}</p>
      <p>
        <a href="${siteUrl}" style="color: #C9A84C;">${siteUrl}</a>
      </p>
    </div>
  </div>
</body>
</html>
`;
}

// Template email confirmation client
function getClientEmailTemplate(
  data: ContactFormInput,
  locale: string,
  siteName: string,
  siteUrl: string,
  contactEmail: string,
  phoneNumber: string
): string {
  const isFr = locale === "fr";

  const texts = {
    greeting: isFr ? "Bonjour" : "Hello",
    confirmation: isFr
      ? "Nous avons bien reçu votre message et nous vous en remercions."
      : "We have received your message and thank you for it.",
    response: isFr
      ? "Notre équipe vous répondra dans les plus brefs délais, généralement sous 24 heures."
      : "Our team will get back to you as soon as possible, usually within 24 hours.",
    recap: isFr ? "Récapitulatif de votre message" : "Summary of your message",
    subject: isFr ? "Objet" : "Subject",
    message: isFr ? "Message" : "Message",
    contact: isFr ? "Nos coordonnées" : "Our contact details",
    regards: isFr ? "Cordialement" : "Best regards",
    team: isFr ? "L'équipe" : "The team",
  };

  const subjectLabels: Record<string, { fr: string; en: string }> = {
    vehicle_info: { fr: "Information sur un véhicule", en: "Vehicle information" },
    trade_in: { fr: "Reprise de véhicule", en: "Trade-in" },
    pricing: { fr: "Demande de prix", en: "Pricing request" },
    other: { fr: "Autre", en: "Other" },
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0A0A0A; padding: 30px; text-align: center; }
    .header h1 { color: #C9A84C; margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 30px; }
    .field { margin-bottom: 20px; }
    .field-label { font-weight: bold; color: #C9A84C; margin-bottom: 5px; }
    .field-value { color: #333; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; background: #f0f0f0; }
    .highlight { background: #C9A84C20; padding: 15px; border-radius: 4px; border-left: 3px solid #C9A84C; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 ${siteName}</h1>
    </div>

    <div class="content">
      <h2 style="color: #0A0A0A; margin-top: 0;">${texts.greeting} ${esc(data.first_name)},</h2>

      <div class="highlight">
        <p style="margin: 0;">${texts.confirmation}</p>
      </div>

      <p>${texts.response}</p>

      <h3 style="color: #0A0A0A; border-bottom: 2px solid #C9A84C; padding-bottom: 10px;">
        ${texts.recap}
      </h3>

      <div class="field">
        <div class="field-label">${texts.subject}</div>
        <div class="field-value">${subjectLabels[data.subject][locale as keyof typeof subjectLabels['vehicle_info']] || subjectLabels[data.subject].fr}</div>
      </div>

      <div class="field">
        <div class="field-label">${texts.message}</div>
        <div class="field-value" style="white-space: pre-wrap; background: #fff; padding: 15px; border-radius: 4px;">${esc(data.message)}</div>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
        <h4 style="color: #0A0A0A;">${texts.contact}</h4>
        <p style="margin: 5px 0;">📞 ${phoneNumber}</p>
        <p style="margin: 5px 0;">✉️ ${contactEmail}</p>
      </div>

      <p style="margin-top: 30px;">
        ${texts.regards},<br>
        <strong style="color: #C9A84C;">${texts.team} ${siteName}</strong>
      </p>
    </div>

    <div class="footer">
      <p><a href="${siteUrl}" style="color: #C9A84C;">${siteUrl}</a></p>
    </div>
  </div>
</body>
</html>
`;
}

// Fonction d'envoi d'email via Resend
async function sendEmail({
  from,
  to,
  subject,
  html,
}: {
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });
  if (error) throw new Error(error.message);
}

export async function submitContactForm(
  formData: ContactFormInput,
  locale: string = "fr"
): Promise<ActionResult> {
  try {
    // 1. Validation Zod
    const validation = contactFormSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      return { success: false, fieldErrors };
    }

    const data = validation.data;

    // 2. Vérification honeypot (anti-spam)
    if (data.website && data.website.trim() !== "") {
      // Champ rempli par un bot → rejet silencieux
      return { success: true }; // On fait croire que ça a marché
    }

    // 3. Rate limiting (5/hour per IP)
    const clientIP = getClientIP();
    const rl = await checkRateLimit(clientIP, { prefix: "contact", maxRequests: 5 });
    if (!rl.allowed) {
      return {
        success: false,
        error:
          locale === "fr"
            ? "Trop de tentatives. Veuillez réessayer dans une heure."
            : "Too many attempts. Please try again in an hour.",
      };
    }

    // 4. Charger les paramètres dynamiques
    const settings = await getSiteSettings();
    const senderEmail = getSenderEmail(settings);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://autoroi.fr";

    // 5. Insertion en base
    const supabase = await createClient();
    const insertData: ContactMessageInsert = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone || null,
      vehicle_ref: data.vehicle_ref || null,
      message: `[Objet: ${data.subject}]\n\n${data.message}`,
      ip_address: clientIP,
      status: "non_lu",
    };
    const { error: insertError } = await (supabase.from("contact_messages") as any).insert(insertData);

    if (insertError) {
      console.error("Erreur insertion contact:", insertError);
      return {
        success: false,
        error:
          locale === "fr"
            ? "Une erreur est survenue. Veuillez réessayer."
            : "An error occurred. Please try again.",
      };
    }

    // 6. Envoi email admin
    try {
      await sendEmail({
        from: senderEmail,
        to: settings.email_notifications,
        subject: `🚗 Nouveau message de contact — ${settings.business_name}`,
        html: getAdminEmailTemplate(data, settings.business_name, siteUrl, settings.email_notifications),
      });
    } catch (emailError) {
      console.error("Erreur envoi email admin:", emailError);
      // On continue, le message est déjà en base
    }

    // 7. Envoi email confirmation client
    try {
      await sendEmail({
        from: senderEmail,
        to: data.email,
        subject:
          locale === "fr"
            ? `Votre message a bien été reçu — ${settings.business_name}`
            : `Your message has been received — ${settings.business_name}`,
        html: getClientEmailTemplate(
          data,
          locale,
          settings.business_name,
          siteUrl,
          settings.email_public || settings.contact_email,
          settings.phone_number
        ),
      });
    } catch (emailError) {
      console.error("Erreur envoi email client:", emailError);
      // On continue
    }

    return { success: true };
  } catch (error) {
    console.error("Erreur submitContactForm:", error);
    return {
      success: false,
      error:
        locale === "fr"
          ? "Une erreur inattendue est survenue."
          : "An unexpected error occurred.",
    };
  }
}
