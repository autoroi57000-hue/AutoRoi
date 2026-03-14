'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { localePath } from '@/lib/constants'

interface SetPasswordPageProps {
  params: { locale: string }
}

export default function SetPasswordPage({ params }: SetPasswordPageProps) {
  const { locale } = params
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(
          updateError.message.includes('expired')
            ? "Le lien d'invitation a expiré. Demandez une nouvelle invitation à votre administrateur."
            : "Impossible de définir le mot de passe. Le lien a peut-être expiré."
        )
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`${localePath(locale, '/admin')}`)
      }, 2000)
    })
  }

  return (
    <>
      {/* Card with rotating border — same as login */}
      <div className="login-border-wrap anim-card w-full">
        <div className="login-card">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1
              className="font-display text-2xl font-bold text-white"
              style={{ letterSpacing: '0.04em' }}
            >
              Bienvenue chez Auto Roi
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Créez votre mot de passe pour accéder à votre espace
            </p>
          </div>

          {/* Success */}
          {success && (
            <div
              className="mb-6 flex items-center gap-2 rounded-xl p-3 text-sm"
              style={{
                border: '1px solid rgba(26,107,58,0.35)',
                background: 'rgba(26,107,58,0.1)',
                color: '#4ade80',
              }}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Mot de passe créé avec succès ! Redirection vers le tableau de bord…
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="mb-6 flex items-center gap-2 rounded-xl p-3 text-sm"
              style={{
                border: '1px solid rgba(139,26,26,0.35)',
                background: 'rgba(139,26,26,0.1)',
                color: 'rgba(220,80,80,0.9)',
              }}
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password */}
              <div className="anim-f1">
                <label htmlFor="password" className="lux-label">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: '#C9A84C' }}
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className="lux-input"
                    style={{ paddingLeft: '2.75rem', paddingRight: '4.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-all"
                    style={{ color: 'rgba(201,168,76,0.5)' }}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm */}
              <div className="anim-f2">
                <label htmlFor="confirm" className="lux-label">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: '#C9A84C' }}
                  />
                  <input
                    id="confirm"
                    name="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    className="lux-input"
                    style={{ paddingLeft: '2.75rem', paddingRight: '4.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-all"
                    style={{ color: 'rgba(201,168,76,0.5)' }}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Strength hints */}
              <div className="space-y-1">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Le mot de passe doit contenir :
                </p>
                <ul className="space-y-0.5 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  <li>• Au moins 8 caractères</li>
                  <li>• Majuscules et minuscules recommandées</li>
                  <li>• Un chiffre ou symbole recommandé</li>
                </ul>
              </div>

              {/* Submit */}
              <div className="anim-btn pt-1">
                <button type="submit" disabled={isPending} className="shimmer-btn">
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#0A0A0A' }} />
                      Création en cours…
                    </>
                  ) : (
                    'Créer mon mot de passe'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer note */}
      <p
        className="anim-footer mt-6 text-center text-xs"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        Vous avez été invité(e) par un administrateur Auto Roi.
      </p>
    </>
  )
}
