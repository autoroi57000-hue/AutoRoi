'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink, Menu, KeyRound, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types/database'
import { ChangePasswordDialog } from './ChangePasswordDialog'
import { createClient } from '@/lib/supabase/client'

interface AdminHeaderProps {
  locale: string
  profile: Profile
  onMenuToggle?: () => void
}

const PAGE_LABELS: Record<string, string> = {
  admin: 'Dashboard',
  annonces: 'Annonces',
  nouvelle: 'Nouvelle annonce',
  messages: 'Messages',
  collaborateurs: 'Collaborateurs',
  parametres: 'Paramètres',
}

function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  // Chercher depuis la fin pour trouver le segment le plus spécifique
  for (let i = segments.length - 1; i >= 0; i--) {
    const label = PAGE_LABELS[segments[i]]
    if (label) return label
  }
  return 'Administration'
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

export function AdminHeader({ locale, profile, onMenuToggle }: AdminHeaderProps) {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)
  const isAdmin = profile.role === 'admin'
  const [showMenu, setShowMenu] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = `/${locale}/login`
  }

  return (
    <>
    <ChangePasswordDialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} />
    <header className="flex h-14 sm:h-16 shrink-0 items-center justify-between border-b border-ar-gold/10 bg-ar-dark/90 backdrop-blur-xl px-3 sm:px-4 lg:px-6 sticky top-0 z-40 shadow-lg shadow-ar-gold/5">
      {/* Gauche : espace burger + titre */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Espace pour le bouton burger mobile fixe */}
        <div className="w-11 md:hidden" />

        <div className="relative">
          <h1 className="font-display text-base sm:text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight truncate max-w-[180px] sm:max-w-none">
            {pageTitle}
          </h1>
          <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-ar-gold to-transparent rounded-full" />
        </div>
      </div>

      {/* Droite : badge rôle + lien site + avatar */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Badge rôle */}
        <span
          className={cn(
            'hidden rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border sm:block backdrop-blur-sm transition-all duration-300',
            isAdmin
              ? 'bg-ar-gold/10 border-ar-gold/30 text-ar-gold shadow-lg shadow-ar-gold/10'
              : 'bg-ar-silver/5 border-ar-silver/20 text-ar-silver/70'
          )}
        >
          {profile.role}
        </span>

        {/* Voir le site */}
        <Link
          href={`/${locale}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-2 rounded-lg border border-ar-gold/20 bg-ar-dark/50 px-4 py-2 text-xs text-ar-silver/70 transition-all duration-300 hover:border-ar-gold/50 hover:text-ar-gold hover:shadow-lg hover:shadow-ar-gold/10 sm:flex backdrop-blur-sm"
        >
          <ExternalLink className="h-4 w-4" />
          Voir le site
        </Link>

        {/* Avatar + Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="relative group"
          >
            <div className="absolute inset-0 bg-ar-gold/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ar-gold/20 to-ar-gold/5 border border-ar-gold/30 text-xs font-bold text-ar-gold shadow-lg shadow-ar-gold/10 transition-all duration-300 group-hover:border-ar-gold/50 group-hover:shadow-ar-gold/20">
              {getInitials(profile.full_name, profile.email)}
            </div>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-ar-gold/20 bg-ar-dark shadow-2xl shadow-ar-gold/10">
              <div className="border-b border-ar-gold/10 px-4 py-3">
                <p className="text-sm font-medium text-white truncate">{profile.full_name || profile.email}</p>
                <p className="text-xs text-ar-silver/50 truncate">{profile.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setShowMenu(false); setShowPasswordDialog(true) }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-ar-silver transition-colors hover:bg-ar-gold/10 hover:text-ar-gold"
                >
                  <KeyRound className="h-4 w-4" />
                  Changer le mot de passe
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
    </>
  )
}
