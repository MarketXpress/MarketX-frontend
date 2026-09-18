"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, SearchX } from "lucide-react";
import FilterSidebar from "./FilterSidebar";
import AssetCard from "./AssetCard";
import { mockAssets } from "@/lib/mockData";
import { ScrollReveal } from "../animations/ScrollReveal";

const PAGE_SIZE = 6;

export default function MarketplaceSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Derived filtered state based purely on URL SearchParams
  const filteredAssets = useMemo(() => {
    const q = searchParams.get("q")?.trim().toLowerCase();
    const types = searchParams.getAll("type");
    const statuses = searchParams.getAll("status");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const currency = searchParams.get("currency");
    const minRating = searchParams.get("minRating");

    const searchTerms = q ? q.split(/\s+/).filter(Boolean) : [];

    return mockAssets.filter((asset) => {
      if (searchTerms.length > 0) {
        const assetText = [
          asset.name,
          asset.sellerName,
          asset.assetType,
          asset.escrowStatus,
          asset.priceCurrency,
        ]
          .join(" ")
          .toLowerCase();

        const priceString = String(asset.priceAmount);

        if (!searchTerms.every((term) => assetText.includes(term) || priceString.includes(term))) {
          return false;
        }
      }

      if (types.length > 0 && !types.includes(asset.assetType)) return false;
      if (statuses.length > 0 && !statuses.includes(asset.escrowStatus)) return false;
      if (currency && currency !== "All" && asset.priceCurrency !== currency) return false;
      if (minPrice && asset.priceAmount < parseFloat(minPrice)) return false;
      if (maxPrice && asset.priceAmount > parseFloat(maxPrice)) return false;
      if (minRating && minRating !== "All" && asset.sellerRating < parseFloat(minRating)) return false;

      return true;
    });
  }, [searchParams]);

  const rawPage = Number(searchParams.get("page") || "1");
  const currentPage = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / PAGE_SIZE));
  const totalCount = filteredAssets.length;
  const page = Math.min(currentPage, totalPages);
  const paginatedAssets = filteredAssets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasMore = page < totalPages;

  const goToPage = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (pageNumber <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(pageNumber));
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const activeFiltersCount = Array.from(searchParams.keys()).filter((k) => k !== "q" && k !== "page").length;

  return (
    <section id="explore" className="relative z-10 max-w-7xl mx-auto px-6 py-16 w-full min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <ScrollReveal className="flex flex-col gap-3">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-ink">Marketplace</h2>
          <p className="text-ink-faint max-w-xl">
            {searchParams.get("q")
              ? `Results for "${searchParams.get("q")}" (${totalCount} total)`
              : "Discover verified assets currently secured in escrow."}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2} className="w-full md:w-auto flex justify-between items-center bg-surface border border-line p-2 rounded-xl lg:hidden">
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-on-accent font-bold rounded-lg transition-colors text-sm"
            >
              <Filter className="w-4 h-4" /> Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
            <span className="text-sm font-medium text-ink-faint px-4">
               {`${totalCount} Results`}
            </span>
        </ScrollReveal>
      </div>

      <div className="flex gap-8 grow relative">
        <FilterSidebar
          key={searchParams.toString()}
          isDrawerOpen={isMobileFiltersOpen}
          closeDrawer={() => setIsMobileFiltersOpen(false)}
        />

        <div className="flex-1 w-full">
          {paginatedAssets.length > 0 ? (
            // Loaded State
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {paginatedAssets.map((asset, i) => (
                  <AssetCard key={asset.id} asset={asset} delay={Math.min(0.1 * i, 0.5)} />
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-ink-faint">
                  Showing {paginatedAssets.length} of {filteredAssets.length} results
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                        pageNumber === page
                          ? "bg-accent text-on-accent"
                          : "bg-surface-2 text-ink-faint hover:bg-surface-3"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  {hasMore && (
                    <button
                      onClick={() => goToPage(page + 1)}
                      className="rounded-lg px-3 py-1.5 text-sm font-semibold bg-surface-2 text-ink-muted hover:bg-surface-3"
                    >
                      Load more
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            // No Results State
            <div className="w-full h-80 flex flex-col items-center justify-center bg-surface border border-line rounded-2xl text-center p-8">
              <div className="w-16 h-16 bg-accent-soft rounded-full flex items-center justify-center mb-5">
                <SearchX className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">No assets found</h3>
              <p className="text-ink-faint max-w-md text-sm">
                We couldn&apos;t find anything matching your current filters and search criteria. Try adjusting your parameters.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
