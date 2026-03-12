import type { Profile, ProfileInsert, ProfileUpdate, UserRole } from './database'

// ─── Re-exports des types DB ─────────────────────────────────────────────────
export type { Profile, ProfileInsert, ProfileUpdate, UserRole }

/** Profil avec la session Supabase Auth intégrée */
export interface AuthUser {
  id: string
  email: string
  profile: Profile | null
}

/** Vérifier si un profil a le rôle admin */
export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === 'admin'
}
