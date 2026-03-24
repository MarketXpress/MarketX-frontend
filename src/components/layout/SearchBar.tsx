"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 500);

  // Sync internal state with external URL changes if we navigate back
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Push to URL when debounced query changes
  useEffect(() => {
    // If the query is unchanged from what's in URL, do nothing on initial mount
    if (debouncedQuery === searchParams.get("q") && !debouncedQuery) return;
    
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }
    
    // Always navigate to home/explore so search works everywhere
    const targetPath = pathname.startsWith("/dashboard") ? "/" : pathname;
    router.push(`${targetPath}?${params.toString()}`, { scroll: false });
  }, [debouncedQuery, router, pathname]);

  return (
    <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
      <Search className="w-4 h-4 text-neutral-500" />
      <input
        type="text"
        placeholder="Search assets..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-transparent border-none outline-none text-sm px-2 text-white placeholder:text-neutral-600 w-32 lg:w-48"
      />
    </div>
  );
}
