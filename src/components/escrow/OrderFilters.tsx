"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import {
  OrderFilters,
  SortOption,
  FilterCategory,
  FilterState,
} from "@/lib/orderFilters";
import { cn } from "@/lib/utils";

interface OrderFiltersProps {
  filters: OrderFilters;
  onFiltersChange: (filters: OrderFilters) => void;
}

export default function OrderFiltersComponent({
  filters,
  onFiltersChange,
}: OrderFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
        <input
          type="text"
          placeholder="Search by asset name, contract ID, or party..."
          value={filters.searchQuery}
          onChange={(e) =>
            onFiltersChange({ ...filters, searchQuery: e.target.value })
          }
          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-neutral-500 uppercase tracking-widest font-bold">
          <SlidersHorizontal className="w-4 h-4" />
          Filters:
        </div>

        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              category: e.target.value as FilterCategory,
            })
          }
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
        >
          <option value="all">All Categories</option>
          <option value="Digital">Digital</option>
          <option value="Physical">Physical</option>
          <option value="Service">Service</option>
        </select>

        {/* State Filter */}
        <select
          value={filters.state}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              state: e.target.value as FilterState,
            })
          }
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
        >
          <option value="all">All States</option>
          <option value="funded">Funded</option>
          <option value="in_escrow">In Escrow</option>
          <option value="in_transit">In Transit</option>
          <option value="released">Released</option>
          <option value="disputed">Disputed</option>
        </select>

        {/* Sort By */}
        <select
          value={filters.sortBy}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              sortBy: e.target.value as SortOption,
            })
          }
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price-high">Price: High to Low</option>
          <option value="price-low">Price: Low to High</option>
        </select>
      </div>
    </div>
  );
}
