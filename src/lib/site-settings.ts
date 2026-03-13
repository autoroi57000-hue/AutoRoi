import { createClient } from "@/lib/supabase/server"

// Type complet de tous les settings
export type SiteSettings = {
  // Contact
  phone_number: string
  whatsapp_number: string
  whatsapp_default_message: string
  whatsapp_message_fr: string
  whatsapp_message_en: string
  whatsapp_tooltip_fr: string
  whatsapp_tooltip_en: string
  whatsapp_subtitle_fr: string
  whatsapp_subtitle_en: string
  contact_email: string
  email_public: string
  email_notifications: string
  email_sender_domain: string
  opening_hours: string

  // Entreprise
  business_name: string
  business_address: string
  slogan_fr: string
  slogan_en: string
  about_text_fr: string
  about_text_en: string

  // Réseaux sociaux
  facebook_url: string
  instagram_url: string
  snapchat_url: string
  tiktok_url: string
  youtube_url: string

  // Mentions légales
  legal_entity_name: string
  legal_siret: string
  legal_capital: string
  legal_form: string
  legal_address: string
  legal_host_name: string
  legal_host_address: string

  // SEO
  meta_description_fr: string
  meta_description_en: string

  // Affichage
  vehicles_per_page: string
  show_view_count: string
  default_sort: string
  admin_welcome_message: string
}

// Valeurs par défaut (fallback si clé absente de la DB)
const DEFAULTS: SiteSettings = {
  phone_number: "+33 6 00 00 00 00",
  whatsapp_number: "33600000000",
  whatsapp_default_message: "Bonjour, je suis intéressé(e) par un véhicule.",
  whatsapp_message_fr: "Bonjour, je suis intéressé(e) par un véhicule sur Auto Roi.",
  whatsapp_message_en: "Hello, I am interested in a vehicle on Auto Roi.",
  whatsapp_tooltip_fr: "Comment pouvons-nous vous aider ?",
  whatsapp_tooltip_en: "How can we help you?",
  whatsapp_subtitle_fr: "Notre équipe vous répond sous 24h.",
  whatsapp_subtitle_en: "Our team responds within 24h.",
  contact_email: "contact@autoroi.fr",
  email_public: "contact@autoroi.fr",
  email_notifications: "auto.roi57000@gmail.com",
  email_sender_domain: "resend.dev",
  opening_hours: "Lun-Sam 9h-19h, Dim sur RDV",
  business_name: "Auto Roi",
  business_address: "43 Rue de Pontpierre, 57380 Faulquemont",
  slogan_fr: "Votre partenaire automobile premium",
  slogan_en: "Your premium automotive partner",
  about_text_fr: "",
  about_text_en: "",
  facebook_url: "",
  instagram_url: "",
  snapchat_url: "",
  tiktok_url: "",
  youtube_url: "",
  legal_entity_name: "",
  legal_siret: "",
  legal_capital: "",
  legal_form: "",
  legal_address: "",
  legal_host_name: "Vercel Inc.",
  legal_host_address: "440 N Barranca Ave #4133, Covina, CA 91723, USA",
  meta_description_fr: "",
  meta_description_en: "",
  vehicles_per_page: "12",
  show_view_count: "true",
  default_sort: "newest",
  admin_welcome_message: "",
}

// Fonction principale — utilisable dans tous les Server Components
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")

    if (error || !data) return { ...DEFAULTS }

    // Convertir le tableau [{key, value}] en objet
    const settings = data.reduce(
      (acc, { key, value }) => {
        acc[key as keyof SiteSettings] = value ?? ""
        return acc
      },
      {} as Partial<SiteSettings>
    )

    // Merger avec les defaults (fallback sur chaque clé manquante)
    return { ...DEFAULTS, ...settings }
  } catch {
    return { ...DEFAULTS }
  }
}

// Helper — formater le lien WhatsApp
export function getWhatsAppUrl(
  settings: SiteSettings,
  locale: string,
  customMessage?: string
): string {
  const number = settings.whatsapp_number.replace(/[^0-9]/g, "")
  const message =
    customMessage ??
    (locale === "en"
      ? settings.whatsapp_message_en
      : settings.whatsapp_message_fr)
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

// Helper — email expéditeur Resend
// Resend sandbox impose onboarding@resend.dev comme adresse exacte.
// Quand tu auras vérifié ton propre domaine, change email_sender_domain dans l'admin.
export function getSenderEmail(settings: SiteSettings): string {
  const domain = settings.email_sender_domain?.trim()
  if (!domain || domain === "resend.dev") {
    return `${settings.business_name} <onboarding@resend.dev>`
  }
  return `${settings.business_name} <noreply@${domain}>`
}
