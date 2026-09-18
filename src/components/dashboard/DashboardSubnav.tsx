"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Orders", href: "/dashboard/orders" },
  { label: "Wishlist", href: "/dashboard/wishlist" },
  { label: "Selling", href: "/dashboard/selling" },
  { label: "Wallet", href: "/dashboard/wallet" },
  { label: "Profile", href: "/profile" },
];

export default function DashboardSubnav({ title }: { title: string }) {
  const pathname = usePathname();

  return (
    <div className="bg-surface border-b border-line px-4 sm:px-6 h-12 flex items-center justify-between gap-4">
      <h1 className="text-sm font-bold text-ink hidden sm:block shrink-0">{title}</h1>
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const active =
            pathname === tab.href ||
            pathname.startsWith(`${tab.href}/`) ||
            (tab.href === "/dashboard/orders" && pathname === "/dashboard");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                active
                  ? "bg-accent text-on-accent"
                  : "bg-surface-2 text-ink-muted hover:bg-surface-3 hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
