import ProductCardSkeleton from "@/components/marketplace/ProductCardSkeleton";

export default function SellerLoading() {
  return (
    <div className="min-h-screen bg-bg pt-24" aria-label="Loading seller storefront" role="status">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-line bg-surface-2 animate-pulse" />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-6 w-48 rounded bg-surface-2 animate-pulse" />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <div className="h-4 w-28 rounded bg-surface-2 animate-pulse" />
              <div className="h-4 w-24 rounded bg-surface-2 animate-pulse" />
              <div className="h-4 w-20 rounded bg-surface-2 animate-pulse" />
            </div>
            <div className="h-4 w-3/4 max-w-lg rounded bg-surface-2 animate-pulse" />
          </div>

          <div className="hidden h-16 w-56 rounded-md bg-surface-2 animate-pulse sm:block" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <li key={i}>
              <ProductCardSkeleton />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
