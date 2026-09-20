import type { Metadata } from "next";
import ListingPhotosManager from "@/components/selling/ListingPhotosManager";

export const metadata: Metadata = {
  title: "Manage Photographs — MarketXpress",
  description: "Add, remove, and reorder photographs for your listing.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ManageListingPhotosPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <ListingPhotosManager listingId={id} />
    </main>
  );
}
