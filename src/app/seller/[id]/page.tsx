import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Star, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSellerActiveListings, getSellerProfile } from "@/lib/listings";
import { formatUsd } from "@/lib/money";

/**
 * A seller's shopfront: everything one seller has for sale, in one place.
 *
 * A server component, so the page arrives with its listings and a seller who
 * does not exist 404s before anything is sent.
 *
 * Nothing here is gated. A buyer deciding whether to send money to a stranger
 * should be able to look at everything that stranger sells, and how they have
 * been rated, without having to sign up first.
 */

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const seller = await getSellerProfile(supabase, id);

  if (!seller) return { title: "Seller not found" };

  return {
    title: seller.displayName,
    description:
      seller.bio ?? `Items for sale from ${seller.displayName} on MarketXpress.`,
  };
}

export default async function SellerStorefrontPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [seller, listings] = await Promise.all([
    getSellerProfile(supabase, id),
    getSellerActiveListings(supabase, id),
  ]);

  if (!seller) notFound();

  const memberSince = new Date(seller.memberSince).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-bg pt-24">
      {/* ------------------------------------------------------------------ */}
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-line bg-surface-2">
            {seller.avatarUrl ? (
              <Image src={seller.avatarUrl} alt="" fill sizes="64px" className="object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-xl font-bold text-ink-faint">
                {seller.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-ink">{seller.displayName}</h1>

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
              {seller.sellerSales > 0 || seller.sellerRating > 0 ? (
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-warn text-warn" aria-hidden="true" />
                  <span className="tnum font-semibold text-ink">
                    {seller.sellerRating.toFixed(1)}
                  </span>
                  <span className="tnum">({seller.sellerSales.toLocaleString()} sales)</span>
                </span>
              ) : (
                <span>New seller</span>
              )}

              <span>Joined {memberSince}</span>

              <span className="flex items-center gap-1">
                <Store className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="tnum">{listings.length}</span>{" "}
                {listings.length === 1 ? "listing" : "listings"}
              </span>
            </div>

            {seller.bio && (
              <p className="mt-2 max-w-2xl text-sm text-ink-muted">{seller.bio}</p>
            )}
          </div>

          {/* The one thing a buyer most wants to know about a stranger: that
              they cannot simply take the money. */}
          {seller.stellarAddress && (
            <div className="flex items-start gap-2 rounded-md border border-ok-line bg-ok-bg px-3 py-2 sm:max-w-56">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden="true" />
              <p className="text-xs text-ink">
                Payouts settle to a verified Stellar account. Your money stays in escrow until
                you confirm delivery.
              </p>
            </div>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {listings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line-strong bg-surface-2 px-6 py-16 text-center">
            <Store className="mx-auto h-8 w-8 text-ink-faint" aria-hidden="true" />
            <h2 className="mt-3 text-base font-bold text-ink">Nothing for sale right now</h2>
            <p className="mt-1 text-sm text-ink-muted">
              {seller.displayName} has no active listings.
            </p>
            <Link
              href="/marketplace"
              className="mt-5 inline-block rounded-md border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
            >
              Browse the marketplace
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {listings.map((listing) => (
              <li key={listing.id}>
                <Link
                  href={`/product/${listing.id}`}
                  className="group block overflow-hidden rounded-lg border border-line bg-surface transition-shadow hover:shadow-panel"
                >
                  <div className="relative aspect-square bg-surface-2">
                    {listing.imageUrl ? (
                      <Image
                        src={listing.imageUrl}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-xs text-ink-faint">
                        No photograph
                      </div>
                    )}

                    {listing.discountPercent > 0 && (
                      <span className="absolute left-2 top-2 rounded bg-deal-bg px-1.5 py-0.5 text-[11px] font-bold text-deal">
                        −{listing.discountPercent}%
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 p-3">
                    <p className="line-clamp-2 text-sm text-ink">{listing.name}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="tnum text-base font-bold text-ink">
                        {formatUsd(listing.usdPrice)}
                      </span>
                      {listing.originalUsdPrice !== null &&
                        listing.originalUsdPrice > listing.usdPrice && (
                          <span className="tnum text-xs text-ink-faint line-through">
                            {formatUsd(listing.originalUsdPrice)}
                          </span>
                        )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
