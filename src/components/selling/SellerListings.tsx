"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  ImageOff,
  Loader2,
  PackagePlus,
  Star,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  deleteListing,
  getSellerListings,
  setListingStatus,
  type ListingStatus,
  type SellerListing,
} from "@/lib/listings";
import { formatUsd } from "@/lib/money";
import { cn } from "@/lib/utils";
import ConfirmModal from "@/components/ui/ConfirmModal";

/**
 * A seller's own listings, in every status.
 *
 * Drafts are shown alongside live listings because a draft is usually the
 * result of an upload that failed half way, and a seller who cannot see it
 * will simply create the listing again.
 */
export default function SellerListings() {
  const supabase = useMemo(() => createClient(), []);
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  const [listings, setListings] = useState<SellerListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SellerListing | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setListings(await getSellerListings(supabase, user.id));
      setError(null);
    } catch {
      setError("Could not load your listings. Refresh to try again.");
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      setIsLoading(false);
      return;
    }
    load();
  }, [isAuthLoading, user, load]);

  async function changeStatus(listing: SellerListing, status: ListingStatus) {
    setBusyId(listing.id);
    try {
      await setListingStatus(supabase, listing.id, status);
      setListings((current) =>
        current.map((item) => (item.id === listing.id ? { ...item, status } : item)),
      );
      toast({
        title: status === "active" ? "Listing published" : "Listing hidden",
        description:
          status === "active"
            ? `${listing.name} is visible in the marketplace.`
            : `${listing.name} is no longer shown to buyers.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Could not update the listing",
        description: "Try again in a moment.",
        variant: "error",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    const listing = pendingDelete;
    if (!listing) return;

    setPendingDelete(null);
    setBusyId(listing.id);
    try {
      await deleteListing(supabase, listing.id);
      setListings((current) => current.filter((item) => item.id !== listing.id));
      toast({
        title: "Listing deleted",
        description: `${listing.name} and its photographs were removed.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Could not delete the listing",
        description: "Try again in a moment.",
        variant: "error",
      });
    } finally {
      setBusyId(null);
    }
  }

  if (isAuthLoading || isLoading) {
    return (
      <div className="space-y-4" aria-label="Loading your listings" role="status">
        <dl className="mb-4 grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-line bg-surface px-3 py-2.5">
              <div className="h-3 w-12 rounded bg-surface-2 animate-pulse" />
              <div className="mt-1.5 h-6 w-16 rounded bg-surface-2 animate-pulse" />
            </div>
          ))}
        </dl>
        <ul className="space-y-2">
          {[1, 2, 3].map((i) => (
            <li
              key={i}
              className="flex items-center gap-4 rounded-lg border border-line bg-surface p-3"
            >
              <div className="h-16 w-16 shrink-0 rounded-md bg-surface-2 animate-pulse" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-12 rounded bg-surface-2 animate-pulse" />
                  <div className="h-3 w-20 rounded bg-surface-2 animate-pulse" />
                </div>
                <div className="h-4 w-3/4 rounded bg-surface-2 animate-pulse" />
                <div className="flex items-center gap-3">
                  <div className="h-3 w-16 rounded bg-surface-2 animate-pulse" />
                  <div className="h-3 w-12 rounded bg-surface-2 animate-pulse" />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <div className="h-8 w-8 rounded-md bg-surface-2 animate-pulse" />
                <div className="h-8 w-8 rounded-md bg-surface-2 animate-pulse" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-lg border border-bad-line bg-bad-bg px-4 py-3 text-sm text-ink">{error}</p>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line-strong bg-surface-2 px-6 py-16 text-center">
        <PackagePlus className="mx-auto h-8 w-8 text-ink-faint" aria-hidden="true" />
        <h2 className="mt-3 text-base font-bold text-ink">Nothing listed yet</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">
          Put something up for sale. Buyers pay into escrow, and the money is released to you
          when they confirm they have received it.
        </p>
        <Link
          href="/dashboard/selling/new"
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
        >
          <PackagePlus className="h-4 w-4" aria-hidden="true" />
          List an item
        </Link>
      </div>
    );
  }

  const live = listings.filter((item) => item.status === "active");
  const drafts = listings.filter((item) => item.status === "draft");
  const listedValue = live.reduce((total, item) => total + item.usdPrice, 0);

  return (
    <>
      {/* Counted from the rows on screen rather than fetched separately, so the
          figures cannot disagree with the list underneath them. */}
      <dl className="mb-4 grid grid-cols-3 gap-2">
        <Stat label="Live" value={String(live.length)} />
        <Stat label="Drafts" value={String(drafts.length)} />
        <Stat label="Listed value" value={formatUsd(listedValue)} />
      </dl>

      <ConfirmModal
        isOpen={pendingDelete !== null}
        title="Delete this listing?"
        description={
          pendingDelete
            ? `“${pendingDelete.name}” and its photographs will be removed permanently. Orders already placed against it are not affected.`
            : ""
        }
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <ul className="space-y-2">
        {listings.map((listing) => {
          const isBusy = busyId === listing.id;

          return (
            <li
              key={listing.id}
              className={cn(
                "flex items-center gap-4 rounded-lg border border-line bg-surface p-3 transition-opacity",
                isBusy && "opacity-60",
              )}
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-surface-2">
                {listing.imageUrl ? (
                  <Image
                    src={listing.imageUrl}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center">
                    <ImageOff className="h-4 w-4 text-ink-faint" aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <StatusPill status={listing.status} />
                  {listing.categoryName && (
                    <span className="truncate text-xs text-ink-faint">{listing.categoryName}</span>
                  )}
                </div>
                <Link
                  href={`/product/${listing.id}`}
                  className="mt-0.5 block truncate text-sm font-medium text-ink hover:text-accent"
                >
                  {listing.name}
                </Link>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-ink-muted">
                  <span className="tnum font-semibold text-ink">{formatUsd(listing.usdPrice)}</span>
                  {listing.reviewCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-warn text-warn" aria-hidden="true" />
                      <span className="tnum">{listing.rating.toFixed(1)}</span>
                      <span className="text-ink-faint">({listing.reviewCount})</span>
                    </span>
                  )}
                  <span className="text-ink-faint">
                    {listing.imageCount} photo{listing.imageCount === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {listing.status === "active" ? (
                  <IconAction
                    label="Hide from the marketplace"
                    onClick={() => changeStatus(listing, "archived")}
                    disabled={isBusy}
                  >
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  </IconAction>
                ) : (
                  <IconAction
                    label="Publish to the marketplace"
                    onClick={() => changeStatus(listing, "active")}
                    disabled={isBusy || listing.imageCount === 0}
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  </IconAction>
                )}

                <IconAction
                  label="Delete this listing"
                  onClick={() => setPendingDelete(listing)}
                  disabled={isBusy}
                  destructive
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </IconAction>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

const STATUS_LABELS: Record<ListingStatus, string> = {
  draft: "Draft",
  active: "Live",
  sold: "Sold",
  archived: "Hidden",
};

const STATUS_CLASSES: Record<ListingStatus, string> = {
  draft: "border-warn-line bg-warn-bg text-warn",
  active: "border-ok-line bg-ok-bg text-ok",
  sold: "border-accent-line bg-accent-soft text-accent",
  archived: "border-line bg-surface-2 text-ink-faint",
};

function StatusPill({ status }: { status: ListingStatus }) {
  return (
    <span
      className={cn(
        "rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        STATUS_CLASSES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function IconAction({
  label,
  onClick,
  disabled,
  destructive,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-md text-ink-muted transition-colors",
        "hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40",
        destructive ? "hover:text-bad" : "hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2.5">
      <dt className="label">{label}</dt>
      <dd className="tnum mt-0.5 text-lg font-bold text-ink">{value}</dd>
    </div>
  );
}
