"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Filter, SearchX } from "lucide-react";
import FilterSidebar from "./FilterSidebar";
import AssetCard from "./AssetCard";
import AssetCardSkeleton from "./AssetCardSkeleton";
import { mockAssets } from "@/lib/mockData";
import { ScrollReveal } from "../animations/ScrollReveal";

export default function MarketplaceSection() {
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
    const q = searchParams.get("q")?.toLowerCase();
    const types = searchParams.getAll("type");
    const statuses = searchParams.getAll("status");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const currency = searchParams.get("currency");
    const minRating = searchParams.get("minRating");

    return mockAssets.filter((asset) => {
      // 1. Search Query
      if (q && !asset.name.toLowerCase().includes(q) && !asset.sellerName.toLowerCase().includes(q)) return false;
      
      // 2. Asset Type
      if (types.length > 0 && !types.includes(asset.assetType)) return false;

      // 3. Escrow Status
      if (statuses.length > 0 && !statuses.includes(asset.escrowStatus)) return false;

      // 4. Currency
      if (currency && currency !== "All" && asset.priceCurrency !== currency) return false;

      // 5. Min Price
      if (minPrice && asset.priceAmount < parseFloat(minPrice)) return false;

      // 6. Max Price
      if (maxPrice && asset.priceAmount > parseFloat(maxPrice)) return false;

      // 7. Seller Rating
      if (minRating && minRating !== "All" && asset.sellerRating < parseFloat(minRating)) return false;

      return true;
    });
  }, [searchParams]);

  const activeFiltersCount = Array.from(searchParams.keys()).filter(k => k !== "q").length;

  return (
    <section id="explore" className="relative z-10 max-w-7xl mx-auto px-6 py-32 w-full min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <ScrollReveal className="flex flex-col gap-4">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Marketplace</h2>
          <p className="text-neutral-400 max-w-xl">
            {searchParams.get("q") 
              ? `Results for "${searchParams.get("q")}"`
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
               {isLoading ? "Loading..." : `${filteredAssets.length} Results`}
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
          ) : filteredAssets.length > 0 ? (
            // Loaded State
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {filteredAssets.map((asset, i) => (
                <AssetCard key={asset.id} asset={asset} delay={Math.min(0.1 * i, 0.5)} />
              ))}
            </div>
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
