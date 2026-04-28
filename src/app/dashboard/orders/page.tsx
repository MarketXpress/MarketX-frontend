"use client";

import { useState, useMemo } from "react";
import OrderDetails from "@/components/escrow/OrderDetails";
import OrderFiltersComponent from "@/components/escrow/OrderFilters";
import { mockTransaction } from "@/lib/escrowData";
import { OrderFilters, filterOrders } from "@/lib/orderFilters";

export default function OrdersPage() {
  const [filters, setFilters] = useState<OrderFilters>({
    category: "all",
    state: "all",
    sortBy: "newest",
    searchQuery: "",
  });

  // Mock multiple orders for demonstration
  const allOrders = useMemo(() => [mockTransaction], []);
  const filteredOrders = useMemo(
    () => filterOrders(allOrders, filters),
    [allOrders, filters],
  );

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 bg-[#050505] text-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            My Orders
          </h1>
          <p className="text-neutral-400">
            Track the state of your escrowed transactions in real-time.
          </p>
        </div>

        <div className="mb-8">
          <OrderFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-12 bg-white/5 border border-white/10 rounded-3xl text-center">
            <p className="text-neutral-400">No orders match your filters.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredOrders.map((order) => (
              <OrderDetails key={order.id} initialTransaction={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
