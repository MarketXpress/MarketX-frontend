// components/Marketplace/MarketplaceEmptyState.tsx

import Link from "next/link";

type Props = {
  title?: string;
  message?: string;
};

export default function MarketplaceEmptyState({
  title = "No items found",
  message = "Try adjusting your filters or check back later.",
}: Props) {
  return (
    <div className="w-full py-12 flex flex-col items-center text-center gap-3">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <p className="text-sm text-gray-500 max-w-sm">{message}</p>

      <Link
        href="/marketplace"
        className="text-sm text-blue-600 hover:underline"
      >
        Reset filters
      </Link>
    </div>
  );
}