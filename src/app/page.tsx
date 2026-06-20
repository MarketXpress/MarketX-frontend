import { Suspense } from "react";
import HeroBanners from "@/components/home/HeroBanners";
import FlashSaleSection from "@/components/home/FlashSaleSection";
import CategoryChips from "@/components/home/CategoryChips";
import HomeFooter from "@/components/home/HomeFooter";
import ProductCard from "@/components/marketplace/ProductCard";
import { mockProducts } from "@/lib/mockData";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-0">
        {/* Hero banners */}
        <section className="mb-6">
          <HeroBanners />
        </section>

        {/* Flash sale */}
        <section className="mb-8">
          <Suspense>
            <FlashSaleSection />
          </Suspense>
        </section>

        {/* Category chips */}
        <section className="mb-8">
          <CategoryChips />
        </section>

        {/* New Arrivals product grid */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-gray-900">🆕 New Arrivals</h2>
            <span className="text-xs font-semibold text-emerald-600 cursor-pointer hover:text-emerald-700">
              View All →
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {mockProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>

      <HomeFooter />
    </div>
  );
}
