// =============================================================================
// Génération de contrat de VENTE PDF — 4 pages premium AUTO ROI
// Lib : @react-pdf/renderer
// =============================================================================

import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer"
import path from "path"
import fs from "fs"
import { createAdminClient } from "@/lib/supabase/server"
import { getSiteSettings, type SiteSettings } from "@/lib/site-settings"
import { SITE_NAME, EMAIL, PHONE_NUMBER } from "@/lib/constants"
import type { VehicleWithAll, VehiclePhoto, VehicleFeature } from "@/types/vehicle"
import type {
  FuelType,
  TransmissionType,
  BodyType,
  ConditionType,
  CtStatus,
  DriveType,
} from "@/types/database"

// ─── Couleurs ────────────────────────────────────────────────────────────────

const GOLD = "#C9A84C"
const DARK = "#1a1a1a"
const GRAY = "#555555"
const LIGHT_GRAY = "#f8f8f8"
const BORDER_COLOR = "#e0e0e0"
const WHITE = "#FFFFFF"

// ─── Labels FR ───────────────────────────────────────────────────────────────

const FUEL_LABELS: Record<string, string> = {
  essence: "Essence",
  diesel: "Diesel",
  hybride: "Hybride",
  electrique: "Électrique",
  gpl: "GPL",
  autre: "Autre",
}

const TRANSMISSION_LABELS: Record<string, string> = {
  manuelle: "Manuelle",
  automatique: "Automatique",
  "semi-automatique": "Semi-automatique",
}

const BODY_LABELS: Record<string, string> = {
  berline: "Berline",
  suv: "SUV / 4x4",
  break: "Break",
  coupe: "Coupé",
  cabriolet: "Cabriolet",
  monospace: "Monospace",
  pickup: "Pick-up",
  utilitaire: "Utilitaire",
  moto: "Moto",
  autre: "Autre",
}

const CONDITION_LABELS: Record<string, string> = {
  excellent: "Excellent état",
  bon: "Bon état",
  passable: "État passable",
  pieces: "Pour pièces",
}

const CT_LABELS: Record<string, string> = {
  valide: "Valide",
  a_passer: "À passer",
  non_requis: "Non requis",
}

