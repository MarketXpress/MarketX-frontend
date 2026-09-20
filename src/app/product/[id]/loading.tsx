export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-bg" aria-busy="true" aria-label="Loading product details">
      <div className="mx-auto max-w-6xl px-4 pt-20 pb-12">
        {/* Breadcrumb skeleton */}
        <div className="mb-6 flex items-center gap-2">
          <div className="h-3.5 w-12 animate-pulse rounded bg-surface-3" />
          <span className="text-xs text-ink-faint">/</span>
          <div className="h-3.5 w-20 animate-pulse rounded bg-surface-3" />
          <span className="text-xs text-ink-faint">/</span>
          <div className="h-3.5 w-32 animate-pulse rounded bg-surface-3" />
        </div>

        {/* Back button skeleton */}
        <div className="mb-6 h-4 w-28 animate-pulse rounded bg-surface-3" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* ── Left: Image Gallery Skeleton ── */}
          <div className="space-y-3">
            <div className="aspect-square overflow-hidden rounded-2xl border border-line bg-surface-2 animate-pulse" />

            <div className="flex gap-2">
              <div className="h-16 w-16 animate-pulse rounded-lg border border-line bg-surface-2" />
              <div className="h-16 w-16 animate-pulse rounded-lg border border-line bg-surface-2" />
              <div className="h-16 w-16 animate-pulse rounded-lg border border-line bg-surface-2" />
            </div>
          </div>

          {/* ── Right: Details & Purchase Skeleton ── */}
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-surface-3" />
              <div className="h-7 w-5/6 animate-pulse rounded bg-surface-2" />
              <div className="flex items-center gap-3 pt-1">
                <div className="h-4 w-24 animate-pulse rounded bg-surface-3" />
                <div className="h-4 w-32 animate-pulse rounded bg-surface-3" />
              </div>
            </div>

            {/* Price block skeleton */}
            <div className="space-y-3 rounded-xl border border-line bg-surface p-4">
              <div className="flex items-baseline gap-3">
                <div className="h-8 w-28 animate-pulse rounded bg-surface-2" />
                <div className="h-5 w-20 animate-pulse rounded bg-surface-3" />
              </div>
              <div className="h-4 w-48 animate-pulse rounded bg-surface-3" />
            </div>

            {/* CTA action buttons */}
            <div className="flex gap-3">
              <div className="h-11 flex-1 animate-pulse rounded-lg bg-surface-2" />
              <div className="h-11 flex-1 animate-pulse rounded-lg bg-surface-2" />
            </div>

            {/* Escrow guarantee skeleton */}
            <div className="h-20 animate-pulse rounded-xl border border-line bg-surface-2" />

            {/* Description skeleton */}
            <div className="space-y-2.5 rounded-xl border border-line bg-surface p-5">
              <div className="h-4 w-28 animate-pulse rounded bg-surface-2" />
              <div className="h-3.5 w-full animate-pulse rounded bg-surface-3" />
              <div className="h-3.5 w-11/12 animate-pulse rounded bg-surface-3" />
              <div className="h-3.5 w-4/5 animate-pulse rounded bg-surface-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
