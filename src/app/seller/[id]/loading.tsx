export default function SellerStorefrontLoading() {
  return (
    <div className="min-h-screen bg-bg pt-24" aria-busy="true" aria-label="Loading seller storefront">
      {/* ------------------------------------------------------------------ */}
      {/* Header skeleton matching seller storefront header layout */}
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center">
          <div className="h-16 w-16 shrink-0 animate-pulse rounded-full border border-line bg-surface-2" />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-6 w-48 animate-pulse rounded bg-surface-2" />

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <div className="h-4 w-28 animate-pulse rounded bg-surface-3" />
              <div className="h-4 w-24 animate-pulse rounded bg-surface-3" />
              <div className="h-4 w-20 animate-pulse rounded bg-surface-3" />
            </div>

            <div className="h-3.5 w-full max-w-md animate-pulse rounded bg-surface-3" />
          </div>

          <div className="hidden h-14 w-52 shrink-0 animate-pulse rounded-md bg-surface-2 sm:block" />
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Active listings grid skeleton matching real product cards */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <li
              key={i}
              className="overflow-hidden rounded-lg border border-line bg-surface animate-pulse"
            >
              <div className="aspect-square bg-surface-2" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-5/6 rounded bg-surface-2" />
                <div className="h-4 w-1/3 rounded bg-surface-3" />
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
