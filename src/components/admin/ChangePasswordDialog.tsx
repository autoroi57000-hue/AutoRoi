'use client'

import { useState, useTransition } from 'react'
import { Lock, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ChangePasswordDialogProps {
  open: boolean
  onClose: () => void
}

export function ChangePasswordDialog({ open, onClose }: ChangePasswordDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  if (!open) return null

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const newPassword = formData.get('newPassword') as string
    const confirm = formData.get('confirm') as string

    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (newPassword !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        setError(updateError.message || 'Impossible de modifier le mot de passe.')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setError(null)
        onClose()
      }, 2000)
    })
  }

  const handleClose = () => {
    if (!isPending) {
      setError(null)
      setSuccess(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl border border-ar-gold/20 bg-ar-dark p-6 shadow-2xl shadow-ar-gold/10">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-ar-silver/40 transition-colors hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="font-display text-xl font-bold text-white">
            Changer le mot de passe
          </h2>
          <p className="mt-1 text-sm text-ar-silver/60">
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        {/* Success */}
        {success && (
          <div
            className="mb-4 flex items-center gap-2 rounded-lg p-3 text-sm"
            style={{
              border: '1px solid rgba(26,107,58,0.35)',
              background: 'rgba(26,107,58,0.1)',
              color: '#4ade80',
            }}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Mot de passe modifié avec succès !
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New password */}
            <div className="space-y-1.5">
              <label htmlFor="newPassword" className="block text-sm font-medium text-ar-silver">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ar-silver/40" />
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNew ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-ar-gray bg-ar-black py-3 pl-10 pr-12 text-sm text-white placeholder-ar-silver/30 transition-colors focus:border-ar-gold focus:outline-none focus:ring-1 focus:ring-ar-gold/50"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ar-silver/40 hover:text-ar-gold"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm */}
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

            {/* Hints */}
            <div className="space-y-1">
              <p className="text-xs text-ar-silver/50">Le mot de passe doit contenir :</p>
              <ul className="space-y-0.5 text-xs text-ar-silver/40">
                <li>• Au moins 8 caractères</li>
                <li>• Majuscules et minuscules recommandées</li>
                <li>• Un chiffre ou symbole recommandé</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="flex-1 rounded-lg border border-ar-gray py-2.5 text-sm font-medium text-ar-silver transition-colors hover:border-ar-silver/50 hover:text-white disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-ar-gold to-ar-gold-dark py-2.5 text-sm font-semibold text-ar-black transition-all hover:from-ar-gold-light hover:to-ar-gold disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Modification…
                  </>
                ) : (
                  'Modifier'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
