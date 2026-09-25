"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter, SearchX } from "lucide-react";
import FilterSidebar from "./FilterSidebar";
import ProductCard from "./ProductCard";
import type { Category } from "@/lib/listings";
import type { Product, SortOption } from "@/lib/products";
import { cn } from "@/lib/utils";

/**
 * The marketplace grid.
 *
 * Products, the page and the total arrive from the server component that
 * queried them, so this holds no data of its own — it renders what it is
 * given and writes the user's choices back to the URL, which is what causes
 * the next query.
 *
 * It used to import `mockAssets` and filter that array in memory, so the page
 * called Marketplace showed items that did not exist and never showed one a
 * seller had actually listed.
 */

interface MarketplaceSectionProps {
  products: Product[];
  categories: Category[];
  total: number;
  page: number;
  pageCount: number;
  search: string;
  sort: SortOption;
}

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Best rated",
};

export default function MarketplaceSection({
  products,
  categories,
  total,
  page,
  pageCount,
  search,
  sort,
}: MarketplaceSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const push = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const goToPage = (next: number) =>
    push((params) => {
      if (next <= 1) params.delete("page");
      else params.set("page", String(next));
    });

  const changeSort = (next: SortOption) =>
    push((params) => {
      if (next === "newest") params.delete("sort");
      else params.set("sort", next);
      params.delete("page");
    });

  const activeFilterCount = Array.from(searchParams.keys()).filter(
    (key) => key !== "q" && key !== "page" && key !== "sort",
  ).length;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Marketplace</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {search
            ? `${total} ${total === 1 ? "result" : "results"} for “${search}”`
            : "Everything currently for sale. Every purchase is held in escrow until you confirm it arrived."}
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center gap-2 rounded-md border border-line-strong bg-surface px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2 lg:hidden"
        >
          <Filter className="h-4 w-4" aria-hidden="true" />
          Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="sort" className="text-xs text-ink-faint">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(event) => changeSort(event.target.value as SortOption)}
            className="rounded-md border border-line-strong bg-surface px-2 py-1.5 text-sm text-ink focus:border-accent focus:outline-none"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        <FilterSidebar
          categories={categories}
          isDrawerOpen={isMobileFiltersOpen}
          closeDrawer={() => setIsMobileFiltersOpen(false)}
        />

        <div className="min-w-0 flex-1">
          {products.length === 0 ? (
            <div className="flex h-80 flex-col items-center justify-center rounded-lg border border-line bg-surface p-8 text-center">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-accent-soft">
                <SearchX className="h-7 w-7 text-accent" aria-hidden="true" />
              </div>
              <h2 className="mb-1 text-lg font-bold text-ink">Nothing matches</h2>
              <p className="max-w-md text-sm text-ink-muted">
                {activeFilterCount > 0 || search
                  ? "Try widening the price range or clearing a filter."
                  : "No listings are live yet. If you have something to sell, you could be the first."}
              </p>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <li key={product.id}>
                    <ProductCard product={product} />
                  </li>
                ))}
              </ul>

              {pageCount > 1 && (
                <nav
                  aria-label="Pagination"
                  className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="tnum text-sm text-ink-faint">
                    Page {page} of {pageCount} · {total} {total === 1 ? "listing" : "listings"}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => goToPage(page - 1)}
                      disabled={page <= 1}
                      className="rounded-md border border-line-strong bg-surface px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                      <button
                        key={number}
                        type="button"
                        onClick={() => goToPage(number)}
                        aria-current={number === page ? "page" : undefined}
                        className={cn(
                          "tnum rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
                          number === page
                            ? "bg-accent text-on-accent"
                            : "bg-surface-2 text-ink-muted hover:bg-surface-3",
                        )}
                      >
                        {number}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => goToPage(page + 1)}
                      disabled={page >= pageCount}
                      className="rounded-md border border-line-strong bg-surface px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
