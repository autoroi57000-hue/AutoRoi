import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { ChevronRight, ExternalLink, Edit3, ArrowLeft, FileDown, ScrollText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { VehicleForm } from "@/components/admin/VehicleForm"
import type { VehicleWithAll } from "@/types/vehicle"
import { localePath } from '@/lib/constants'

interface EditAnnoncePageProps {
  params: { locale: string; id: string }
}

export default async function EditAnnoncePage({ params }: EditAnnoncePageProps) {
  const { locale, id } = params
  const supabase = await createClient()

  // Vérifier l'authentification
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`${localePath(locale, '/login')}`)
  }

  // Vérifier le profil
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const userRole = (profile as { role: string } | null)?.role
  if (!userRole || (userRole !== "admin" && userRole !== "collaborateur")) {
    redirect(`${localePath(locale, '/admin')}`)
  }

  // Charger les données du véhicule
  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select(`
      *,
      vehicle_photos (*),
      vehicle_features (*)
    `)
    .eq("id", id)
    .single()

  if (error || !vehicle) {
    notFound()
  }

  const typedVehicle = vehicle as unknown as VehicleWithAll
  const vehicleData = vehicle as any

  return (
    <div className="relative">
      {/* ===== HEADER STICKY VRAIMENT FIXE EN HAUT ===== */}
      <div className="sticky top-0 z-40 -mx-4 lg:-mx-6 -mt-4 lg:-mt-6 px-4 lg:px-6 pt-4 lg:pt-6 pb-4 bg-ar-dark/95 backdrop-blur-2xl border-b border-ar-gold/20 shadow-lg shadow-ar-gold/5">
        <div className="max-w-[1000px] mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center text-xs mb-3 text-gray-500">
            <Link 
              href={`${localePath(locale, '/admin')}`} 
              className="hover:text-ar-gold transition-colors"
            >
              Admin
            </Link>
            <ChevronRight className="h-3 w-3 mx-2 text-ar-gold/30" />
            <Link
              href={`${localePath(locale, '/admin/annonces')}`}
              className="hover:text-ar-gold transition-colors"
            >
              Annonces
            </Link>
            <ChevronRight className="h-3 w-3 mx-2 text-ar-gold/30" />
            <span className="text-ar-gold truncate max-w-[120px]">
              {vehicleData.brand} {vehicleData.model}
            </span>
          </nav>

          {/* Titre et actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-ar-gold/30 via-ar-gold/10 to-ar-gold/5 border border-ar-gold/30 flex items-center justify-center shadow-lg shadow-ar-gold/20">
                <div className="absolute inset-0 bg-ar-gold/10 blur-md rounded-xl" />
                <Edit3 className="relative h-5 w-5 text-ar-gold" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {vehicleData.brand} {vehicleData.model}
                </h1>
                <p className="text-xs text-gray-500">
                  {vehicleData.year} • {vehicleData.mileage?.toLocaleString('fr-FR')} km
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <a href={`/api/sale-contract/${id}`} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="sm"
                  className="group relative overflow-hidden border-ar-gold/30 bg-gradient-to-r from-ar-gold/20 to-ar-gold/10 text-ar-gold hover:text-white hover:border-ar-gold/60 shadow-lg shadow-ar-gold/10 transition-all duration-300 hover:shadow-xl hover:shadow-ar-gold/20"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-ar-gold/0 via-ar-gold/30 to-ar-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <ScrollText className="relative h-4 w-4 mr-1.5" />
                  <span className="relative">Contrat de vente</span>
                </Button>
              </a>
              <a href="/api/acte-vente" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="sm"
                  className="group relative overflow-hidden border-ar-gold/30 bg-gradient-to-r from-ar-dark/80 to-ar-gray/80 text-ar-gold hover:text-white hover:border-ar-gold/50 shadow-lg shadow-ar-gold/10 transition-all duration-300 hover:shadow-xl hover:shadow-ar-gold/20"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-ar-gold/0 via-ar-gold/20 to-ar-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <FileDown className="relative h-4 w-4 mr-1.5" />
                  <span className="relative">Cerfa</span>
                </Button>
              </a>
              {vehicleData.status === "publie" && vehicleData.slug && (
                <a
                  href={`${localePath(locale, `/vehicules/${vehicleData.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="group relative overflow-hidden border-ar-gold/30 bg-gradient-to-r from-ar-dark/80 to-ar-gray/80 text-ar-gold hover:text-white hover:border-ar-gold/50 shadow-lg shadow-ar-gold/10 transition-all duration-300 hover:shadow-xl hover:shadow-ar-gold/20"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-ar-gold/0 via-ar-gold/20 to-ar-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <ExternalLink className="relative h-4 w-4 mr-1.5" />
                    <span className="relative">Voir</span>
                  </Button>
                </a>
              )}
              
              {/* ===== BOUTON RETOUR STYLE 2027 ===== */}
              <Link href={`${localePath(locale, '/admin/annonces')}`}>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="group relative overflow-hidden border-ar-gold/30 bg-gradient-to-r from-ar-dark/80 to-ar-gray/80 text-ar-gold hover:text-white hover:border-ar-gold/50 shadow-lg shadow-ar-gold/10 transition-all duration-300 hover:shadow-xl hover:shadow-ar-gold/20"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-ar-gold/0 via-ar-gold/20 to-ar-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <ArrowLeft className="relative h-4 w-4 mr-1.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
                  <span className="relative">Retour</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu avec espacement pour le header */}
      <div className="pt-6 max-w-[1000px] mx-auto">
        <VehicleForm
          mode="edit"
          initialData={typedVehicle}
          isAdmin={userRole === "admin"}
        />
      </div>
    </div>
  )
}
