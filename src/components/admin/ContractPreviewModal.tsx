"use client"

import { useState, useEffect, useCallback } from "react"
import {
  FileText,
  FileDown,
  Loader2,
  Pencil,
  Check,
  Download,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  getContractData,
  regenerateContract,
} from "@/app/[locale]/(admin)/admin/locations/actions"
import { toast } from "@/hooks/use-toast"

// ─── Types ──────────────────────────────────────────────────────────────────

interface ContractField {
  key: string
  label: string
  value: string
  section: "loueur" | "locataire" | "vehicule" | "conditions"
}

interface ContractPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rentalId: string | null
  readOnly?: boolean
  onContractGenerated?: () => void
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(d: string | null | undefined) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function formatEur(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n)
}

// ─── DOCX generation (client-side) ──────────────────────────────────────────

async function generateDocx(fields: ContractField[], contractNumber: string) {
  const {
    Document: DocxDocument,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    BorderStyle,
    HeadingLevel,
    Packer,
    ShadingType,
    Header,
    Footer,
    PageNumber,
    NumberFormat,
  } = await import("docx")

  const getField = (key: string) =>
    fields.find((f) => f.key === key)?.value ?? "—"

  const GOLD_HEX = "C9A84C"
  const DARK_HEX = "1A1A1A"

  const noBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  }

  const goldLine = new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: GOLD_HEX } },
    spacing: { after: 200 },
  })

  const sectionTitle = (text: string) =>
    new Paragraph({
      children: [
        new TextRun({
          text: text.toUpperCase(),
          bold: true,
          size: 20,
          color: GOLD_HEX,
          font: "Georgia",
        }),
      ],
      spacing: { before: 300, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: GOLD_HEX } },
    })

  const fieldRow = (label: string, value: string) =>
    new Paragraph({
      children: [
        new TextRun({ text: `${label} : `, color: "555555", size: 18, font: "Calibri" }),
        new TextRun({ text: value, bold: true, color: DARK_HEX, size: 18, font: "Calibri" }),
      ],
      spacing: { after: 60 },
    })

  const conditionItem = (text: string) =>
    new Paragraph({
      children: [
        new TextRun({ text: "▸ ", color: GOLD_HEX, size: 18, font: "Calibri" }),
        new TextRun({ text, color: DARK_HEX, size: 18, font: "Calibri" }),
      ],
      spacing: { after: 80 },
    })

  const doc = new DocxDocument({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 800, bottom: 800, left: 1000, right: 1000 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "AUTO ROI",
                    bold: true,
                    size: 28,
                    color: GOLD_HEX,
                    font: "Georgia",
                  }),
                  new TextRun({
                    text: `    ${contractNumber}`,
                    color: "999999",
                    size: 16,
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${getField("company_name")} — ${getField("company_email")} — ${getField("company_phone")}`,
                    color: "999999",
                    size: 14,
                    font: "Calibri",
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: "CONTRAT DE LOCATION DE VÉHICULE",
                bold: true,
                size: 32,
                color: DARK_HEX,
                font: "Georgia",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Document contractuel — conserver précieusement",
                color: "555555",
                size: 16,
                font: "Calibri",
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          goldLine,

          // Reference
          new Paragraph({
            children: [
              new TextRun({ text: "N° Contrat : ", color: "555555", size: 18, font: "Calibri" }),
              new TextRun({ text: contractNumber, bold: true, color: GOLD_HEX, size: 22, font: "Calibri" }),
              new TextRun({ text: `     Date : ${formatDate(new Date().toISOString())}`, color: "555555", size: 18, font: "Calibri" }),
            ],
            spacing: { after: 200 },
          }),

          // LOUEUR
          sectionTitle("Le Loueur"),
          fieldRow("Société", getField("company_name")),
          fieldRow("Adresse", getField("company_address")),
          fieldRow("SIRET", getField("company_siret")),
          fieldRow("Email", getField("company_email")),
          fieldRow("Téléphone", getField("company_phone")),

          // LOCATAIRE
          sectionTitle("Le Locataire"),
          fieldRow("Nom", getField("client_name")),
          fieldRow("Email", getField("client_email")),
          fieldRow("Téléphone", getField("client_phone")),
          fieldRow("Adresse", getField("client_address")),
          fieldRow("Date de naissance", getField("client_birth_date")),
          fieldRow("N° Permis", getField("client_license")),

          // VÉHICULE
          sectionTitle("Véhicule loué"),
          fieldRow("Marque / Modèle", `${getField("vehicle_brand")} ${getField("vehicle_model")}`),
          fieldRow("Année", getField("vehicle_year")),
          fieldRow("Couleur", getField("vehicle_color")),
          fieldRow("Carburant", getField("vehicle_fuel")),
          fieldRow("Transmission", getField("vehicle_transmission")),
          new Paragraph({
            children: [
              new TextRun({ text: "Kilométrage au départ (à compléter) : __________________ km", color: "555555", size: 18, font: "Calibri" }),
            ],
            spacing: { before: 100, after: 100 },
          }),

          // CONDITIONS
          sectionTitle("Conditions de location"),
          fieldRow("Prise en charge", `${getField("start_date")} à ${getField("pickup_time")}`),
          fieldRow("Restitution", `${getField("end_date")} à ${getField("return_time")}`),
          fieldRow("Durée", `${getField("total_days")} jours`),
          fieldRow("Tarif journalier", getField("price_per_day")),
          fieldRow("Total TTC", getField("total_amount")),
          fieldRow("Acompte", getField("deposit_amount")),
          fieldRow("Solde dû à la remise", getField("balance")),

          // CONDITIONS GÉNÉRALES
          sectionTitle("Conditions générales"),
          conditionItem(`Kilométrage inclus : ${getField("included_km")} km/jour. Tout kilomètre supplémentaire sera facturé ${getField("extra_km_price")} €/km.`),
          conditionItem("Carburant : le véhicule est remis avec un niveau défini. Il doit être restitué au même niveau, sous peine de facturation du manquant au prix courant + 10 €."),
          conditionItem("État du véhicule : tout dommage non signalé à la remise sera facturé au locataire selon le barème en vigueur."),
          conditionItem("En cas de sinistre : contacter immédiatement le loueur, ne pas déplacer le véhicule sans autorisation, remplir un constat amiable."),
          conditionItem("Retard de restitution : tout dépassement sera facturé par heure entamée selon le tarif horaire en vigueur."),
          conditionItem("Annulation : moins de 48h avant le départ = conservation de l'acompte. Au-delà = remboursement intégral sous 10 jours ouvrés."),
          conditionItem("Le locataire certifie être titulaire d'un permis de conduire valide et couvert par une assurance personnelle."),

          // SIGNATURES
          sectionTitle("Signatures"),
          new Paragraph({ spacing: { after: 200 } }),
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "LE LOUEUR", bold: true, color: "555555", size: 16, font: "Calibri" }),
                        ],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: getField("company_name"), size: 16, font: "Calibri" })],
                        spacing: { after: 600 },
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: "Signature + date :", color: "999999", size: 14, font: "Calibri" })],
                        border: { top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
                      }),
                    ],
                    borders: noBorders,
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "LE LOCATAIRE", bold: true, color: "555555", size: 16, font: "Calibri" }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: getField("client_name"), size: 16, font: "Calibri" }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Précédé de la mention "Lu et approuvé"', italics: true, color: "999999", size: 14, font: "Calibri" }),
                        ],
                        spacing: { after: 400 },
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: "Signature + date :", color: "999999", size: 14, font: "Calibri" })],
                        border: { top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
                      }),
                    ],
                    borders: noBorders,
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  return blob
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ContractPreviewModal({
  open,
  onOpenChange,
  rentalId,
  readOnly = false,
  onContractGenerated,
}: ContractPreviewModalProps) {
  const [fields, setFields] = useState<ContractField[]>([])
  const [contractNumber, setContractNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState<"pdf" | "docx" | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!rentalId) return
    setLoading(true)
    const result = await getContractData(rentalId)
    if (result.success && result.data) {
      const { rental, settings, contractNumber: cnum } = result.data
      const v = rental.rental_vehicle
      setContractNumber(cnum)

      const newFields: ContractField[] = [
        // Loueur
        { key: "company_name", label: "Société", value: settings.business_name || "Auto Roi", section: "loueur" },
        { key: "company_address", label: "Adresse", value: settings.legal_address || settings.business_address || "France", section: "loueur" },
        { key: "company_siret", label: "SIRET", value: settings.legal_siret || "—", section: "loueur" },
        { key: "company_email", label: "Email", value: settings.contact_email || "contact@autoroi.fr", section: "loueur" },
        { key: "company_phone", label: "Téléphone", value: settings.phone_number || "+33 6 00 00 00 00", section: "loueur" },
        // Locataire
        { key: "client_name", label: "Nom complet", value: `${rental.client_first_name} ${rental.client_last_name}`, section: "locataire" },
        { key: "client_email", label: "Email", value: rental.client_email, section: "locataire" },
        { key: "client_phone", label: "Téléphone", value: rental.client_phone, section: "locataire" },
        { key: "client_address", label: "Adresse", value: [rental.client_address, rental.client_postal_code, rental.client_city].filter(Boolean).join(", ") || "—", section: "locataire" },
        { key: "client_birth_date", label: "Date de naissance", value: rental.client_birth_date ? formatDate(rental.client_birth_date) : "—", section: "locataire" },
        { key: "client_license", label: "N° Permis", value: rental.client_license_number || "—", section: "locataire" },
        // Véhicule
        { key: "vehicle_brand", label: "Marque", value: v?.brand ?? "—", section: "vehicule" },
        { key: "vehicle_model", label: "Modèle", value: v?.model ?? "—", section: "vehicule" },
        { key: "vehicle_year", label: "Année", value: String(v?.year ?? "—"), section: "vehicule" },
        { key: "vehicle_color", label: "Couleur", value: v?.color ?? "—", section: "vehicule" },
        { key: "vehicle_fuel", label: "Carburant", value: v?.fuel ?? "—", section: "vehicule" },
        { key: "vehicle_transmission", label: "Transmission", value: v?.transmission ?? "—", section: "vehicule" },
        // Conditions
        { key: "start_date", label: "Date début", value: formatDate(rental.start_date), section: "conditions" },
        { key: "end_date", label: "Date fin", value: formatDate(rental.end_date), section: "conditions" },
        { key: "pickup_time", label: "Heure prise en charge", value: rental.pickup_time || "09:00", section: "conditions" },
        { key: "return_time", label: "Heure restitution", value: rental.return_time || "18:00", section: "conditions" },
        { key: "total_days", label: "Durée (jours)", value: String(rental.total_days), section: "conditions" },
        { key: "price_per_day", label: "Tarif / jour", value: formatEur(rental.base_price_per_day), section: "conditions" },
        { key: "total_amount", label: "Total TTC", value: formatEur(rental.total_amount), section: "conditions" },
        { key: "deposit_amount", label: "Acompte", value: formatEur(rental.deposit_amount), section: "conditions" },
        { key: "balance", label: "Solde dû", value: formatEur(rental.total_amount - rental.deposit_amount), section: "conditions" },
        { key: "included_km", label: "Km inclus / jour", value: String(v?.included_km_per_day ?? 200), section: "conditions" },
        { key: "extra_km_price", label: "Prix km supplémentaire", value: String(v?.extra_km_price ?? 0.25), section: "conditions" },
      ]
      setFields(newFields)
    }
    setLoading(false)
  }, [rentalId])

  useEffect(() => {
    if (open && rentalId) {
      loadData()
    }
  }, [open, rentalId, loadData])

  const updateField = (key: string, value: string) => {
    setFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, value } : f))
    )
  }

  const handleGeneratePdf = async () => {
    if (!rentalId) return
    setGenerating("pdf")
    try {
      const result = await regenerateContract(rentalId)
      if (result.success && result.url) {
        // Télécharger le PDF automatiquement
        const a = document.createElement("a")
        a.href = result.url
        a.target = "_blank"
        a.download = `contrat-${contractNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        toast({
          title: "Contrat PDF généré",
          description: "Le PDF a été téléchargé et envoyé au client.",
          variant: "success",
        })
        onContractGenerated?.()
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de générer le contrat",
          variant: "destructive",
        })
      }
    } catch {
      toast({ title: "Erreur", description: "Erreur inattendue", variant: "destructive" })
    }
    setGenerating(null)
  }

  const handleGenerateDocx = async () => {
    setGenerating("docx")
    try {
      const blob = await generateDocx(fields, contractNumber)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `contrat-${contractNumber}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({ title: "Contrat Word téléchargé", variant: "success" })
    } catch (err) {
      console.error("DOCX generation error:", err)
      toast({ title: "Erreur", description: "Erreur lors de la génération DOCX", variant: "destructive" })
    }
    setGenerating(null)
  }

  const sections = [
    { key: "loueur" as const, title: "Le Loueur" },
    { key: "locataire" as const, title: "Le Locataire" },
    { key: "vehicule" as const, title: "Véhicule" },
    { key: "conditions" as const, title: "Conditions de location" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-ar-gray to-ar-dark border-ar-gold/20 text-white backdrop-blur-xl shadow-2xl shadow-ar-gold/10 max-w-[95vw] md:max-w-2xl lg:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-ar-gold/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-ar-gold" />
            </div>
            <div>
              <span>Contrat de location</span>
              {contractNumber && (
                <span className="block text-sm font-mono text-ar-gold">{contractNumber}</span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-ar-gold animate-spin" />
          </div>
        ) : (
          <div className="space-y-5 mt-2">
            <p className="text-xs text-gray-500">
              {readOnly
                ? "Aperçu du contrat — téléchargez le document Word."
                : "Vérifiez les informations ci-dessous. Cliquez sur un champ pour le modifier avant la génération."}
            </p>

            {sections.map((section) => {
              const sectionFields = fields.filter((f) => f.section === section.key)
              if (sectionFields.length === 0) return null
              return (
                <div key={section.key} className="bg-ar-dark/50 rounded-xl p-4 border border-ar-gold/10">
                  <h3 className="text-xs font-bold text-ar-gold uppercase tracking-wider mb-3">
                    {section.title}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 sm:gap-x-6 gap-y-2">
                    {sectionFields.map((field) => (
                      <div key={field.key} className="flex items-center gap-2 group">
                        <span className="text-xs text-gray-500 min-w-[80px] sm:min-w-[100px] flex-shrink-0">
                          {field.label}
                        </span>
                        {!readOnly && editingField === field.key ? (
                          <div className="flex items-center gap-1 flex-1">
                            <Input
                              value={field.value}
                              onChange={(e) => updateField(field.key, e.target.value)}
                              className="h-7 text-xs bg-ar-dark/80 border-ar-gold/30 text-white"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") setEditingField(null)
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-ar-gold/10"
                              onClick={() => setEditingField(null)}
                            >
                              <Check className="h-3 w-3 text-green-400" />
                            </Button>
                          </div>
                        ) : readOnly ? (
                          <span className="text-sm text-white flex-1 min-w-0 truncate">
                            {field.value}
                          </span>
                        ) : (
                          <button
                            onClick={() => setEditingField(field.key)}
                            className="flex items-center gap-1 text-sm text-white hover:text-ar-gold transition-colors text-left flex-1 min-w-0"
                          >
                            <span className="truncate">{field.value}</span>
                            <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-60 flex-shrink-0 transition-opacity" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <DialogFooter className="gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-ar-gold/20 text-gray-300 hover:text-white hover:border-ar-gold/40"
          >
            Fermer
          </Button>
          <Button
            onClick={handleGenerateDocx}
            disabled={generating !== null || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            {generating === "docx" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            Télécharger Word
          </Button>
          {!readOnly && (
            <Button
              onClick={handleGeneratePdf}
              disabled={generating !== null || loading}
              className="bg-ar-gold hover:bg-ar-gold-light text-ar-black font-bold"
            >
              {generating === "pdf" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Générer PDF
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
