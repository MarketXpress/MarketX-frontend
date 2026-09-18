import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import DashboardSubnav from "@/components/dashboard/DashboardSubnav";
import ListingForm from "@/components/selling/ListingForm";

export const metadata: Metadata = {
  title: "List an item",
  description: "Put something up for sale on MarketXpress.",
};

export default function NewListingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="pt-14">
        <DashboardSubnav title="My Account" />

        <div className="mx-auto max-w-4xl px-4 py-6">
          <Link
            href="/dashboard/selling"
            className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Your listings
          </Link>

          <h1 className="text-xl font-bold text-ink">List an item</h1>
          <p className="mb-5 mt-0.5 text-sm text-ink-muted">
            Buyers pay into escrow on Stellar. The money is released to you when they confirm
            the item arrived — MarketXpress never holds it.
          </p>

          <ListingForm />
        </div>
      </div>
    </div>
  );
}
