"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import DashboardSubnav from "@/components/dashboard/DashboardSubnav";
import StatCard from "@/components/dashboard/StatCard";
import { mockTransaction, EscrowTransaction } from "@/lib/escrowData";
import { OrderFilters, filterOrders } from "@/lib/orderFilters";

const STATUS_STYLES: Record<string, string> = {
  in_escrow: "bg-accent-soft text-accent border border-accent-line",
  funded: "bg-blue-50 text-blue-700 border border-blue-200",
  in_transit: "bg-warn-bg text-warn border border-warn-line",
  released: "bg-surface-2 text-ink-muted border border-line",
  disputed: "bg-bad-bg text-bad border border-bad-line",
};

function OrderRow({ order }: { order: EscrowTransaction }) {
  const statusKey = order.currentState.toLowerCase().replace(/\s+/g, "_");

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-surface-2 transition-colors">
      <div className="w-12 h-12 rounded-lg bg-surface-2 shrink-0 flex items-center justify-center">
        <span className="text-lg">📦</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-ink truncate">
          {order.assetName}
        </p>
        <p className="text-xs text-ink-faint">
          {order.seller.name} ·{" "}
          {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-black text-ink">
          {order.priceXLM.toLocaleString()} XLM
        </p>
        <p className="text-[11px] text-ink-faint">
          ≈ ${Math.round(order.priceXLM * 0.206)}
        </p>
      </div>
      <span
        className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
          STATUS_STYLES[statusKey] ?? STATUS_STYLES["in_escrow"]
        }`}
      >
        {statusKey.replace(/_/g, " ")}
      </span>
    </div>
  );
}

export default function OrdersPage() {
  const [filters, setFilters] = useState<OrderFilters>({
    category: "all",
    state: "all",
    sortBy: "newest",
    searchQuery: "",
  });

  const allOrders = useMemo(() => [mockTransaction], []);
  const filteredOrders = useMemo(
    () => filterOrders(allOrders, filters),
    [allOrders, filters]
  );

  return (
    <div className="min-h-screen bg-bg">
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
          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <h2 className="text-sm font-black text-ink">Order History</h2>
              <input
                type="search"
                placeholder="Search orders…"
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, searchQuery: e.target.value }))
                }
                className="border border-line rounded-lg px-3 py-1.5 text-xs text-ink-muted placeholder:text-ink-faint outline-none focus:border-accent w-48"
              />
            </div>

            {filteredOrders.length === 0 ? (
              <div className="py-16 flex flex-col items-center text-center gap-4 px-4">
                <svg
                  width="72"
                  height="72"
                  viewBox="0 0 72 72"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect width="72" height="72" rx="16" fill="#F0FDF4" />
                  <rect x="18" y="22" width="36" height="30" rx="4" fill="#D1FAE5" stroke="#6EE7B7" strokeWidth="2" />
                  <rect x="24" y="16" width="24" height="10" rx="3" fill="#A7F3D0" stroke="#6EE7B7" strokeWidth="2" />
                  <line x1="24" y1="34" x2="48" y2="34" stroke="#6EE7B7" strokeWidth="2" strokeLinecap="round" />
                  <line x1="24" y1="40" x2="40" y2="40" stroke="#6EE7B7" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="52" cy="52" r="10" fill="#FEF3C7" stroke="#FCD34D" strokeWidth="2" />
                  <line x1="52" y1="48" x2="52" y2="53" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="52" cy="55.5" r="1" fill="#F59E0B" />
                </svg>

                <div>
                  <h3 className="text-sm font-bold text-ink mb-1">No orders found</h3>
                  <p className="text-xs text-ink-faint max-w-xs">
                    {filters.searchQuery
                      ? `No orders match "${filters.searchQuery}". Try a different search term.`
                      : "You haven't placed any orders yet. Browse the marketplace to get started."}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {filters.searchQuery && (
                    <button
                      onClick={() => setFilters((f) => ({ ...f, searchQuery: "" }))}
                      className="text-xs font-semibold text-accent border border-accent-line bg-accent-soft hover:bg-accent-soft px-4 py-2 rounded-lg transition-colors"
                    >
                      Clear search
                    </button>
                  )}
                  <Link
                    href="/marketplace"
                    className="text-xs font-semibold text-on-accent bg-accent hover:bg-accent-hover px-4 py-2 rounded-lg transition-colors"
                  >
                    Browse Marketplace
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
