"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, SearchX } from "lucide-react";
import FilterSidebar from "./FilterSidebar";
import AssetCard from "./AssetCard";
import AssetCardSkeleton from "./AssetCardSkeleton";
import { mockAssets } from "@/lib/mockData";
import { ScrollReveal } from "../animations/ScrollReveal";

const PAGE_SIZE = 6;

export default function MarketplaceSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate network latency when filters change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [searchParams]);

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
    <section id="explore" className="relative z-10 max-w-7xl mx-auto px-6 py-32 w-full min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <ScrollReveal className="flex flex-col gap-4">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Marketplace</h2>
          <p className="text-neutral-400 max-w-xl">
            {searchParams.get("q") 
              ? `Results for "${searchParams.get("q")}" (${filteredAssets.totalCount} total)`
              : "Discover verified assets currently secured in escrow."}
          </p>
        </ScrollReveal>
        
        <ScrollReveal delay={0.2} className="w-full md:w-auto flex justify-between items-center bg-white/5 border border-white/10 p-2 rounded-2xl lg:hidden">
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
            >
              <Filter className="w-4 h-4" /> Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
            <span className="text-sm font-medium text-neutral-400 px-4">
               {isLoading ? "Loading..." : `${filteredAssets.totalCount} Results`}
            </span>
        </ScrollReveal>
      </div>

      <div className="flex gap-10 flex-grow relative">
        <FilterSidebar 
          isDrawerOpen={isMobileFiltersOpen} 
          closeDrawer={() => setIsMobileFiltersOpen(false)} 
        />
        
        <div className="flex-1 w-full">
          {isLoading ? (
            // Skeleton State
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <AssetCardSkeleton key={i} />
              ))}
            </div>
          ) : paginatedAssets.length > 0 ? (
            // Loaded State
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                {paginatedAssets.map((asset, i) => (
                  <AssetCard key={asset.id} asset={asset} delay={Math.min(0.1 * i, 0.5)} />
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-neutral-400">
                  Showing {paginatedAssets.length} of {filteredAssets.length} results
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-all ${
                        pageNumber === page
                          ? "bg-blue-600 text-white"
                          : "bg-white/5 text-neutral-300 hover:bg-white/10"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  {hasMore && (
                    <button
                      onClick={() => goToPage(page + 1)}
                      className="rounded-2xl px-4 py-2 text-sm font-semibold bg-white/10 text-white hover:bg-white/20"
                    >
                      Load more
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            // No Results State
            <div className="w-full h-96 flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-[3rem] text-center p-8">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                <SearchX className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No assets found</h3>
              <p className="text-neutral-400 max-w-md">
                We couldn't find anything matching your current filters and search criteria. Try adjusting your parameters.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
