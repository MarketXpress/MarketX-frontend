import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getMarketplaceListings, SORT_OPTIONS, type SortOption } from "@/lib/products";
import { getCategories } from "@/lib/listings";
import MarketplaceSection from "@/components/marketplace/MarketplaceSection";
import MarketplaceLoadingState from "@/components/marketplace/MarketplaceLoadingState";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Browse everything for sale on MarketXpress. Every purchase is held in Stellar escrow until the buyer confirms delivery.",
};

const PAGE_SIZE = 12;

/** Query strings come from the address bar, so every value is treated as hostile. */
function readNumber(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function readSort(value: string | undefined): SortOption {
  return SORT_OPTIONS.includes(value as SortOption) ? (value as SortOption) : "newest";
}

function readList(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * A server component, so the filtering happens in Postgres and the page
 * arrives with its results already in it.
 */
async function MarketplaceResults({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const search = typeof params.q === "string" ? params.q : "";
  const sort = readSort(typeof params.sort === "string" ? params.sort : undefined);
  const page = Math.max(1, Math.trunc(readNumber(params.page as string | undefined) ?? 1));

  const [categories, result] = await Promise.all([
    getCategories(supabase),
    getMarketplaceListings(supabase, {
      search,
      categoryIds: readList(params.category),
      minPrice: readNumber(params.minPrice as string | undefined),
      maxPrice: readNumber(params.maxPrice as string | undefined),
      minRating: readNumber(params.minRating as string | undefined),
      sort,
      page,
      pageSize: PAGE_SIZE,
    }),
  ]);

  return (
    <MarketplaceSection
      products={result.products}
      categories={categories}
      total={result.total}
      page={result.page}
      pageCount={result.pageCount}
      search={search}
      sort={sort}
    />
  );
}

export default function MarketplacePage({ searchParams }: PageProps) {
  return (
    <div className="min-h-screen bg-bg pt-24">
      {/* Keyed on the query so changing a filter shows the loading state
          rather than the previous results sitting there looking current. */}
      <Suspense fallback={<MarketplaceLoadingState />}>
        <MarketplaceResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
