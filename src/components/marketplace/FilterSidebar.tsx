"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FilterSidebar({ 
  className, 
  isDrawerOpen, 
  closeDrawer 
}: { 
  className?: string;
  isDrawerOpen?: boolean;
  closeDrawer?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for instant UI updates
  const [types, setTypes] = useState<string[]>(searchParams.getAll("type"));
  const [status, setStatus] = useState<string[]>(searchParams.getAll("status"));
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [currency, setCurrency] = useState(searchParams.get("currency") || "All");
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "All");

  // Sync state with URL if URL changes externally
  useEffect(() => {
    setTypes(searchParams.getAll("type"));
    setStatus(searchParams.getAll("status"));
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setCurrency(searchParams.get("currency") || "All");
    setMinRating(searchParams.get("minRating") || "All");
  }, [searchParams]);

  // Push new filters to URL
  const applyFilters = useCallback(
    (key: string, values: string[] | string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      
      // Clear existing keys
      params.delete(key);
      
      if (Array.isArray(values)) {
        values.forEach(v => params.append(key, v));
      } else if (values && values !== "All") {
        params.set(key, values);
      }
      
      // Reset page if pagination exists (bonus)
      params.delete("page");
      
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const toggleArrayFilter = (key: string, value: string, currentState: string[], setter: (v: string[]) => void) => {
    const newState = currentState.includes(value)
      ? currentState.filter(v => v !== value)
      : [...currentState, value];
    setter(newState);
    applyFilters(key, newState);
  };

  const handlePriceChange = (e: React.FocusEvent<HTMLInputElement>, key: "minPrice" | "maxPrice", setter: (v: string) => void) => {
    const val = e.target.value;
    applyFilters(key, val || null);
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

  const activeFiltersCount = Array.from(searchParams.keys()).filter(k => k !== "q").length;

  const content = (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <Filter className="w-5 h-5 text-blue-400" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-[10px] px-2 py-0.5 rounded-full">{activeFiltersCount}</span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button onClick={clearAllFilters} className="text-xs text-neutral-400 hover:text-white transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Asset Type */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Asset Type</h4>
        <div className="flex flex-col gap-2">
          {["Digital", "Physical", "Service"].map(t => (
            <label key={t} className="flex items-center gap-3 cursor-pointer group">
              <div className={cn(
                "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                types.includes(t) ? "bg-blue-600 border-blue-600" : "bg-white/5 border-white/10 group-hover:border-blue-500/50"
              )}>
                {types.includes(t) && <span className="w-2.5 h-2.5 bg-white rounded-sm" />}
              </div>
              <span className="text-sm text-neutral-400 group-hover:text-white transition-colors">{t}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/5 w-full" />

      {/* Price Range */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Price Range</h4>
        
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
          {["All", "XLM", "USDC"].map(c => (
            <button
              key={c}
              onClick={() => {
                setCurrency(c);
                applyFilters("currency", c);
              }}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                currency === c ? "bg-white/10 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              {c}
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

      {/* Escrow Status */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Escrow Status</h4>
        <div className="flex flex-col gap-2">
          {["Active", "Completed"].map(s => (
            <label key={s} className="flex items-center gap-3 cursor-pointer group">
              <div className={cn(
                "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                status.includes(s) ? "bg-blue-600 border-blue-600" : "bg-white/5 border-white/10 group-hover:border-blue-500/50"
              )}>
                {status.includes(s) && <span className="w-2.5 h-2.5 bg-white rounded-sm" />}
              </div>
              <span className="text-sm text-neutral-400 group-hover:text-white transition-colors">{s} Status</span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/5 w-full" />

      {/* Seller Rating */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Seller Rating</h4>
        <div className="flex flex-col gap-2">
          {[{label: "Any Rating", val: "All"}, {label: "4+ Stars", val: "4"}, {label: "4.5+ Stars", val: "4.5"}].map(r => (
            <label key={r.val} className="flex items-center gap-3 cursor-pointer group">
              <div className={cn(
                "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                minRating === r.val ? "border-blue-500" : "border-white/20 group-hover:border-blue-500/50"
              )}>
                {minRating === r.val && <div className="w-2h-2 rounded-full bg-blue-500" />}
              </div>
              <input 
                type="radio" 
                name="rating" 
                className="hidden" 
                onChange={() => {
                  setMinRating(r.val);
                  applyFilters("minRating", r.val);
                }}
              />
              <span className="text-sm text-neutral-400 group-hover:text-white transition-colors">{r.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn("hidden lg:block w-72 shrink-0 self-start sticky top-32 p-6 rounded-3xl bg-white/5 border border-white/10", className)}>
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[110] lg:hidden flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDrawer} />
          <div className="relative w-80 max-w-[80vw] h-full bg-[#0a0a0a] border-r border-white/10 p-6 overflow-y-auto animate-in slide-in-from-left duration-300 shadow-2xl">
            <button onClick={closeDrawer} className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-white bg-white/5 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="mt-8">
              {content}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
