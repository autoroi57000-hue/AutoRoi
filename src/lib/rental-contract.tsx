// =============================================================================
// Génération de contrat de location PDF
// Lib : @react-pdf/renderer (npm install @react-pdf/renderer)
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
  Font,
} from "@react-pdf/renderer"
import path from "path"
import fs from "fs"
import { createAdminClient } from "@/lib/supabase/server"
import { sendRentalEmail } from "@/lib/rental-emails"
import { getSiteSettings, type SiteSettings } from "@/lib/site-settings"
import { SITE_NAME, EMAIL, PHONE_NUMBER } from "@/lib/constants"
import type { Rental } from "@/types/rental"

// Helvetica est embarquée nativement dans react-pdf, pas besoin de Font.register

// ─── Styles ──────────────────────────────────────────────────────────────────

const GOLD = "#C9A84C"
const DARK = "#1a1a1a"
const GRAY = "#555555"
const LIGHT_GRAY = "#f8f8f8"
const BORDER_COLOR = "#e0e0e0"

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: DARK,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    backgroundColor: "#FFFFFF",
  },
  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 18,
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
    color: "#999",
  },
  footerGold: {
    fontSize: 7,
    color: GOLD,
  },
  // ── Header ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: GOLD,
  },
  logo: {
    width: 80,
    height: 40,
    objectFit: "contain",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    textAlign: "right",
  },
  headerSub: {
    fontSize: 8,
    color: GRAY,
    textAlign: "right",
    marginTop: 2,
  },
  // ── Référence ──
  refRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: LIGHT_GRAY,
    padding: 8,
    borderRadius: 3,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
  },
  refLabel: {
    fontSize: 7,
    color: GRAY,
    textTransform: "uppercase",
  },
  refValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
    marginTop: 2,
  },
  refDate: {
    fontSize: 8,
    color: GRAY,
  },
  // ── Section title ──
  sectionTitle: {
    fontSize: 8,
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
  // ── Blocs loueur / locataire ──
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
    width: 60,
  },
  partyValue: {
    fontSize: 8,
    color: DARK,
    flex: 1,
    fontFamily: "Helvetica-Bold",
  },
  // ── Tableaux ──
  table: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 14,
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
    color: "#FFFFFF",
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
  // ── Prix totaux ──
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: DARK,
  },
  totalLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
  },
  totalValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
  },
  // ── Conditions ──
  conditionItem: {
    flexDirection: "row",
    marginBottom: 4,
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
  // ── Signatures ──
  signatureRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 16,
  },
  signatureBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 3,
    padding: 10,
    minHeight: 80,
  },
  signatureTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: GRAY,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  signatureLine: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    paddingTop: 4,
  },
  signatureLineText: {
    fontSize: 7,
    color: GRAY,
  },
  electronicNote: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#FFF8E8",
    borderRadius: 3,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
  },
  electronicNoteText: {
    fontSize: 7,
    color: GRAY,
    lineHeight: 1.5,
  },
  // ── Utilitaires ──
  fieldFill: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    minWidth: 60,
    paddingBottom: 1,
    marginLeft: 2,
    flex: 1,
  },
})

// ─── Formatage ────────────────────────────────────────────────────────────────

function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "—"
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate))
}

function formatDateTime(isoDate: string | null | undefined): string {
  if (!isoDate) return "—"
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate))
}

function formatEur(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount)
}

// ─── Composant PDF ────────────────────────────────────────────────────────────

interface ContractDocumentProps {
  rental: Rental
  logoBase64: string | null
  generatedAt: Date
  settings: SiteSettings
}

