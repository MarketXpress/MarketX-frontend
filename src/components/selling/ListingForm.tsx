"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Check, Loader2, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { listingSchema, type ListingFormData } from "@/lib/validations/listing";
import {
  createListing,
  getCategories,
  getPayoutAddress,
  isValidStellarAddress,
  setListingStatus,
  setPayoutAddress,
  uploadListingImages,
  type Category,
} from "@/lib/listings";
import { formatUsd, formatXlm, usdToXlm } from "@/lib/money";
import ImagePicker from "./ImagePicker";
import { cn } from "@/lib/utils";

/**
 * Creates a listing, for real.
 *
 * It replaces a four-step wizard that waited three seconds and wrote nothing —
 * and that described itself as deploying a Soroban contract per listing, which
 * is not how the escrow works: a contract holds one *order*, and a listing is
 * bought many times.
 *
 * One page rather than four steps. A wizard is worth its cost when the answers
 * branch or the form is long enough to intimidate; this is six fields, and
 * splitting it across four screens mostly hid from the seller how little was
 * being asked.
 *
 * The listing is written as a draft first and only published once its images
 * are attached, so a failed upload leaves a recoverable draft rather than a
 * live listing with no photograph.
 */
export default function ListingForm() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [payoutAddress, setPayoutAddressState] = useState<string | null>(null);
  const [payoutDraft, setPayoutDraft] = useState("");
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [isSavingPayout, setIsSavingPayout] = useState(false);
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    mode: "onTouched",
    defaultValues: { name: "", description: "", images: [] },
  });

  const watched = watch();

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [nextCategories, address] = await Promise.all([
          getCategories(supabase),
          user ? getPayoutAddress(supabase, user.id) : Promise.resolve(null),
        ]);
        if (!active) return;
        setCategories(nextCategories);
        setPayoutAddressState(address);
      } catch {
        if (active) setSubmitError("Could not load categories. Refresh and try again.");
      } finally {
        if (active) setIsLoadingContext(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [supabase, user]);

  async function savePayoutAddress() {
    if (!user) return;

    if (!isValidStellarAddress(payoutDraft)) {
      setPayoutError("That is not a Stellar address — they are 56 characters and begin with G.");
      return;
    }

    setPayoutError(null);
    setIsSavingPayout(true);
    try {
      const normalised = payoutDraft.trim().toUpperCase();
      await setPayoutAddress(supabase, user.id, normalised);
      setPayoutAddressState(normalised);
      toast({
        title: "Payout address saved",
        description: "Escrow releases will settle to this account.",
        variant: "success",
      });
    } catch (error) {
      setPayoutError(
        error instanceof Error && error.message.includes("duplicate")
          ? "That address is already on another account."
          : "Could not save the address. Try again.",
      );
    } finally {
      setIsSavingPayout(false);
    }
  }

  async function onSubmit(data: ListingFormData) {
    if (!user) return;
    setSubmitError(null);

    let listingId: string | null = null;

    try {
      listingId = await createListing(supabase, user.id, {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        usdPrice: data.usdPrice,
        originalUsdPrice: data.originalUsdPrice ?? null,
      });

      await uploadListingImages(supabase, user.id, listingId, data.images);
      await setListingStatus(supabase, listingId, "active");

      toast({
        title: "Listing published",
        description: `${data.name} is now live in the marketplace.`,
        variant: "success",
      });
      router.push(`/product/${listingId}`);
    } catch (error) {
      // The draft row survives a failed upload, so say so — otherwise the
      // seller retypes everything and ends up with two of them.
      setSubmitError(
        listingId
          ? "The photographs did not finish uploading. Your listing is saved as a draft — open it from your listings and add them there."
          : "Could not create the listing. Check your connection and try again.",
      );
      if (process.env.NODE_ENV === "development") console.error(error);
    }
  }

  const needsPayoutAddress = !payoutAddress;
  const usdPrice = Number.isFinite(watched.usdPrice) ? watched.usdPrice : 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <fieldset disabled={isLoadingContext || isSubmitting} className="space-y-6 border-0 p-0 m-0 min-w-0">
        {/* ---------------------------------------------------------------- */}
        <Section title="What are you selling?">
          <Field label="Item name" error={errors.name?.message} htmlFor="name">
            <input
              id="name"
              {...register("name")}
              placeholder="Samsung Galaxy A55 5G, 256GB, unlocked"
              className={inputClass(!!errors.name)}
            />
            <Hint>Say what it is, not how good it is. Buyers search for the model name.</Hint>
          </Field>

          <Field label="Category" error={errors.categoryId?.message} htmlFor="categoryId">
            <select id="categoryId" {...register("categoryId")} className={inputClass(!!errors.categoryId)} defaultValue="">
              <option value="" disabled>
                Choose a category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Description" error={errors.description?.message} htmlFor="description">
            <textarea
              id="description"
              rows={6}
              {...register("description")}
              placeholder="Condition, age, what is included, anything wrong with it. Buyers who know exactly what they are getting raise fewer disputes."
              className={cn(inputClass(!!errors.description), "resize-y leading-relaxed")}
            />
            <Hint>
              {(watched.description?.length ?? 0)} / 2000 characters
            </Hint>
          </Field>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section title="Photographs">
          <Controller
            control={control}
            name="images"
            render={({ field }) => (
              <ImagePicker
                files={field.value ?? []}
                onChange={field.onChange}
                disabled={isSubmitting}
                error={errors.images?.message}
              />
            )}
          />
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section title="Price">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Asking price (USD)" error={errors.usdPrice?.message} htmlFor="usdPrice">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">$</span>
                <input
                  id="usdPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  {...register("usdPrice", { valueAsNumber: true })}
                  placeholder="299.00"
                  className={cn(inputClass(!!errors.usdPrice), "tnum pl-7")}
                />
              </div>
            </Field>

            <Field
              label="Was (optional)"
              error={errors.originalUsdPrice?.message}
              htmlFor="originalUsdPrice"
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">$</span>
                <input
                  id="originalUsdPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  {...register("originalUsdPrice", {
                    // An empty optional number field yields NaN, which fails
                    // validation with a message about the wrong thing.
                    setValueAs: (value) => (value === "" ? null : Number(value)),
                  })}
                  placeholder="459.00"
                  className={cn(inputClass(!!errors.originalUsdPrice), "tnum pl-7")}
                />
              </div>
              <Hint>Shows a discount badge on the listing.</Hint>
            </Field>
          </div>

          <p className="rounded-md border border-line bg-surface-2 px-3 py-2 text-xs text-ink-muted">
            Buyers pay in USDC on Stellar. {usdPrice > 0 ? (
              <>
                {formatUsd(usdPrice)} is about <span className="tnum font-medium text-ink">{formatXlm(usdToXlm(usdPrice))}</span> at today&apos;s rate, shown for reference only —
              </>
            ) : (
              <>The XLM figure shown on your listing is for reference only —</>
            )}{" "}
            settlement is always in dollars, so a price move during delivery does not change what you receive.
          </p>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section title="Where you get paid">
          {payoutAddress ? (
            <div className="flex items-start gap-3 rounded-md border border-ok-line bg-ok-bg px-3 py-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">Payout address set</p>
                <p className="truncate font-mono text-xs text-ink-muted">{payoutAddress}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 rounded-md border border-warn-line bg-warn-bg px-3 py-3">
              <div className="flex items-start gap-3">
                <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-warn" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-ink">Add a payout address first</p>
                  <p className="text-xs text-ink-muted">
                    Escrow releases go straight from the contract to your Stellar account.
                    MarketXpress never holds the money, so there is nowhere for it to wait if
                    we do not know where to send it.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={payoutDraft}
                  onChange={(event) => setPayoutDraft(event.target.value)}
                  placeholder="GAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  spellCheck={false}
                  autoCapitalize="characters"
                  className={cn(inputClass(!!payoutError), "font-mono text-xs")}
                  aria-label="Stellar payout address"
                  aria-invalid={!!payoutError}
                />
                <button
                  type="button"
                  onClick={savePayoutAddress}
                  disabled={isSavingPayout}
                  className="shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-60"
                >
                  {isSavingPayout ? "Saving…" : "Save"}
                </button>
              </div>

              {payoutError && <p className="text-xs font-medium text-bad">{payoutError}</p>}
            </div>
          )}
        </Section>

        {submitError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-bad-line bg-bad-bg px-3 py-2.5 text-sm text-ink"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-bad" aria-hidden="true" />
            {submitError}
          </div>
        )}
      </fieldset>

      {/* ------------------------------------------------------------------ */}
      {/* Preview. A seller is writing for a grid they cannot see while they  */}
      {/* type; showing the card as it will appear is the fastest way to make */}
      {/* a bad photograph or a truncated name obvious.                       */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <p className="label mb-2">How buyers will see it</p>

        <PreviewCard
          name={watched.name}
          usdPrice={usdPrice}
          originalUsdPrice={watched.originalUsdPrice ?? null}
          image={watched.images?.[0]}
          category={categories.find((c) => c.id === watched.categoryId)?.name ?? null}
        />

        <button
          type="submit"
          disabled={isLoadingContext || isSubmitting || needsPayoutAddress}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {isSubmitting ? "Publishing…" : "Publish listing"}
        </button>

        {needsPayoutAddress && (
          <p className="mt-2 text-center text-xs text-ink-faint">
            Add a payout address to publish.
          </p>
        )}

        <Link
          href="/dashboard/selling"
          className="mt-2 block text-center text-xs text-ink-muted underline-offset-2 hover:text-ink hover:underline"
        >
          Cancel
        </Link>
      </aside>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Small local pieces. Kept here rather than exported: they encode this form's */
/* spacing and nothing else needs them yet.                                    */
/* -------------------------------------------------------------------------- */

function inputClass(hasError: boolean) {
  return cn(
    "w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint",
    "transition-colors focus:outline-none focus-visible:border-accent",
    hasError ? "border-bad" : "border-line-strong",
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-surface p-5">
      <h2 className="mb-4 text-sm font-bold text-ink">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error && <p className="text-xs font-medium text-bad">{error}</p>}
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-ink-faint">{children}</p>;
}

function PreviewCard({
  name,
  usdPrice,
  originalUsdPrice,
  image,
  category,
}: {
  name?: string;
  usdPrice: number;
  originalUsdPrice: number | null;
  image?: File;
  category: string | null;
}) {
  // Derived rather than stored: mirroring the file into state through an
  // effect costs a second render for every keystroke that changes the cover,
  // and the effect only exists to revoke the URL afterwards.
  const preview = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const discount =
    originalUsdPrice && originalUsdPrice > usdPrice && usdPrice > 0
      ? Math.round(((originalUsdPrice - usdPrice) / originalUsdPrice) * 100)
      : 0;

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
      <div className="relative aspect-square bg-surface-2">
        {preview ? (
          <Image src={preview} alt="" fill sizes="320px" className="object-cover" unoptimized />
        ) : (
          <div className="grid h-full place-items-center text-xs text-ink-faint">
            No photograph yet
          </div>
        )}
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded bg-deal-bg px-1.5 py-0.5 text-[11px] font-bold text-deal">
            −{discount}%
          </span>
        )}
      </div>

      <div className="space-y-1 p-3">
        {category && <p className="label">{category}</p>}
        <p className="line-clamp-2 text-sm font-medium text-ink">
          {name?.trim() || "Your item name"}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="tnum text-base font-bold text-ink">
            {usdPrice > 0 ? formatUsd(usdPrice) : "$0.00"}
          </span>
          {discount > 0 && originalUsdPrice && (
            <span className="tnum text-xs text-ink-faint line-through">
              {formatUsd(originalUsdPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
