"use client";
export default function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
      {/* Image area */}
      <div className="relative h-36 bg-gray-100 flex items-center justify-center">
        <div className="w-16 h-16 bg-gray-200 rounded-lg" />
        <div className="absolute top-2 left-2 w-10 h-4 bg-gray-200 rounded" />
        <div className="absolute top-2 right-2 w-12 h-4 bg-gray-200 rounded" />
      </div>
      {/* Body */}
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-5 bg-gray-100 rounded w-1/2 mt-1" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded-full" />
          <div className="h-3 bg-gray-100 rounded w-16" />
        </div>
        <div className="h-7 bg-gray-100 rounded-md w-full mt-1" />
      </div>
    </div>
  );
}
