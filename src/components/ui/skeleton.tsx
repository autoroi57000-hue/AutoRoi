"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-ar-gray-100",
        className
      )}
    />
  );
}

// Shimmer effect skeleton
function SkeletonShimmer({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-ar-gray-100",
        className
      )}
    >
      <div className="shimmer absolute inset-0" />
    </div>
  );
}

// Vehicle Card Skeleton
function VehicleCardSkeleton() {
  return (
    <div className="card-ar relative overflow-hidden">
      {/* Image */}
      <SkeletonShimmer className="aspect-[4/3] w-full" />
      
      {/* Content */}
      <div className="p-5">
        {/* Price */}
        <Skeleton className="mb-3 h-8 w-32" />
        
        {/* Title */}
        <Skeleton className="mb-2 h-6 w-3/4" />
        
        {/* Subtitle */}
        <Skeleton className="mb-4 h-4 w-1/2" />
        
        {/* Specs */}
        <div className="flex gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

// Vehicle Grid Skeleton
function VehicleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <VehicleCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Vehicle Detail Skeleton
function VehicleDetailSkeleton() {
  return (
    <div className="min-h-screen bg-ar-gray-100">
      {/* Header */}
      <div className="bg-ar-black py-12">
        <div className="container mx-auto px-4">
          <Skeleton className="mb-4 h-4 w-32 bg-ar-gray-700" />
          <Skeleton className="h-10 w-96 bg-ar-gray-700" />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left: Images */}
          <div className="space-y-4">
            <SkeletonShimmer className="aspect-[4/3] w-full rounded-xl" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonShimmer key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="space-y-6">
            {/* Price */}
            <Skeleton className="h-12 w-48" />
            
            {/* Title */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-ar-gray-200 bg-white p-4">
                  <Skeleton className="mb-2 h-4 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="rounded-xl bg-ar-black p-6">
              <Skeleton className="mb-4 h-6 w-48 bg-ar-gray-700" />
              <div className="flex gap-3">
                <Skeleton className="h-12 flex-1 bg-ar-gray-700" />
                <Skeleton className="h-12 flex-1 bg-ar-gray-700" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Admin Table Skeleton
function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-ar-gray-200 bg-white">
      {/* Header */}
      <div className="grid grid-cols-6 gap-4 border-b border-ar-gray-200 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid grid-cols-6 gap-4 border-b border-ar-gray-100 p-4 last:border-0"
        >
          {Array.from({ length: 6 }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn(
                "h-5",
                colIndex === 0 ? "w-3/4" : "w-full"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Hero Section Skeleton
function HeroSkeleton() {
  return (
    <div className="relative h-screen bg-ar-black">
      {/* Background */}
      <div className="absolute inset-0">
        <SkeletonShimmer className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-ar-black via-ar-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        <Skeleton className="mb-6 h-12 w-12 rounded-full bg-ar-gray-700" />
        <Skeleton className="mb-4 h-16 w-64 bg-ar-gray-700" />
        <Skeleton className="mb-8 h-6 w-96 bg-ar-gray-700" />
        <Skeleton className="mb-4 h-1 w-32 bg-ar-gray-700" />
        <Skeleton className="h-8 w-48 bg-ar-gray-700" />

        {/* Search Bar */}
        <div className="absolute bottom-32 left-4 right-4 md:left-8 md:right-8">
          <div className="mx-auto max-w-5xl">
            <Skeleton className="h-20 rounded-xl bg-white/10 backdrop-blur" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats Section Skeleton
function StatsSkeleton() {
  return (
    <div className="bg-ar-black py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <Skeleton className="mb-2 h-16 w-32 bg-ar-gray-700" />
              <Skeleton className="h-5 w-48 bg-ar-gray-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Form Skeleton
function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      ))}
      <Skeleton className="h-12 w-full rounded-md" />
    </div>
  );
}

// Contact Info Skeleton
function ContactInfoSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-ar-gray-200 bg-white p-4"
        >
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Dashboard Stats Skeleton
function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-ar-gray-200 bg-white p-6"
        >
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-10 w-16" />
        </div>
      ))}
    </div>
  );
}

export {
  Skeleton,
  SkeletonShimmer,
  VehicleCardSkeleton,
  VehicleGridSkeleton,
  VehicleDetailSkeleton,
  AdminTableSkeleton,
  HeroSkeleton,
  StatsSkeleton,
  FormSkeleton,
  ContactInfoSkeleton,
  DashboardStatsSkeleton,
};
