"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/marketplace/ProductCard";
import MarketplaceEmptyState from "@/components/marketplace/MarketplaceEmptyState";
import { mockProducts } from "@/lib/mockData";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();

  const filteredProducts = useMemo(() => {
    if (!normalizedQuery) return [];

    return mockProducts.filter((product) =>
      [
        product.name,
        product.category,
        product.seller,
        product.description ?? "",
      ].some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [normalizedQuery]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-gray-900">
              {query ? (
                <>{filteredProducts.length} results for "{query}"</>
              ) : (
                "Search products"
              )}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Browse matching products from the marketplace catalog.
            </p>
          </div>
          <Link
            href="/marketplace"
            className="shrink-0 rounded-md border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            Marketplace
          </Link>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white">
            <MarketplaceEmptyState
              title={query ? "No products found" : "Start a product search"}
              message={
                query
                  ? "Try a different product name, category, or seller."
                  : "Use the search box above to find products by name, category, or seller."
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
