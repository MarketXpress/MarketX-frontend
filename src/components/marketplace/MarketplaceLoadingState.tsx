import ProductCardSkeleton from "./ProductCardSkeleton";

/**
 * Shown while the marketplace query runs.
 *
 * A grid of card-shaped placeholders rather than a spinner, so the layout does
 * not jump when the real listings land. It was a centred spinner with a blue
 * border — the one colour not in the palette.
 */
export default function MarketplaceLoadingState() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="mb-6 space-y-2">
        <div className="h-7 w-48 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-surface-2" />
      </div>

      <div className="flex gap-6">
        <div className="hidden w-56 shrink-0 lg:block">
          <div className="h-80 animate-pulse rounded-lg bg-surface-2" />
        </div>

        <ul className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <li key={index}>
              <ProductCardSkeleton />
            </li>
          ))}
        </ul>
      </div>

      <span className="sr-only" role="status">
        Loading listings
      </span>
    </section>
  );
}
