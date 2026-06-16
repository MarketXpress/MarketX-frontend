# MarketXpress Frontend Redesign

**Date:** 2026-06-16  
**Status:** Approved  
**Scope:** Full frontend redesign — every page from landing to dashboard  
**Vision:** Jumia/Konga-style e-commerce marketplace on Stellar blockchain with crypto payments (XLM, USDC). Physical goods, digital goods, and NFTs. Every purchase secured by Stellar smart contract escrow.

---

## Design Decisions

| Decision | Choice |
|---|---|
| Theme | Clean Light — white surfaces, `#F9FAFB` page bg, `#F3F4F6` subtle fills |
| Accent colour | Emerald `#059669` (hover `#047857`, tint bg `#ECFDF5`, tint border `#A7F3D0`) |
| Font | Sora — geometric, Web3-native energy. Weights used: 400 (body), 600 (labels/buttons), 700 (subheadings), 800/900 (prices, headlines) |
| Layout pattern | Jumia/Konga-style — top navbar with search + cart, emerald category bar, product grids |
| Dashboard nav | Global top navbar + pill tab subnav per page |
| Hero | Dark main banner + two side promo banners (3-column layout) |
| Crypto display | Every price shows USD primary + XLM/USDC equivalent secondary |

---

## Design Tokens

```
Background:   #FFFFFF (cards/surfaces), #F9FAFB (page bg), #F3F4F6 (hover/subtle fills)
Border:       #E5E7EB (default), #D1D5DB (strong)
Text:         #111111 (primary), #374151 (secondary), #6B7280 (muted), #9CA3AF (placeholder)
Accent:       #059669 (primary), #047857 (hover), #ECFDF5 (tint bg), #A7F3D0 (tint border)
Danger:       #DC2626, #FEF2F2 bg, #FECACA border
Warning:      #D97706, #FEF3C7 bg
Dark panel:   #111111 / #1F2937 (auth left panel, hero banner)
```

---

## Global Navbar

Shared across every page. Fixed to top, `h-14`, white bg, `border-b border-gray-200`.

**Layout (left → right):**
1. `● MarketXpress` wordmark (emerald dot + bold black text)
2. Full-width search bar — input + emerald `Search` button on the right edge
3. Icon buttons: Account (avatar when logged in) · Cart (with badge count) · Wishlist
4. `Sell on MX` emerald CTA button (visible when logged out or for sellers)

**Authenticated state:** Account icon becomes avatar circle (initials, emerald bg) with dropdown: My Orders · Selling Dashboard · Wallet · Profile · Sign Out.

---

## Emerald Category Bar

Sits directly below the navbar. Emerald `#059669` background, white text links. Horizontal scrollable on mobile.

Categories: All Categories · Electronics · Fashion · Home & Living · Beauty · Sports · Gaming · NFTs & Digital · Sellers

Active category has darker bg (`rgba(0,0,0,0.15)`). Clicking filters the marketplace product grid.

---

## Landing / Home Page (`/`)

### Hero Banners (3-column)
- **Main banner (2/3 width):** Dark bg (`#111` → `#1F2937` gradient), emerald accent label ("🔐 Escrow Protected"), bold headline (*"Buy anything. Pay with crypto. Zero risk."*), subtitle, `Shop Now →` emerald CTA button. Subtle emerald radial glow top-right.
- **Side banners (1/3 width, stacked 2):** Light tinted cards — "New Arrivals" (emerald tint) and "Top Sellers" (blue tint). Each links to a filtered category page.

### Flash Sale Section
- Row header: "⚡ Flash Sale" title + live badge + countdown timer (`HH:MM:SS` in dark blocks) + "View All →" link.
- Product grid: horizontal row of 5 product cards (scrollable on mobile).

### Product Card (reusable component)
- Product image area (grey placeholder, real image later) with discount badge top-left (`-35%`, emerald bg).
- Product name (2-line clamp).
- Price: `$299` bold emerald + `$459` strikethrough muted.
- Crypto price: `≈ 1,450 XLM` in small muted text below.
- Star rating + review count.
- `+ Add to Cart` button (emerald tint, full width).

### Shop by Category
Grid of 8 category chips — emoji icon + label. Tap navigates to filtered marketplace. Categories: Electronics · Fashion · Home · Beauty · Sports · Gaming · NFTs · More.

### Recommended / New Arrivals Section
Second product grid row below categories. Same product card pattern.

### Footer
3-column: Brand + tagline left · Navigation links centre · Social + crypto badge right. Bottom bar: copyright "© 2026 MarketXpress". All "MarketX" instances replaced with "MarketXpress".

---

## Auth Pages

Both share a **split-panel layout**: dark brand panel left (~40%), clean form right (~60%).

**Left panel** (`bg-gray-900`): Wordmark, brand quote, subtle footer text.  
**Right panel** (white): form content, centred vertically.

### Login (`/auth/login`)
- Quote: *"Trade anything. Risk nothing."*
- Form: Email + Password, Remember me, Forgot password link.
- `Sign In` emerald submit button.
- Divider + Google / GitHub social buttons (ghost style).
- Footer: "Don't have an account? Create one free"
- `?registered=1` → green success banner: "Account created! Sign in to continue."
- `?email=` → pre-fills email field.

