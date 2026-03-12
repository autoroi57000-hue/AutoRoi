import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { WhatsAppButton } from "@/components/contact/WhatsAppButton";
import { getSiteSettings } from "@/lib/site-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MountReveal, MountStagger } from "@/components/ui/MountReveal";

interface ContactPageProps {
  params: { locale: string };
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = params;
  const settings = await getSiteSettings();

  const titles = {
    fr: `Contact | ${settings.business_name}`,
    en: `Contact | ${settings.business_name}`,
  };

  const descriptions = {
    fr: `Contactez ${settings.business_name} pour toute question sur nos véhicules premium. Notre équipe vous répond sous 24h.`,
    en: `Contact ${settings.business_name} for any questions about our premium vehicles. Our team will reply within 24 hours.`,
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.fr,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.fr,
    alternates: {
      canonical: `/${locale}/contact`,
      languages: {
        fr: "/fr/contact",
        en: "/en/contact",
      },
    },
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = params;
  const settings = await getSiteSettings();

  const texts = {
    fr: {
      backHome: "← Retour à l'accueil",
      subtitle: "NOUS SOMMES À VOTRE ÉCOUTE",
      title: "CONTACTEZ-NOUS",
      description:
        "Notre équipe d'experts est disponible pour répondre à toutes vos questions et vous accompagner dans votre projet automobile.",
      availability: "Disponibilité",
      availabilityHours: settings.opening_hours,
      phone: "Téléphone",
      email: "Email",
      address: "Adresse",
      whatsapp: "WhatsApp",
      whatsappText: "Contact rapide",
      mapTitle: "Notre localisation",
      formTitle: "Envoyez-nous un message",
      formSubtitle: "Remplissez le formulaire ci-dessous, nous vous répondrons dans les plus brefs délais.",
      socialTitle: "Suivez-nous",
    },
    en: {
      backHome: "← Back to home",
      subtitle: "WE ARE LISTENING",
      title: "CONTACT US",
      description:
        "Our team of experts is available to answer all your questions and support you in your automotive project.",
      availability: "Availability",
      availabilityHours: settings.opening_hours,
      phone: "Phone",
      email: "Email",
      address: "Address",
      whatsapp: "WhatsApp",
      whatsappText: "Quick contact",
      mapTitle: "Our location",
      formTitle: "Send us a message",
      formSubtitle: "Fill out the form below, we will get back to you as soon as possible.",
      socialTitle: "Follow us",
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.fr;

  // Format WhatsApp link
  const whatsappPhone = settings.whatsapp_number.replace(/\D/g, "");
  const whatsappHref = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    locale === "fr"
      ? settings.whatsapp_message_fr
      : settings.whatsapp_message_en
  )}`;

  return (
    <div className="min-h-screen">
      {/* Hero Mini */}
      <section className="relative bg-ar-black pb-20 pt-12">
        {/* Back link */}
        <div className="container mx-auto px-4">
          <Link
            href={`/${locale}`}
            className="mb-8 inline-flex items-center text-sm text-ar-silver transition-colors hover:text-ar-gold"
          >
            {t.backHome}
          </Link>

          {/* Header content */}
          <div className="text-center">
            <MountReveal delay={0}>
              <div className="mb-4 flex items-center justify-center gap-4">
                <span className="h-px w-12 bg-ar-gold" />
                <span className="text-xs font-medium uppercase tracking-[0.3em] text-ar-gold">
                  {t.subtitle}
                </span>
                <span className="h-px w-12 bg-ar-gold" />
              </div>
              <h1 className="font-display text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                {t.title}
              </h1>
            </MountReveal>
            <MountReveal delay={0.1}>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-ar-silver/80">
                {t.description}
              </p>
            </MountReveal>
          </div>
        </div>

        {/* Decorative bottom curve */}
        <div className="absolute bottom-0 left-0 right-0 h-16" style={{ background: 'transparent' }}>
          <svg
            className="h-full w-full"
            viewBox="0 0 1440 64"
            preserveAspectRatio="none"
          >
            <path
              fill="#0A0A0A"
              d="M0,0 C480,64 960,64 1440,0 L1440,0 L0,0 Z"
            />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 pt-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Left: Contact Form */}
            <MountReveal delay={0.4} className="order-2 lg:order-1">
              <div className="mb-8">
                <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
                  {t.formTitle}
                </h2>
                <p className="mt-2 text-ar-silver">{t.formSubtitle}</p>
              </div>
              <ContactForm locale={locale} />
            </MountReveal>

            {/* Right: Contact Info */}
            <div className="order-1 lg:order-2">
              <div className="sticky top-24 space-y-6">
                {/* Logo Card */}
                <Card className="overflow-hidden border-ar-gray/20">
                  <CardContent className="p-0">
                    <div className="bg-ar-black p-6 text-center">
                      <h3 className="font-display text-2xl font-bold text-ar-gold">
                        {settings.business_name}
                      </h3>
                      <p className="mt-1 text-sm text-ar-silver">
                        {locale === "fr"
                          ? "Véhicules Premium"
                          : "Premium Vehicles"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Cards */}
                <MountStagger delay={0.2} className="space-y-4">
                  {/* Phone */}
                  <a
                    href={`tel:${settings.phone_number}`}
                    className="group flex items-center gap-4 rounded-xl p-4 transition-all hover:border-ar-gold" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ar-gold/10 text-ar-gold transition-colors group-hover:bg-ar-gold group-hover:text-ar-black">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ar-silver">
                        {t.phone}
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {settings.phone_number}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-ar-gray opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-xl border border-[#25D366]/30 bg-[#25D366]/5 p-4 transition-all hover:border-[#25D366] hover:bg-[#25D366]/10 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ar-silver">
                        {t.whatsapp}
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {t.whatsappText}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-[#25D366]" />
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:${settings.email_public}`}
                    className="group flex items-center gap-4 rounded-xl p-4 transition-all hover:border-ar-gold" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ar-gold/10 text-ar-gold transition-colors group-hover:bg-ar-gold group-hover:text-ar-black">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ar-silver">
                        {t.email}
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {settings.email_public}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-ar-gray opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>

