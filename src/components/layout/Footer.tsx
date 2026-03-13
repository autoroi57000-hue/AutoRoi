import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { getSiteSettings, type SiteSettings } from "@/lib/site-settings";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";

// ── SVG Social Icons (official logos) ──────────────────────────────

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function SnapchatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.166.934c1.028 0 4.5.287 6.14 3.958.548 1.234.417 3.334.309 5.02l-.003.062c-.012.186-.023.357-.031.528.078.047.21.093.415.093.31-.016.682-.124 1.07-.312.17-.091.356-.108.48-.108.189 0 .372.03.527.093.466.155.76.497.76.868.016.465-.404.869-1.256 1.21-.092.03-.216.078-.356.124-.466.14-1.179.373-1.38.839-.093.232-.063.543.124.899l.003.016c.87 2.037 2.4 2.901 3.637 2.901.404 0 .746-.077.962-.197l.065-.034c.197-.104.395-.158.585-.158.362 0 .713.208.917.546.124.226.155.466.093.683-.093.341-.404.591-.853.731-1.536.466-2.128.728-2.346 1.178-.047.093-.065.202-.059.325.016.248.108.496.233.775l.031.073c.155.373.403.992.202 1.567-.171.496-.606.853-1.287 1.06-.668.202-1.398.124-2.064-.216-.497-.248-.932-.373-1.335-.373-.373 0-.714.109-1.04.249-.777.388-1.755.621-2.794.621-1.04 0-2.003-.233-2.78-.621-.326-.14-.668-.249-1.04-.249-.404 0-.838.124-1.336.373-.667.34-1.398.418-2.064.216-.681-.207-1.116-.564-1.287-1.06-.201-.575.047-1.194.202-1.567l.03-.073c.125-.28.217-.527.233-.775.007-.123-.011-.232-.058-.325-.218-.45-.81-.712-2.346-1.178-.45-.14-.76-.39-.853-.731-.062-.217-.031-.457.093-.683.204-.338.555-.546.917-.546.19 0 .388.054.585.158l.065.034c.216.12.558.197.962.197 1.237 0 2.767-.864 3.637-2.901l.016-.016c.186-.356.217-.667.124-.899-.202-.466-.914-.699-1.38-.839-.14-.046-.264-.093-.357-.124-.852-.341-1.272-.745-1.256-1.21 0-.371.294-.713.76-.868.155-.063.342-.093.527-.093.124 0 .31.017.48.108.388.188.76.296 1.07.312.205 0 .337-.046.415-.093-.008-.17-.019-.342-.031-.528l-.004-.062c-.107-1.686-.238-3.786.31-5.02C7.653 1.22 11.125.934 12.166.934z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// ── Social config ──────────────────────────────────────────────────

const SOCIALS = [
  {
    key: "facebook_url" as keyof SiteSettings,
    label: "Facebook",
    icon: FacebookIcon,
    hoverClass:
      "hover:bg-[#1877F2]/15 hover:border-[#1877F2]/40 hover:text-[#1877F2]",
  },
  {
    key: "instagram_url" as keyof SiteSettings,
    label: "Instagram",
    icon: InstagramIcon,
    hoverClass:
      "hover:bg-[#E1306C]/15 hover:border-[#E1306C]/40 hover:text-[#E1306C]",
  },
  {
    key: "snapchat_url" as keyof SiteSettings,
    label: "Snapchat",
    icon: SnapchatIcon,
    hoverClass:
      "hover:bg-[#FFFC00]/15 hover:border-[#FFFC00]/40 hover:text-[#FFFC00]",
  },
  {
    key: "tiktok_url" as keyof SiteSettings,
    label: "TikTok",
    icon: TikTokIcon,
    hoverClass:
      "hover:bg-white/10 hover:border-white/30 hover:text-white",
  },
  {
    key: "youtube_url" as keyof SiteSettings,
    label: "YouTube",
    icon: YouTubeIcon,
    hoverClass:
      "hover:bg-[#FF0000]/15 hover:border-[#FF0000]/40 hover:text-[#FF0000]",
  },
] as const;

// ── Footer (Server Component) ──────────────────────────────────────

