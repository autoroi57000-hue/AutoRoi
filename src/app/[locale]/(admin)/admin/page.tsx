import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getDashboardStats, getLatestVehicles } from "./actions"
import dynamic from "next/dynamic"
import { localePath } from '@/lib/constants'

const DashboardContent = dynamic(
  () => import("@/components/admin/DashboardContent"),
  { loading: () => <div className="h-96 animate-pulse rounded-lg bg-muted" /> }
)

interface DashboardPageProps {
  params: { locale: string }
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = params
  const supabase = await createClient()

  // Vérifier l'authentification
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`${localePath(locale, '/login')}`)
  }

  // Charger le rôle
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: string }>()

  const role = (profile?.role ?? "collaborateur") as "admin" | "collaborateur"

  // Charger les stats vente et les dernières annonces en parallèle
  const [statsResult, latestResult] = await Promise.all([
    getDashboardStats(),
    getLatestVehicles(5),
  ])

  const { stats } = statsResult
  const { vehicles: latestVehicles } = latestResult

  return (
    <DashboardContent
      locale={locale}
      role={role}
      saleStats={stats}
      latestVehicles={latestVehicles}
    />
  )
}
