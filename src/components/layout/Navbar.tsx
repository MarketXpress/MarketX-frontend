"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Heart, User, Store } from "lucide-react";
import { KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import CartDrawer, { getCartCount, subscribeToCart } from "./CartDrawer";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Keep cart badge in sync
  useEffect(() => {
    setCartCount(getCartCount());
    return subscribeToCart(() => setCartCount(getCartCount()));
  }, []);

  const closeCart = useCallback(() => setCartOpen(false), []);

  const closeAccountMenu = (restoreFocus = true) => {
    setAccountOpen(false);

    if (restoreFocus) {
      accountButtonRef.current?.focus();
    }
  };

  const getAccountMenuItems = () =>
    Array.from(accountMenuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  useEffect(() => {
    if (!accountOpen) return;

    getAccountMenuItems()[0]?.focus();
  }, [accountOpen]);

  const handleAccountButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (["ArrowDown", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      setAccountOpen(true);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setAccountOpen(true);
      requestAnimationFrame(() => getAccountMenuItems().at(-1)?.focus());
    }
  };

  const handleAccountMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const menuItems = getAccountMenuItems();
    const activeIndex = menuItems.findIndex((item) => item === document.activeElement);

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        closeAccountMenu();
        break;
      case "Tab": {
        e.preventDefault();
        const nextIndex = e.shiftKey
          ? (activeIndex - 1 + menuItems.length) % menuItems.length
          : (activeIndex + 1) % menuItems.length;
        menuItems[nextIndex]?.focus();
        break;
      }
      case "ArrowDown":
        e.preventDefault();
        menuItems[(activeIndex + 1) % menuItems.length]?.focus();
        break;
      case "ArrowUp":
        e.preventDefault();
        menuItems[(activeIndex - 1 + menuItems.length) % menuItems.length]?.focus();
        break;
      case "Home":
        e.preventDefault();
        menuItems[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        menuItems.at(-1)?.focus();
        break;
      default:
        break;
    }
  };

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

        <button
          onClick={() => setCartOpen(true)}
          className="relative p-2 text-gray-500 hover:text-emerald-600 transition-colors"
          aria-label={`Shopping cart, ${cartCount} items`}
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-[3px]">
              {cartCount}
            </span>
          )}
        </button>

        {user ? (
          <div className="relative">
            <button
              ref={accountButtonRef}
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              aria-controls="account-menu"
              aria-label="Account menu"
              onClick={() => setAccountOpen((v) => !v)}
              onKeyDown={handleAccountButtonKeyDown}
              className="flex items-center gap-1.5 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                {user.email.charAt(0).toUpperCase()}
              </div>
            </button>
            {accountOpen && (
              <div
                id="account-menu"
                ref={accountMenuRef}
                role="menu"
                aria-label="Account menu"
                onKeyDown={handleAccountMenuKeyDown}
                className="absolute right-0 top-10 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50"
              >
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-900 truncate">{user.email}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{user.role.toLowerCase()}</p>
                </div>
                <Link href="/dashboard/orders" role="menuitem" tabIndex={-1} onClick={() => setAccountOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none">My Orders</Link>
                <Link href="/dashboard/selling" role="menuitem" tabIndex={-1} onClick={() => setAccountOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none">Selling Dashboard</Link>
                <Link href="/dashboard/wallet" role="menuitem" tabIndex={-1} onClick={() => setAccountOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none">Wallet</Link>
                <Link href="/profile" role="menuitem" tabIndex={-1} onClick={() => setAccountOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none">Profile</Link>
                <button role="menuitem" tabIndex={-1} onClick={() => { logout(); setAccountOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none">Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/auth/login" className="p-2 text-gray-500 hover:text-emerald-600 transition-colors">
            <User className="w-5 h-5" />
          </Link>
        )}
      </div>

      {/* Cart drawer */}
      <CartDrawer isOpen={cartOpen} onClose={closeCart} />
    </header>
  );
}
