import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64 bg-ar-gold/10" />
        <Skeleton className="h-6 w-32 bg-ar-gold/5" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 border border-ar-gold/10 rounded-xl p-6 backdrop-blur-sm">
            <Skeleton className="h-4 w-32 mb-4 bg-ar-gold/10" />
            <Skeleton className="h-10 w-16 bg-ar-gold/20" />
          </div>
        ))}
      </div>

      {/* CTA skeleton */}
      <div className="flex justify-center py-4">
        <Skeleton className="h-14 w-48 rounded-xl bg-ar-gold/20" />
      </div>

      {/* Latest vehicles skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 bg-ar-gold/10" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 border border-ar-gold/10 rounded-xl overflow-hidden backdrop-blur-sm">
              <Skeleton className="aspect-video w-full bg-ar-gold/5" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-full bg-ar-gold/10" />
                <Skeleton className="h-4 w-20 bg-ar-gold/20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
