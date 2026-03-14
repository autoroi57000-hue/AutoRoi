'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { forgotPasswordAction, type ActionResult } from '../actions'
import { localePath } from '@/lib/constants'

interface ForgotPasswordPageProps {
  params: { locale: string }
}

export default function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { locale } = params
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<ActionResult | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('locale', locale)

    startTransition(async () => {
      const res = await forgotPasswordAction(formData)
      setResult(res)
    })
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="rounded-2xl border border-ar-gold/20 bg-ar-dark p-8 shadow-2xl shadow-ar-gold/5">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold text-white">Mot de passe oublié</h1>
          <p className="mt-1 text-sm text-ar-silver/60">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Succès */}
        {result?.success && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{result.message}</p>
            </div>
            <Link
              href={`${localePath(locale, '/login')}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-ar-gray py-3 text-sm text-ar-silver transition-colors hover:border-ar-gold hover:text-ar-gold"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </div>
        )}

        {/* Formulaire */}
        {!result?.success && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {result && !result.success && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {result.error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-ar-silver">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ar-silver/40" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="votre@email.fr"
                  className="w-full rounded-lg border border-ar-gray bg-ar-black py-3 pl-10 pr-4 text-sm text-white placeholder-ar-silver/30 transition-colors focus:border-ar-gold focus:outline-none focus:ring-1 focus:ring-ar-gold/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-ar-gold to-ar-gold-dark py-3 text-sm font-semibold text-ar-black transition-all hover:from-ar-gold-light hover:to-ar-gold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi en cours…
                </>
              ) : (
                'Envoyer le lien'
              )}
            </button>

            <Link
              href={`${localePath(locale, '/login')}`}
              className="flex items-center justify-center gap-2 text-sm text-ar-silver/50 transition-colors hover:text-ar-gold"
            >
              <ArrowLeft className="h-3 w-3" />
              Retour à la connexion
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
