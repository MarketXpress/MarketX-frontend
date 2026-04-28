"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useState, Suspense } from "react";
import WalletConnect from "@/components/auth/WalletConnect";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { name: "Marketplace", href: "/" },
  { name: "Selling", href: "/dashboard/selling" },
  { name: "Buying", href: "/dashboard/buying" },
  { name: "Profile", href: "/profile" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Don't show Navbar on auth pages for a cleaner focus
  if (pathname.startsWith("/auth")) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-100 px-6 py-4">
      <div className="max-w-7xl mx-auto backdrop-blur-2xl bg-black/20 border border-white/10 rounded-3xl px-6 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <img 
              src="/logo.png" 
              alt="MarketX Logo" 
              className="h-9 sm:h-11 object-contain group-hover:scale-105 transition-transform"
            />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  pathname === link.href
                    ? "text-white bg-white/10"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Suspense fallback={<div className="hidden sm:block w-32 lg:w-48 h-8 rounded-xl bg-white/5 animate-pulse" />}>
            <SearchBar />
          </Suspense>

          <ThemeToggle />
          <WalletConnect />

          <Link
            href="/auth/login"
            className="hidden lg:block text-sm font-medium text-neutral-400 hover:text-white transition-colors px-2"
          >
            Sign In
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-24 left-6 right-6 md:hidden backdrop-blur-3xl bg-black/60 border border-white/10 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-white hover:text-blue-400 py-2 border-b border-white/5 last:border-none"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/auth/login"
              onClick={() => setIsOpen(false)}
              className="mt-2 w-full bg-white/10 hover:bg-white/20 text-white text-center py-3 rounded-2xl transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
