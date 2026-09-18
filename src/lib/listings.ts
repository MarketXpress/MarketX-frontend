import type { SupabaseClient } from "@supabase/supabase-js";
import { usdToXlm } from "@/lib/money";
import type { Product } from "@/lib/products";

/**
 * Everything the seller side of the marketplace does: creating a listing,
 * uploading its photographs, and managing it afterwards.
 *
 * Reads for the *buyer* side live in `products.ts`. The split is by audience
 * rather than by table, because the two ask very different questions — a buyer
 * only ever sees active listings, a seller needs to see their drafts too.
 */

export const LISTING_STATUSES = ["draft", "active", "sold", "archived"] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface SellerListing {
  id: string;
  name: string;
  description: string | null;
  usdPrice: number;
  originalUsdPrice: number | null;
  discountPercent: number;
  status: ListingStatus;
  categoryId: string | null;
  categoryName: string | null;
  imageUrl: string | null;
  imageCount: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface SellerProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  stellarAddress: string | null;
  sellerRating: number;
  sellerSales: number;
  memberSince: string;
}

export interface ListingInput {
  name: string;
  description: string;
  categoryId: string;
  usdPrice: number;
  /** The "was" price. Omitted when the listing is not on offer. */
  originalUsdPrice?: number | null;
}

/** See the note in `products.ts`: PostgREST sends `numeric` as a string. */
function toNumber(value: string | number | null | undefined, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function getCategories(supabase: SupabaseClient): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("position");

  if (error) throw error;
  return (data ?? []) as Category[];
}

// ---------------------------------------------------------------------------
// Writing a listing
// ---------------------------------------------------------------------------

/**
 * Creates the listing row.
 *
 * `seller_id` is passed explicitly because the insert policy checks it against
 * `auth.uid()` — the database will reject a row claiming to belong to somebody
 * else, so this cannot be used to plant a listing on another account.
 *
 * Created as a draft. A listing becomes visible only once its images are
 * attached and `publishListing` is called, so a half-uploaded listing never
 * appears in the marketplace with no photograph.
 */