interface FooterProps {
  locale: string;
}

export async function Footer({ locale }: FooterProps) {
  const [settings, t] = await Promise.all([
    getSiteSettings(),
    getTranslations({ locale, namespace: "footer" }),
  ]);

  const tNav = await getTranslations({ locale, namespace: "nav" });
  const currentYear = new Date().getFullYear();
  const slogan = locale === "en" ? settings.slogan_en : settings.slogan_fr;

  const quickLinks = [
    { href: `/${locale}`, label: tNav("home") },
    { href: `/${locale}/vehicules`, label: tNav("vehicles") },
    { href: `/${locale}/location`, label: tNav("rental") },
    { href: `/${locale}/contact`, label: tNav("contact") },
  ];

  const legalLinks = [
    { href: `/${locale}/mentions-legales`, label: t("legal") },
    { href: `/${locale}/confidentialite`, label: t("privacy") },
  ];

  const activeSocials = SOCIALS.filter((s) => settings[s.key]);

  return (
    <footer className="bg-[#070707] border-t border-white/[0.04]">
      {/* Gold separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* ── Col 1: Identity + Social ── */}
          <div className="lg:col-span-1">
            <Link
              href={`/${locale}`}
              className="font-display text-2xl font-bold text-[#C9A84C]"
            >
              {settings.business_name}
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              {t("description")}
            </p>
            {slogan && (
              <p className="mt-2 text-xs text-[#C9A84C]/80">{slogan}</p>
            )}

            {/* Social links */}
            {activeSocials.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#C9A84C]/70">
                  {locale === "en" ? "Follow us" : "Suivez-nous"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeSocials.map((social) => (
                    <a
                      key={social.key}
                      href={settings[social.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      title={social.label}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/[0.08] bg-white/[0.03] text-white/70 transition-all duration-250 ease-out hover:-translate-y-0.5 hover:shadow-lg ${social.hoverClass}`}
                    >
                      <social.icon />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Col 2: Quick Links ── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#C9A84C]" role="heading" aria-level={3}>
              {t("quickLinks")}
            </p>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-[#C9A84C]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Contact ── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#C9A84C]" role="heading" aria-level={3}>
              {t("contact")}
            </p>
            <ul className="mt-5 space-y-3">
              {settings.phone_number && (
                <li>
                  <a
                    href={`tel:${settings.phone_number}`}
                    className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-[#C9A84C]"
                  >
                    <Phone className="h-3.5 w-3.5 text-[#C9A84C]/70" />
                    {settings.phone_number}
                  </a>
                </li>
              )}
              {settings.email_public && (
                <li>
                  <a
                    href={`mailto:${settings.email_public}`}
                    className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-[#C9A84C]"
                  >
                    <Mail className="h-3.5 w-3.5 text-[#C9A84C]/70" />
                    {settings.email_public}
                  </a>
                </li>
              )}
              {settings.business_address && (
                <li className="inline-flex items-start gap-2 text-sm text-white/70">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C9A84C]/70" />
                  <span>{settings.business_address}</span>
                </li>
              )}
              {settings.opening_hours && (
                <li className="inline-flex items-start gap-2 text-sm text-white/70">
                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C9A84C]/70" />
                  <span className="whitespace-pre-line">
                    {settings.opening_hours}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* ── Col 4: Legal + Language ── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#C9A84C]" role="heading" aria-level={3}>
              {locale === "en" ? "Information" : "Informations"}
            </p>
            <ul className="mt-5 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-[#C9A84C]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Locale Switcher */}
            <div className="mt-8">
              <p className="mb-3 text-[10px] uppercase tracking-[0.15em] text-white/60">
                Language
              </p>
              <LocaleSwitcher />
            </div>
          </div>
        </div>

        {/* ── Separator ── */}
        <div className="my-10 h-px bg-white/[0.06]" />

        {/* ── Bottom bar ── */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-white/60">
            &copy; {currentYear} {settings.business_name}. {t("allRights")}
          </p>
          {slogan && (
            <p className="text-xs text-[#C9A84C]/60">{slogan}</p>
          )}
        </div>
      </div>
    </footer>
  );
}
