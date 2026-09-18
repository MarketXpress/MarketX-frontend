"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import type { Category } from "@/lib/listings";
import { cn } from "@/lib/utils";

/**
 * Marketplace filters.
 *
 * Rewritten for the real catalogue. The previous version filtered on the mock
 * escrow-asset shape — asset type (Digital / Physical / Service), escrow
 * status, and a currency toggle — none of which is a property of a listing.
 * Categories come from the `categories` table, prices are in USD because that
 * is what listings are priced in, and escrow status belongs to an order rather
 * than to the thing being sold.
 *
 * All state lives in the URL, so a filtered view can be linked and the back
 * button behaves.
 */

interface FilterSidebarProps {
  categories: Category[];
  isDrawerOpen: boolean;
  closeDrawer: () => void;
}

const RATINGS = [
  { label: "Any rating", value: "" },
  { label: "4.0 and above", value: "4" },
  { label: "4.5 and above", value: "4.5" },
];

export default function FilterSidebar({
  categories,
  isDrawerOpen,
  closeDrawer,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategories = searchParams.getAll("category");
  const minRating = searchParams.get("minRating") ?? "";

  // Price is held locally while being typed. Pushing a new URL on every
  // keystroke would put a history entry behind each digit and fire a query for
  // "1", "12", "125" on the way to 1250.
  const [minPrice, setMinPrice] = useState(() => searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get("maxPrice") ?? "");

  const apply = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      // Any filter change invalidates the page number — page 4 of the old
      // result set is usually empty in the new one.
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const toggleCategory = (id: string) =>
    apply((params) => {
      const current = params.getAll("category");
      params.delete("category");
      const next = current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id];
      for (const value of next) params.append("category", value);
    });

  const applyPrice = () =>
    apply((params) => {
      if (minPrice.trim()) params.set("minPrice", minPrice.trim());
      else params.delete("minPrice");
      if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());
      else params.delete("maxPrice");
    });

  const setRating = (value: string) =>
    apply((params) => {
      if (value) params.set("minRating", value);
      else params.delete("minRating");
    });

  const clearAll = () => {
    setMinPrice("");
    setMaxPrice("");
    apply((params) => {
      for (const key of ["category", "minPrice", "maxPrice", "minRating"]) {
        params.delete(key);
      }
    });
  };

  const activeCount =
    selectedCategories.length +
    (searchParams.get("minPrice") ? 1 : 0) +
    (searchParams.get("maxPrice") ? 1 : 0) +
    (minRating ? 1 : 0);

  const panel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
          <SlidersHorizontal className="h-4 w-4 text-ink-muted" aria-hidden="true" />
          Filters
        </h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-accent underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <fieldset>
        <legend className="label mb-2">Category</legend>
        <div className="space-y-1.5">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex cursor-pointer items-center gap-2 text-sm text-ink-muted hover:text-ink"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
                className="h-3.5 w-3.5 rounded border-line-strong accent-[var(--accent)]"
              />
              {category.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label mb-2">Price (USD)</legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            inputMode="decimal"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            onBlur={applyPrice}
            onKeyDown={(event) => event.key === "Enter" && applyPrice()}
            placeholder="Min"
            aria-label="Minimum price in dollars"
            className="tnum w-full rounded-md border border-line-strong bg-surface px-2 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
          />
          <span className="text-ink-faint" aria-hidden="true">
            –
          </span>
          <input
            type="number"
            min="0"
            inputMode="decimal"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            onBlur={applyPrice}
            onKeyDown={(event) => event.key === "Enter" && applyPrice()}
            placeholder="Max"
            aria-label="Maximum price in dollars"
            className="tnum w-full rounded-md border border-line-strong bg-surface px-2 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="label mb-2">Seller rating</legend>
        <div className="space-y-1.5">
          {RATINGS.map((option) => (
            <label
              key={option.label}
              className="flex cursor-pointer items-center gap-2 text-sm text-ink-muted hover:text-ink"
            >
              <input
                type="radio"
                name="minRating"
                checked={minRating === option.value}
                onChange={() => setRating(option.value)}
                className="h-3.5 w-3.5 accent-[var(--accent)]"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );

  return (
    <>
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-28 rounded-lg border border-line bg-surface p-4">{panel}</div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          isDrawerOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!isDrawerOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity",
            isDrawerOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={closeDrawer}
        />
        <div
          role="dialog"
          aria-modal={isDrawerOpen}
          aria-label="Filters"
          className={cn(
            "absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-surface p-5 shadow-modal transition-transform",
            isDrawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close filters"
            className="absolute right-3 top-3 rounded-md p-1.5 text-ink-faint hover:bg-surface-2 hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
          {panel}
        </div>
      </div>
    </>
  );
}
