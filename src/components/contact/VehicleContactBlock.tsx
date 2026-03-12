"use client"

import { useState } from "react"
import { Phone, MessageSquare, ChevronDown, Copy, Check, AlertCircle, Loader2, Send, Share2 } from "lucide-react"
import { MagneticButton } from "@/components/ui/MagneticButton"
import { submitVehicleInquiry } from "@/app/[locale]/(public)/vehicules/[slug]/actions"
import { formatPrice } from "@/lib/utils"

interface VehicleContactBlockProps {
  vehicleId: string
  brand: string
  model: string
  year: number
  price: number
  isSold?: boolean
  phoneNumber: string
  whatsappNumber: string
}

interface FormState {
  name: string
  email: string
  phone: string
  message: string
}

export function VehicleContactBlock({
  vehicleId,
  brand,
  model,
  year,
  price,
  isSold = false,
  phoneNumber,
  whatsappNumber,
}: VehicleContactBlockProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [formError, setFormError] = useState("")

  const vehicleRef = `${brand} ${model} ${year}`
  const shortId = vehicleId.slice(0, 8).toUpperCase()
  const defaultMessage = `Bonjour, je suis intéressé(e) par le ${vehicleRef} (réf: ${shortId}). Pourriez-vous me contacter ?`

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    message: defaultMessage,
  })

  const whatsappMsg = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par votre ${brand} ${model} (réf: ${shortId})`
  )
  const waNumber = whatsappNumber.replace(/\D/g, "")

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch { /* silent */ }
  }

  const handleField = (key: keyof FormState, value: string) =>
    setForm((s) => ({ ...s, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setFormError("Veuillez remplir les champs obligatoires.")
      return
    }
    setSubmitStatus("loading")
    setFormError("")

    const result = await submitVehicleInquiry({
      vehicleId,
      vehicleRef,
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      message: form.message,
    })

    if (result.success) {
      setSubmitStatus("success")
    } else {
      setSubmitStatus("error")
      setFormError(result.error ?? "Une erreur est survenue.")
    }
  }

  return (
    <div
      className="contact-panel relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(201,168,76,0.18)',
        borderRadius: '24px',
        padding: '32px',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Corner decoration — radial gold top-right */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: 120,
          height: 120,
          background: 'radial-gradient(circle at 100% 0%, rgba(201,168,76,0.09) 0%, transparent 70%)',
        }}
      />

      {/* ── Price header ── */}
      <div className="relative mb-6">
        {isSold ? (
          <div>
            <p className="text-xs font-bold uppercase mb-1.5" style={{ letterSpacing: '0.18em', color: '#ef4444' }}>
              Véhicule vendu
            </p>
            <p className="font-display text-2xl font-bold line-through" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {formatPrice(price)}
            </p>
            <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Contactez-nous pour un véhicule similaire.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold uppercase mb-1.5" style={{ letterSpacing: '0.25em', color: 'rgba(201,168,76,0.6)' }}>
              Prix
            </p>
            <p className="shimmer-text-gold font-display font-extrabold" style={{ fontSize: '2.2rem', lineHeight: 1.1 }}>
              {formatPrice(price)}
            </p>
          </div>
        )}
      </div>

      {/* Gold separator */}
      <div className="mb-6" style={{ height: 1, background: 'linear-gradient(90deg, rgba(201,168,76,0.3), rgba(201,168,76,0.05), transparent)' }} />

      {/* ── CTA Buttons ── */}
      <div className="space-y-3">
        {/* WhatsApp — gold shimmer + magnetic */}
        <MagneticButton>
          <a
            href={`https://wa.me/${waNumber}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="wa-gold"
          >
            <svg className="h-5 w-5 flex-shrink-0" style={{ fill: '#0A0A0A' }} viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Contacter via WhatsApp
          </a>
        </MagneticButton>

        {/* Phone — gold outline */}
        <a href={`tel:${phoneNumber}`} className="phone-btn">
          <Phone className="h-4 w-4 flex-shrink-0" />
          {phoneNumber}
        </a>

        {/* Message form toggle */}
        <button onClick={() => setFormOpen((o) => !o)} className="msg-btn">
          <MessageSquare className="h-4 w-4 flex-shrink-0" style={{ color: '#C9A84C' }} />
          Envoyer un message
          <ChevronDown
            className={`h-4 w-4 ml-auto flex-shrink-0 transition-transform duration-200 ${formOpen ? "rotate-180" : ""}`}
            style={{ color: 'rgba(255,255,255,0.3)' }}
          />
        </button>
      </div>

      {/* ── Inline form ── */}
      {formOpen && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {submitStatus === "success" ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div
                className="h-14 w-14 rounded-full flex items-center justify-center mb-3"
                style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)' }}
              >
                <Check className="h-7 w-7" style={{ color: '#C9A84C' }} />
              </div>
              <p className="font-semibold text-white text-base">Message envoyé !</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Nous vous répondrons sous 24h.</p>
              <button
                onClick={() => { setSubmitStatus("idle"); setForm((s) => ({ ...s, name: "", email: "", phone: "" })) }}
                className="mt-4 text-xs hover:underline"
                style={{ color: '#C9A84C' }}
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <input type="text" placeholder="Nom et prénom *" value={form.name}
                onChange={(e) => handleField("name", e.target.value)} className="dark-field" required />
              <input type="email" placeholder="Email *" value={form.email}
                onChange={(e) => handleField("email", e.target.value)} className="dark-field" required />
              <input type="tel" placeholder="Téléphone (optionnel)" value={form.phone}
                onChange={(e) => handleField("phone", e.target.value)} className="dark-field" />
              <textarea rows={3} placeholder="Message *" value={form.message}
                onChange={(e) => handleField("message", e.target.value)}
                className="dark-field resize-none" required />

              {(submitStatus === "error" || formError) && (
                <p className="flex items-center gap-1.5 text-xs" style={{ color: '#f87171' }}>
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {formError}
                </p>
              )}

              <button type="submit" disabled={submitStatus === "loading"} className="submit-gold mt-1">
                {submitStatus === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Envoyer
              </button>
              <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>* Champs obligatoires</p>
            </form>
          )}
        </div>
      )}

      {/* ── Share ── */}
      <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-xs font-semibold uppercase mb-3 flex items-center gap-2"
          style={{ letterSpacing: '0.2em', color: 'rgba(201,168,76,0.45)' }}>
          <Share2 className="h-3.5 w-3.5" />
          Partager
        </p>
        <div className="flex items-center flex-wrap gap-2">
          <button onClick={handleCopy} className="share-btn">
            {copied
              ? <><Check className="h-3.5 w-3.5" style={{ color: '#C9A84C' }} />Copié !</>
              : <><Copy className="h-3.5 w-3.5" />Copier le lien</>
            }
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${brand} ${model} ${year} — Auto Roi`)}`}
            target="_blank" rel="noopener noreferrer" className="share-btn"
          >
            WhatsApp
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent(`${vehicleRef} — Auto Roi`)}&body=${encodeURIComponent(`Découvrez ce véhicule sur Auto Roi`)}`}
            className="share-btn"
          >
            Email
          </a>
        </div>
        <button className="mt-3 text-xs transition-colors hover:text-red-400/60" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Signaler cette annonce
        </button>
      </div>

      {/* Ref */}
      <p className="text-center mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.18)', letterSpacing: '0.08em' }}>
        Réf. {shortId}
      </p>
    </div>
  )
}
