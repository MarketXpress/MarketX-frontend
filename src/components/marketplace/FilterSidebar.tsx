"use client";

import { useCallback, useState, type FocusEvent } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterSidebarProps = {
  className?: string;
  isDrawerOpen?: boolean;
  closeDrawer?: () => void;
};

export default function FilterSidebar({
  className,
  isDrawerOpen,
  closeDrawer,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [types, setTypes] = useState<string[]>(() => searchParams.getAll("type"));
  const [status, setStatus] = useState<string[]>(() => searchParams.getAll("status"));
  const [minPrice, setMinPrice] = useState(() => searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get("maxPrice") || "");
  const [currency, setCurrency] = useState(() => searchParams.get("currency") || "All");
  const [minRating, setMinRating] = useState(() => searchParams.get("minRating") || "All");

  const applyFilters = useCallback(
    (key: string, values: string[] | string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      params.delete(key);

      if (Array.isArray(values)) {
        values.forEach((value) => params.append(key, value));
      } else if (values && values !== "All") {
        params.set(key, values);
      }

      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const toggleArrayFilter = (
    key: string,
    value: string,
    currentState: string[],
    setCurrentState: (next: string[]) => void,
  ) => {
    const nextState = currentState.includes(value)
      ? currentState.filter((item) => item !== value)
      : [...currentState, value];

    setCurrentState(nextState);
    applyFilters(key, nextState);
  };

  const handlePriceChange = (
    e: FocusEvent<HTMLInputElement>,
    key: "minPrice" | "maxPrice",
    setValue: (next: string) => void,
  ) => {
    const value = e.target.value;
    setValue(value);
    applyFilters(key, value || null);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("type");
    params.delete("status");
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("currency");
    params.delete("minRating");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const activeFiltersCount = Array.from(searchParams.keys()).filter(
    (key) => key !== "q" && key !== "page",
  ).length;

  const content = (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <Filter className="w-5 h-5 text-blue-400" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-[10px] px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
          Asset Type
        </h4>
        <div className="flex flex-col gap-2">
          {["Digital", "Physical", "Service"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleArrayFilter("type", type, types, setTypes)}
              className="flex items-center gap-3 cursor-pointer group text-left"
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                  types.includes(type)
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white/5 border-white/10 group-hover:border-blue-500/50",
                )}
              >
                {types.includes(type) && (
                  <span className="w-2.5 h-2.5 bg-white rounded-sm" />
                )}
              </div>
              <span className="text-sm text-neutral-400 group-hover:text-white transition-colors">
                {type}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/5 w-full" />

      <div className="space-y-4">
        <h4 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
          Price Range
        </h4>

        <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
          {["All", "XLM", "USDC"].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setCurrency(value);
                applyFilters("currency", value);
              }}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                currency === value
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-300",
              )}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={(e) => handlePriceChange(e, "minPrice", setMinPrice)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
          <span className="text-neutral-600">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={(e) => handlePriceChange(e, "maxPrice", setMaxPrice)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
        </div>
      </div>

      <div className="h-px bg-white/5 w-full" />

      <div className="space-y-3">
        <h4 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
          Escrow Status
        </h4>
        <div className="flex flex-col gap-2">
          {["Active", "Completed"].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleArrayFilter("status", value, status, setStatus)}
              className="flex items-center gap-3 cursor-pointer group text-left"
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                  status.includes(value)
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white/5 border-white/10 group-hover:border-blue-500/50",
                )}
              >
                {status.includes(value) && (
                  <span className="w-2.5 h-2.5 bg-white rounded-sm" />
                )}
              </div>
              <span className="text-sm text-neutral-400 group-hover:text-white transition-colors">
                {value} Status
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/5 w-full" />

      <div className="space-y-3">
        <h4 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
          Seller Rating
        </h4>
        <div className="flex flex-col gap-2">
          {[
            { label: "Any Rating", val: "All" },
            { label: "4+ Stars", val: "4" },
            { label: "4.5+ Stars", val: "4.5" },
          ].map((rating) => (
            <button
              key={rating.val}
              type="button"
              onClick={() => {
                setMinRating(rating.val);
                applyFilters("minRating", rating.val);
              }}
              className="flex items-center gap-3 cursor-pointer group text-left"
            >
              <div
                className={cn(
                  "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                  minRating === rating.val
                    ? "border-blue-500"
                    : "border-white/20 group-hover:border-blue-500/50",
                )}
              >
                {minRating === rating.val && (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </div>
              <span className="text-sm text-neutral-400 group-hover:text-white transition-colors">
                {rating.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "hidden lg:block w-72 shrink-0 self-start sticky top-32 p-6 rounded-3xl bg-white/5 border border-white/10",
          className,
        )}
      >
        {content}
      </aside>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-[110] lg:hidden flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeDrawer}
          />
          <div className="relative w-80 max-w-[80vw] h-full bg-[#0a0a0a] border-r border-white/10 p-6 overflow-y-auto animate-in slide-in-from-left duration-300 shadow-2xl">
            <button
              onClick={closeDrawer}
              className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-white bg-white/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mt-8">{content}</div>
          </div>
        </div>
      )}
    </>
  );
}
