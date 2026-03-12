import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Toaster } from '@/components/ui/toaster'
import type { Profile } from '@/types/database'

interface AdminLayoutProps {
  children: ReactNode
  params: { locale: string }
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = params
  const supabase = await createClient()

  // Vérifier la session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  // Charger le profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  if (!profile) {
    redirect(`/${locale}/login`)
  }

  // Vérifier que le compte est actif
  if (!profile.is_active) {
    await supabase.auth.signOut()
    redirect(`/${locale}/login?error=disabled`)
  }

  // Charger les compteurs pour la sidebar
  const [{ count: unreadMessages }, { count: vehicleCount }] = await Promise.all([
    supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'non_lu'),
    supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'publie'),
  ])

  return (
    <div className="flex h-screen overflow-hidden bg-ar-black">

      <AdminSidebar
        locale={locale}
        profile={profile}
        unreadMessages={unreadMessages ?? 0}
        vehicleCount={vehicleCount ?? 0}
      />

      {/* Zone principale */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        <AdminHeader locale={locale} profile={profile} />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          <div className="relative">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}
