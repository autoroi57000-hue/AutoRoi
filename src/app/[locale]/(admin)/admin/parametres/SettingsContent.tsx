"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  Type,
  Share2,
  Eye,
  Shield,
  Info,
} from "lucide-react";
import { SettingField, SaveButton } from "@/components/admin/settings/SettingField";
import { bulkUpdateSettings } from "./actions";
import { cn } from "@/lib/utils";
import { fadeIn } from "@/lib/animations";

interface SettingsContentProps {
  initialSettings: Record<string, string>;
}

type TabType = "contact" | "content" | "social" | "legal" | "display";

const tabs = [
  { id: "contact" as TabType, label: "Coordonnées & Contact", icon: Phone },
  { id: "content" as TabType, label: "Contenu & Textes", icon: Type },
  { id: "social" as TabType, label: "Réseaux Sociaux", icon: Share2 },
  { id: "legal" as TabType, label: "Mentions Légales", icon: Shield },
  { id: "display" as TabType, label: "Paramètres Affichage", icon: Eye },
];

// ── SVG Social Icons (official logos — same as Footer) ──────────────

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function SnapchatIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.166.934c1.028 0 4.5.287 6.14 3.958.548 1.234.417 3.334.309 5.02l-.003.062c-.012.186-.023.357-.031.528.078.047.21.093.415.093.31-.016.682-.124 1.07-.312.17-.091.356-.108.48-.108.189 0 .372.03.527.093.466.155.76.497.76.868.016.465-.404.869-1.256 1.21-.092.03-.216.078-.356.124-.466.14-1.179.373-1.38.839-.093.232-.063.543.124.899l.003.016c.87 2.037 2.4 2.901 3.637 2.901.404 0 .746-.077.962-.197l.065-.034c.197-.104.395-.158.585-.158.362 0 .713.208.917.546.124.226.155.466.093.683-.093.341-.404.591-.853.731-1.536.466-2.128.728-2.346 1.178-.047.093-.065.202-.059.325.016.248.108.496.233.775l.031.073c.155.373.403.992.202 1.567-.171.496-.606.853-1.287 1.06-.668.202-1.398.124-2.064-.216-.497-.248-.932-.373-1.335-.373-.373 0-.714.109-1.04.249-.777.388-1.755.621-2.794.621-1.04 0-2.003-.233-2.78-.621-.326-.14-.668-.249-1.04-.249-.404 0-.838.124-1.336.373-.667.34-1.398.418-2.064.216-.681-.207-1.116-.564-1.287-1.06-.201-.575.047-1.194.202-1.567l.03-.073c.125-.28.217-.527.233-.775.007-.123-.011-.232-.058-.325-.218-.45-.81-.712-2.346-1.178-.45-.14-.76-.39-.853-.731-.062-.217-.031-.457.093-.683.204-.338.555-.546.917-.546.19 0 .388.054.585.158l.065.034c.216.12.558.197.962.197 1.237 0 2.767-.864 3.637-2.901l.016-.016c.186-.356.217-.667.124-.899-.202-.466-.914-.699-1.38-.839-.14-.046-.264-.093-.357-.124-.852-.341-1.272-.745-1.256-1.21 0-.371.294-.713.76-.868.155-.063.342-.093.527-.093.124 0 .31.017.48.108.388.188.76.296 1.07.312.205 0 .337-.046.415-.093-.008-.17-.019-.342-.031-.528l-.004-.062c-.107-1.686-.238-3.786.31-5.02C7.653 1.22 11.125.934 12.166.934z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// Social network config for the redesigned tab
const SOCIAL_NETWORKS = [
  {
    key: "facebook_url",
    label: "Facebook",
    icon: FacebookIcon,
    brandColor: "#1877F2",
    placeholder: "https://facebook.com/votrepage",
    hoverClass: "hover:bg-[#1877F2]/15 hover:border-[#1877F2]/40 hover:text-[#1877F2]",
  },
  {
    key: "instagram_url",
    label: "Instagram",
    icon: InstagramIcon,
    brandColor: "#E1306C",
    placeholder: "https://instagram.com/votrepage",
    hoverClass: "hover:bg-[#E1306C]/15 hover:border-[#E1306C]/40 hover:text-[#E1306C]",
  },
  {
    key: "snapchat_url",
    label: "Snapchat",
    icon: SnapchatIcon,
    brandColor: "#FFFC00",
    placeholder: "https://snapchat.com/add/votrepage",
    hoverClass: "hover:bg-[#FFFC00]/15 hover:border-[#FFFC00]/40 hover:text-[#FFFC00]",
  },
  {
    key: "tiktok_url",
    label: "TikTok",
    icon: TikTokIcon,
    brandColor: "#ffffff",
    placeholder: "https://tiktok.com/@votrepage",
    hoverClass: "hover:bg-white/10 hover:border-white/30 hover:text-white",
  },
  {
    key: "youtube_url",
    label: "YouTube",
    icon: YouTubeIcon,
    brandColor: "#FF0000",
    placeholder: "https://youtube.com/@votrechaine",
    hoverClass: "hover:bg-[#FF0000]/15 hover:border-[#FF0000]/40 hover:text-[#FF0000]",
  },
] as const;