const DRIVE_LABELS: Record<string, string> = {
  "2RM": "2 roues motrices",
  "4RM": "4 roues motrices",
  integral: "Intégral",
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // ── Pages ──
  pageCover: {
    fontFamily: "Helvetica",
    backgroundColor: DARK,
    paddingHorizontal: 50,
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: DARK,
    paddingTop: 36,
    paddingBottom: 52,
    paddingHorizontal: 40,
    backgroundColor: WHITE,
  },
  // ── Cover elements ──
  coverGoldLine: {
    width: "100%",
    height: 2,
    backgroundColor: GOLD,
    marginVertical: 20,
  },
  coverTitle: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
    textAlign: "center",
    letterSpacing: 3,
    marginTop: 30,
  },
  coverSubtitle: {
    fontSize: 12,
    color: GOLD,
    textAlign: "center",
    letterSpacing: 2,
    marginTop: 8,
  },
  coverRef: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
    textAlign: "center",
    marginTop: 30,
    letterSpacing: 1,
  },
  coverDate: {
    fontSize: 10,
    color: "#999999",
    textAlign: "center",
    marginTop: 8,
  },
  coverVehicle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
    textAlign: "center",
    marginTop: 30,
  },
  coverLogo: {
    width: 140,
    height: 70,
    objectFit: "contain",
    marginBottom: 10,
  },
  // ── Watermark logo ──
  watermark: {
    position: "absolute",
    top: "35%",
    left: "25%",
    width: 300,
    height: 150,
    opacity: 0.04,
  },
  // ── Header / Footer ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: GOLD,
  },
  headerLogo: {
    width: 60,
    height: 30,
    objectFit: "contain",
  },
  headerTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    textAlign: "right",
  },
  headerSub: {
    fontSize: 7,
    color: GRAY,
    textAlign: "right",
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: "#999999",
  },
  footerGold: {
    fontSize: 7,
    color: GOLD,
  },
  // ── Section ──
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: GOLD,
  },
  section: {
    marginBottom: 14,
  },
  // ── Two column party boxes ──
  twoCol: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  partyBox: {
    flex: 1,
    padding: 10,
    backgroundColor: LIGHT_GRAY,
    borderRadius: 3,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
  },
  partyTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  partyRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  partyLabel: {
    fontSize: 8,
    color: GRAY,
    width: 70,
  },
  partyValue: {
    fontSize: 8,
    color: DARK,
    flex: 1,
    fontFamily: "Helvetica-Bold",
  },
  // ── Tables ──
  table: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: DARK,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
  },
  tableRowAlt: {
    backgroundColor: LIGHT_GRAY,
  },
  tableCell: {
    fontSize: 8,
    color: DARK,
    flex: 1,
  },
  tableCellBold: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    flex: 1,
  },
  tableCellGold: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
    flex: 1,
  },
  // ── Photo ──
  mainPhoto: {
    width: "100%",
    height: 200,
    objectFit: "cover",
    borderRadius: 4,
    marginBottom: 10,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  photoThumb: {
    width: "48%",
    height: 120,
    objectFit: "cover",
    borderRadius: 3,
  },
  // ── Specs grid ──
  specGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 0,
  },
  specItem: {
    width: "50%",
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  specLabel: {
    fontSize: 8,
    color: GRAY,
    width: 100,
  },
  specValue: {
    fontSize: 8,
    color: DARK,
    fontFamily: "Helvetica-Bold",
    flex: 1,
  },
  // ── Features ──
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 6,
  },
  featureBadge: {
    fontSize: 7,
    color: DARK,
    backgroundColor: LIGHT_GRAY,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  // ── Price box ──
  priceBox: {
    backgroundColor: DARK,
    borderRadius: 4,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  priceLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
  },
  priceValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
  },
  priceWords: {
    fontSize: 8,
    color: "#cccccc",
    marginTop: 2,
  },
  // ── Empty field line ──
  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 6,
    paddingVertical: 2,
  },
  fieldLabel: {
    fontSize: 8,
    color: GRAY,
    width: 120,
  },
  fieldLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    minHeight: 12,
    paddingBottom: 1,
  },
  fieldValue: {
    fontSize: 8,
    color: DARK,
    fontFamily: "Helvetica-Bold",
  },
  // ── Signatures ──
  signatureRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 12,
  },
  signatureBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 3,
    padding: 10,
    minHeight: 90,
  },
  signatureTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: GRAY,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  signatureLine: {
    marginTop: 45,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    paddingTop: 4,
  },
  signatureLineText: {
    fontSize: 7,
    color: GRAY,
  },
  // ── Conditions ──
  conditionItem: {
    flexDirection: "row",
    marginBottom: 3,
    alignItems: "flex-start",
  },
  conditionBullet: {
    fontSize: 8,
    color: GOLD,
    marginRight: 5,
    marginTop: 1,
  },
  conditionText: {
    fontSize: 8,
    color: DARK,
    flex: 1,
    lineHeight: 1.4,
  },
  legalText: {
    fontSize: 6.5,
    color: GRAY,
    lineHeight: 1.5,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
  },
  // ── Recap box (page 4) ──
  recapBox: {
    backgroundColor: LIGHT_GRAY,
    borderRadius: 4,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
  },
  recapTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  recapRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  recapLabel: {
    fontSize: 8,
    color: GRAY,
    width: 100,
  },
  recapValue: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    flex: 1,
  },
})

// ─── Formatage ───────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso))
}

function formatEur(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount)
}

