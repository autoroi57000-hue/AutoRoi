'use client'

import { useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react'
import { loginAction, type ActionResult } from '../actions'

interface LoginPageProps {
  params: { locale: string }
}

export default function LoginPage({ params }: LoginPageProps) {
  const { locale } = params
  const searchParams = useSearchParams()
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<ActionResult | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const resetSuccess = searchParams.get('reset') === 'success'

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('locale', locale)
    startTransition(async () => {
      const res = await loginAction(formData)
      setResult(res)
    })
  }

  return (
    <>
      {/* Card with rotating border */}
      <div className="login-border-wrap anim-card w-full">
        <div className="login-card">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1
              className="font-display text-2xl font-bold text-white"
              style={{ letterSpacing: '0.04em' }}
            >
              Espace Professionnel
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Accès réservé à l&apos;équipe Auto Roi
            </p>
          </div>

          {/* Reset success */}
          {resetSuccess && (
            <div
              className="mb-6 flex items-center gap-2 rounded-xl p-3 text-sm"
              style={{
                border: '1px solid rgba(26,107,58,0.35)',
                background: 'rgba(26,107,58,0.1)',
                color: '#4ade80',
              }}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Mot de passe modifié avec succès. Vous pouvez vous connecter.
            </div>
          )}

          {/* Error */}
          {result && !result.success && (
            <div
              className="mb-6 flex items-center gap-2 rounded-xl p-3 text-sm"
              style={{
                border: '1px solid rgba(139,26,26,0.35)',
                background: 'rgba(139,26,26,0.1)',
                color: 'rgba(220,80,80,0.9)',
              }}
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {result.error}
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="anim-f1">
              <label htmlFor="email" className="lux-label">
                Adresse email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: '#C9A84C' }}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@auto-roi.fr"
                  className="lux-input"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="anim-f2">
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
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="lux-input"
                  style={{ paddingLeft: '2.75rem', paddingRight: '4.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium transition-all hover:underline"
                  style={{ color: 'rgba(201,168,76,0.65)' }}
                >
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <Link
                href={`/${locale}/forgot-password`}
                className="text-xs font-medium transition-all hover:underline"
                style={{ color: 'rgba(201,168,76,0.55)' }}
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Submit */}
            <div className="anim-btn pt-1">
              <button type="submit" disabled={isPending} className="shimmer-btn">
                {isPending ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12" cy="12" r="10"
                        stroke="#0A0A0A"
                        strokeWidth="4"
                        opacity="0.3"
                      />
                      <path
                        fill="#0A0A0A"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        opacity="0.8"
                      />
                    </svg>
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer note */}
      <p
        className="anim-footer mt-6 text-center text-xs"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        L&apos;accès est sur invitation uniquement.{' '}
        <a
          href="mailto:contact@autoroi.fr"
          className="transition-all hover:underline"
          style={{ color: '#C9A84C' }}
        >
          Contactez un administrateur.
        </a>
      </p>
    </>
  )
}
