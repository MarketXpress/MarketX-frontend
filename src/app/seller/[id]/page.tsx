import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Star,
  Store,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getSellerStorefrontData,
  getSellerProfile,
  type SellerListingSort,
} from "@/lib/listings";
import { formatUsd } from "@/lib/money";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    sort?: string;
    q?: string;
    category?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const seller = await getSellerProfile(supabase, id);

  if (!seller) return { title: "Seller not found" };

  return {
    title: `${seller.displayName} - MarketXpress Storefront`,
    description:
      seller.bio ?? `Items for sale from ${seller.displayName} on MarketXpress.`,
  };
}

const SORT_OPTIONS: { id: SellerListingSort; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
  { id: "rating", label: "Best Rated" },
];

function buildStoreUrl(
  sellerId: string,
  params: {
    sort?: string;
    q?: string;
    category?: string;
    page?: number;
  },
) {
  const sp = new URLSearchParams();
  if (params.sort && params.sort !== "newest") sp.set("sort", params.sort);
  if (params.q && params.q.trim()) sp.set("q", params.q.trim());
  if (params.category) sp.set("category", params.category);
  if (params.page && params.page > 1) sp.set("page", params.page.toString());
  const str = sp.toString();
  return `/seller/${sellerId}${str ? `?${str}` : ""}`;
}