function ContractDocument({ rental, logoBase64, generatedAt, settings }: ContractDocumentProps) {
  const v = rental.rental_vehicle
  const options = rental.selected_options ?? []
  const clientName = `${rental.client_first_name} ${rental.client_last_name}`

  // Use real site settings
  const companyName = settings.business_name || SITE_NAME
  const companyEmail = settings.contact_email || EMAIL
  const companyPhone = settings.phone_number || PHONE_NUMBER
  const companySiret = settings.legal_siret || "—"
  const companyAddress = settings.legal_address || settings.business_address || "—"

  const pageProps = {
    size: "A4" as const,
    style: styles.page,
  }

  const FooterComponent = ({ pageNumber }: { pageNumber: number }) => (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        {companyName} — {companyEmail} — {companyPhone}
      </Text>
      <Text style={styles.footerGold}>{rental.reference}</Text>
      <Text style={styles.footerText}>Page {pageNumber}/2</Text>
    </View>
  )

  return (
    <Document
      title={`Contrat de location ${rental.reference}`}
      author={companyName}
      subject="Contrat de location de véhicule"
      creator={companyName}
    >
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* PAGE 1 — EN-TÊTE, PARTIES, VÉHICULE, DATES                      */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <Page {...pageProps}>
        <FooterComponent pageNumber={1} />

        {/* ── En-tête ── */}
        <View style={styles.header}>
          {logoBase64 ? (
            <Image src={logoBase64} style={styles.logo} />
          ) : (
            <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold", color: GOLD }}>
              {companyName}
            </Text>
          )}
          <View>
            <Text style={styles.headerTitle}>CONTRAT DE LOCATION</Text>
            <Text style={styles.headerTitle}>DE VÉHICULE</Text>
            <Text style={styles.headerSub}>Document contractuel — conserver précieusement</Text>
          </View>
        </View>

        {/* ── Référence ── */}
        <View style={styles.refRow}>
          <View>
            <Text style={styles.refLabel}>Référence</Text>
            <Text style={styles.refValue}>{rental.reference}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.refLabel}>Date d&apos;émission</Text>
            <Text style={styles.refDate}>{formatDate(generatedAt.toISOString())}</Text>
          </View>
        </View>

        {/* ── Parties ── */}
        <View style={styles.twoCol}>
          {/* Loueur */}
          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>Le Loueur</Text>
            <View style={styles.partyRow}>
              <Text style={styles.partyLabel}>Société</Text>
              <Text style={styles.partyValue}>{companyName}</Text>
            </View>
            <View style={styles.partyRow}>
              <Text style={styles.partyLabel}>Adresse</Text>
              <Text style={styles.partyValue}>{companyAddress}</Text>
            </View>
            <View style={styles.partyRow}>
              <Text style={styles.partyLabel}>SIRET</Text>
              <Text style={styles.partyValue}>{companySiret}</Text>
            </View>
            <View style={styles.partyRow}>
              <Text style={styles.partyLabel}>Email</Text>
              <Text style={styles.partyValue}>{companyEmail}</Text>
            </View>
            <View style={styles.partyRow}>
              <Text style={styles.partyLabel}>Tél.</Text>
              <Text style={styles.partyValue}>{companyPhone}</Text>
            </View>
          </View>

          {/* Locataire */}
          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>Le Locataire</Text>
            <View style={styles.partyRow}>
              <Text style={styles.partyLabel}>Nom complet</Text>
              <Text style={styles.partyValue}>{clientName}</Text>
            </View>
            <View style={styles.partyRow}>
              <Text style={styles.partyLabel}>Email</Text>
              <Text style={styles.partyValue}>{rental.client_email}</Text>
            </View>
            <View style={styles.partyRow}>
              <Text style={styles.partyLabel}>Tél.</Text>
              <Text style={styles.partyValue}>{rental.client_phone}</Text>
            </View>
            {rental.client_address && (
              <View style={styles.partyRow}>
                <Text style={styles.partyLabel}>Adresse</Text>
                <Text style={styles.partyValue}>
                  {rental.client_address}
                  {rental.client_postal_code ? `, ${rental.client_postal_code}` : ""}
                  {rental.client_city ? ` ${rental.client_city}` : ""}
                </Text>
              </View>
            )}
            {rental.client_birth_date && (
              <View style={styles.partyRow}>
                <Text style={styles.partyLabel}>Né(e) le</Text>
                <Text style={styles.partyValue}>{formatDate(rental.client_birth_date)}</Text>
              </View>
            )}
            {rental.client_license_number && (
              <View style={styles.partyRow}>
                <Text style={styles.partyLabel}>N° permis</Text>
                <Text style={styles.partyValue}>{rental.client_license_number}</Text>
              </View>
            )}
            {rental.is_business && rental.business_name && (
              <View style={styles.partyRow}>
                <Text style={styles.partyLabel}>Société</Text>
                <Text style={styles.partyValue}>
                  {rental.business_name}
                  {rental.business_siret ? ` — SIRET : ${rental.business_siret}` : ""}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Véhicule ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Véhicule loué</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              {["Marque", "Modèle", "Année", "Couleur", "Carburant", "Boîte", "Places"].map((h) => (
                <Text key={h} style={styles.tableHeaderCell}>{h}</Text>
              ))}
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellBold}>{v?.brand ?? "—"}</Text>
              <Text style={styles.tableCell}>{v?.model ?? "—"}</Text>
              <Text style={styles.tableCell}>{v?.year ?? "—"}</Text>
              <Text style={styles.tableCell}>{v?.color ?? "—"}</Text>
              <Text style={styles.tableCell}>{v?.fuel ?? "—"}</Text>
              <Text style={styles.tableCell}>{v?.transmission ?? "—"}</Text>
              <Text style={styles.tableCell}>{v?.seats ?? "—"}</Text>
            </View>
          </View>

          {/* Kilométrage départ — à remplir à la main */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <Text style={{ fontSize: 8, color: GRAY, marginRight: 6 }}>
              Kilométrage au départ (à compléter lors de la remise) :
            </Text>
            <View style={styles.fieldFill} />
            <Text style={{ fontSize: 8, color: GRAY, marginLeft: 4 }}>km</Text>
          </View>
        </View>

        {/* ── Dates de location ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Période de location</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, { backgroundColor: LIGHT_GRAY }]}>
              <Text style={[styles.tableCellBold, { flex: 0.4 }]}>Prise en charge</Text>
              <Text style={styles.tableCell}>
                {formatDate(rental.start_date)} à {rental.pickup_time || "09:00"}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellBold, { flex: 0.4 }]}>Restitution prévue</Text>
              <Text style={styles.tableCell}>
                {formatDate(rental.end_date)} à {rental.return_time || "18:00"}
              </Text>
            </View>
            <View style={[styles.tableRow, { backgroundColor: LIGHT_GRAY }]}>
              <Text style={[styles.tableCellBold, { flex: 0.4 }]}>Durée</Text>
              <Text style={styles.tableCell}>
                {rental.total_days} jour{rental.total_days > 1 ? "s" : ""}
                {rental.total_hours ? ` (${rental.total_hours}h)` : ""}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellBold, { flex: 0.4 }]}>Lieu de remise</Text>
              <Text style={styles.tableCell}>Sur rendez-vous — contacter {companyName}</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* PAGE 2 — TARIFICATION, CONDITIONS, SIGNATURES                   */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <Page {...pageProps}>
        <FooterComponent pageNumber={2} />

        {/* ── Tarification ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détail de la tarification</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Désignation</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "right" }]}>Montant</Text>
            </View>

            {/* Base */}
            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {rental.total_days} jour{rental.total_days > 1 ? "s" : ""} × {formatEur(rental.base_price_per_day)}/jour
              </Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
                {formatEur(rental.subtotal)}
              </Text>
            </View>

            {/* Options */}
            {options.map((opt, i) => {
              const amount =
                opt.price_type === "per_day"
                  ? opt.price * rental.total_days * opt.quantity
                  : opt.price * opt.quantity
              return (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 3, color: GRAY }]}>
                    Option : {opt.name}{opt.quantity > 1 ? ` ×${opt.quantity}` : ""}
                    {opt.price_type === "per_day" ? ` (${formatEur(opt.price)}/j)` : ""}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
                    {formatEur(amount)}
                  </Text>
                </View>
              )
            })}

            {/* Supplément */}
            {rental.surcharge_total > 0 && (
              <View style={[styles.tableRow, styles.tableRowAlt]}>
                <Text style={[styles.tableCell, { flex: 3, color: GRAY }]}>Supplément week-end</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
                  {formatEur(rental.surcharge_total)}
                </Text>
              </View>
            )}

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>{formatEur(rental.total_amount)}</Text>
            </View>
          </View>

          {/* Acompte + solde */}
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={[styles.tableCellBold, { flex: 3 }]}>
                Acompte versé à la réservation
                {rental.stripe_payment_intent_id
                  ? ` (Réf. Stripe : ${rental.stripe_payment_intent_id})`
                  : ""}
              </Text>
              <Text style={[styles.tableCellGold, { flex: 1, textAlign: "right" }]}>
                − {formatEur(rental.deposit_amount)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellBold, { flex: 3 }]}>
                Solde à régler à la remise des clés
              </Text>
              <Text style={[styles.tableCellBold, { flex: 1, textAlign: "right" }]}>
                {formatEur(rental.total_amount - rental.deposit_amount)}
              </Text>
            </View>
            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={[styles.tableCell, { flex: 3, color: GRAY }]}>
                Caution (empreinte CB, non encaissée)
              </Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: "right", color: GRAY }]}>
                {formatEur(rental.deposit_amount)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Conditions ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conditions de location</Text>
          {[
            `Kilométrage inclus : ${v?.included_km_per_day ?? 200} km/jour. Tout kilomètre supplémentaire sera facturé ${v?.extra_km_price ?? "0.25"} €/km.`,
            "Carburant : le véhicule est remis avec un niveau de carburant défini lors de la prise en charge. Il devra être restitué avec le même niveau, sous peine de facturation du manquant au prix courant + 10 €.",
            "État du véhicule : tout dommage constaté au retour et non signalé à la remise sera facturé au locataire selon le barème en vigueur.",
            "En cas de sinistre : le locataire s'engage à contacter immédiatement le loueur, à ne pas déplacer le véhicule sans autorisation, et à remplir un constat amiable.",
            `Retard de restitution : tout dépassement de l'heure de restitution prévue (${rental.return_time || "18:00"}) sera facturé ${v?.price_per_hour ? formatEur(v.price_per_hour) : "—"} par heure entamée.`,
            "Annulation : toute annulation moins de 48h avant le départ entraîne la conservation de l'acompte. Au-delà, remboursement intégral sous 10 jours ouvrés.",
            "Le locataire certifie être titulaire d'un permis de conduire valide et être couvert par une assurance personnelle couvrant l'usage d'un véhicule de location.",
          ].map((text, i) => (
            <View key={i} style={styles.conditionItem}>
              <Text style={styles.conditionBullet}>▸</Text>
              <Text style={styles.conditionText}>{text}</Text>
            </View>
          ))}
        </View>

        {/* ── Signatures ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Signatures</Text>
          <View style={styles.signatureRow}>
            {/* Loueur */}
            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>Le Loueur — {companyName}</Text>
              <View style={styles.signatureLine}>
                <Text style={styles.signatureLineText}>Signature + date :</Text>
              </View>
            </View>

            {/* Locataire */}
            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>Le Locataire — {clientName}</Text>
              <Text style={{ fontSize: 7, color: GRAY, marginBottom: 2 }}>
                Précédé de la mention &quot;Lu et approuvé&quot;
              </Text>
              <View style={styles.signatureLine}>
                <Text style={styles.signatureLineText}>Signature + date :</Text>
              </View>
            </View>
          </View>

          {/* Note consentement électronique */}
          <View style={styles.electronicNote}>
            <Text style={styles.electronicNoteText}>
              ✓ Ce contrat a été accepté électroniquement le {formatDateTime(rental.cgv_accepted_at ?? rental.created_at)} par {rental.client_email}.
              {"\n"}Les conditions générales de vente ont été lues et approuvées lors de la réservation en ligne (ref. {rental.reference}).
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

// =============================================================================
// FONCTION PRINCIPALE
// =============================================================================

export async function generateRentalContract(rentalId: string): Promise<string> {
  const supabase = createAdminClient()

  // 1. Récupérer la réservation complète
  const { data: rentalData, error: fetchError } = await supabase
    .from("rentals")
    .select("*, rental_vehicle:rental_vehicles(*)")
    .eq("id", rentalId)
    .single()

  if (fetchError || !rentalData) {
    throw new Error(`generateRentalContract : réservation ${rentalId} introuvable`)
  }

  const rental = rentalData as unknown as Rental

  // 2. Charger les paramètres du site (vrais données SQL)
  const settings = await getSiteSettings()

  // 3. Charger le logo en base64 (lecture fichier local)
  let logoBase64: string | null = null
  try {
    const logoPath = path.join(process.cwd(), "public", "logo1.png")
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath)
      logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`
    }
  } catch {
    // Logo non critique — contrat généré sans logo
    console.warn("generateRentalContract : logo introuvable, génération sans logo")
  }

  // 4. Générer le PDF en mémoire
  const generatedAt = new Date()
  const pdfBuffer = await renderToBuffer(
    <ContractDocument
      rental={rental}
      logoBase64={logoBase64}
      generatedAt={generatedAt}
      settings={settings}
    />
  )

  // 4. Uploader dans Supabase Storage (bucket 'contracts', privé)
  const storagePath = `rentals/${rentalId}/contrat-${rental.reference}.pdf`

  const { error: uploadError } = await supabase.storage
    .from("contracts")
    .upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true, // écrase si déjà existant (régénération)
      cacheControl: "3600",
    })

  if (uploadError) {
    throw new Error(`generateRentalContract : upload Storage échoué — ${uploadError.message}`)
  }

  // 5. Générer une URL signée (valable 7 jours = 604 800 secondes)
  const { data: signedData, error: signedError } = await supabase.storage
    .from("contracts")
    .createSignedUrl(storagePath, 7 * 24 * 60 * 60)

  if (signedError || !signedData?.signedUrl) {
    throw new Error(`generateRentalContract : URL signée échouée — ${signedError?.message}`)
  }

  const contractUrl = signedData.signedUrl

  // 6. Persister l'URL et la date de génération en DB
  const { error: updateError } = await supabase
    .from("rentals")
    .update({
      contract_url: contractUrl,
      contract_generated_at: generatedAt.toISOString(),
    } as never)
    .eq("id", rentalId)

  if (updateError) {
    console.error("generateRentalContract : mise à jour DB échouée", updateError)
    // Non bloquant : le PDF existe, on continue
  }

  // 7. Envoyer l'email "contrat prêt" au client
  try {
    const updatedRental: Rental = {
      ...(rental as Rental),
      contract_url: contractUrl,
      contract_generated_at: generatedAt.toISOString(),
    }
    await sendRentalEmail("contract_ready", updatedRental, {
      contractUrl,
      locale: "fr",
    })
  } catch (emailErr) {
    console.error("generateRentalContract : email contract_ready échoué", emailErr)
    // Non bloquant
  }

  return contractUrl
}