export async function createListing(
  supabase: SupabaseClient,
  sellerId: string,
  input: ListingInput,
): Promise<string> {
  const { data, error } = await supabase
    .from("products")
    .insert({
      seller_id: sellerId,
      category_id: input.categoryId,
      name: input.name.trim(),
      description: input.description.trim(),
      usd_price: input.usdPrice,
      original_usd_price: input.originalUsdPrice ?? null,
      xlm_price: usdToXlm(input.usdPrice),
      status: "draft",
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function updateListing(
  supabase: SupabaseClient,
  listingId: string,
  input: ListingInput,
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({
      category_id: input.categoryId,
      name: input.name.trim(),
      description: input.description.trim(),
      usd_price: input.usdPrice,
      original_usd_price: input.originalUsdPrice ?? null,
      xlm_price: usdToXlm(input.usdPrice),
    })
    .eq("id", listingId);

  if (error) throw error;
}

export async function setListingStatus(
  supabase: SupabaseClient,
  listingId: string,
  status: ListingStatus,
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ status })
    .eq("id", listingId);

  if (error) throw error;
}

export async function deleteListing(
  supabase: SupabaseClient,
  listingId: string,
): Promise<void> {
  // `product_images` cascades from the row, but the objects in Storage do not
  // — they are removed first, while we still know which listing they belong
  // to. A failure here is not fatal: an orphaned file costs storage, whereas
  // refusing to delete the listing leaves the seller stuck.
  const { data: images } = await supabase
    .from("product_images")
    .select("url")
    .eq("product_id", listingId);

  const paths = (images ?? [])
    .map((row) => storagePathFromUrl(row.url as string))
    .filter((path): path is string => path !== null);

  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths);
  }

  const { error } = await supabase.from("products").delete().eq("id", listingId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

export const BUCKET = "product-images";

/** Enforced on the bucket too; repeated here so the user hears about it before uploading. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGES = 6;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Recovers the object path from a public URL, for deletion.
 *
 * Public URLs are `<project>/storage/v1/object/public/<bucket>/<path>`, and it
 * is the `<path>` part the storage API wants back.
 */
function storagePathFromUrl(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : url.slice(index + marker.length);
}

/**
 * Uploads photographs and records them against the listing.
 *
 * The path is `<seller>/<listing>/<n>-<random>.<ext>`, and the storage policy
 * checks that first segment against the caller — which is what stops one
 * seller writing over another's pictures.
 *
 * `position` decides the order they appear in, and position 0 is the one the
 * marketplace grid shows.
 */
export async function uploadListingImages(
  supabase: SupabaseClient,
  sellerId: string,
  listingId: string,
  files: File[],
  startPosition = 0,
): Promise<string[]> {
  const urls: string[] = [];

  for (const [index, file] of files.entries()) {
    const position = startPosition + index;
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    // Random suffix so re-uploading at the same position cannot collide with a
    // cached copy of the old file at the same URL.
    const path = `${sellerId}/${listingId}/${position}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const { error: rowError } = await supabase
      .from("product_images")
      .insert({ product_id: listingId, url: publicUrl, position });

    if (rowError) throw rowError;
    urls.push(publicUrl);
  }

  return urls;
}

// ---------------------------------------------------------------------------
// Reading, for the seller
// ---------------------------------------------------------------------------

const SELLER_LISTING_COLUMNS = `
  id, name, description, usd_price, original_usd_price, discount_percent,
  status, category_id, rating, review_count, created_at,
  categories:category_id ( name ),
  product_images ( url, position )
`;

interface SellerListingRow {
  id: string;
  name: string;
  description: string | null;
  usd_price: string | number;
  original_usd_price: string | number | null;
  discount_percent: number | null;
  status: ListingStatus;
  category_id: string | null;
  rating: string | number | null;
  review_count: number | null;
  created_at: string;
  categories: { name: string } | null;
  product_images: { url: string; position: number }[] | null;
}

function mapSellerListing(row: SellerListingRow): SellerListing {
  const images = [...(row.product_images ?? [])].sort((a, b) => a.position - b.position);

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    usdPrice: toNumber(row.usd_price),
    originalUsdPrice:
      row.original_usd_price === null ? null : toNumber(row.original_usd_price),
    discountPercent: row.discount_percent ?? 0,
    status: row.status,
    categoryId: row.category_id,
    categoryName: row.categories?.name ?? null,
    imageUrl: images[0]?.url ?? null,
    imageCount: images.length,
    rating: toNumber(row.rating),
    reviewCount: row.review_count ?? 0,
    createdAt: row.created_at,
  };
}

/**
 * Every listing belonging to one seller, in any status.
 *
 * Drafts and archived listings come back because this feeds the seller's own
 * dashboard. RLS is what makes that safe: the "sellers read their own products
 * in any status" policy returns nothing for anyone else, so the filter below
 * is a convenience and not the security boundary.
 */
export async function getSellerListings(
  supabase: SupabaseClient,
  sellerId: string,
): Promise<SellerListing[]> {
  const { data, error } = await supabase
    .from("products")
    .select(SELLER_LISTING_COLUMNS)
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as unknown as SellerListingRow[]).map(mapSellerListing);
}

export async function getListingForEdit(
  supabase: SupabaseClient,
  listingId: string,
): Promise<SellerListing | null> {
  const { data, error } = await supabase
    .from("products")
    .select(SELLER_LISTING_COLUMNS)
    .eq("id", listingId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapSellerListing(data as unknown as SellerListingRow) : null;
}

// ---------------------------------------------------------------------------
// Reading, for the storefront
// ---------------------------------------------------------------------------

export async function getSellerProfile(
  supabase: SupabaseClient,
  sellerId: string,
): Promise<SellerProfile | null> {
  // `email` is deliberately absent: anon and authenticated no longer hold a
  // grant on that column, and asking for it fails the whole query.
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, stellar_address, seller_rating, seller_sales, created_at")
    .eq("id", sellerId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id as string,
    displayName: (data.display_name as string | null) ?? "Unnamed seller",
    avatarUrl: (data.avatar_url as string | null) ?? null,
    bio: (data.bio as string | null) ?? null,
    stellarAddress: (data.stellar_address as string | null) ?? null,
    sellerRating: toNumber(data.seller_rating),
    sellerSales: (data.seller_sales as number | null) ?? 0,
    memberSince: data.created_at as string,
  };
}

/** A seller's public shopfront: active listings only. */
export async function getSellerActiveListings(
  supabase: SupabaseClient,
  sellerId: string,
): Promise<SellerListing[]> {
  const { data, error } = await supabase
    .from("products")
    .select(SELLER_LISTING_COLUMNS)
    .eq("seller_id", sellerId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as unknown as SellerListingRow[]).map(mapSellerListing);
}

// ---------------------------------------------------------------------------
// Payout address
// ---------------------------------------------------------------------------

/**
 * A Stellar public key: 56 characters, base32, starting with G.
 *
 * Checked because a seller who saves a mistyped address has told us to send
 * their takings somewhere that does not exist. This validates the shape only;
 * it cannot tell whether the account is funded or whether the seller controls
 * it.
 */
export const STELLAR_ADDRESS_PATTERN = /^G[A-Z2-7]{55}$/;

export function isValidStellarAddress(address: string): boolean {
  return STELLAR_ADDRESS_PATTERN.test(address.trim().toUpperCase());
}

export async function setPayoutAddress(
  supabase: SupabaseClient,
  userId: string,
  address: string,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ stellar_address: address.trim().toUpperCase() })
    .eq("id", userId);

  if (error) throw error;
}

export async function getPayoutAddress(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("stellar_address")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data?.stellar_address as string | null) ?? null;
}

/** Re-exported so a caller can hand a `SellerListing` to buyer-facing UI. */
export type { Product };
