import ProductCardSkeleton from "@/components/marketplace/ProductCardSkeleton";

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-bg" aria-label="Loading product details" role="status">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-20">
        {/* Breadcrumb skeleton */}
        <div className="mb-6 flex items-center gap-2">
          <div className="h-3 w-12 rounded bg-surface-2 animate-pulse" />
          <div className="h-3 w-3 rounded bg-surface-2 animate-pulse" />
          <div className="h-3 w-16 rounded bg-surface-2 animate-pulse" />
          <div className="h-3 w-3 rounded bg-surface-2 animate-pulse" />
          <div className="h-3 w-32 rounded bg-surface-2 animate-pulse" />
        </div>

        {/* Back button skeleton */}
        <div className="mb-6 h-4 w-24 rounded bg-surface-2 animate-pulse" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: Gallery skeleton */}
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-surface-2 animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-16 w-16 rounded-lg border border-line bg-surface-2 animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Right: Product details skeleton */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="h-4 w-24 rounded bg-surface-2 animate-pulse" />
              <div className="h-8 w-3/4 rounded bg-surface-2 animate-pulse" />
              <div className="flex items-center gap-3">
                <div className="h-4 w-20 rounded bg-surface-2 animate-pulse" />
                <div className="h-4 w-24 rounded bg-surface-2 animate-pulse" />
              </div>
            </div>

            {/* Price box skeleton */}
            <div className="rounded-xl border border-line bg-surface p-4 space-y-3">
              <div className="h-8 w-36 rounded bg-surface-2 animate-pulse" />
              <div className="h-4 w-28 rounded bg-surface-2 animate-pulse" />
            </div>

            {/* Actions skeleton */}
            <div className="flex gap-3">
              <div className="h-11 flex-1 rounded-lg bg-surface-2 animate-pulse" />
              <div className="h-11 w-11 rounded-lg bg-surface-2 animate-pulse" />
              <div className="h-11 w-11 rounded-lg bg-surface-2 animate-pulse" />
            </div>

            {/* Seller info card skeleton */}
            <div className="rounded-xl border border-line bg-surface p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-surface-2 animate-pulse" />
                <div className="space-y-1">
                  <div className="h-4 w-28 rounded bg-surface-2 animate-pulse" />
                  <div className="h-3 w-20 rounded bg-surface-2 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related products skeleton */}
        <div className="mt-16 space-y-4">
          <div className="h-6 w-40 rounded bg-surface-2 animate-pulse" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