                  {/* Availability */}
                  <div className="flex items-center gap-4 rounded-xl border border-ar-gray/20 bg-ar-gray/5 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ar-black text-ar-gold">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ar-silver">
                        {t.availability}
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {t.availabilityHours}
                      </p>
                    </div>
                  </div>
                </MountStagger>

                {/* Map Placeholder */}
                <Card className="overflow-hidden border-ar-gray/20">
                  <CardContent className="p-0">
                    <div className="relative aspect-video bg-ar-gray/10">
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-ar-silver">
                        <MapPin className="mb-2 h-10 w-10 text-ar-gold" />
                        <p className="font-medium">{t.mapTitle}</p>
                        <p className="mt-1 text-sm">
                          {locale === "fr"
                            ? "Bientôt disponible"
                            : "Coming soon"}
                        </p>
                      </div>
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-ar-black/20 to-transparent" />
                    </div>
                  </CardContent>
                </Card>

                {/* CTA Card */}
                <Card className="border-ar-gold/30 bg-ar-gold/5">
                  <CardContent className="p-6">
                    <h3 className="mb-2 font-display text-lg font-bold text-white">
                      {locale === "fr"
                        ? "Besoin d'une réponse rapide ?"
                        : "Need a quick answer?"}
                    </h3>
                    <p className="mb-4 text-sm text-ar-silver">
                      {locale === "fr"
                        ? "Contactez-nous directement par WhatsApp pour une réponse immédiate."
                        : "Contact us directly via WhatsApp for an immediate response."}
                    </p>
                    <WhatsAppButton
                      whatsappNumber={settings.whatsapp_number}
                      className="w-full justify-center"
                      label={
                        locale === "fr"
                          ? "Nous écrire sur WhatsApp"
                          : "Message us on WhatsApp"
                      }
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