export default async function SellerStorefrontPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const rawSearchParams = await searchParams;

  const currentSort: SellerListingSort =
    rawSearchParams.sort === "price_asc" ||
    rawSearchParams.sort === "price_desc" ||
    rawSearchParams.sort === "rating"
      ? rawSearchParams.sort
      : "newest";

  const currentQuery = (rawSearchParams.q ?? "").trim();
  const currentCategory = rawSearchParams.category || undefined;
  const currentPage = Math.max(1, parseInt(rawSearchParams.page || "1", 10) || 1);
  const pageSize = 12;

  const supabase = await createClient();

  const [seller, storefrontData] = await Promise.all([
    getSellerProfile(supabase, id),
    getSellerStorefrontData(supabase, {
      sellerId: id,
      sortBy: currentSort,
      query: currentQuery,
      categoryId: currentCategory,
      page: currentPage,
      pageSize,
    }),
  ]);

  if (!seller) notFound();

  const {
    listings,
    totalMatching,
    totalActive,
    totalPages,
    categories,
  } = storefrontData;

  const memberSince = new Date(seller.memberSince).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const hasActiveFilters = Boolean(currentQuery || currentCategory || currentSort !== "newest");

  return (
    <div className="min-h-screen bg-bg pt-20 pb-16">
      {/* ── Seller Header ── */}
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-line bg-surface-2">
            {seller.avatarUrl ? (
              <Image src={seller.avatarUrl} alt="" fill sizes="64px" className="object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-xl font-bold text-ink-faint">
                {seller.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-ink">{seller.displayName}</h1>

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
              {seller.sellerSales > 0 || seller.sellerRating > 0 ? (
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-warn text-warn" aria-hidden="true" />
                  <span className="tnum font-semibold text-ink">
                    {seller.sellerRating.toFixed(1)}
                  </span>
                  <span className="tnum">({seller.sellerSales.toLocaleString()} sales)</span>
                </span>
              ) : (
                <span>New seller</span>
              )}

              <span>Joined {memberSince}</span>

              <span className="flex items-center gap-1">
                <Store className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="tnum">{totalActive}</span>{" "}
                {totalActive === 1 ? "active listing" : "active listings"}
              </span>
            </div>

            {seller.bio && (
              <p className="mt-2 max-w-2xl text-sm text-ink-muted leading-relaxed">{seller.bio}</p>
            )}
          </div>

          {seller.stellarAddress && (
            <div className="flex items-start gap-2 rounded-md border border-ok-line bg-ok-bg px-3 py-2 sm:max-w-56">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden="true" />
              <p className="text-xs text-ink">
                Payouts settle to a verified Stellar account. Your money stays in escrow until
                you confirm delivery.
              </p>
            </div>
          )}
        </div>
      </header>

      {/* ── Main Storefront Content ── */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {totalActive === 0 ? (
          /* Entirely empty seller shop */
          <div className="rounded-lg border border-dashed border-line-strong bg-surface-2 px-6 py-16 text-center">
            <Store className="mx-auto h-8 w-8 text-ink-faint" aria-hidden="true" />
            <h2 className="mt-3 text-base font-bold text-ink">Nothing for sale right now</h2>
            <p className="mt-1 text-sm text-ink-muted">
              {seller.displayName} has no active listings.
            </p>
            <Link
              href="/marketplace"
              className="mt-5 inline-block rounded-md border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
            >
              Browse the marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ── Controls Strip: Search & Sort ── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search input form */}
              <form
                method="GET"
                action={`/seller/${id}`}
                className="relative flex-1 max-w-md flex items-center"
              >
                {currentCategory && (
                  <input type="hidden" name="category" value={currentCategory} />
                )}
                {currentSort !== "newest" && (
                  <input type="hidden" name="sort" value={currentSort} />
                )}
                <Search className="absolute left-3 h-4 w-4 text-ink-faint pointer-events-none" />
                <input
                  type="text"
                  name="q"
                  defaultValue={currentQuery}
                  placeholder={`Search ${seller.displayName}'s store…`}
                  className="w-full rounded-lg border border-line bg-surface pl-9 pr-8 py-2 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
                {currentQuery && (
                  <Link
                    href={buildStoreUrl(id, {
                      sort: currentSort,
                      category: currentCategory,
                      page: 1,
                    })}
                    className="absolute right-2.5 p-0.5 text-ink-faint hover:text-ink rounded"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </Link>
                )}
              </form>

              {/* Sort pills / selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <div className="flex items-center gap-1 text-xs text-ink-faint mr-1 shrink-0">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Sort:</span>
                </div>
                {SORT_OPTIONS.map((opt) => {
                  const isActive = currentSort === opt.id;
                  return (
                    <Link
                      key={opt.id}
                      href={buildStoreUrl(id, {
                        q: currentQuery,
                        category: currentCategory,
                        sort: opt.id,
                        page: 1,
                      })}
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-accent text-on-accent"
                          : "bg-surface border border-line text-ink-muted hover:border-line-strong hover:text-ink"
                      }`}
                    >
                      {opt.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ── Category Breakdown Chips ── */}
            {categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-line/60">
                <Link
                  href={buildStoreUrl(id, {
                    q: currentQuery,
                    sort: currentSort,
                    page: 1,
                  })}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    !currentCategory
                      ? "bg-surface-2 border border-line-strong text-ink font-bold shadow-sm"
                      : "bg-surface border border-line text-ink-muted hover:bg-surface-2"
                  }`}
                >
                  All ({totalActive})
                </Link>
                {categories.map((cat) => {
                  const isActive = currentCategory === cat.id;
                  return (
                    <Link
                      key={cat.id}
                      href={buildStoreUrl(id, {
                        q: currentQuery,
                        category: cat.id,
                        sort: currentSort,
                        page: 1,
                      })}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-surface-2 border border-line-strong text-ink font-bold shadow-sm"
                          : "bg-surface border border-line text-ink-muted hover:bg-surface-2"
                      }`}
                    >
                      {cat.name} ({cat.count})
                    </Link>
                  );
                })}
              </div>
            )}

            {/* ── Active Filter Status Bar ── */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between text-xs text-ink-muted bg-surface border border-line rounded-lg px-3 py-2">
                <span>
                  Showing <strong>{totalMatching}</strong> of <strong>{totalActive}</strong> listings
                  {currentQuery && (
                    <> for &ldquo;<strong>{currentQuery}</strong>&rdquo;</>
                  )}
                </span>
                <Link
                  href={`/seller/${id}`}
                  className="font-semibold text-bad hover:underline ml-2 shrink-0"
                >
                  Reset all filters
                </Link>
              </div>
            )}

            {/* ── Listings Grid / Filter Empty State ── */}
            {listings.length === 0 ? (
              <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center">
                <Search className="mx-auto h-8 w-8 text-ink-faint" />
                <h3 className="mt-3 text-sm font-bold text-ink">No matching listings found</h3>
                <p className="mt-1 text-xs text-ink-muted">
                  No items matched your current search or category filter.
                </p>
                <Link
                  href={`/seller/${id}`}
                  className="mt-4 inline-block rounded-md bg-surface-2 border border-line px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-surface"
                >
                  Clear filters
                </Link>
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {listings.map((listing) => (
                  <li key={listing.id}>
                    <Link
                      href={`/product/${listing.id}`}
                      className="group block overflow-hidden rounded-lg border border-line bg-surface transition-shadow hover:shadow-panel"
                    >
                      <div className="relative aspect-square bg-surface-2">
                        {listing.imageUrl ? (
                          <Image
                            src={listing.imageUrl}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-xs text-ink-faint">
                            No photograph
                          </div>
                        )}

                        {listing.discountPercent > 0 && (
                          <span className="absolute left-2 top-2 rounded bg-deal-bg px-1.5 py-0.5 text-[11px] font-bold text-deal">
                            −{listing.discountPercent}%
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 p-3">
                        <p className="line-clamp-2 text-sm text-ink">{listing.name}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="tnum text-base font-bold text-ink">
                            {formatUsd(listing.usdPrice)}
                          </span>
                          {listing.originalUsdPrice !== null &&
                            listing.originalUsdPrice > listing.usdPrice && (
                              <span className="tnum text-xs text-ink-faint line-through">
                                {formatUsd(listing.originalUsdPrice)}
                              </span>
                            )}
                        </div>
                        {listing.categoryName && (
                          <p className="text-[11px] text-ink-faint truncate">
                            {listing.categoryName}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {/* ── Pagination Controls ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4 border-t border-line">
                {currentPage > 1 ? (
                  <Link
                    href={buildStoreUrl(id, {
                      q: currentQuery,
                      category: currentCategory,
                      sort: currentSort,
                      page: currentPage - 1,
                    })}
                    className="flex items-center gap-1 rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface-2"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 rounded-md border border-line/40 bg-surface/50 px-3 py-1.5 text-xs font-semibold text-ink-faint cursor-not-allowed">
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </span>
                )}

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const isCurrent = p === currentPage;
                    return (
                      <Link
                        key={p}
                        href={buildStoreUrl(id, {
                          q: currentQuery,
                          category: currentCategory,
                          sort: currentSort,
                          page: p,
                        })}
                        className={`h-8 w-8 rounded-md flex items-center justify-center text-xs font-semibold transition-colors ${
                          isCurrent
                            ? "bg-accent text-on-accent"
                            : "bg-surface border border-line text-ink hover:bg-surface-2"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                </div>

                {currentPage < totalPages ? (
                  <Link
                    href={buildStoreUrl(id, {
                      q: currentQuery,
                      category: currentCategory,
                      sort: currentSort,
                      page: currentPage + 1,
                    })}
                    className="flex items-center gap-1 rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface-2"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 rounded-md border border-line/40 bg-surface/50 px-3 py-1.5 text-xs font-semibold text-ink-faint cursor-not-allowed">
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
