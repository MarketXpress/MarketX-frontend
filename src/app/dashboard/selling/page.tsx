import type { Metadata } from "next";
import Link from "next/link";
import { PackagePlus } from "lucide-react";
import DashboardSubnav from "@/components/dashboard/DashboardSubnav";
import SellerListings from "@/components/selling/SellerListings";

export const metadata: Metadata = {
  title: "Your listings",
  description: "Manage the items you have for sale on MarketXpress.",
};

export default function SellingDashboard() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="pt-14">
        <DashboardSubnav title="My Account" />

        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-ink">Your listings</h1>
              <p className="mt-0.5 text-sm text-ink-muted">
                Everything you have for sale, including drafts.
              </p>
            </div>

            <Link
              href="/dashboard/selling/new"
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
            >
              <PackagePlus className="h-4 w-4" aria-hidden="true" />
              List an item
            </Link>
          </div>

          <SellerListings />
        </div>
      </div>
    </div>
  );
}
