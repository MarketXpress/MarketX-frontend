"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Heart, User, Store } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);

  if (pathname.startsWith("/auth")) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3">
      {/* Wordmark */}
      <Link href="/" className="flex items-center gap-1.5 shrink-0">
        <span className="w-2 h-2 rounded-full bg-emerald-600" />
        <span className="text-[15px] font-black text-gray-900 tracking-tight">MarketXpress</span>
      </Link>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-1 max-w-xl mx-auto h-9">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, brands, categories…"
          className="flex-1 border border-gray-200 border-r-0 rounded-l-md px-3 text-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-500 focus:bg-white transition-colors"
        />
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 rounded-r-md text-sm font-semibold transition-colors shrink-0"
        >
          Search
        </button>
      </form>

      {/* Right icons */}
      <div className="flex items-center gap-1 shrink-0">
        {!user && (
          <Link
            href="/auth/register"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-colors"
          >
            <Store className="w-3.5 h-3.5" />
            Sell on MX
          </Link>
        )}

        <Link href="/dashboard/wishlist" className="relative p-2 text-gray-500 hover:text-emerald-600 transition-colors">
          <Heart className="w-5 h-5" />
        </Link>

        <Link href="/dashboard/orders" className="relative p-2 text-gray-500 hover:text-emerald-600 transition-colors">
          <ShoppingCart className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">3</span>
        </Link>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setAccountOpen((v) => !v)}
              className="flex items-center gap-1.5 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                {user.email.charAt(0).toUpperCase()}
              </div>
            </button>
            {accountOpen && (
              <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-900 truncate">{user.email}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{user.role.toLowerCase()}</p>
                </div>
                <Link href="/dashboard/orders" onClick={() => setAccountOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">My Orders</Link>
                <Link href="/dashboard/selling" onClick={() => setAccountOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Selling Dashboard</Link>
                <Link href="/dashboard/wallet" onClick={() => setAccountOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Wallet</Link>
                <Link href="/profile" onClick={() => setAccountOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                <button onClick={() => { logout(); setAccountOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/auth/login" className="p-2 text-gray-500 hover:text-emerald-600 transition-colors">
            <User className="w-5 h-5" />
          </Link>
        )}
      </div>
    </header>
  );
}
