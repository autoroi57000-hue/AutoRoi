'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Car,
  Plus,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  X,
  Menu,
  Crown,
  Calendar,
  KeyRound,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logoutAction } from '@/app/[locale]/(auth)/actions'
import type { Profile } from '@/types/database'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  adminOnly?: boolean
}

interface AdminSidebarProps {
  locale: string
  profile: Profile
  unreadMessages?: number
  vehicleCount?: number
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

export function AdminSidebar({
  locale,
  profile,
  unreadMessages = 0,
  vehicleCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isAdmin = profile.role === 'admin'

  const navItems: NavItem[] = [
    {
      href: `/${locale}/admin`,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: `/${locale}/admin/annonces`,
      label: 'Annonces',
      icon: Car,
      badge: vehicleCount > 0 ? vehicleCount : undefined,
    },
    {
      href: `/${locale}/admin/annonces/nouvelle`,
      label: 'Nouvelle annonce',
      icon: Plus,
    },
    {
      href: `/${locale}/admin/locations`,
      label: 'Réservations',
      icon: Calendar,
    },
    {
      href: `/${locale}/admin/locations/vehicules`,
      label: 'Flotte location',
      icon: KeyRound,
    },
    {
      href: `/${locale}/admin/messages`,
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
    {
      href: `/${locale}/admin/collaborateurs`,
      label: 'Collaborateurs',
      icon: Users,
      adminOnly: true,
    },
    {
      href: `/${locale}/admin/parametres`,
      label: 'Paramètres',
      icon: Settings,
      adminOnly: true,
    },
  ]

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  /* ─── Contenu sidebar complet (mobile drawer + desktop lg) ─── */
  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-ar-gold/10 bg-gradient-to-r from-ar-dark to-ar-gray/50",
        collapsed ? "justify-center px-2 py-4" : "gap-3 px-6 py-5"
      )}>
        <div className="relative">
          <div className="absolute inset-0 bg-ar-gold/30 blur-lg rounded-full" />
          <Crown className="relative h-6 w-6 text-ar-gold" />
        </div>
        {!collapsed && (
          <span className="font-display text-lg font-bold tracking-[0.2em] bg-gradient-to-r from-ar-gold to-ar-gold-light bg-clip-text text-transparent">
            AUTO ROI
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 overflow-y-auto py-4", collapsed ? "px-2" : "px-3")}>
        <ul className="space-y-1.5">
          {visibleItems.map((item) => {
            const isActive =
              item.href === `/${locale}/admin`
                ? pathname === item.href
                : pathname.startsWith(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'group flex items-center rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden',
                    collapsed
                      ? 'justify-center p-3'
                      : 'justify-between px-4 py-3',
                    isActive
                      ? 'bg-gradient-to-r from-ar-gold/20 to-transparent text-ar-gold border-l-2 border-ar-gold shadow-lg shadow-ar-gold/5'
                      : 'text-ar-silver/70 hover:bg-ar-gold/5 hover:text-ar-silver border-l-2 border-transparent'
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-ar-gold/5 blur-xl" />
                  )}

                  <div className={cn("relative flex items-center", !collapsed && "gap-3")}>
                    <item.icon
                      className={cn(
                        'h-5 w-5 shrink-0 transition-all duration-300',
                        isActive ? 'text-ar-gold scale-110' : 'text-ar-silver/50 group-hover:text-ar-gold/70'
                      )}
                    />
                    {!collapsed && <span className="relative">{item.label}</span>}
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        'relative rounded-full text-xs font-bold backdrop-blur-sm transition-all duration-300',
                        collapsed ? 'absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-[10px] p-0' : 'px-2.5 py-0.5',
                        item.href.includes('messages')
                          ? 'bg-ar-danger/80 text-white shadow-lg shadow-ar-danger/20'
                          : 'bg-ar-gold/20 text-ar-gold border border-ar-gold/20'
                      )}
                    >
                      {collapsed ? '' : item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Profil + déconnexion */}
      <div className="border-t border-ar-gold/10 p-4 bg-gradient-to-t from-ar-dark to-transparent">
        {collapsed ? (
          /* Tablette : avatar seul */
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-ar-gold/20 blur-md rounded-full" />
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ar-gold/20 to-ar-gold/5 border border-ar-gold/30 text-sm font-bold text-ar-gold">
                {getInitials(profile.full_name, profile.email)}
              </div>
            </div>
          </div>
        ) : (
          /* Desktop / mobile : avatar + nom */
          <div className="mb-4 flex items-center gap-3 p-3 rounded-xl bg-ar-dark/50 border border-ar-gold/10">
            <div className="relative">
              <div className="absolute inset-0 bg-ar-gold/20 blur-md rounded-full" />
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ar-gold/20 to-ar-gold/5 border border-ar-gold/30 text-sm font-bold text-ar-gold">
                {getInitials(profile.full_name, profile.email)}
              </div>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {profile.full_name ?? profile.email}
              </p>
              <p className="text-xs capitalize text-ar-silver/50">{profile.role}</p>
            </div>
          </div>
        )}

        <form action={logoutAction.bind(null, locale)}>
          <button
            type="submit"
            title={collapsed ? 'Se déconnecter' : undefined}
            className={cn(
              "group flex w-full items-center rounded-xl text-sm text-ar-silver/60 transition-all duration-300 hover:bg-ar-danger/10 hover:text-ar-danger border border-transparent hover:border-ar-danger/20",
              collapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
            {!collapsed && 'Se déconnecter'}
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* ─── Bouton burger mobile (< md) ─── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-ar-gold/20 bg-ar-dark/90 backdrop-blur-sm text-ar-silver shadow-lg shadow-ar-gold/5 transition-all duration-300 hover:border-ar-gold/40 hover:text-ar-gold active:scale-95 md:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* ─── Overlay mobile ─── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Drawer mobile (< md) ─── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[min(16rem,calc(100vw-3rem))] border-r border-ar-gold/10 bg-ar-dark/95 backdrop-blur-xl transition-transform duration-300 shadow-2xl shadow-ar-gold/10 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 rounded-lg p-2 text-ar-silver/60 hover:text-ar-silver hover:bg-ar-gold/10 transition-all duration-300"
          aria-label="Fermer le menu"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* ─── Sidebar tablette (md → lg) : icônes seules ─── */}
      <aside className="hidden md:flex md:flex-col lg:hidden w-16 shrink-0 border-r border-ar-gold/10 bg-ar-dark">
        <SidebarContent collapsed />
      </aside>

      {/* ─── Sidebar desktop (lg+) : complète ─── */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-ar-gold/10 bg-ar-dark">
        <SidebarContent />
      </aside>
    </>
  )
}
