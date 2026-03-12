import type { VehicleCard as VehicleCardType } from '@/types/vehicle'
import { VehicleCard } from './VehicleCard'

interface VehicleGridProps {
  vehicles: VehicleCardType[]
  locale?: string
}

export function VehicleGrid({ vehicles, locale = 'fr' }: VehicleGridProps) {
  if (!vehicles.length) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-ar-gray bg-ar-black">
        <p className="text-ar-silver/60">Aucun véhicule disponible.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} locale={locale} />
      ))}
    </div>
  )
}
