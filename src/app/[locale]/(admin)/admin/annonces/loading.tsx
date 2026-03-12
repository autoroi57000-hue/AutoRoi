import { Skeleton } from "@/components/ui/skeleton"

export default function AnnoncesLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64 bg-ar-gold/10" />
        <Skeleton className="h-10 w-40 bg-ar-gold/20 rounded-xl" />
      </div>

      {/* Filters skeleton */}
      <div className="flex gap-4 bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 p-5 rounded-xl border border-ar-gold/10 backdrop-blur-sm">
        <Skeleton className="h-10 flex-1 bg-ar-gold/5" />
        <Skeleton className="h-10 w-44 bg-ar-gold/5" />
        <Skeleton className="h-10 w-44 bg-ar-gold/5" />
        <Skeleton className="h-10 w-36 bg-ar-gold/5" />
      </div>

      {/* Table skeleton */}
      <div className="bg-gradient-to-br from-ar-gray/80 to-ar-dark/90 rounded-xl border border-ar-gold/10 overflow-hidden backdrop-blur-sm">
        <div className="p-4 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full bg-ar-gold/5" />
          ))}
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48 bg-ar-gold/5" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 bg-ar-gold/5" />
          <Skeleton className="h-10 w-10 bg-ar-gold/5" />
          <Skeleton className="h-10 w-10 bg-ar-gold/5" />
        </div>
      </div>
    </div>
  )
}
