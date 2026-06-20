"use client";

import { useEffect, useState } from "react";
import DashboardSubnav from "@/components/dashboard/DashboardSubnav";
import ProductCard from "@/components/marketplace/ProductCard";
import { mockProducts } from "@/lib/mockData";
import { getWishlist } from "@/lib/wishlistStore";

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    const reload = () => setWishlistIds(getWishlist());
    reload();
    window.addEventListener("wishlist-change", reload);
    return () => window.removeEventListener("wishlist-change", reload);
  }, []);

  const wishlistItems = mockProducts.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-14">
        <DashboardSubnav title="My Account" />

        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-black text-gray-900">My Wishlist</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {wishlistItems.length} saved items
              </p>
            </div>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
              <p className="text-2xl mb-2">♡</p>
              <p className="text-sm font-bold text-gray-900 mb-1">
                Your wishlist is empty
              </p>
              <p className="text-xs text-gray-500">
                Save items you love by clicking the heart icon on any product.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {wishlistItems.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
