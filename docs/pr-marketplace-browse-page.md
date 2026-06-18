# feat: Marketplace Browse Page (`/marketplace`)

## Summary

Routes the existing but unconnected marketplace components — `MarketplaceSection`, `FilterSidebar`, and `AssetCard` — to a live, browsable page at `/marketplace`. No new component logic was written; this PR purely wires up the route and navigation entry points.

---

## Changes

### `src/app/marketplace/page.tsx` *(new)*

Thin Next.js App Router page that:

- Exports `metadata` with a descriptive title and description for SEO
- Renders a `pt-14` wrapper (accounts for fixed Navbar height) with `bg-gray-50`
- Wraps `<MarketplaceSection />` in a `<Suspense>` boundary (required because `MarketplaceSection` uses `useSearchParams`) with `<MarketplaceLoadingState />` as the fallback

```
/marketplace
/marketplace?q=camera
/marketplace?type=Digital&status=Active
/marketplace?minPrice=100&maxPrice=500&currency=XLM
/marketplace?page=2
```

All URL-driven filter and pagination state is handled entirely inside `MarketplaceSection` — the page component stays zero-state.

---

### `src/components/layout/CategoryBar.tsx`

Added a **Marketplace** navigation link at the leading position in the category bar:

- Links to `/marketplace`
- Highlights with `bg-black/20` active state when `pathname === "/marketplace"`
- Separated from the category chips by a subtle divider
- Category chips no longer show active state when on the `/marketplace` route

---

## How It Works

`MarketplaceSection` already implements:

| Feature | Details |
|---|---|
| **Search** | `?q=` query param, multi-term, case-insensitive |
| **Asset Type filter** | `?type=Digital`, `?type=Physical`, `?type=Service` (multi-select) |
| **Escrow Status filter** | `?status=Active`, `?status=Completed` (multi-select) |
| **Price Range filter** | `?minPrice=`, `?maxPrice=`, `?currency=` |
| **Seller Rating filter** | `?minRating=4` or `?minRating=4.5` |
| **Pagination** | `?page=N`, page size of 6, "Load more" button |
| **Empty state** | `SearchX` icon with descriptive message |
| **Mobile filters** | Slide-in drawer triggered by Filters button |

---

## Screenshots

> _Attach screenshots of the marketplace page (desktop + mobile, with and without active filters) before merging._

---

## Testing Checklist

- [ ] `/marketplace` loads and displays all 10 mock assets
- [ ] Search via `?q=camera` filters results correctly
- [ ] Asset Type checkboxes update the URL and filter the grid
- [ ] Escrow Status checkboxes update the URL and filter the grid
- [ ] Price range inputs (min/max) filter by `priceAmount`
- [ ] Currency toggle (All / XLM / USDC) filters by `priceCurrency`
- [ ] Seller Rating radio filters correctly
- [ ] Pagination buttons navigate between pages via `?page=N`
- [ ] "Load more" button increments page
- [ ] Empty state renders when no assets match
- [ ] "Clear all" resets all filters
- [ ] Mobile filter drawer opens and closes correctly
- [ ] `MarketplaceLoadingState` spinner shows during Suspense
- [ ] **Marketplace** link in CategoryBar highlights when on `/marketplace`
- [ ] Metadata title shows "Marketplace | MarketXpress" in browser tab

---

## Related

- Closes #60
- Branch: `feat/marketplace-browse-page`
