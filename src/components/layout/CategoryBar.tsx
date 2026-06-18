"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const CATEGORIES = [
  { label: "All Categories", value: "" },
  { label: "Electronics", value: "Electronics" },
  { label: "Fashion", value: "Fashion" },
  { label: "Home & Living", value: "Home" },
  { label: "Beauty", value: "Beauty" },
  { label: "Sports", value: "Sports" },
  { label: "Gaming", value: "Gaming" },
  { label: "NFTs & Digital", value: "NFTs" },
];

export default function CategoryBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCat = searchParams.get("cat") ?? "";

  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile")
  )
    return null;

  return (
    <nav className="fixed top-14 left-0 right-0 z-40 h-10 bg-emerald-600 flex items-center px-4 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-0 min-w-max">
        <Link
          href="/marketplace"
          className={`px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors rounded-sm ${
            pathname === "/marketplace"
              ? "text-white font-bold bg-black/20"
              : "text-emerald-100 hover:text-white hover:bg-black/10"
          }`}
        >
          Marketplace
        </Link>
        <span className="text-emerald-400 text-xs px-1">|</span>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value || "all"}
            href={cat.value ? `/?cat=${cat.value}` : "/"}
            className={`px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors rounded-sm ${
              currentCat === cat.value && pathname !== "/marketplace"
                ? "text-white font-bold bg-black/20"
                : "text-emerald-100 hover:text-white hover:bg-black/10"
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
