import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getListingForEdit } from "@/lib/listings";
import DashboardSubnav from "@/components/dashboard/DashboardSubnav";
import EditListingForm from "@/components/selling/EditListingForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const listing = await getListingForEdit(supabase, id);

  if (!listing) return { title: "Listing not found" };

  return {
    title: `Edit "${listing.name}" - Selling Dashboard`,
  };
}

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const listing = await getListingForEdit(supabase, id);

  if (!listing) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="pt-14">
        <DashboardSubnav title="Seller Hub" />

        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Link
              href="/dashboard/selling"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition-colors mb-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to listings
            </Link>
            <h1 className="text-xl font-black text-ink">Edit Listing</h1>
            <p className="text-xs text-ink-muted mt-0.5">
              Update pricing, description, or details for &ldquo;{listing.name}&rdquo;.
            </p>
          </div>

          <EditListingForm listing={listing} />
        </div>
      </div>
    </div>
  );
}
