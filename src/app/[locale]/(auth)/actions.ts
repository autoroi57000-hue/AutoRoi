'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createActionClient } from '@/lib/supabase/server'
import { DEFAULT_LOCALE } from '@/lib/constants'

// ─── Schemas ─────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  locale: z.string().default(DEFAULT_LOCALE),
})

const forgotSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  locale: z.string().default(DEFAULT_LOCALE),
})

const resetSchema = z
  .object({
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirm: z.string(),
    locale: z.string().default(DEFAULT_LOCALE),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm'],
  })

// ─── Types retour ─────────────────────────────────────────────────────────────

export type ActionResult =
  | { success: true; message?: string }
  | { success: false; error: string }

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    locale: formData.get('locale') ?? DEFAULT_LOCALE,
  })

  if (!parsed.success) {
    return { success: false, error: 'Email ou mot de passe invalide.' }
  }

  const supabase = await createActionClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { success: false, error: 'Email ou mot de passe incorrect.' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { success: false, error: 'Veuillez confirmer votre email avant de vous connecter.' }
    }
    return { success: false, error: 'Une erreur est survenue. Veuillez réessayer.' }
  }

  // Vérifier que le profil est actif
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_active')
      .eq('id', user.id)
      .single<{ is_active: boolean }>()

    if (!profile || !profile.is_active) {
      await supabase.auth.signOut()
      return { success: false, error: 'Votre compte a été désactivé. Contactez un administrateur.' }
    }
  }

  redirect(`/${parsed.data.locale}/admin`)
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction(locale: string = DEFAULT_LOCALE): Promise<void> {
  const supabase = await createActionClient()
  await supabase.auth.signOut()
  redirect(`/${locale}/login`)
}

// ─── Mot de passe oublié ─────────────────────────────────────────────────────

export async function forgotPasswordAction(formData: FormData): Promise<ActionResult> {
  const parsed = forgotSchema.safeParse({
    email: formData.get('email'),
    locale: formData.get('locale') ?? DEFAULT_LOCALE,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Email invalide.' }
  }

  const supabase = await createActionClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/${parsed.data.locale}/reset-password`,
  })

  if (error) {
    return { success: false, error: 'Une erreur est survenue. Veuillez réessayer.' }
  }

  // Toujours retourner success pour ne pas révéler si l'email existe
  return {
    success: true,
    message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
  }
}

// ─── Reset mot de passe ───────────────────────────────────────────────────────

export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  const parsed = resetSchema.safeParse({
    password: formData.get('password'),
    confirm: formData.get('confirm'),
    locale: formData.get('locale') ?? DEFAULT_LOCALE,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Données invalides.' }
  }

  const supabase = await createActionClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })

  if (error) {
    return { success: false, error: 'Impossible de modifier le mot de passe. Le lien a peut-être expiré.' }
  }

  redirect(`/${parsed.data.locale}/login?reset=success`)
}
