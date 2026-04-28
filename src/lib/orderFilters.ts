import { EscrowTransaction, EscrowState } from "./escrowData";

export type SortOption = "newest" | "oldest" | "price-high" | "price-low";
export type FilterCategory = "all" | "Digital" | "Physical" | "Service";
export type FilterState = "all" | EscrowState;

export interface OrderFilters {
  category: FilterCategory;
  state: FilterState;
  sortBy: SortOption;
  searchQuery: string;
}

export const filterOrders = (
  orders: EscrowTransaction[],
  filters: OrderFilters,
): EscrowTransaction[] => {
  let filtered = [...orders];

  // Filter by category
  if (filters.category !== "all") {
    filtered = filtered.filter(
      (order) => order.assetCategory === filters.category,
    );
  }

  // Filter by state
  if (filters.state !== "all") {
    filtered = filtered.filter((order) => order.currentState === filters.state);
  }

  // Filter by search query
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (order) =>
        order.assetName.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query) ||
        order.buyer.name.toLowerCase().includes(query) ||
        order.seller.name.toLowerCase().includes(query),
    );
  }

  // Sort
  switch (filters.sortBy) {
    case "newest":
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
    case "oldest":
      filtered.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      break;
    case "price-high":
      filtered.sort((a, b) => b.priceXLM - a.priceXLM);
      break;
    case "price-low":
      filtered.sort((a, b) => a.priceXLM - b.priceXLM);
      break;
  }

  return filtered;
};
