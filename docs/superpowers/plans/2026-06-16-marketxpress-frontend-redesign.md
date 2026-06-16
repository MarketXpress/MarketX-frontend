# MarketXpress Frontend Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dark glassmorphism UI with a Jumia/Konga-style clean-light marketplace design across every page, using Sora font and Emerald `#059669` accent.

**Architecture:** New shared layout components (Navbar, CategoryBar) wrap all pages except auth. New reusable components (ProductCard, StatCard, DashboardSubnav) are composed into redesigned pages. Auth logic in AuthContext + lib/api.ts is untouched throughout.

**Tech Stack:** Next.js 16.2.1 App Router, React 19, Tailwind CSS v4, Sora via `next/font/google`, Lucide React icons, Framer Motion (minimal, for page transitions only), TypeScript.

**Spec:** `docs/superpowers/specs/2026-06-16-marketxpress-redesign.md`

---

## Design Tokens (reference throughout every task)

```
Font:          Sora (weights 400, 600, 700, 800, 900)
Page bg:       #F9FAFB
Surface:       #FFFFFF
Subtle fill:   #F3F4F6
Border:        #E5E7EB (default), #D1D5DB (strong)
Text primary:  #111111
Text secondary:#374151
Text muted:    #6B7280
Text placeholder: #9CA3AF
Accent:        #059669 (hover #047857)
Accent tint bg:#ECFDF5
Accent border: #A7F3D0
Danger:        #DC2626, bg #FEF2F2, border #FECACA
Dark panel:    #111111 / #1F2937
Navbar height: h-14  (56px)
CategoryBar h: h-10  (40px)
Page offset:   pt-24 (96px) on marketplace pages, pt-14 (56px) on dashboard pages
```

---

## File Map

**Create:**
- `src/components/layout/CategoryBar.tsx`
- `src/components/marketplace/ProductCard.tsx`
- `src/components/home/HeroBanners.tsx`
- `src/components/home/FlashSaleSection.tsx`
- `src/components/home/CategoryChips.tsx`
- `src/components/home/HomeFooter.tsx`
- `src/components/dashboard/DashboardSubnav.tsx`
- `src/components/dashboard/StatCard.tsx`
- `src/app/dashboard/wishlist/page.tsx`
- `src/app/dashboard/wallet/page.tsx`

**Rewrite:**
- `src/app/globals.css` — light-only tokens, Sora CSS variable, remove glassmorphism
- `src/app/layout.tsx` — Sora font, brand rename in metadata, remove ThemeToggle import path
- `src/components/layout/Navbar.tsx` — full Jumia-style rewrite
- `src/app/page.tsx` — full Jumia-style home page
- `src/app/auth/login/page.tsx` — split-panel, keep all auth logic
- `src/app/auth/register/page.tsx` — split-panel, keep all auth logic
- `src/app/dashboard/orders/page.tsx` — stat cards + order table
- `src/app/dashboard/selling/page.tsx` — light reskin wrapper
- `src/components/selling/MultiStepForm.tsx` — light reskin (logic unchanged)
- `src/components/selling/Step1Details.tsx` — light reskin
- `src/components/selling/Step2Pricing.tsx` — light reskin
- `src/components/selling/Step3Media.tsx` — light reskin
- `src/components/selling/Step4Review.tsx` — light reskin

**Extend:**
- `src/lib/mockData.ts` — add `ProductMock` type + `mockProducts` array with USD prices

---

## Task 1: Globals, Sora font, and layout metadata

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace globals.css**

```css
/* src/app/globals.css */
@import "tailwindcss";

:root {
  --background: #F9FAFB;
  --foreground: #111111;
  --accent: #059669;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  -webkit-font-smoothing: antialiased;
}

*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.skip-nav {
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent);
  color: white;
  padding: 8px 16px;
  border-radius: 0 0 8px 8px;
  z-index: 9999;
  transition: top 0.2s ease;
}

.skip-nav:focus {
  top: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 2: Update layout.tsx — Sora font + brand rename**

Replace the entire file:

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001",
  ),
  title: {
    default: "MarketXpress | Secure P2P Marketplace",
    template: "%s | MarketXpress",
  },
  description:
    "The safest way to trade anything, peer-to-peer. Secured by Stellar smart contract escrow.",
  keywords: [
    "MarketXpress",
    "P2P marketplace",
    "escrow",
    "Stellar",
    "crypto marketplace",
    "XLM",
    "USDC",
  ],
  applicationName: "MarketXpress",
  authors: [{ name: "MarketXpress" }],
  creator: "MarketXpress",
  publisher: "MarketXpress",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "MarketXpress | Secure P2P Marketplace",
    description:
      "The safest way to trade anything, peer-to-peer. Secured by Stellar smart contract escrow.",
    url: "/",
    siteName: "MarketXpress",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MarketXpress | Secure P2P Marketplace",
    description:
      "The safest way to trade anything, peer-to-peer. Secured by Stellar smart contract escrow.",
  },
  icons: { icon: "/icon.png", apple: "/icon.png" },
};

export const viewport = {
  themeColor: "#059669",
};

import Navbar from "@/components/layout/Navbar";
import AppProviders from "@/providers/AppProviders";
import { PageTransition } from "@/components/animations/PageTransition";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={sora.variable}>
      <body className="antialiased font-[family-name:var(--font-sora)]" suppressHydrationWarning>
        <AppProviders>
          <a href="#main-content" className="skip-nav">Skip to main content</a>
          <Navbar />
          <main id="main-content">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </AppProviders>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Start dev server and verify Sora loads**

```bash
cd MarketX-frontend && npm run dev
```

Open `http://localhost:3001` (or whichever port it takes). Open DevTools → Network → filter "sora" — confirm the font file loads. The page background should now be `#F9FAFB` (light gray), not black.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: switch to Sora font, light theme globals, MarketXpress metadata"
```

---

## Task 2: Add mock product data

**Files:**
- Modify: `src/lib/mockData.ts`

- [ ] **Step 1: Append ProductMock type and mockProducts array**

Add this to the bottom of `src/lib/mockData.ts` (keep existing exports intact):

```ts
export interface ProductMock {
  id: string;
  name: string;
  usdPrice: number;
  originalUsdPrice: number;
  xlmPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  category: string;
  seller: string;
  badge?: "flash" | "new" | "hot";
}

