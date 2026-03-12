'use client'

import { useState, useTransition } from 'react'
import { Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { resetPasswordAction, type ActionResult } from '../actions'

interface ResetPasswordPageProps {
  params: { locale: string }
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { locale } = params
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<ActionResult | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setClientError(null)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    if (password.length < 8) {
      setClientError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirm) {
      setClientError('Les mots de passe ne correspondent pas.')
      return
    }

    formData.set('locale', locale)
    startTransition(async () => {
      const res = await resetPasswordAction(formData)
      setResult(res)
    })
  }

  const errorMsg = clientError ?? (result && !result.success ? result.error : null)

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="rounded-2xl border border-ar-gold/20 bg-ar-dark p-8 shadow-2xl shadow-ar-gold/5">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold text-white">Nouveau mot de passe</h1>
          <p className="mt-1 text-sm text-ar-silver/60">
            Choisissez un mot de passe sécurisé (8 caractères minimum)
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nouveau mot de passe */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-ar-silver">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ar-silver/40" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full rounded-lg border border-ar-gray bg-ar-black py-3 pl-10 pr-12 text-sm text-white placeholder-ar-silver/30 transition-colors focus:border-ar-gold focus:outline-none focus:ring-1 focus:ring-ar-gold/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ar-silver/40 hover:text-ar-gold"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirmation */}
          <div className="space-y-1.5">
            <label htmlFor="confirm" className="block text-sm font-medium text-ar-silver">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ar-silver/40" />
              <input
                id="confirm"
                name="confirm"
                type={showConfirm ? 'text' : 'password'}
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-ar-gray bg-ar-black py-3 pl-10 pr-12 text-sm text-white placeholder-ar-silver/30 transition-colors focus:border-ar-gold focus:outline-none focus:ring-1 focus:ring-ar-gold/50"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ar-silver/40 hover:text-ar-gold"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Indicateur de force */}
          <div className="space-y-1">
            <p className="text-xs text-ar-silver/50">Le mot de passe doit contenir :</p>
            <ul className="space-y-0.5 text-xs text-ar-silver/40">
              <li>• Au moins 8 caractères</li>
              <li>• Majuscules et minuscules recommandées</li>
              <li>• Un chiffre ou symbole recommandé</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-ar-gold to-ar-gold-dark py-3 text-sm font-semibold text-ar-black transition-all hover:from-ar-gold-light hover:to-ar-gold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Modification en cours…
              </>
            ) : (
              'Modifier le mot de passe'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