### Register (`/auth/register`)
- Quote: *"Join 12,000+ traders worldwide."*
- Role segmented control: `🛒 I'm a Buyer` / `🏪 I'm a Seller`. Selected = white bg + shadow. Buyer role = emerald submit, Seller role = violet `#7C3AED` submit.
- Form: First name + Last name (side by side) · Email · Password.
- Submit: `Create Account →` in role colour.
- Footer: "Already have an account? Sign in"
- On success: redirect to `/auth/login?email=<email>&registered=1` (no auto-login after register).

---

## Dashboard

### Global Sub-navbar (shared across all `/dashboard/*`)
White bg, `border-b`, `px-7 h-12`. Left: page title ("My Account"). Right: pill tabs.

**Tabs:** Orders · Wishlist · Selling · Wallet · Profile

Active pill: `bg-emerald-600 text-white rounded-full`. Inactive: `bg-gray-100 text-gray-500`.

### Orders (`/dashboard/orders`)
- **Stat cards (4):** Total Orders · In Escrow (emerald accent card, shows USD + XLM) · Completed · Wallet Balance (XLM + USD equivalent).
- **Orders table:** thumbnail · product name + seller + timestamp · USD amount + XLM amount · status badge.
- **Status badges:** In Escrow (emerald) · Shipped (blue) · Delivered (gray) · Disputed (red).

### Wishlist (`/dashboard/wishlist` — new page)
Grid of saved product cards. Same product card component. `Remove` icon on each. `Add to Cart` button.

### Selling (`/dashboard/selling`)
- **Seller stats:** Active Listings · Total Sales · Pending Payouts · Seller Rating.
- Multi-step listing form (`<MultiStepForm>`) reskinned to light theme. Emerald step progress indicator. Existing step components (Step1–Step4) kept, styled to match.

### Wallet (`/dashboard/wallet` — new page)
- Balance card: XLM balance + USD equivalent, large emerald display.
- Crypto address (truncated, copy button).
- Recent transactions list: sent/received with amounts.
- `Connect Wallet` / `Deposit` / `Withdraw` action buttons (UI only — no blockchain integration in this phase).

### Profile (`/profile`)
- Two-column: avatar + name card left, form sections right.
- Sections: Personal Info · Notification Preferences · Danger Zone.
- Reskin existing components to light theme.

---

## Key New Components

| Component | Purpose |
|---|---|
| `ProductCard.tsx` | Reusable product card — image, name, USD price, XLM price, rating, Add to Cart |
| `CategoryBar.tsx` | Emerald category nav bar below global navbar |
| `HeroBanners.tsx` | 3-column banner layout (main dark + 2 side cards) |
| `FlashSaleSection.tsx` | Row header with timer + horizontal product grid |
| `CategoryChips.tsx` | Shop-by-category emoji grid |
| `DashboardSubnav.tsx` | Shared pill-tab subnav for all dashboard pages |
| `StatCard.tsx` | Reusable stat display card |
| `WalletPage.tsx` | New wallet balance + transactions page |
| `WishlistPage.tsx` | New wishlist grid page |

---

## Components to Reskin (logic unchanged)

- `Navbar.tsx` — full rewrite: search bar, cart icon, wishlist icon, account dropdown
- `AssetCard.tsx` → becomes `ProductCard.tsx` — new design, same mock data shape
- `FilterSidebar.tsx` — light reskin, emerald active states
- `MarketplaceSection.tsx` — product grid layout, use `ProductCard`
- `OrderDetails.tsx`, `OrderFilters.tsx` — light reskin
- `ActivityFeedPanel.tsx`, `ActivitySummaryCards.tsx` — light reskin
- `MultiStepForm.tsx` + Step components — light reskin, emerald progress
- `SearchBar.tsx` — absorbed into new `Navbar.tsx`
- `ThemeToggle.tsx` — **removed** (light-only, no dark mode)

---

## Brand Copy Changes

- Replace every instance of `"MarketX"` → `"MarketXpress"` across all files, metadata, OG tags, footer, auth copy.
- Update `layout.tsx` metadata: title `"MarketXpress | Secure P2P Marketplace"`, template `"%s | MarketXpress"`.
- Update tagline to: *"The safest way to trade anything, peer-to-peer."*
- Remove all blockchain/Stellar jargon from user-facing copy — use plain language ("your payment is protected until delivery").

---

## Pages Scope

| Route | Status |
|---|---|
| `/` | Redesign — Jumia-style homepage |
| `/auth/login` | Redesign — split panel |
| `/auth/register` | Redesign — split panel + role selector |
| `/dashboard/orders` | Redesign — stat cards + order table |
| `/dashboard/wishlist` | **New page** — wishlist grid |
| `/dashboard/selling` | Redesign — seller stats + listing form |
| `/dashboard/wallet` | **New page** — wallet balance + transactions |
| `/dashboard/activity` | Reskin — light theme |
| `/profile` | Reskin — light theme |
| `/help` | Reskin — light theme |

---

## Out of Scope

- Live blockchain / Stellar wallet integration (UI placeholders only)
- Real product data from backend (mock data continues)
- Payment checkout flow (UI shell only, no transaction logic)
- NFT minting or Web3 wallet connection
- Dark mode (removed entirely)