export const mockProducts: ProductMock[] = [
  { id: "p1", name: "Samsung Galaxy A55 5G", usdPrice: 299, originalUsdPrice: 459, xlmPrice: 1450, discountPercent: 35, rating: 4.5, reviewCount: 312, category: "Electronics", seller: "TechHub NG", badge: "flash" },
  { id: "p2", name: "Nike Air Max 270", usdPrice: 88, originalUsdPrice: 110, xlmPrice: 427, discountPercent: 20, rating: 4.7, reviewCount: 198, category: "Fashion", seller: "SoleKing", badge: "hot" },
  { id: "p3", name: "Sony WH-1000XM5", usdPrice: 193, originalUsdPrice: 350, xlmPrice: 936, discountPercent: 45, rating: 4.8, reviewCount: 540, category: "Electronics", seller: "AudioWorld", badge: "flash" },
  { id: "p4", name: "Levi's 501 Original Jeans", usdPrice: 45, originalUsdPrice: 60, xlmPrice: 218, discountPercent: 25, rating: 4.3, reviewCount: 87, category: "Fashion", seller: "DenimCo", },
  { id: "p5", name: "Anker 65W GaN Charger", usdPrice: 28, originalUsdPrice: 40, xlmPrice: 136, discountPercent: 30, rating: 4.6, reviewCount: 231, category: "Electronics", seller: "PowerDeals" },
  { id: "p6", name: "JBL Flip 6 Speaker", usdPrice: 99, originalUsdPrice: 130, xlmPrice: 480, discountPercent: 24, rating: 4.4, reviewCount: 175, category: "Electronics", seller: "SoundZone", badge: "new" },
  { id: "p7", name: "Adidas Ultraboost 22", usdPrice: 120, originalUsdPrice: 180, xlmPrice: 582, discountPercent: 33, rating: 4.6, reviewCount: 94, category: "Fashion", seller: "SoleKing" },
  { id: "p8", name: "Xiaomi Smart Band 9", usdPrice: 35, originalUsdPrice: 50, xlmPrice: 170, discountPercent: 30, rating: 4.2, reviewCount: 412, category: "Electronics", seller: "TechHub NG" },
  { id: "p9", name: "Legendary NFT #0042", usdPrice: 450, originalUsdPrice: 450, xlmPrice: 2183, discountPercent: 0, rating: 5.0, reviewCount: 12, category: "NFTs", seller: "art_node", badge: "hot" },
  { id: "p10", name: "iPhone 15 Case (MagSafe)", usdPrice: 19, originalUsdPrice: 25, xlmPrice: 92, discountPercent: 24, rating: 4.1, reviewCount: 63, category: "Electronics", seller: "CaseWorld" },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/mockData.ts
git commit -m "feat: add ProductMock type and mockProducts with USD+XLM prices"
```

---

## Task 3: Rewrite Navbar

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

The new Navbar is fixed, `h-14`, white bg with bottom border. It contains: wordmark left, search bar centre, and icon buttons right (cart, wishlist, account/login). On auth pages it returns null.

- [ ] **Step 1: Replace Navbar.tsx**

```tsx
// src/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Heart, User, Store, Search } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);

  if (pathname.startsWith("/auth")) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/?q=${encodeURIComponent(query.trim())}`;
    }
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
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 rounded-r-md text-sm font-700 transition-colors shrink-0"
        >
          Search
        </button>
      </form>

      {/* Right icons */}
      <div className="flex items-center gap-1 shrink-0">
        {!user && (
          <Link
            href="/auth/register"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-700 rounded-md transition-colors"
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
          <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[9px] font-800 rounded-full flex items-center justify-center">3</span>
        </Link>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setAccountOpen((v) => !v)}
              className="flex items-center gap-1.5 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-800">
                {user.email.charAt(0).toUpperCase()}
              </div>
            </button>
            {accountOpen && (
              <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs font-700 text-gray-900 truncate">{user.email}</p>
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
```

- [ ] **Step 2: Visual check**

With dev server running, open `http://localhost:3001`. Verify:
- White top bar, `h-14`, with green dot + "MarketXpress" left
- Search bar with "Search" button centre
- Cart icon with badge `3`, heart icon, and user icon right
- No Navbar on `http://localhost:3001/auth/login`

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat: rewrite Navbar — Jumia-style with search, cart, wishlist, account dropdown"
```

---

## Task 4: CategoryBar component

**Files:**
- Create: `src/components/layout/CategoryBar.tsx`

The CategoryBar sits fixed below the Navbar (`top-14`), only on non-auth, non-dashboard routes.

- [ ] **Step 1: Create CategoryBar.tsx**

```tsx
// src/components/layout/CategoryBar.tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const CATEGORIES = [
  { label: "All Categories", value: "" },
  { label: "Electronics", value: "Electronics" },
  { label: "Fashion", value: "Fashion" },
  { label: "Home & Living", value: "Home" },
  { label: "Beauty", value: "Beauty" },
  { label: "Sports", value: "Sports" },
  { label: "Gaming", value: "Gaming" },
  { label: "NFTs & Digital", value: "NFTs" },
];

