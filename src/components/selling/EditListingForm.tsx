"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";
import {
  editListingSchema,
  type EditListingFormData,
} from "@/lib/validations/listing";
import {
  getCategories,
  updateListing,
  type Category,
  type SellerListing,
} from "@/lib/listings";
import { formatUsd, formatXlm, usdToXlm } from "@/lib/money";

interface EditListingFormProps {
  listing: SellerListing;
}

export default function EditListingForm({ listing }: EditListingFormProps) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditListingFormData>({
    resolver: zodResolver(editListingSchema),
    mode: "onTouched",
    defaultValues: {
      name: listing.name,
      description: listing.description ?? "",
      categoryId: listing.categoryId ?? "",
      usdPrice: listing.usdPrice,
      originalUsdPrice: listing.originalUsdPrice,
    },
  });

  const watched = watch();

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const cats = await getCategories(supabase);
        if (!active) return;
        setCategories(cats);
      } catch {
        if (active) setSubmitError("Could not load categories. Refresh and try again.");
      } finally {
        if (active) setIsLoadingCategories(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [supabase]);

  async function onSubmit(data: EditListingFormData) {
    setSubmitError(null);

    try {
      await updateListing(supabase, listing.id, {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        usdPrice: data.usdPrice,
        originalUsdPrice: data.originalUsdPrice,
      });

      toast({
        title: "Listing updated",
        description: "Your changes have been saved successfully.",
        variant: "success",
      });

      router.push("/dashboard/selling");
      router.refresh();
    } catch (err) {
      console.error("Failed to update listing:", err);
      setSubmitError("Could not save changes. Please try again in a moment.");
    }
  }

  const parsedUsd = typeof watched.usdPrice === "number" && !isNaN(watched.usdPrice) ? watched.usdPrice : 0;
  const xlmEquivalent = parsedUsd > 0 ? usdToXlm(parsedUsd) : 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <div className="flex items-start gap-3 rounded-lg border border-bad-line bg-bad-bg p-4 text-sm text-bad">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{submitError}</p>
        </div>
      )}

      {/* Listing details card */}
      <div className="rounded-xl border border-line bg-surface p-6 space-y-5">
        <h2 className="text-base font-bold text-ink">Item Details</h2>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-xs font-semibold text-ink mb-1.5">
            Listing title
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
            className="w-full rounded-lg border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-accent focus:bg-surface transition-colors"
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-bad">{errors.name.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="categoryId" className="block text-xs font-semibold text-ink mb-1.5">
            Category
          </label>
          <select
            id="categoryId"
            {...register("categoryId")}
            disabled={isLoadingCategories}
            className="w-full rounded-lg border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent focus:bg-surface transition-colors"
          >
            <option value="">Select a category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1.5 text-xs text-bad">{errors.categoryId.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-xs font-semibold text-ink mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            rows={5}
            {...register("description")}
            placeholder="Describe the condition, features, history, and what accessories are included…"
            className="w-full rounded-lg border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-accent focus:bg-surface transition-colors leading-relaxed"
          />
          {errors.description && (
            <p className="mt-1.5 text-xs text-bad">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Pricing card */}
      <div className="rounded-xl border border-line bg-surface p-6 space-y-5">
        <h2 className="text-base font-bold text-ink">Pricing</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Asking price */}
          <div>
            <label htmlFor="usdPrice" className="block text-xs font-semibold text-ink mb-1.5">
              Price (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-ink-faint">
                $
              </span>
              <input
                id="usdPrice"
                type="number"
                step="0.01"
                min="0.01"
                {...register("usdPrice", { valueAsNumber: true })}
                className="w-full rounded-lg border border-line bg-surface-2 pl-8 pr-3.5 py-2.5 text-sm font-medium text-ink placeholder:text-ink-faint outline-none focus:border-accent focus:bg-surface transition-colors"
              />
            </div>
            {errors.usdPrice && (
              <p className="mt-1.5 text-xs text-bad">{errors.usdPrice.message}</p>
            )}

            {parsedUsd > 0 && (
              <p className="mt-2 text-xs text-ink-muted">
                Buyer pays ≈ <strong className="text-ink">{formatXlm(xlmEquivalent)}</strong> via Stellar Escrow
              </p>
            )}
          </div>

          {/* Original price */}
          <div>
            <label htmlFor="originalUsdPrice" className="block text-xs font-semibold text-ink mb-1.5">
              Original &ldquo;Was&rdquo; Price (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-ink-faint">
                $
              </span>
              <input
                id="originalUsdPrice"
                type="number"
                step="0.01"
                min="0.01"
                {...register("originalUsdPrice", {
                  setValueAs: (v) => (v === "" || isNaN(v) ? null : Number(v)),
                })}
                placeholder="e.g. 199.00"
                className="w-full rounded-lg border border-line bg-surface-2 pl-8 pr-3.5 py-2.5 text-sm font-medium text-ink placeholder:text-ink-faint outline-none focus:border-accent focus:bg-surface transition-colors"
              />
            </div>
            {errors.originalUsdPrice && (
              <p className="mt-1.5 text-xs text-bad">
                {errors.originalUsdPrice.message}
              </p>
            )}
            <p className="mt-1.5 text-[11px] text-ink-faint">
              Shows a discount badge if higher than the asking price.
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/dashboard/selling"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink px-3 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-accent hover:bg-accent-hover active:bg-accent-hover text-on-accent px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving changes…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