export function SettingsContent({ initialSettings }: SettingsContentProps) {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<TabType>("contact");
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const getValue = (key: string, defaultValue: string = ""): string => {
    return settings[key] ?? defaultValue;
  };

  const handleSettingChange = useCallback((key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSaveTab = async (tabFields: string[]) => {
    setIsSaving(true);
    setSaveMessage("");

    const settingsToSave = tabFields.map((key) => ({
      key,
      value: settings[key] ?? "",
    }));

    try {
      const result = await bulkUpdateSettings(settingsToSave);
      if (result.success) {
        setSaveMessage(t("common.saved"));
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage(result.error || t("errors.serverError"));
      }
    } catch (error) {
      setSaveMessage(t("errors.serverError"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-ar-gold">
          {t("admin.settings")}
        </h1>
        {saveMessage && (
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-md px-4 py-2 text-sm",
              saveMessage === t("common.saved")
                ? "bg-ar-success/10 text-ar-success"
                : "bg-ar-danger/10 text-ar-danger"
            )}
          >
            {saveMessage}
          </motion.span>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-ar-gray-700/50">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "border-ar-gold text-ar-gold"
                    : "border-transparent text-ar-silver hover:text-ar-gold"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="rounded-xl border border-ar-gray-700 bg-ar-black p-6"
        >
          {/* TAB 1: COORDONNÉES & CONTACT */}
          {activeTab === "contact" && (
            <div className="space-y-6">
              <div className="mb-6 flex items-center gap-3">
                <Phone className="h-5 w-5 text-ar-gold" />
                <h2 className="font-display text-xl font-semibold text-white">
                  Coordonnées & Contact
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <SettingField
                  settingKey="phone_number"
                  label="Numéro de téléphone"
                  description="Numéro affiché sur le site"
                  type="tel"
                  defaultValue={getValue("phone_number", "+33 6 00 00 00 00")}
                  placeholder="+33 6 12 34 56 78"
                  onSave={handleSettingChange}
                />

                <SettingField
                  settingKey="whatsapp_number"
                  label="Numéro WhatsApp"
                  description="Format international sans + (ex: 33612345678)"
                  type="tel"
                  defaultValue={getValue("whatsapp_number", "33600000000")}
                  placeholder="33612345678"
                  onSave={handleSettingChange}
                />

                <SettingField
                  settingKey="email_public"
                  label="Email de contact public"
                  description="Email affiché sur le site"
                  type="email"
                  defaultValue={getValue("email_public", "contact@autoroi.fr")}
                  placeholder="contact@autoroi.fr"
                  onSave={handleSettingChange}
                />

                <SettingField
                  settingKey="email_notifications"
                  label="Email notifications"
                  description="Email pour recevoir les alertes (peut être différent)"
                  type="email"
                  defaultValue={getValue("email_notifications", "admin@autoroi.fr")}
                  placeholder="admin@autoroi.fr"
                  onSave={handleSettingChange}
                />
              </div>

              <SettingField
                settingKey="whatsapp_default_message"
                label="Message WhatsApp par défaut"
                description="Message pré-rempli quand un client clique sur WhatsApp"
                type="textarea"
                defaultValue={getValue("whatsapp_default_message", "Bonjour, je vous contacte depuis votre site Auto Roi.")}
                placeholder="Bonjour..."
                onSave={handleSettingChange}
              />

              <SettingField
                settingKey="address"
                label="Adresse"
                description="Adresse pour les mentions légales (optionnel)"
                type="textarea"
                defaultValue={getValue("address", "")}
                placeholder="123 Rue de Paris, 75000 Paris"
                onSave={handleSettingChange}
              />

              <SettingField
                settingKey="opening_hours"
                label="Horaires d'ouverture"
                description="Texte libre affiché sur la page contact"
                type="textarea"
                defaultValue={getValue("opening_hours", "Lun-Sam 9h-19h, Dimanche sur RDV")}
                placeholder="Lundi au Samedi 9h-19h"
                onSave={handleSettingChange}
              />

              <div className="flex justify-end pt-4">
                <SaveButton
                  onClick={() =>
                    handleSaveTab([
                      "phone_number",
                      "whatsapp_number",
                      "email_public",
                      "email_notifications",
                      "whatsapp_default_message",
                      "address",
                      "opening_hours",
                    ])
                  }
                  isLoading={isSaving}
                />
              </div>
            </div>
          )}

          {/* TAB 2: CONTENU & TEXTES */}
          {activeTab === "content" && (
            <div className="space-y-6">
              <div className="mb-6 flex items-center gap-3">
                <Type className="h-5 w-5 text-ar-gold" />
                <h2 className="font-display text-xl font-semibold text-white">
                  Contenu & Textes du Site
                </h2>
              </div>

              <SettingField
                settingKey="slogan_fr"
                label="Slogan FR"
                description="Sous-titre affiché sous le logo"
                type="text"
                defaultValue={getValue("slogan_fr", "Achat — Vente — Reprise Automobile")}
                placeholder="Votre slogan en français"
                onSave={handleSettingChange}
              />

              <SettingField
                settingKey="slogan_en"
                label="Slogan EN"
                description="Sous-titre en anglais"
                type="text"
                defaultValue={getValue("slogan_en", "Purchase — Sale — Trade-in")}
                placeholder="Your slogan in English"
                onSave={handleSettingChange}
              />

              <SettingField
                settingKey="meta_description_fr"
                label="Meta description FR"
                description="Description pour Google (max 160 caractères)"
                type="textarea"
                maxLength={160}
                defaultValue={getValue("meta_description_fr", "Découvrez notre stock de véhicules premium chez Auto Roi.")}
                placeholder="Description SEO en français..."
                onSave={handleSettingChange}
              />

              <SettingField
                settingKey="meta_description_en"
                label="Meta description EN"
                description="Description pour Google en anglais"
                type="textarea"
                maxLength={160}
                defaultValue={getValue("meta_description_en", "Discover our premium vehicle stock at Auto Roi.")}
                placeholder="SEO description in English..."
                onSave={handleSettingChange}
              />

              <SettingField
                settingKey="about_text_fr"
                label="Texte À propos FR"
                description="Texte pour la future page À propos"
                type="textarea"
                defaultValue={getValue("about_text_fr", "")}
                placeholder="Présentation de votre entreprise..."
                onSave={handleSettingChange}
              />

              <SettingField
                settingKey="about_text_en"
                label="Texte À propos EN"
                description="Texte À propos en anglais"
                type="textarea"
                defaultValue={getValue("about_text_en", "")}
                placeholder="Company presentation..."
                onSave={handleSettingChange}
              />

              <div className="flex justify-end pt-4">
                <SaveButton
                  onClick={() =>
                    handleSaveTab([
                      "slogan_fr",
                      "slogan_en",
                      "meta_description_fr",
                      "meta_description_en",
                      "about_text_fr",
                      "about_text_en",
                    ])
                  }
                  isLoading={isSaving}
                />
              </div>
            </div>
          )}

          {/* TAB 3: RÉSEAUX SOCIAUX */}
          {activeTab === "social" && (
            <div className="space-y-6">
              <div className="mb-6 flex items-center gap-3">
                <Share2 className="h-5 w-5 text-ar-gold" />
                <h2 className="font-display text-xl font-semibold text-white">
                  Réseaux Sociaux
                </h2>
              </div>

              <p className="mb-4 text-sm text-ar-gray-300">
                Configurez vos réseaux sociaux. Les icônes apparaissent automatiquement dans le footer du site.
                Laissez vide pour ne pas afficher un réseau.
              </p>

              {/* Social network cards */}
              <div className="space-y-3">
                {SOCIAL_NETWORKS.map((network) => {
                  const Icon = network.icon;
                  const url = getValue(network.key, "");
                  const isActive = url.trim().length > 0;

                  return (
                    <div
                      key={network.key}
                      className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-colors hover:border-white/[0.12]"
                    >
                      {/* Logo officiel */}
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${network.brandColor}15` }}
                      >
                        <Icon className={isActive ? "" : "opacity-40"} />
                      </div>

                      {/* Input */}
                      <div className="min-w-0 flex-1">
                        <label
                          htmlFor={`social-${network.key}`}
                          className="mb-1 block text-sm font-medium text-white"
                        >
                          {network.label}
                        </label>
                        <input
                          id={`social-${network.key}`}
                          type="url"
                          value={url}
                          onChange={(e) => handleSettingChange(network.key, e.target.value)}
                          placeholder={network.placeholder}
                          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-ar-gold/50 focus:outline-none focus:ring-1 focus:ring-ar-gold/30"
                        />
                      </div>

                      {/* Badge statut */}
                      <div className="shrink-0">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                            Non configuré
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* WhatsApp messages section */}
              <div className="mt-8 border-t border-white/[0.06] pt-6">
                <div className="mb-4 flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-ar-gold" />
                  <h3 className="font-display text-lg font-semibold text-white">
                    Messages WhatsApp
                  </h3>
                </div>

                <p className="mb-4 text-sm text-ar-gray-300">
                  Messages pré-remplis quand un visiteur clique sur le bouton WhatsApp flottant.
                </p>

                <div className="grid gap-6 md:grid-cols-2">
                  <SettingField
                    settingKey="whatsapp_message_fr"
                    label="Message WhatsApp FR"
                    description="Message en français"
                    type="textarea"
                    defaultValue={getValue("whatsapp_message_fr", "Bonjour, je suis intéressé(e) par un véhicule sur Auto Roi.")}
                    placeholder="Bonjour, je suis intéressé(e)..."
                    onSave={handleSettingChange}
                  />

                  <SettingField
                    settingKey="whatsapp_message_en"
                    label="Message WhatsApp EN"
                    description="Message en anglais"
                    type="textarea"
                    defaultValue={getValue("whatsapp_message_en", "Hello, I am interested in a vehicle on Auto Roi.")}
                    placeholder="Hello, I am interested..."
                    onSave={handleSettingChange}
                  />
                </div>
              </div>

              {/* Live preview */}
              <div className="mt-8 border-t border-white/[0.06] pt-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ar-gold/60">
                  Aperçu — Section &laquo; Suivez-nous &raquo; du footer
                </p>
                <div className="rounded-xl border border-white/[0.06] bg-[#070707] p-5">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#C9A84C]/50">
                    Suivez-nous
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SOCIAL_NETWORKS.map((network) => {
                      const url = getValue(network.key, "");
                      if (!url.trim()) return null;
                      const Icon = network.icon;
                      return (
                        <div
                          key={network.key}
                          title={network.label}
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/[0.08] bg-white/[0.03] text-white/50 transition-all duration-250 ease-out hover:-translate-y-0.5 hover:shadow-lg ${network.hoverClass}`}
                        >
                          <Icon />
                        </div>
                      );
                    })}
                    {SOCIAL_NETWORKS.every((n) => !getValue(n.key, "").trim()) && (
                      <p className="text-sm italic text-white/20">
                        Aucun réseau configuré — remplissez une URL ci-dessus pour voir l&apos;aperçu.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <SaveButton
                  onClick={() =>
                    handleSaveTab([
                      "facebook_url",
                      "instagram_url",
                      "snapchat_url",
                      "tiktok_url",
                      "youtube_url",
                      "whatsapp_message_fr",
                      "whatsapp_message_en",
                    ])
                  }
                  isLoading={isSaving}
                />
              </div>
            </div>
          )}

          {/* TAB 4: MENTIONS LÉGALES */}
          {activeTab === "legal" && (
            <div className="space-y-6">
              <div className="mb-6 flex items-center gap-3">
                <Shield className="h-5 w-5 text-ar-gold" />
                <h2 className="font-display text-xl font-semibold text-white">
                  Mentions Légales
                </h2>
              </div>

              {/* Info banner */}
              <div
                className="flex items-start gap-3 rounded-xl border px-5 py-4"
                style={{
                  backgroundColor: "rgba(201,168,76,0.08)",
                  borderColor: "rgba(201,168,76,0.20)",
                }}
              >
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-ar-gold" />
                <p className="text-sm leading-relaxed text-ar-silver">
                  Ces informations sont affichées sur la page{" "}
                  <strong className="text-white">Mentions Légales</strong> de votre site.
                  Elles sont <strong className="text-white">obligatoires légalement</strong>.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <SettingField
                  settingKey="legal_entity_name"
                  label="Nom de l'éditeur"
                  description="Raison sociale ou nom du dirigeant"
                  type="text"
                  defaultValue={getValue("legal_entity_name", "")}
                  placeholder="Ex: Jean Dupont"
                  onSave={handleSettingChange}
                />

                <SettingField
                  settingKey="legal_form"
                  label="Forme juridique"
                  description="Type de société"
                  type="text"
                  defaultValue={getValue("legal_form", "")}
                  placeholder="Ex: SARL, SAS, EI"
                  onSave={handleSettingChange}
                />

                <SettingField
                  settingKey="legal_capital"
                  label="Capital social"
                  description="Montant du capital social"
                  type="text"
                  defaultValue={getValue("legal_capital", "")}
                  placeholder="Ex: 10 000 €"
                  onSave={handleSettingChange}
                />

                <SettingField
                  settingKey="legal_siret"
                  label="Numéro SIRET"
                  description="14 chiffres"
                  type="text"
                  defaultValue={getValue("legal_siret", "")}
                  placeholder="Ex: 123 456 789 00012"
                  onSave={handleSettingChange}
                />
              </div>

              <SettingField
                settingKey="legal_address"
                label="Adresse du siège social"
                description="Adresse complète du siège"
                type="textarea"
                defaultValue={getValue("legal_address", "")}
                placeholder="Adresse complète"
                onSave={handleSettingChange}
              />

              <div className="border-t border-white/[0.06] pt-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ar-silver">
                  Hébergeur du site
                </h3>

                <div className="grid gap-6 md:grid-cols-2">
                  <SettingField
                    settingKey="legal_host_name"
                    label="Hébergeur — Nom"
                    description="Nom de l'hébergeur"
                    type="text"
                    defaultValue={getValue("legal_host_name", "Vercel Inc.")}
                    placeholder="Vercel Inc."
                    onSave={handleSettingChange}
                  />

                  <SettingField
                    settingKey="legal_host_address"
                    label="Hébergeur — Adresse"
                    description="Adresse complète de l'hébergeur"
                    type="text"
                    defaultValue={getValue("legal_host_address", "440 N Barranca Ave #4133, Covina, CA 91723, USA")}
                    placeholder="440 N Barranca Ave #4133, Covina, CA 91723, USA"
                    onSave={handleSettingChange}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <SaveButton
                  onClick={() =>
                    handleSaveTab([
                      "legal_entity_name",
                      "legal_form",
                      "legal_capital",
                      "legal_siret",
                      "legal_address",
                      "legal_host_name",
                      "legal_host_address",
                    ])
                  }
                  isLoading={isSaving}
                />
              </div>
            </div>
          )}

          {/* TAB 5: PARAMÈTRES AFFICHAGE */}
          {activeTab === "display" && (
            <div className="space-y-6">
              <div className="mb-6 flex items-center gap-3">
                <Eye className="h-5 w-5 text-ar-gold" />
                <h2 className="font-display text-xl font-semibold text-white">
                  Paramètres d&apos;Affichage
                </h2>
              </div>

              <SettingField
                settingKey="vehicles_per_page"
                label="Véhicules par page"
                description="Nombre de véhicules affichés par page dans le catalogue"
                type="select"
                options={[
                  { value: "12", label: "12 véhicules" },
                  { value: "24", label: "24 véhicules" },
                  { value: "48", label: "48 véhicules" },
                ]}
                defaultValue={getValue("vehicles_per_page", "12")}
                onSave={handleSettingChange}
              />

              <SettingField
                settingKey="show_view_count"
                label="Afficher le compteur de vues"
                description="Affiche le nombre de vues sur les fiches véhicules"
                type="toggle"
                defaultValue={getValue("show_view_count", "true")}
                onSave={handleSettingChange}
              />

              <SettingField
                settingKey="default_sort"
                label="Tri par défaut"
                description="Ordre de tri par défaut dans le catalogue"
                type="select"
                options={[
                  { value: "newest", label: "Plus récent d'abord" },
                  { value: "price_asc", label: "Prix croissant" },
                  { value: "price_desc", label: "Prix décroissant" },
                  { value: "year_desc", label: "Année récente" },
                ]}
                defaultValue={getValue("default_sort", "newest")}
                onSave={handleSettingChange}
              />

              <SettingField
                settingKey="admin_welcome_message"
                label="Message d'accueil admin"
                description="Message affiché sur le tableau de bord admin"
                type="textarea"
                defaultValue={getValue("admin_welcome_message", "Bienvenue dans l'administration Auto Roi.")}
                placeholder="Bienvenue..."
                onSave={handleSettingChange}
              />

              <div className="flex justify-end pt-4">
                <SaveButton
                  onClick={() =>
                    handleSaveTab([
                      "vehicles_per_page",
                      "show_view_count",
                      "default_sort",
                      "admin_welcome_message",
                    ])
                  }
                  isLoading={isSaving}
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