/** Convertit un nombre en lettres (simplifié, jusqu'à 999 999) */
function numberToWords(n: number): string {
  const units = [
    "", "un", "deux", "trois", "quatre", "cinq", "six", "sept",
    "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze",
    "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf",
  ]
  const tens = [
    "", "", "vingt", "trente", "quarante", "cinquante",
    "soixante", "soixante", "quatre-vingt", "quatre-vingt",
  ]

  if (n === 0) return "zéro"

  const convert = (num: number): string => {
    if (num < 20) return units[num]
    if (num < 100) {
      const t = Math.floor(num / 10)
      const u = num % 10
      // Gestion 70-79, 90-99
      if (t === 7 || t === 9) {
        return tens[t] + (u + 10 === 11 ? " et " : "-") + units[u + 10]
      }
      if (u === 0) return tens[t] + (t === 8 ? "s" : "")
      if (u === 1 && t !== 8) return tens[t] + " et un"
      return tens[t] + "-" + units[u]
    }
    if (num < 1000) {
      const h = Math.floor(num / 100)
      const rest = num % 100
      const prefix = h === 1 ? "cent" : units[h] + " cent"
      if (rest === 0) return prefix + (h > 1 ? "s" : "")
      return prefix + " " + convert(rest)
    }
    if (num < 1000000) {
      const th = Math.floor(num / 1000)
      const rest = num % 1000
      const prefix = th === 1 ? "mille" : convert(th) + " mille"
      if (rest === 0) return prefix
      return prefix + " " + convert(rest)
    }
    return String(num)
  }

  const euros = Math.floor(n)
  const cents = Math.round((n - euros) * 100)
  let result = convert(euros) + " euro" + (euros > 1 ? "s" : "")
  if (cents > 0) {
    result += " et " + convert(cents) + " centime" + (cents > 1 ? "s" : "")
  }
  return result.charAt(0).toUpperCase() + result.slice(1)
}

/** Génère un numéro de contrat : CVT-2026-XXXX */
function generateContractNumber(): string {
  const year = new Date().getFullYear()
  const rand = String(Math.floor(1000 + Math.random() * 9000))
  return `CVT-${year}-${rand}`
}

// ─── Composant PDF ───────────────────────────────────────────────────────────

interface SaleContractProps {
  vehicle: VehicleWithAll
  logoBase64: string | null
  settings: SiteSettings
  contractNumber: string
  generatedAt: Date
  photoUrls: string[] // URLs publiques des photos
}

