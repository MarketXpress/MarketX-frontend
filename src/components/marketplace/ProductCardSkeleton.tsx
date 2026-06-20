"use client";

export default function ProductCardSkeleton() {
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse h-full"
      aria-hidden="true"
    >
      <div className="relative h-36 bg-gray-100 flex items-center justify-center">
        <div className="w-16 h-16 bg-gray-200 rounded-lg" />
        <div className="absolute top-2 left-2 h-4 w-10 bg-gray-200 rounded" />
        <div className="absolute top-2 right-2 h-4 w-12 bg-gray-200 rounded" />
      </div>

      <div className="p-3">
        <div className="space-y-1.5 mb-2 min-h-[2.5rem]">
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-4/5" />
        </div>

        <div className="flex items-baseline gap-1.5 mb-1">
          <div className="h-5 bg-gray-100 rounded w-16" />
          <div className="h-3 bg-gray-100 rounded w-10" />
        </div>
        <div className="h-3 bg-gray-100 rounded w-20 mb-3" />

        <div className="flex items-center gap-1 mb-3">
          <div className="w-3 h-3 bg-gray-100 rounded-full" />
          <div className="h-3 bg-gray-100 rounded w-8" />
          <div className="h-3 bg-gray-100 rounded w-10" />
        </div>

        <div className="h-7 bg-emerald-50 border border-emerald-100 rounded-md" />
      </div>
    </div>
  );
}
