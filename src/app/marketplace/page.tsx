import { Suspense } from "react";
import type { Metadata } from "next";
import MarketplaceSection from "@/components/marketplace/MarketplaceSection";
import MarketplaceLoadingState from "@/components/marketplace/MarketplaceLoadingState";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Browse verified assets secured in Stellar escrow — Digital, Physical, and Service listings.",
};

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <Suspense fallback={<MarketplaceLoadingState />}>
        <MarketplaceSection />
      </Suspense>
    </div>
  );
}