function SaleContractDocument({
  vehicle,
  logoBase64,
  settings,
  contractNumber,
  generatedAt,
  photoUrls,
}: SaleContractProps) {
  const v = vehicle
  const companyName = settings.business_name || SITE_NAME
  const companyEmail = settings.contact_email || EMAIL
  const companyPhone = settings.phone_number || PHONE_NUMBER
  const companySiret = settings.legal_siret || "—"
  const companyAddress = settings.legal_address || settings.business_address || "—"
  const companyForm = settings.legal_form || "—"
  const companyCapital = settings.legal_capital || "—"
  const companyEntity = settings.legal_entity_name || companyName

  const vehicleName = `${v.brand} ${v.model}${v.version ? ` ${v.version}` : ""} — ${v.year}`
  const priceWords = numberToWords(v.price)
  const dateStr = formatDate(generatedAt.toISOString())

  const coverPhoto = photoUrls[0] || null
  const otherPhotos = photoUrls.slice(1, 5) // max 4 thumbnails

  // Organize features by category
  const featuresByCategory: Record<string, string[]> = {}
  for (const f of v.vehicle_features ?? []) {
    const cat = f.category || "Autre"
    if (!featuresByCategory[cat]) featuresByCategory[cat] = []
    featuresByCategory[cat].push(f.feature)
  }

  // Page header for inner pages
  const PageHeader = ({ title }: { title: string }) => (
    <View style={s.header}>
      {logoBase64 ? (
        <Image src={logoBase64} style={s.headerLogo} />
      ) : (
        <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: GOLD }}>
          {companyName}
        </Text>
      )}
      <View>
        <Text style={s.headerTitle}>{title}</Text>
        <Text style={s.headerSub}>{contractNumber}</Text>
      </View>
    </View>
  )

  // Footer for all inner pages
  const PageFooter = ({ pageNum, totalPages }: { pageNum: number; totalPages: number }) => (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>
        {companyEntity} — SIRET {companySiret}
      </Text>
      <Text style={s.footerGold}>{contractNumber}</Text>
      <Text style={s.footerText}>Page {pageNum}/{totalPages}</Text>
    </View>
  )

  // Spec row helper
  const SpecRow = ({ label, value }: { label: string; value: string | number | null | undefined }) => {
    if (!value && value !== 0) return null
    return (
      <View style={s.specItem}>
        <Text style={s.specLabel}>{label}</Text>
        <Text style={s.specValue}>{String(value)}</Text>
      </View>
    )
  }

  // Field row (pre-filled or empty line)
  const FieldRow = ({ label, value }: { label: string; value?: string | null }) => (
    <View style={s.fieldRow}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={s.fieldLine}>
        {value ? <Text style={s.fieldValue}>{value}</Text> : null}
      </View>
    </View>
  )

  return (
    <Document
      title={`Contrat de vente — ${v.brand} ${v.model}`}
      author={companyName}
      subject="Contrat de vente de véhicule"
      creator={companyName}
    >
      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* PAGE 1 — COUVERTURE                                              */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.pageCover}>
        {/* Logo */}
        {logoBase64 ? (
          <Image src={logoBase64} style={s.coverLogo} />
        ) : (
          <Text style={{ fontSize: 28, fontFamily: "Helvetica-Bold", color: GOLD, marginBottom: 10 }}>
            {companyName}
          </Text>
        )}

        {/* Gold separator */}
        <View style={s.coverGoldLine} />

        {/* Title */}
        <Text style={s.coverTitle}>CONTRAT DE VENTE</Text>
        <Text style={s.coverSubtitle}>DE VÉHICULE</Text>

        {/* Contract number */}
        <Text style={s.coverRef}>{contractNumber}</Text>
        <Text style={s.coverDate}>{dateStr}</Text>

        {/* Gold separator */}
        <View style={[s.coverGoldLine, { marginTop: 30 }]} />

        {/* Vehicle name */}
        <Text style={s.coverVehicle}>{vehicleName}</Text>

        {/* Price */}
        <Text style={{ fontSize: 22, fontFamily: "Helvetica-Bold", color: GOLD, textAlign: "center", marginTop: 14 }}>
          {formatEur(v.price)}
        </Text>

        {/* Bottom gold line */}
        <View style={[s.coverGoldLine, { marginTop: "auto" }]} />
        <Text style={{ fontSize: 8, color: "#666666", textAlign: "center" }}>
          {companyEntity} — {companyAddress}
        </Text>
        <Text style={{ fontSize: 7, color: "#555555", textAlign: "center", marginTop: 3 }}>
          SIRET : {companySiret} — {companyPhone} — {companyEmail}
        </Text>
      </Page>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* PAGE 2 — FICHE VÉHICULE COMPLÈTE                                 */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>
        {logoBase64 && <Image src={logoBase64} style={s.watermark} />}
        <PageHeader title="FICHE VÉHICULE" />
        <PageFooter pageNum={2} totalPages={4} />

        {/* Cover photo */}
        {coverPhoto && (
          <Image src={coverPhoto} style={s.mainPhoto} />
        )}

        {/* Photo gallery */}
        {otherPhotos.length > 0 && (
          <View style={s.photoGrid}>
            {otherPhotos.map((url, i) => (
              <Image key={i} src={url} style={s.photoThumb} />
            ))}
          </View>
        )}

        {/* Vehicle specs table */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Caractéristiques techniques</Text>
          <View style={[s.specGrid, { backgroundColor: LIGHT_GRAY, borderRadius: 3, borderWidth: 1, borderColor: BORDER_COLOR }]}>
            <SpecRow label="Marque" value={v.brand} />
            <SpecRow label="Modèle" value={v.model} />
            <SpecRow label="Version" value={v.version} />
            <SpecRow label="Année" value={v.year} />
            <SpecRow label="Kilométrage" value={v.mileage ? `${v.mileage.toLocaleString("fr-FR")} km` : null} />
            <SpecRow label="Carburant" value={v.fuel ? FUEL_LABELS[v.fuel] || v.fuel : null} />
            <SpecRow label="Boîte" value={v.transmission ? TRANSMISSION_LABELS[v.transmission] || v.transmission : null} />
            <SpecRow label="Carrosserie" value={v.body ? BODY_LABELS[v.body] || v.body : null} />
            <SpecRow label="Couleur ext." value={v.color_ext} />
            <SpecRow label="Couleur int." value={v.color_int} />
            <SpecRow label="Puissance" value={v.power_hp ? `${v.power_hp} ch${v.power_kw ? ` (${v.power_kw} kW)` : ""}` : null} />
            <SpecRow label="Cylindrée" value={v.engine_size ? `${v.engine_size} cm³` : null} />
            <SpecRow label="Transmission" value={v.drive ? DRIVE_LABELS[v.drive] || v.drive : null} />
            <SpecRow label="Portes" value={v.doors} />
            <SpecRow label="Places" value={v.seats} />
            <SpecRow label="CT" value={v.ct_status ? CT_LABELS[v.ct_status] || v.ct_status : null} />
            {v.ct_date && <SpecRow label="Date CT" value={formatDate(v.ct_date)} />}
            <SpecRow label="1ère mise en circ." value={v.first_sale_date ? formatDate(v.first_sale_date) : null} />
            <SpecRow label="État général" value={v.condition ? CONDITION_LABELS[v.condition] || v.condition : null} />
          </View>
        </View>

        {/* Features / Equipment */}
        {Object.keys(featuresByCategory).length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Équipements et options</Text>
            {Object.entries(featuresByCategory).map(([category, features]) => (
              <View key={category} style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: GRAY, textTransform: "uppercase", marginBottom: 3 }}>
                  {category}
                </Text>
                <View style={s.featureGrid}>
                  {features.map((feat, i) => (
                    <Text key={i} style={s.featureBadge}>{feat}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Description / observations */}
        {v.description_fr && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Observations</Text>
            <Text style={{ fontSize: 8, color: DARK, lineHeight: 1.5 }}>
              {v.description_fr}
            </Text>
          </View>
        )}
      </Page>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* PAGE 3 — CONDITIONS DE VENTE                                     */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>
        {logoBase64 && <Image src={logoBase64} style={s.watermark} />}
        <PageHeader title="CONDITIONS DE VENTE" />
        <PageFooter pageNum={3} totalPages={4} />

        {/* Seller & Buyer */}
        <View style={s.twoCol}>
          {/* VENDEUR */}
          <View style={s.partyBox}>
            <Text style={s.partyTitle}>Le Vendeur</Text>
            <View style={s.partyRow}>
              <Text style={s.partyLabel}>Société</Text>
              <Text style={s.partyValue}>{companyEntity}</Text>
            </View>
            <View style={s.partyRow}>
              <Text style={s.partyLabel}>Forme</Text>
              <Text style={s.partyValue}>{companyForm}</Text>
            </View>
            <View style={s.partyRow}>
              <Text style={s.partyLabel}>Capital</Text>
              <Text style={s.partyValue}>{companyCapital}</Text>
            </View>
            <View style={s.partyRow}>
              <Text style={s.partyLabel}>SIRET</Text>
              <Text style={s.partyValue}>{companySiret}</Text>
            </View>
            <View style={s.partyRow}>
              <Text style={s.partyLabel}>Adresse</Text>
              <Text style={s.partyValue}>{companyAddress}</Text>
            </View>
            <View style={s.partyRow}>
              <Text style={s.partyLabel}>Tél.</Text>
              <Text style={s.partyValue}>{companyPhone}</Text>
            </View>
            <View style={s.partyRow}>
              <Text style={s.partyLabel}>Email</Text>
              <Text style={s.partyValue}>{companyEmail}</Text>
            </View>
          </View>

          {/* ACHETEUR — champs vides élégants */}
          <View style={s.partyBox}>
            <Text style={s.partyTitle}>L&apos;Acheteur</Text>
            <FieldRow label="Nom" />
            <FieldRow label="Prénom" />
            <FieldRow label="Adresse" />
            <FieldRow label="Code postal" />
            <FieldRow label="Ville" />
            <FieldRow label="Téléphone" />
            <FieldRow label="Email" />
            <FieldRow label="Type" value="☐ Particulier   ☐ Professionnel" />
          </View>
        </View>

        {/* TRANSACTION */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Transaction</Text>
          <View style={s.priceBox}>
            <View>
              <Text style={s.priceLabel}>PRIX DE VENTE TTC</Text>
              <Text style={s.priceWords}>{priceWords}</Text>
            </View>
            <Text style={s.priceValue}>{formatEur(v.price)}</Text>
          </View>
          <FieldRow label="Modalité de paiement" value="☐ Virement   ☐ Chèque   ☐ Espèces   ☐ Autre : ___________" />
          <FieldRow label="Date de vente" />
          <FieldRow label="Date de livraison" />
        </View>

        {/* CLAUSES */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Clauses contractuelles</Text>
          {[
            `Le véhicule ${v.brand} ${v.model} (${v.year}), kilométrage ${v.mileage?.toLocaleString("fr-FR") ?? "—"} km, est vendu en l'état, tel que vu et essayé par l'acheteur le jour de la vente. L'acheteur déclare avoir pris connaissance de l'état du véhicule et l'accepter sans réserve.`,
            "Conformément aux articles 1641 à 1649 du Code civil, le vendeur est tenu de la garantie légale des vices cachés. Si un vice caché rendant le véhicule impropre à l'usage auquel il est destiné est constaté, l'acheteur pourra demander la résolution de la vente ou une réduction du prix.",
            v.ct_status === "valide"
              ? `Le contrôle technique en cours de validité est remis à l'acheteur avec le véhicule (date : ${v.ct_date ? formatDate(v.ct_date) : "voir document"}).`
              : "Le contrôle technique sera établi conformément à la réglementation en vigueur avant la cession.",
            "Le transfert de propriété prend effet à la date de signature du présent contrat. Les risques sont transférés à l'acheteur dès la remise effective du véhicule.",
            "Les frais de carte grise (certificat d'immatriculation) sont à la charge de l'acheteur. Le vendeur s'engage à fournir l'ensemble des documents nécessaires au changement de titulaire.",
            "En cas de litige relatif au présent contrat, les parties s'engagent à rechercher une solution amiable avant toute action judiciaire. À défaut, les tribunaux compétents du ressort du siège social du vendeur seront seuls compétents.",
          ].map((text, i) => (
            <View key={i} style={s.conditionItem}>
              <Text style={s.conditionBullet}>▸</Text>
              <Text style={s.conditionText}>{text}</Text>
            </View>
          ))}
        </View>

        {/* CGV petit texte */}
        <Text style={s.legalText}>
          Le présent contrat est soumis au droit français. Il annule et remplace tout accord verbal ou écrit antérieur
          entre les parties relatif à la vente du véhicule désigné ci-dessus. Toute modification du présent contrat
          devra faire l'objet d'un avenant écrit signé par les deux parties. Le vendeur professionnel est tenu au
          respect des dispositions du Code de la consommation relatives à l'information précontractuelle, au droit de
          rétractation (si applicable), et à la garantie légale de conformité (articles L.217-4 à L.217-14 du Code de la
          consommation).
        </Text>
      </Page>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* PAGE 4 — SIGNATURES                                              */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>
        {logoBase64 && <Image src={logoBase64} style={s.watermark} />}
        <PageHeader title="SIGNATURES" />
        <PageFooter pageNum={4} totalPages={4} />

        {/* Recap */}
        <View style={s.recapBox}>
          <Text style={s.recapTitle}>Récapitulatif</Text>
          <View style={s.recapRow}>
            <Text style={s.recapLabel}>Véhicule</Text>
            <Text style={s.recapValue}>{vehicleName}</Text>
          </View>
          <View style={s.recapRow}>
            <Text style={s.recapLabel}>Kilométrage</Text>
            <Text style={s.recapValue}>{v.mileage?.toLocaleString("fr-FR") ?? "—"} km</Text>
          </View>
          <View style={s.recapRow}>
            <Text style={s.recapLabel}>Prix TTC</Text>
            <Text style={[s.recapValue, { color: GOLD }]}>{formatEur(v.price)}</Text>
          </View>
          <View style={s.recapRow}>
            <Text style={s.recapLabel}>En lettres</Text>
            <Text style={s.recapValue}>{priceWords}</Text>
          </View>
          <View style={s.recapRow}>
            <Text style={s.recapLabel}>Vendeur</Text>
            <Text style={s.recapValue}>{companyEntity}</Text>
          </View>
          <View style={s.recapRow}>
            <Text style={s.recapLabel}>Contrat n°</Text>
            <Text style={[s.recapValue, { color: GOLD }]}>{contractNumber}</Text>
          </View>
        </View>

        {/* Mention engagement */}
        <View style={{ backgroundColor: "#FFF8E8", padding: 10, borderRadius: 3, borderLeftWidth: 3, borderLeftColor: GOLD, marginBottom: 14 }}>
          <Text style={{ fontSize: 8, color: DARK, lineHeight: 1.5 }}>
            Les soussignés déclarent avoir pris connaissance de l'ensemble des conditions de vente figurant dans
            le présent contrat et les acceptent sans réserve. Le vendeur certifie être propriétaire du véhicule
            désigné et qu'il est libre de tout gage. L'acheteur reconnaît avoir examiné le véhicule et en accepter
            l'état.
          </Text>
        </View>

        {/* Signatures */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Signatures des parties</Text>
          <View style={s.signatureRow}>
            {/* Vendeur */}
            <View style={s.signatureBox}>
              <Text style={s.signatureTitle}>Le Vendeur</Text>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 2 }}>
                {companyEntity}
              </Text>
              <Text style={{ fontSize: 7, color: GRAY }}>
                Représenté par : ___________________________
              </Text>
              <View style={s.signatureLine}>
                <Text style={s.signatureLineText}>Signature + cachet :</Text>
              </View>
            </View>

            {/* Acheteur */}
            <View style={s.signatureBox}>
              <Text style={s.signatureTitle}>L&apos;Acheteur</Text>
              <Text style={{ fontSize: 7, color: GRAY, marginBottom: 2 }}>
                Précédé de la mention manuscrite :
              </Text>
              <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 2 }}>
                &quot;Lu et approuvé, bon pour achat&quot;
              </Text>
              <View style={s.signatureLine}>
                <Text style={s.signatureLineText}>Signature :</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Date & Lieu */}
        <View style={{ flexDirection: "row", gap: 20, marginTop: 10, marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <FieldRow label="Fait à" />
          </View>
          <View style={{ flex: 1 }}>
            <FieldRow label="Le" />
          </View>
        </View>
        <Text style={{ fontSize: 7, color: GRAY, textAlign: "center" }}>
          En deux exemplaires originaux, un pour chaque partie.
        </Text>

        {/* Footer mentions légales */}
        <View style={{ marginTop: "auto", paddingTop: 12, borderTopWidth: 1, borderTopColor: GOLD }}>
          <Text style={{ fontSize: 7, color: GRAY, textAlign: "center", lineHeight: 1.5 }}>
            {companyEntity} — {companyForm}{companyCapital ? ` au capital de ${companyCapital}` : ""}
            {"\n"}Siège social : {companyAddress} — SIRET : {companySiret}
            {"\n"}{companyPhone} — {companyEmail}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// =============================================================================
// FONCTION PRINCIPALE
// =============================================================================

export async function generateSaleContract(vehicleId: string) {
  const supabase = createAdminClient()

  // 1. Charger le véhicule avec photos et features
  const { data: vehicleData, error: fetchError } = await supabase
    .from("vehicles")
    .select("*, vehicle_photos(*), vehicle_features(*)")
    .eq("id", vehicleId)
    .single()

  if (fetchError || !vehicleData) {
    throw new Error(`generateSaleContract : véhicule ${vehicleId} introuvable`)
  }

  const vehicle = vehicleData as unknown as VehicleWithAll

  // 2. Charger les paramètres du site
  const settings = await getSiteSettings()

  // 3. Charger le logo en base64
  let logoBase64: string | null = null
  try {
    const logoPath = path.join(process.cwd(), "public", "logo1.png")
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath)
      logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`
    }
  } catch {
    console.warn("generateSaleContract : logo introuvable")
  }

  // 4. Récupérer les URLs des photos (triées, cover en premier)
  const photos = (vehicle.vehicle_photos ?? []).sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return a.sort_order - b.sort_order
  })

  // Générer des URLs signées pour les photos
  const photoUrls: string[] = []
  for (const photo of photos.slice(0, 5)) {
    if (photo.url) {
      photoUrls.push(photo.url)
    }
  }

  // 5. Générer le PDF
  const contractNumber = generateContractNumber()
  const generatedAt = new Date()

  const pdfBuffer = await renderToBuffer(
    <SaleContractDocument
      vehicle={vehicle}
      logoBase64={logoBase64}
      settings={settings}
      contractNumber={contractNumber}
      generatedAt={generatedAt}
      photoUrls={photoUrls}
    />
  )

  return pdfBuffer
}
