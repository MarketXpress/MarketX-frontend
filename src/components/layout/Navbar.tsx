"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Heart, User, Store } from "lucide-react";
import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useAuth } from "@/context/AuthContext";
import CartDrawer from "./CartDrawer";
import { getCartCount, subscribeToCart } from "@/lib/cartStore";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [query, setQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Read from the cart store rather than mirrored into state. Seeding state
  // from localStorage during render made the server and browser disagree, and
  // the server cannot know what is in a cart — hence the third argument.
  const cartCount = useSyncExternalStore(subscribeToCart, getCartCount, () => 0);

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
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-surface border-b border-line flex items-center px-4 gap-3">
      {/* Wordmark */}
      <Link href="/" className="flex items-center gap-1.5 shrink-0">
        <span className="w-2 h-2 rounded-full bg-accent" />
        <span className="text-[15px] font-black text-ink tracking-tight">MarketXpress</span>
      </Link>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-1 max-w-xl mx-auto h-9">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, brands, categories…"
          className="flex-1 border border-line border-r-0 rounded-l-md px-3 text-sm bg-surface-2 text-ink placeholder:text-ink-faint outline-none focus:border-accent focus:bg-surface transition-colors"
        />
        <button
          type="submit"
          className="bg-accent hover:bg-accent-hover text-on-accent px-4 rounded-r-md text-sm font-semibold transition-colors shrink-0"
        >
          Search
        </button>
      </form>

      {/* Right icons */}
      <div className="flex items-center gap-1 shrink-0">
        {!user && (
          <Link
            href="/auth/register"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-hover text-on-accent text-xs font-semibold rounded-md transition-colors"
          >
            <Store className="w-3.5 h-3.5" />
            Sell on MX
          </Link>
        )}

        <ThemeToggle />

        <Link href="/dashboard/wishlist" className="relative p-2 text-ink-faint hover:text-accent-hover transition-colors">
          <Heart className="w-5 h-5" />
        </Link>

        <button
          onClick={() => setCartOpen(true)}
          className="relative p-2 text-ink-faint hover:text-accent-hover transition-colors"
          aria-label={`Shopping cart, ${cartCount} items`}
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-accent text-on-accent text-[9px] font-bold rounded-full flex items-center justify-center px-[3px]">
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
              className="flex items-center gap-1.5 p-1.5 rounded-md hover:bg-surface-2 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-on-accent text-xs font-bold">
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
                className="absolute right-0 top-10 w-48 bg-surface border border-line rounded-xl shadow-lg py-1 z-50"
              >
                <div className="px-3 py-2 border-b border-line">
                  <p className="text-xs font-semibold text-ink truncate">{user.email}</p>
                  <p className="text-[10px] text-ink-faint capitalize">{user.role.toLowerCase()}</p>
                </div>
                <Link href="/dashboard/orders" role="menuitem" tabIndex={-1} onClick={() => setAccountOpen(false)} className="block px-3 py-2 text-sm text-ink-muted hover:bg-surface-2 focus:bg-surface-2 focus:outline-none">My Orders</Link>
                <Link href="/dashboard/selling" role="menuitem" tabIndex={-1} onClick={() => setAccountOpen(false)} className="block px-3 py-2 text-sm text-ink-muted hover:bg-surface-2 focus:bg-surface-2 focus:outline-none">Selling Dashboard</Link>
                <Link href="/dashboard/wallet" role="menuitem" tabIndex={-1} onClick={() => setAccountOpen(false)} className="block px-3 py-2 text-sm text-ink-muted hover:bg-surface-2 focus:bg-surface-2 focus:outline-none">Wallet</Link>
                <Link href="/profile" role="menuitem" tabIndex={-1} onClick={() => setAccountOpen(false)} className="block px-3 py-2 text-sm text-ink-muted hover:bg-surface-2 focus:bg-surface-2 focus:outline-none">Profile</Link>
                <button role="menuitem" tabIndex={-1} onClick={() => { void signOut(); setAccountOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-bad hover:bg-bad-bg focus:bg-bad-bg focus:outline-none">Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/auth/login" className="p-2 text-ink-faint hover:text-accent-hover transition-colors">
            <User className="w-5 h-5" />
          </Link>
        )}
      </div>

      {/* Cart drawer */}
      <CartDrawer isOpen={cartOpen} onClose={closeCart} />
    </header>
  );
}