export default function CategoryBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCat = searchParams.get("cat") ?? "";

  if (pathname.startsWith("/auth") || pathname.startsWith("/dashboard") || pathname.startsWith("/profile")) return null;

  return (
    <nav className="fixed top-14 left-0 right-0 z-40 h-10 bg-emerald-600 flex items-center px-4 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-0 min-w-max">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={cat.value ? `/?cat=${cat.value}` : "/"}
            className={`px-3 py-1 text-xs font-600 whitespace-nowrap transition-colors rounded-sm ${
              currentCat === cat.value
                ? "text-white font-800 bg-black/20"
                : "text-emerald-100 hover:text-white hover:bg-black/10"
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Add CategoryBar to layout.tsx**

In `src/app/layout.tsx`, import CategoryBar and add it after `<Navbar />`:

```tsx
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import AppProviders from "@/providers/AppProviders";
import { PageTransition } from "@/components/animations/PageTransition";
import { Suspense } from "react";
```

And in the JSX:

```tsx
<AppProviders>
  <a href="#main-content" className="skip-nav">Skip to main content</a>
  <Navbar />
  <Suspense>
    <CategoryBar />
  </Suspense>
  <main id="main-content">
    <PageTransition>
      {children}
    </PageTransition>
  </main>
</AppProviders>
```

- [ ] **Step 3: Visual check**

Open `http://localhost:3001`. Verify:
- Emerald green bar directly below the white Navbar
- Category links scroll horizontally on narrow screens
- No CategoryBar on `/auth/login` or `/dashboard/orders`

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/CategoryBar.tsx src/app/layout.tsx
git commit -m "feat: add CategoryBar — emerald category nav below Navbar on marketplace pages"
```

---

## Task 5: ProductCard component

**Files:**
- Create: `src/components/marketplace/ProductCard.tsx`

- [ ] **Step 1: Create ProductCard.tsx**

```tsx
// src/components/marketplace/ProductCard.tsx
import { Star } from "lucide-react";
import { ProductMock } from "@/lib/mockData";

export default function ProductCard({ product }: { product: ProductMock }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
      {/* Image placeholder */}
      <div className="relative h-36 bg-gray-100 flex items-center justify-center">
        <div className="w-16 h-16 bg-gray-200 rounded-lg" />
        {product.discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-800 px-1.5 py-0.5 rounded">
            -{product.discountPercent}%
          </span>
        )}
        {product.badge === "flash" && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-800 px-1.5 py-0.5 rounded">
            ⚡ Flash
          </span>
        )}
        {product.badge === "hot" && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-800 px-1.5 py-0.5 rounded">
            🔥 Hot
          </span>
        )}
        {product.badge === "new" && (
          <span className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-800 px-1.5 py-0.5 rounded">
            New
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <p className="text-xs text-gray-600 line-clamp-2 min-h-[2.5rem] leading-snug mb-2">
          {product.name}
        </p>

        <div className="flex items-baseline gap-1.5 mb-0.5">
          <span className="text-base font-900 text-emerald-600">${product.usdPrice}</span>
          {product.originalUsdPrice > product.usdPrice && (
            <span className="text-xs text-gray-400 line-through">${product.originalUsdPrice}</span>
          )}
        </div>
        <p className="text-[10px] text-gray-400 font-600 mb-2">≈ {product.xlmPrice.toLocaleString()} XLM</p>

        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-600 text-gray-600">{product.rating}</span>
          <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
        </div>

        <button className="w-full py-1.5 text-[11px] font-700 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors">
          + Add to Cart
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/marketplace/ProductCard.tsx
git commit -m "feat: add ProductCard component with USD + XLM price and discount badge"
```

---

## Task 6: Home page components (HeroBanners, FlashSaleSection, CategoryChips, Footer)

**Files:**
- Create: `src/components/home/HeroBanners.tsx`
- Create: `src/components/home/FlashSaleSection.tsx`
- Create: `src/components/home/CategoryChips.tsx`
- Create: `src/components/home/HomeFooter.tsx`

- [ ] **Step 1: Create HeroBanners.tsx**

```tsx
// src/components/home/HeroBanners.tsx
import Link from "next/link";

export default function HeroBanners() {
  return (
    <div className="flex gap-3">
      {/* Main banner (2/3) */}
      <div className="flex-[2] relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 flex flex-col justify-between min-h-[200px] overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <span className="inline-block bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 text-[10px] font-700 uppercase tracking-widest px-2.5 py-1 rounded-full mb-3">
            🔐 Escrow Protected
          </span>
          <h1 className="text-2xl font-900 text-white leading-tight tracking-tight mb-2">
            Buy anything.<br />Pay with crypto.
          </h1>
          <p className="text-gray-400 text-xs leading-relaxed mb-4">
            Every purchase secured by Stellar smart contracts.<br />Zero risk, full speed.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-700 px-4 py-2 rounded-lg transition-colors"
          >
            Shop Now →
          </Link>
        </div>
      </div>

      {/* Side banners (1/3) */}
      <div className="flex-1 flex flex-col gap-3">
        <Link href="/?cat=Electronics" className="flex-1 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4 hover:border-emerald-300 transition-colors group">
          <div className="text-lg mb-1">📱</div>
          <p className="text-sm font-800 text-gray-900 group-hover:text-emerald-700 transition-colors">New Arrivals</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Up to 30% off</p>
        </Link>
        <Link href="/?cat=Fashion" className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 hover:border-blue-300 transition-colors group">
          <div className="text-lg mb-1">🌟</div>
          <p className="text-sm font-800 text-gray-900 group-hover:text-blue-700 transition-colors">Top Sellers</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Verified merchants</p>
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create FlashSaleSection.tsx**

```tsx
// src/components/home/FlashSaleSection.tsx
"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/marketplace/ProductCard";
import { mockProducts } from "@/lib/mockData";
import Link from "next/link";

function useCountdown(targetSeconds: number) {
  const [seconds, setSeconds] = useState(targetSeconds);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : targetSeconds)), 1000);
    return () => clearInterval(t);
  }, [targetSeconds]);
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return { h, m, s };
}

export default function FlashSaleSection() {
  const { h, m, s } = useCountdown(4 * 3600 + 23 * 60 + 11);
  const flashProducts = mockProducts.filter((p) => p.badge === "flash").slice(0, 5);

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-800 text-gray-900">⚡ Flash Sale</h2>
          <span className="text-[10px] font-700 bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
          <div className="flex items-center gap-1">
            {[h, m, s].map((unit, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="bg-gray-900 text-white text-xs font-800 px-1.5 py-0.5 rounded">{unit}</span>
                {i < 2 && <span className="text-gray-400 text-xs font-700">:</span>}
              </span>
            ))}
          </div>
        </div>
        <Link href="/" className="text-xs font-600 text-emerald-600 hover:text-emerald-700">View All →</Link>
      </div>

      {/* Product row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {flashProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create CategoryChips.tsx**

```tsx
// src/components/home/CategoryChips.tsx
import Link from "next/link";

const CHIPS = [
  { emoji: "📱", label: "Electronics", value: "Electronics" },
  { emoji: "👗", label: "Fashion", value: "Fashion" },
  { emoji: "🏠", label: "Home", value: "Home" },
  { emoji: "💄", label: "Beauty", value: "Beauty" },
  { emoji: "⚽", label: "Sports", value: "Sports" },
  { emoji: "🎮", label: "Gaming", value: "Gaming" },
  { emoji: "🖼️", label: "NFTs", value: "NFTs" },
  { emoji: "📦", label: "More", value: "" },
];

export default function CategoryChips() {
  return (
    <section>
      <h2 className="text-base font-800 text-gray-900 mb-4">Shop by Category</h2>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {CHIPS.map((chip) => (
          <Link
            key={chip.value || "more"}
            href={chip.value ? `/?cat=${chip.value}` : "/"}
            className="flex flex-col items-center gap-1.5 p-3 bg-white border border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-colors group"
          >
            <span className="text-2xl">{chip.emoji}</span>
            <span className="text-[11px] font-600 text-gray-700 group-hover:text-emerald-700 text-center">{chip.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create HomeFooter.tsx**

```tsx
// src/components/home/HomeFooter.tsx
import Link from "next/link";

export default function HomeFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="text-sm font-900 text-gray-900">MarketXpress</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              The safest way to trade anything, peer-to-peer. Every purchase secured by Stellar smart contract escrow.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full font-600">⚡ Stellar Network</span>
              <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full font-600">🔐 Escrow</span>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-800 text-gray-900 mb-2">Marketplace</p>
              {["Browse All", "Flash Sale", "New Arrivals", "Top Sellers"].map((l) => (
                <Link key={l} href="/" className="block text-xs text-gray-500 hover:text-emerald-600 py-0.5">{l}</Link>
              ))}
            </div>
            <div>
              <p className="text-xs font-800 text-gray-900 mb-2">Account</p>
              {[["My Orders", "/dashboard/orders"], ["Sell on MX", "/dashboard/selling"], ["Wallet", "/dashboard/wallet"], ["Help", "/help"]].map(([label, href]) => (
                <Link key={href} href={href} className="block text-xs text-gray-500 hover:text-emerald-600 py-0.5">{label}</Link>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <p className="text-xs font-800 text-gray-900 mb-2">Connect</p>
            {["Twitter / X", "Telegram", "Discord"].map((s) => (
              <p key={s} className="text-xs text-gray-500 py-0.5">{s}</p>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 text-center">
          <p className="text-[11px] text-gray-400">© 2026 MarketXpress. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/home/
git commit -m "feat: add HeroBanners, FlashSaleSection, CategoryChips, HomeFooter components"
```

---

## Task 7: Rewrite landing page (home)

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace page.tsx**

```tsx
// src/app/page.tsx
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

        {/* Recommended / New Arrivals */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-800 text-gray-900">🆕 New Arrivals</h2>
            <span className="text-xs font-600 text-emerald-600 hover:text-emerald-700 cursor-pointer">View All →</span>
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
```

- [ ] **Step 2: Visual check — golden path**

Open `http://localhost:3001`. Verify:
- White Navbar (h-14) at top
- Emerald CategoryBar (h-10) directly below
- Dark hero banner left + two light side banners right
- Flash Sale section with countdown timer
- 8 category emoji chips
- Product grid with USD prices, XLM below each, discount badges
- Footer at bottom with brand + links

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: rewrite landing page — Jumia-style hero, flash sale, categories, product grid"
```

---

## Task 8: Redesign Login page (split-panel)

**Files:**
- Modify: `src/app/auth/login/page.tsx`

All auth logic (`authApi.login`, `useAuth`, redirects, error handling, `?email=` and `?registered=1` params) is preserved exactly. Only the visual markup changes.

- [ ] **Step 1: Replace login page.tsx**

```tsx
// src/app/auth/login/page.tsx
"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authApi, ApiError } from "@/lib/api";

type FormErrors = { email?: string; password?: string; form?: string };

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const prefillEmail = searchParams.get("email") ?? "";
  const justRegistered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e: FormErrors = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Must be at least 8 characters";
    return e;
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsSubmitting(true);
    try {
      const { accessToken, refreshToken } = await authApi.login({ email, password });
      login(accessToken, refreshToken);
      router.push("/dashboard/orders");
    } catch (err) {
      let message: string;
      if (err instanceof ApiError) {
        message = err.status === 401 ? "Invalid email or password" : err.message;
      } else if (err instanceof TypeError && err.message.includes("fetch")) {
        message = "Cannot reach the server. Make sure the backend is running.";
      } else {
        message = "Something went wrong. Please try again.";
      }
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (field: keyof FormErrors, isTouched: boolean) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 outline-none focus:ring-2 transition-all ${
      errors[field] && isTouched
        ? "border-red-300 focus:ring-red-100"
        : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
    }`;

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[42%] bg-gray-900 flex-col justify-between p-10">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-900 text-white">MarketXpress</span>
        </div>
        <div>
          <p className="text-3xl font-900 text-white leading-tight tracking-tight mb-3">
            "Trade anything.<br />Risk nothing."
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            Every transaction on MarketXpress is secured by Stellar smart contract escrow. Your payment only releases when you confirm delivery.
          </p>
        </div>
        <p className="text-xs text-gray-600">© 2026 MarketXpress</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h1 className="text-2xl font-900 text-gray-900 tracking-tight mb-1">Welcome back</h1>
            <p className="text-sm text-gray-500">Sign in to your MarketXpress account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {justRegistered && (
              <div className="px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-600">
                Account created! Sign in to continue.
              </div>
            )}
            {errors.form && (
              <div role="alert" className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {errors.form}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-700 text-gray-700 mb-1.5">Email Address</label>
              <input
                id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                placeholder="name@example.com"
                className={fieldClass("email", touched.email)}
                aria-invalid={!!errors.email}
              />
              {errors.email && touched.email && (
                <p className="text-xs text-red-600 mt-1" role="alert">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-xs font-700 text-gray-700">Password</label>
                <Link href="#" className="text-xs text-emerald-600 hover:text-emerald-700">Forgot password?</Link>
              </div>
              <input
                id="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                placeholder="••••••••"
                className={fieldClass("password", touched.password)}
                aria-invalid={!!errors.password}
              />
              {errors.password && touched.password && (
                <p className="text-xs text-red-600 mt-1" role="alert">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded border-gray-300 text-emerald-600" />
              <label htmlFor="remember" className="text-xs text-gray-500">Remember me</label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-700 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Signing in…</>
              ) : "Sign In"}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <span className="relative flex justify-center bg-white px-3 text-[11px] text-gray-400 uppercase tracking-widest">or continue with</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6">
            {["Google", "GitHub"].map((p) => (
              <button key={p} type="button" className="flex items-center justify-center gap-1.5 border border-gray-200 rounded-lg py-2 text-xs font-600 text-gray-700 hover:bg-gray-50 transition-colors">
                {p}
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-emerald-600 font-700 hover:text-emerald-700">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
```

- [ ] **Step 2: Visual check**

Open `http://localhost:3001/auth/login`. Verify:
- Dark left panel (42%) with MarketXpress wordmark, quote, copyright
- White right panel with email/password form and emerald Sign In button
- No Navbar visible
- `?registered=1` shows green success banner
- `?email=test@example.com` pre-fills the email field

- [ ] **Step 3: Commit**

```bash
git add src/app/auth/login/page.tsx
git commit -m "feat: redesign login page — split-panel layout, emerald styling, auth logic preserved"
```

---

## Task 9: Redesign Register page (split-panel)

**Files:**
- Modify: `src/app/auth/register/page.tsx`

All auth logic preserved. Visual markup replaced with split-panel design.

- [ ] **Step 1: Replace register page.tsx**

```tsx
// src/app/auth/register/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, ApiError } from "@/lib/api";

type FormErrors = { firstName?: string; lastName?: string; email?: string; password?: string; form?: string };

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"BUYER" | "SELLER">("BUYER");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({ firstName: false, lastName: false, email: false, password: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e: FormErrors = {};
    if (!firstName) e.firstName = "First name is required";
    if (!lastName) e.lastName = "Last name is required";
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Must be at least 8 characters";
    return e;
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsSubmitting(true);
    try {
      await authApi.register({ email, password, firstName, lastName, role });
      router.push(`/auth/login?email=${encodeURIComponent(email)}&registered=1`);
    } catch (err) {
      let message: string;
      if (err instanceof ApiError) {
        message = err.status === 409 ? "An account with this email already exists" : err.message;
      } else if (err instanceof TypeError && err.message.includes("fetch")) {
        message = "Cannot reach the server. Make sure the backend is running.";
      } else {
        message = "Something went wrong. Please try again.";
      }
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (field: keyof FormErrors, isTouched: boolean) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 outline-none focus:ring-2 transition-all ${
      errors[field] && isTouched
        ? "border-red-300 focus:ring-red-100"
        : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
    }`;

  const isSeller = role === "SELLER";

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[42%] bg-gray-900 flex-col justify-between p-10">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-900 text-white">MarketXpress</span>
        </div>
        <div>
          <p className="text-3xl font-900 text-white leading-tight tracking-tight mb-3">
            "Join 12,000+<br />traders worldwide."
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            Whether you're buying the latest tech or selling handmade goods, MarketXpress keeps every transaction safe with escrow smart contracts.
          </p>
        </div>
        <p className="text-xs text-gray-600">© 2026 MarketXpress</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-900 text-gray-900 tracking-tight mb-1">Create your account</h1>
            <p className="text-sm text-gray-500">Start trading on MarketXpress today</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl mb-5" role="radiogroup" aria-label="Account type">
            {(["BUYER", "SELLER"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={`py-2 rounded-lg text-xs font-700 transition-all ${
                  role === r
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {r === "BUYER" ? "🛒 I'm a Buyer" : "🏪 I'm a Seller"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
            {errors.form && (
              <div role="alert" className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {errors.form}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-xs font-700 text-gray-700 mb-1.5">First Name</label>
                <input id="firstName" type="text" value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, firstName: true }))}
                  placeholder="John"
                  className={fieldClass("firstName", touched.firstName)}
                />
                {errors.firstName && touched.firstName && (
                  <p className="text-xs text-red-600 mt-1" role="alert">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs font-700 text-gray-700 mb-1.5">Last Name</label>
                <input id="lastName" type="text" value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, lastName: true }))}
                  placeholder="Doe"
                  className={fieldClass("lastName", touched.lastName)}
                />
                {errors.lastName && touched.lastName && (
                  <p className="text-xs text-red-600 mt-1" role="alert">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-700 text-gray-700 mb-1.5">Email Address</label>
              <input id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                placeholder="name@example.com"
                className={fieldClass("email", touched.email)}
              />
              {errors.email && touched.email && (
                <p className="text-xs text-red-600 mt-1" role="alert">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-700 text-gray-700 mb-1.5">Password</label>
              <input id="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                placeholder="Minimum 8 characters"
                className={fieldClass("password", touched.password)}
              />
              {errors.password && touched.password && (
                <p className="text-xs text-red-600 mt-1" role="alert">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full font-700 py-2.5 rounded-lg text-white transition-colors flex items-center justify-center gap-2 text-sm mt-1 ${
                isSeller
                  ? "bg-violet-600 hover:bg-violet-700 disabled:opacity-50"
                  : "bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
              } disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Creating account…</>
              ) : `Create Account →`}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-emerald-600 font-700 hover:text-emerald-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Visual check**

Open `http://localhost:3001/auth/register`. Verify:
- Same split-panel layout as login
- Role segmented control (Buyer = emerald submit, Seller = violet submit)
- First/last name side by side
- No Navbar
- Submitting with valid data redirects to `/auth/login?email=…&registered=1`

- [ ] **Step 3: Commit**

```bash
git add src/app/auth/register/page.tsx
git commit -m "feat: redesign register page — split-panel, role selector, auth logic preserved"
```

---

## Task 10: Dashboard shared components (DashboardSubnav + StatCard)

**Files:**
- Create: `src/components/dashboard/DashboardSubnav.tsx`
- Create: `src/components/dashboard/StatCard.tsx`

- [ ] **Step 1: Create DashboardSubnav.tsx**

```tsx
// src/components/dashboard/DashboardSubnav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Orders", href: "/dashboard/orders" },
  { label: "Wishlist", href: "/dashboard/wishlist" },
  { label: "Selling", href: "/dashboard/selling" },
  { label: "Wallet", href: "/dashboard/wallet" },
  { label: "Profile", href: "/profile" },
];

export default function DashboardSubnav({ title }: { title: string }) {
  const pathname = usePathname();

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 h-12 flex items-center justify-between gap-4">
      <h1 className="text-sm font-800 text-gray-900 hidden sm:block shrink-0">{title}</h1>
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const active = pathname === tab.href || (tab.href === "/dashboard/orders" && pathname === "/dashboard");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-3 py-1 rounded-full text-xs font-700 whitespace-nowrap transition-colors ${
                active
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create StatCard.tsx**

```tsx
// src/components/dashboard/StatCard.tsx
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

export default function StatCard({ label, value, sub, accent = false }: StatCardProps) {
  return (
    <div className={cn(
      "rounded-xl border p-4",
      accent
        ? "bg-emerald-50 border-emerald-200"
        : "bg-white border-gray-200"
    )}>
      <p className="text-[11px] font-700 text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={cn("text-2xl font-900 tracking-tight", accent ? "text-emerald-700" : "text-gray-900")}>{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5 font-600">{sub}</p>}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/DashboardSubnav.tsx src/components/dashboard/StatCard.tsx
git commit -m "feat: add DashboardSubnav (pill tabs) and StatCard components"
```

---

## Task 11: Redesign Dashboard Orders page

**Files:**
- Modify: `src/app/dashboard/orders/page.tsx`

- [ ] **Step 1: Replace orders page**

```tsx
// src/app/dashboard/orders/page.tsx
"use client";

import { useState, useMemo } from "react";
import DashboardSubnav from "@/components/dashboard/DashboardSubnav";
import StatCard from "@/components/dashboard/StatCard";
import { mockTransaction } from "@/lib/escrowData";
import { OrderFilters, filterOrders } from "@/lib/orderFilters";

const STATUS_STYLES: Record<string, string> = {
  "in_escrow": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "shipped":   "bg-blue-50 text-blue-700 border border-blue-200",
  "delivered": "bg-gray-100 text-gray-600 border border-gray-200",
  "disputed":  "bg-red-50 text-red-700 border border-red-200",
};

export default function OrdersPage() {
  const [filters, setFilters] = useState<OrderFilters>({
    category: "all",
    state: "all",
    sortBy: "newest",
    searchQuery: "",
  });

  const allOrders = useMemo(() => [mockTransaction], []);
  const filteredOrders = useMemo(() => filterOrders(allOrders, filters), [allOrders, filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-14">
        <DashboardSubnav title="My Account" />

        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <StatCard label="Total Orders" value="24" />
            <StatCard label="In Escrow" value="$1,240" sub="≈ 6,012 XLM" accent />
            <StatCard label="Completed" value="18" />
            <StatCard label="Wallet Balance" value="4,200 XLM" sub="≈ $866" />
          </div>

          {/* Orders table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-800 text-gray-900">Order History</h2>
              <input
                type="search"
                placeholder="Search orders…"
                value={filters.searchQuery}
                onChange={(e) => setFilters((f) => ({ ...f, searchQuery: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 placeholder:text-gray-400 outline-none focus:border-emerald-400 w-48"
              />
            </div>

            {filteredOrders.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-gray-400">No orders match your filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                      <span className="text-lg">📦</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-700 text-gray-900 truncate">{order.itemName}</p>
                      <p className="text-xs text-gray-500">
                        {order.sellerName} · {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-800 text-gray-900">${order.amount}</p>
                      <p className="text-[11px] text-gray-400">≈ {Math.round(order.amount * 4.85)} XLM</p>
                    </div>

                    {/* Status badge */}
                    <span className={`text-[11px] font-700 px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[order.state] ?? STATUS_STYLES["in_escrow"]}`}>
                      {order.state?.replace(/_/g, " ") ?? "In Escrow"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Check what fields `mockTransaction` actually has**

Run in browser console or check `src/lib/escrowData.ts` to confirm the fields used above (`order.itemName`, `order.sellerName`, `order.createdAt`, `order.amount`, `order.state`) exist on the mock object. If the field names differ, adjust the JSX to match — the rendering logic stays the same.

- [ ] **Step 3: Visual check**

Open `http://localhost:3001/dashboard/orders`. Verify:
- White Navbar at top (56px)
- Pill-tab subnav row directly below (Orders tab active, emerald)
- 4 stat cards row (the "In Escrow" one has emerald tint)
- Orders table with search box
- Order row: thumbnail → product name + seller → amount → status badge

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/orders/page.tsx
git commit -m "feat: redesign orders page — stat cards, order table, DashboardSubnav"
```

---

## Task 12: New Wishlist page

**Files:**
- Create: `src/app/dashboard/wishlist/page.tsx`

- [ ] **Step 1: Create wishlist/page.tsx**

```tsx
// src/app/dashboard/wishlist/page.tsx
import DashboardSubnav from "@/components/dashboard/DashboardSubnav";
import ProductCard from "@/components/marketplace/ProductCard";
import { mockProducts } from "@/lib/mockData";

const wishlistItems = mockProducts.slice(0, 6);

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-14">
        <DashboardSubnav title="My Account" />

        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-800 text-gray-900">My Wishlist</h2>
              <p className="text-xs text-gray-500 mt-0.5">{wishlistItems.length} saved items</p>
            </div>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
              <p className="text-2xl mb-2">♡</p>
              <p className="text-sm font-700 text-gray-900 mb-1">Your wishlist is empty</p>
              <p className="text-xs text-gray-500">Save items you love by clicking the heart icon on any product.</p>
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/wishlist/page.tsx
git commit -m "feat: add wishlist page with product grid and DashboardSubnav"
```

---

## Task 13: New Wallet page

**Files:**
- Create: `src/app/dashboard/wallet/page.tsx`

- [ ] **Step 1: Create wallet/page.tsx**

```tsx
// src/app/dashboard/wallet/page.tsx
"use client";

import DashboardSubnav from "@/components/dashboard/DashboardSubnav";
import { Copy, ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { useState } from "react";

const MOCK_ADDRESS = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGAMC3LHMNQTM8OR";

const MOCK_TXS = [
  { id: "1", type: "received", label: "Payment received", amount: "+200 XLM", usd: "+$41.20", date: "Jun 15, 2026", from: "art_node" },
  { id: "2", type: "sent", label: "Escrow funded", amount: "-450 XLM", usd: "-$92.70", date: "Jun 14, 2026", from: "Samsung Galaxy A55" },
  { id: "3", type: "received", label: "Escrow released", amount: "+88 XLM", usd: "+$18.13", date: "Jun 12, 2026", from: "SoleKing" },
  { id: "4", type: "sent", label: "Escrow funded", amount: "-193 XLM", usd: "-$39.77", date: "Jun 10, 2026", from: "Sony WH-1000XM5" },
];

export default function WalletPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(MOCK_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-14">
        <DashboardSubnav title="My Account" />

        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Balance card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-700 text-gray-400 uppercase tracking-wider">Stellar Wallet</span>
              </div>
              <p className="text-3xl font-900 text-white tracking-tight mb-0.5">4,200 XLM</p>
              <p className="text-sm text-gray-400 mb-5">≈ $866.04 USD</p>

              {/* Address */}
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                <span className="text-[11px] text-gray-300 font-mono flex-1 truncate">{MOCK_ADDRESS.slice(0, 12)}…{MOCK_ADDRESS.slice(-6)}</span>
                <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors shrink-0">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copied && <span className="text-[10px] text-emerald-400 font-600">Copied!</span>}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Connect Wallet", icon: Wallet },
              { label: "Deposit", icon: ArrowDownLeft },
              { label: "Withdraw", icon: ArrowUpRight },
            ].map(({ label, icon: Icon }) => (
              <button
                key={label}
                className="flex flex-col items-center gap-1.5 bg-white border border-gray-200 rounded-xl py-4 hover:border-emerald-400 hover:bg-emerald-50 transition-colors group"
              >
                <Icon className="w-5 h-5 text-gray-500 group-hover:text-emerald-600 transition-colors" />
                <span className="text-xs font-700 text-gray-700 group-hover:text-emerald-700 transition-colors">{label}</span>
              </button>
            ))}
          </div>

          {/* Transaction history */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-800 text-gray-900">Transaction History</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {MOCK_TXS.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${tx.type === "received" ? "bg-emerald-50" : "bg-gray-100"}`}>
                    {tx.type === "received"
                      ? <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                      : <ArrowUpRight className="w-4 h-4 text-gray-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-700 text-gray-900">{tx.label}</p>
                    <p className="text-[11px] text-gray-400">{tx.from} · {tx.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-800 ${tx.type === "received" ? "text-emerald-600" : "text-gray-700"}`}>{tx.amount}</p>
                    <p className="text-[11px] text-gray-400">{tx.usd}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/wallet/page.tsx
git commit -m "feat: add wallet page — balance card, deposit/withdraw buttons, transaction history"
```

---

## Task 14: Reskin Selling page and MultiStepForm

**Files:**
- Modify: `src/app/dashboard/selling/page.tsx`
- Modify: `src/components/selling/MultiStepForm.tsx`
- Modify: `src/components/selling/Step1Details.tsx`
- Modify: `src/components/selling/Step2Pricing.tsx`
- Modify: `src/components/selling/Step3Media.tsx`
- Modify: `src/components/selling/Step4Review.tsx`

**Goal:** Replace all `bg-[#050505]`, `text-white`, dark `border-white/10`, `bg-white/5` patterns with light equivalents. All form logic, validation, and step navigation is untouched.

- [ ] **Step 1: Replace selling/page.tsx wrapper**

```tsx
// src/app/dashboard/selling/page.tsx
import DashboardSubnav from "@/components/dashboard/DashboardSubnav";
import StatCard from "@/components/dashboard/StatCard";
import MultiStepForm from "@/components/selling/MultiStepForm";

export default function SellingDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-14">
        <DashboardSubnav title="My Account" />

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Seller stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <StatCard label="Active Listings" value="3" />
            <StatCard label="Total Sales" value="$2,840" accent />
            <StatCard label="Pending Payout" value="$420" />
            <StatCard label="Seller Rating" value="4.8 ★" />
          </div>

          {/* Listing form */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-base font-800 text-gray-900 mb-1">List a New Item</h2>
            <p className="text-xs text-gray-500 mb-6">Configure your item details, escrow terms, and pricing.</p>
            <MultiStepForm />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Reskin MultiStepForm.tsx — step indicator and nav buttons only**

Open `src/components/selling/MultiStepForm.tsx`. The logic is untouched. Replace all dark styling:

Find and replace patterns in MultiStepForm.tsx:
- `bg-[#050505]` → `bg-white`
- `bg-white/5` → `bg-gray-100`
- `bg-white/10` → `bg-gray-100`
- `border-white/10` → `border-gray-200`
- `text-white` → `text-gray-900`
- `text-neutral-400` → `text-gray-500`
- `text-neutral-500` → `text-gray-400`
- `bg-blue-600` (step indicator active) → `bg-emerald-600`
- `text-blue-400` → `text-emerald-600`
- `border-blue-500` → `border-emerald-500`
- `hover:bg-white/10` → `hover:bg-gray-100`
- `shadow-blue-600/20` → `shadow-emerald-600/20`
- `rounded-3xl` → `rounded-xl`

Also update the step connector line active colour from blue to emerald in the step indicator JSX.

- [ ] **Step 3: Reskin Step1Details, Step2Pricing, Step3Media, Step4Review**

In each step component, apply the same search-and-replace for dark tokens listed in Step 2 above. Specifically:
- Input fields: `bg-white/5 border-white/10 text-white` → `bg-gray-50 border-gray-200 text-gray-900`
- Labels: `text-neutral-400` → `text-gray-700`
- Error text: stays `text-red-500`
- Select dropdowns: same treatment as inputs
- Focus rings: `focus:ring-blue-500/50` → `focus:ring-emerald-500/50`

- [ ] **Step 4: Visual check**

Open `http://localhost:3001/dashboard/selling`. Verify:
- Subnav with Selling tab active
- 4 seller stat cards row
- White card with "List a New Item" heading
- MultiStepForm with emerald step indicators and light-coloured inputs

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/selling/page.tsx src/components/selling/
git commit -m "feat: reskin selling page and MultiStepForm — light theme, emerald step indicators"
```

---

## Task 15: Update opengraph-image and clean up dead code

**Files:**
- Modify: `src/app/opengraph-image.tsx`
- Delete reference to `ThemeToggle` (if any imports remain after Navbar rewrite)

- [ ] **Step 1: Update opengraph-image.tsx brand name**

Open `src/app/opengraph-image.tsx`. Find any "MarketX" strings and replace with "MarketXpress".

- [ ] **Step 2: Check for orphaned ThemeToggle imports**

```bash
grep -r "ThemeToggle" /Users/m-agbe/Documents/builds/MarketXpress/MarketX-frontend/src
```

If any files (other than `ThemeToggle.tsx` itself) still import it, remove those imports.

- [ ] **Step 3: Check for remaining "MarketX" (non-Xpress) strings**

```bash
grep -rn '"MarketX"' /Users/m-agbe/Documents/builds/MarketXpress/MarketX-frontend/src --include="*.tsx" --include="*.ts"
grep -rn "'MarketX'" /Users/m-agbe/Documents/builds/MarketXpress/MarketX-frontend/src --include="*.tsx" --include="*.ts"
```

Fix any found instances.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: update OG image brand name, clean up orphaned imports"
```

---

## Task 16: Full visual QA pass

- [ ] **Step 1: Start both servers**

Backend (port 3000):
```bash
cd MarketX-backend && npm run start:dev
```

Frontend (port 3001+):
```bash
cd MarketX-frontend && npm run dev
```

- [ ] **Step 2: Check every route**

| Route | What to verify |
|---|---|
| `/` | Navbar + CategoryBar, hero banners, flash sale timer, category chips, product grid, footer |
| `/auth/login` | Split panel, no Navbar, emerald button, `?registered=1` green banner |
| `/auth/register` | Split panel, role selector, Buyer=emerald Seller=violet button |
| `/dashboard/orders` | Subnav (Orders active), 4 stat cards, order rows |
| `/dashboard/wishlist` | Subnav (Wishlist active), product grid |
| `/dashboard/wallet` | Subnav (Wallet active), dark balance card, action buttons, tx list |
| `/dashboard/selling` | Subnav (Selling active), seller stats, listing form |
| `/profile` | Subnav (Profile active), no crashes |

- [ ] **Step 3: Check auth flow end-to-end**

1. Register with a new email → lands on `/auth/login` with green banner and pre-filled email
2. Login → lands on `/dashboard/orders`
3. Account dropdown shows initials + email + role
4. Sign Out clears session

- [ ] **Step 4: Check Sora font loaded in DevTools**

Network tab → filter "sora" → confirm `sora-latin-400.woff2`, `sora-latin-700.woff2` etc are loaded.

- [ ] **Step 5: Final commit if any QA fixes were made**

```bash
git add -A
git commit -m "fix: QA pass — visual polish and route checks"
```

---

## Done

At this point the full frontend redesign is complete:
- Sora font loaded via `next/font`
- Light theme (`#F9FAFB` bg, `#059669` emerald accent) throughout
- Jumia-style Navbar + CategoryBar on all marketplace pages
- Landing page: hero, flash sale, category chips, product grid, footer
- Auth pages: split-panel with dark brand panel left, clean form right
- Dashboard: DashboardSubnav pill tabs, stat cards, orders table
- New pages: Wishlist and Wallet
- Brand name: "MarketXpress" everywhere
- Auth logic: untouched throughout
