"use client";

import { useEffect, useState } from "react";
import DashboardSubnav from "@/components/dashboard/DashboardSubnav";
import ProductCard from "@/components/marketplace/ProductCard";
import { getWishlist } from "@/lib/wishlistStore";
import { createClient } from "@/lib/supabase/client";
import { getProductsByIds, type Product } from "@/lib/products";

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

  useEffect(() => {
    const reload = () => setWishlistIds(getWishlist());
    reload();
    window.addEventListener("wishlist-change", reload);
    return () => window.removeEventListener("wishlist-change", reload);
  }, []);

  // The saved ids still come from localStorage; the listings behind them now
  // come from the database. Moving the ids themselves into `wishlist_items`
  // is what will make a wishlist follow the account onto another device.
  useEffect(() => {
    let active = true;

    // No early return for an empty list: `getProductsByIds` already answers
    // `[]` for one. Short-circuiting here would mean calling setState
    // synchronously in the effect body, which triggers a cascading render.
    getProductsByIds(createClient(), wishlistIds)
      .then((products) => {
        if (active) setWishlistItems(products);
      })
      .catch(() => {
        if (active) setWishlistItems([]);
      });

    return () => {
      active = false;
    };
  }, [wishlistIds]);

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
