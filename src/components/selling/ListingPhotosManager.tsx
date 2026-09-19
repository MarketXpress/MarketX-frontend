"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  UploadCloud,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGES,
  MAX_IMAGE_BYTES,
  addListingImages,
  deleteListingImage,
  getListingForEdit,
  getListingImages,
  reorderListingImages,
  setListingCoverImage,
  setListingStatus,
  type ListingImage,
  type SellerListing,
} from "@/lib/listings";
import { cn } from "@/lib/utils";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface ListingPhotosManagerProps {
  listingId: string;
}

export default function ListingPhotosManager({ listingId }: ListingPhotosManagerProps) {
  const supabase = useMemo(() => createClient(), []);
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [listing, setListing] = useState<SellerListing | null>(null);
  const [images, setImages] = useState<ListingImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New files queued for upload
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deletion modal state
  const [pendingDeleteImage, setPendingDeleteImage] = useState<ListingImage | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [listingData, imagesData] = await Promise.all([
        getListingForEdit(supabase, listingId),
        getListingImages(supabase, listingId),
      ]);

      if (!listingData) {
        setError("Listing not found or you do not have permission to manage its photographs.");
        return;
      }

      setListing(listingData);
      setImages(imagesData);
      setError(null);
    } catch {
      setError("Could not load photographs for this listing.");
    } finally {
      setIsLoading(false);
    }
  }, [supabase, listingId, user]);

  useEffect(() => {
    let isCancelled = false;
    if (isAuthLoading) return;
    if (!user) {
      router.push(`/auth/login?returnUrl=/dashboard/selling/${listingId}/images`);
      return;
    }
    const fetchInitial = async () => {
      try {
        const [listingData, imagesData] = await Promise.all([
          getListingForEdit(supabase, listingId),
          getListingImages(supabase, listingId),
        ]);

        if (isCancelled) return;
        if (!listingData) {
          setError("Listing not found or you do not have permission to manage its photographs.");
          return;
        }

        setListing(listingData);
        setImages(imagesData);
        setError(null);
      } catch {
        if (!isCancelled) setError("Could not load photographs for this listing.");
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchInitial();
    return () => {
      isCancelled = true;
    };
  }, [isAuthLoading, user, router, listingId, supabase]);

  // Handle file selection
  const handleFilesChosen = (incoming: FileList | File[]) => {
    const problems: string[] = [];
    const accepted: File[] = [];

    const currentTotal = images.length + newFiles.length;
    const remainingSlots = MAX_IMAGES - currentTotal;

    for (const file of Array.from(incoming)) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        problems.push(`${file.name} is not an accepted format (JPEG, PNG, WebP, AVIF)`);
      } else if (file.size > MAX_IMAGE_BYTES) {
        problems.push(`${file.name} exceeds the 5 MB limit`);
      } else {
        accepted.push(file);
      }
    }

    if (accepted.length > remainingSlots) {
      problems.push(
        `Only ${MAX_IMAGES} total photographs allowed. Kept first ${remainingSlots} selected file(s).`,
      );
    }

    setRejectedFiles(problems);
    if (accepted.length > 0) {
      setNewFiles((prev) => [...prev, ...accepted.slice(0, remainingSlots)]);
    }
  };

  const uploadQueuedFiles = async () => {
    if (!user || newFiles.length === 0) return;
    setIsSaving(true);
    try {
      await addListingImages(supabase, user.id, listingId, newFiles);
      setNewFiles([]);
      toast({
        title: "Photographs uploaded",
        description: `Added ${newFiles.length} new photo(s) to this listing.`,
        variant: "success",
      });
      await loadData();
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Could not upload photographs.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMakeCover = async (image: ListingImage) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await setListingCoverImage(supabase, listingId, image);
      toast({
        title: "Cover image updated",
        description: "This photograph is now the primary image for the marketplace.",
        variant: "success",
      });
      await loadData();
    } catch {
      toast({
        title: "Could not update cover",
        description: "Failed to set cover photograph.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMove = async (index: number, direction: "left" | "right") => {
    if (isSaving) return;
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const nextImages = [...images];
    const [moved] = nextImages.splice(index, 1);
    nextImages.splice(targetIndex, 0, moved);

    // Optimistically update
    setImages(nextImages);
    setIsSaving(true);

    try {
      await reorderListingImages(supabase, listingId, nextImages);
      toast({
        title: "Photographs reordered",
        description: "Updated image order.",
        variant: "success",
      });
      await loadData();
    } catch {
      toast({
        title: "Could not reorder",
        description: "Failed to persist new image order.",
        variant: "error",
      });
      await loadData();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteImage || isSaving) return;
    const target = pendingDeleteImage;
    setPendingDeleteImage(null);
    setIsSaving(true);

    try {
      await deleteListingImage(supabase, listingId, target);
      toast({
        title: "Photograph removed",
        description: "The image was permanently deleted from storage.",
        variant: "success",
      });
      await loadData();
    } catch {
      toast({
        title: "Could not remove photograph",
        description: "Failed to delete the image.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishListing = async () => {
    if (!listing || isSaving || images.length === 0) return;
    setIsSaving(true);
    try {
      await setListingStatus(supabase, listingId, "active");
      setListing((prev) => (prev ? { ...prev, status: "active" } : prev));
      toast({
        title: "Listing published!",
        description: `“${listing.name}” is now live in the marketplace.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Could not publish listing",
        description: "Failed to change listing status to active.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-line bg-surface py-20 text-sm text-ink-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
        Loading listing photographs…
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="rounded-lg border border-bad-line bg-bad-bg p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-bad" />
        <h2 className="mt-2 text-base font-bold text-ink">Unable to load photographs</h2>
        <p className="mt-1 text-sm text-ink-muted">{error ?? "Listing not found."}</p>
        <Link
          href="/dashboard/selling"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to your listings
        </Link>
      </div>
    );
  }

  const remainingSlots = MAX_IMAGES - images.length;

  return (
    <div className="space-y-6">
      {/* Header & Listing Context */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <Link
            href="/dashboard/selling"
            className="mb-1 inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to My Listings
          </Link>
          <h1 className="text-xl font-bold text-ink sm:text-2xl">
            Manage Photographs
          </h1>
          <p className="text-xs text-ink-muted">
            Listing: <span className="font-medium text-ink">{listing.name}</span> · Status:{" "}
            <span className="uppercase tracking-wider font-semibold text-ink">{listing.status}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {listing.status === "draft" && images.length > 0 && (
            <button
              type="button"
              onClick={handlePublishListing}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-md bg-ok px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-ok/90 disabled:opacity-50"
            >
              <Eye className="h-3.5 w-3.5" />
              Publish Listing
            </button>
          )}
          <Link
            href={`/dashboard/selling/${listing.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink transition-colors hover:bg-surface-2"
          >
            Edit Details
          </Link>
        </div>
      </div>

      {/* Confirmation modal for delete */}
      <ConfirmModal
        isOpen={pendingDeleteImage !== null}
        title="Remove photograph?"
        description="This photograph will be permanently deleted from storage and your listing. Remaining photos will be re-ordered automatically."
        confirmLabel="Remove Photo"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDeleteImage(null)}
      />

      {/* Status Bar */}
      <div className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3 text-xs text-ink-muted">
        <span>
          <strong className="text-ink font-semibold">{images.length}</strong> of{" "}
          <strong className="text-ink font-semibold">{MAX_IMAGES}</strong> photographs uploaded
        </span>
        {images.length === 0 && (
          <span className="font-semibold text-warn">
            At least 1 photo is required to publish this listing.
          </span>
        )}
      </div>

      {/* Existing Photographs Grid */}
      {images.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-ink">Current Photographs</h2>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {images.map((img, index) => {
              const isCover = index === 0;
              return (
                <li
                  key={img.id ?? img.url}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-lg border bg-surface transition-all",
                    isCover ? "border-accent ring-1 ring-accent" : "border-line",
                  )}
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-surface-2">
                    <Image
                      src={img.url}
                      alt={`Photograph ${index + 1} for ${listing.name}`}
                      fill
                      sizes="(max-width: 640px) 50vw, 200px"
                      className="object-cover"
                    />

                    {/* Cover badge */}
                    {isCover ? (
                      <span className="absolute left-2 top-2 rounded bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-accent shadow">
                        Cover Photo
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMakeCover(img)}
                        disabled={isSaving}
                        className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-surface/90 px-2 py-1 text-[11px] font-medium text-ink shadow opacity-90 transition-opacity hover:bg-accent hover:text-on-accent focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-40"
                        title="Set as marketplace cover photograph"
                      >
                        <Star className="h-3 w-3" />
                        Make Cover
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => setPendingDeleteImage(img)}
                      disabled={isSaving}
                      className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded bg-surface/90 text-ink-muted shadow transition-colors hover:bg-bad hover:text-white disabled:opacity-40"
                      aria-label={`Delete photograph ${index + 1}`}
                      title="Delete photograph"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Ordering Controls Footer */}
                  <div className="flex items-center justify-between border-t border-line bg-surface-2/60 px-2 py-1.5 text-xs text-ink-muted">
                    <span className="font-mono text-[11px] font-medium text-ink-faint">
                      Pos {index + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMove(index, "left")}
                        disabled={index === 0 || isSaving}
                        className="grid h-6 w-6 place-items-center rounded text-ink-muted hover:bg-surface hover:text-ink disabled:opacity-20"
                        title="Move photo earlier"
                        aria-label="Move photo earlier"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, "right")}
                        disabled={index === images.length - 1 || isSaving}
                        className="grid h-6 w-6 place-items-center rounded text-ink-muted hover:bg-surface hover:text-ink disabled:opacity-20"
                        title="Move photo later"
                        aria-label="Move photo later"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Add New Photographs Section */}
      {remainingSlots > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-ink">
            Add More Photographs ({remainingSlots} slot{remainingSlots === 1 ? "" : "s"} available)
          </h2>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="sr-only"
            disabled={isSaving}
            onChange={(e) => {
              if (e.target.files) handleFilesChosen(e.target.files);
              e.target.value = "";
            }}
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files) handleFilesChosen(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center transition-colors",
              isDragging
                ? "border-accent bg-accent-soft"
                : "border-line-strong bg-surface-2 hover:border-accent hover:bg-accent-soft",
              isSaving && "cursor-not-allowed opacity-50",
            )}
          >
            <ImagePlus className="h-6 w-6 text-ink-faint" />
            <span className="text-sm font-semibold text-ink">
              Drop new photographs here, or click to browse
            </span>
            <span className="text-xs text-ink-faint">
              JPEG, PNG, WebP, AVIF · up to 5 MB each
            </span>
          </div>

          {/* Validation errors */}
          {rejectedFiles.length > 0 && (
            <ul className="space-y-1">
              {rejectedFiles.map((msg) => (
                <li key={msg} className="flex items-start gap-1.5 text-xs text-warn">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {msg}
                </li>
              ))}
            </ul>
          )}

          {/* Pending uploads queue */}
          {newFiles.length > 0 && (
            <div className="rounded-lg border border-line bg-surface p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink">
                  {newFiles.length} photo(s) selected to upload
                </span>
                <button
                  type="button"
                  onClick={uploadQueuedFiles}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-xs font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <UploadCloud className="h-3.5 w-3.5" />
                  )}
                  Upload & Save Photos
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {newFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center gap-1.5 rounded-md border border-line bg-surface-2 px-2.5 py-1 text-xs text-ink"
                  >
                    <span className="truncate max-w-[140px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setNewFiles((f) => f.filter((_, i) => i !== idx))}
                      className="text-ink-muted hover:text-bad"
                      aria-label={`Remove ${file.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
        <div className="rounded-lg border border-line bg-surface-2 px-4 py-3 text-xs text-ink-muted text-center">
          Maximum limit of {MAX_IMAGES} photographs reached. Delete an existing photo to upload a replacement.
        </div>
      )}
    </div>
  );
}
