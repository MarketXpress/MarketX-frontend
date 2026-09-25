import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Catalogue queries against Supabase.
 *
 * The returned shape matches the `ProductMock` interface the UI components
 * were already built against, so swapping the data source did not require
 * touching `ProductCard`, `AssetCard`, the product page or the cart. The
 * mapping happens here, in one place, rather than in each caller.
 */

export interface Product {
  id: string;
  name: string;
  usdPrice: number;
  originalUsdPrice: number;
  xlmPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  category: string;
  seller: string;
  /** The seller's profile id, for linking to their storefront. */
  sellerId: string;
  badge?: 'flash' | 'new' | 'hot';
  description?: string;
  images?: string[];
  sellerRating?: number;
  sellerSales?: number;
}

/**
 * Columns every catalogue query selects.
 *
 * Declared once so a page cannot quietly fetch a narrower set and hand the
 * mapper a row with fields missing.
 */
const PRODUCT_COLUMNS = `
  id, name, description, usd_price, original_usd_price, xlm_price,
  discount_percent, badge, rating, review_count, seller_id,
  categories:category_id ( name ),
  profiles:seller_id ( display_name, seller_rating, seller_sales ),
  product_images ( url, position )
`;

interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  usd_price: string | number;
  original_usd_price: string | number | null;
  xlm_price: string | number;
  discount_percent: number | null;
  badge: 'flash' | 'new' | 'hot' | null;
  rating: string | number | null;
  review_count: number | null;
  seller_id: string;
  categories: { name: string } | null;
  profiles: { display_name: string | null; seller_rating: string | number | null; seller_sales: number | null } | null;
  product_images: { url: string; position: number }[] | null;
}

/**
 * Postgres `numeric` arrives over PostgREST as a string, deliberately — it
 * carries more precision than a JS number can hold. Prices here are small
 * enough to convert safely for display; anything that sums money for a real
 * charge should keep the string and do the arithmetic server-side.
 */
function toNumber(value: string | number | null | undefined, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapProduct(row: ProductRow): Product {
  const usdPrice = toNumber(row.usd_price);

  return {
    id: row.id,
    name: row.name,
    usdPrice,
    // The UI reads `originalUsdPrice` unconditionally, so a listing with no
    // original price reports its current one — which renders as no discount
    // rather than as "was $0".
    originalUsdPrice: toNumber(row.original_usd_price, usdPrice),
    xlmPrice: toNumber(row.xlm_price),
    discountPercent: row.discount_percent ?? 0,
    rating: toNumber(row.rating),
    reviewCount: row.review_count ?? 0,
    category: row.categories?.name ?? 'Uncategorized',
    seller: row.profiles?.display_name ?? 'Unknown seller',
    sellerId: row.seller_id,
    badge: row.badge ?? undefined,
    description: row.description ?? undefined,
    images: [...(row.product_images ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((image) => image.url),
    sellerRating: toNumber(row.profiles?.seller_rating, 0),
    sellerSales: row.profiles?.seller_sales ?? 0,
  };
}

/** Every active listing, newest first. */
export async function getProducts(supabase: SupabaseClient): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as unknown as ProductRow[]).map(mapProduct);
}

/** One listing by id, or `null` when it does not exist or is not active. */
export async function getProductById(
  supabase: SupabaseClient,
  id: string,
): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('id', id)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw error;
  return data ? mapProduct(data as unknown as ProductRow) : null;
}

/** Listings carrying the flash-sale badge. */
export async function getFlashSaleProducts(
  supabase: SupabaseClient,
  limit = 5,
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('status', 'active')
    .eq('badge', 'flash')
    .order('discount_percent', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as unknown as ProductRow[]).map(mapProduct);
}

/**
 * Full-text-ish search over name and description.
 *
 * Runs in the database rather than filtering a fetched array, so search does
 * not depend on having already downloaded the whole catalogue — which is fine
 * at ten products and is not at ten thousand.
 */
export async function searchProducts(
  supabase: SupabaseClient,
  query: string,
): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) return getProducts(supabase);

  // Commas separate `or` terms in PostgREST, so a query containing one would
  // otherwise be read as two filters.
  const safe = trimmed.replace(/[,()]/g, ' ').trim();

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('status', 'active')
    .or(`name.ilike.%${safe}%,description.ilike.%${safe}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as unknown as ProductRow[]).map(mapProduct);
}

/** Listings by id, for the wishlist. Preserves the order asked for. */
export async function getProductsByIds(
  supabase: SupabaseClient,
  ids: string[],
): Promise<Product[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .in('id', ids)
    .eq('status', 'active');

  if (error) throw error;

  const byId = new Map(
    (data as unknown as ProductRow[]).map((row) => [row.id, mapProduct(row)]),
  );
  return ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
}

// ---------------------------------------------------------------------------
// Marketplace browsing
// ---------------------------------------------------------------------------

export const SORT_OPTIONS = ['newest', 'price-asc', 'price-desc', 'rating'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export interface MarketplaceQuery {
  search?: string;
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface MarketplacePage {
  products: Product[];
  /** Total matching the filters, not the number on this page. */
  total: number;
  page: number;
  pageCount: number;
}

const ORDER_BY: Record<SortOption, { column: string; ascending: boolean }> = {
  newest: { column: 'created_at', ascending: false },
  'price-asc': { column: 'usd_price', ascending: true },
  'price-desc': { column: 'usd_price', ascending: false },
  rating: { column: 'rating', ascending: false },
};

/**
 * The marketplace grid: filtered, sorted and paged in the database.
 *
 * Every constraint here is applied by Postgres rather than by filtering a
 * fetched array in the browser. The page this replaced downloaded its whole
 * (mock) catalogue and filtered in memory, which is invisible at ten listings
 * and fatal at ten thousand.
 *
 * `count: 'exact'` is what makes a page count possible without a second
 * round trip.
 */
export async function getMarketplaceListings(
  supabase: SupabaseClient,
  options: MarketplaceQuery = {},
): Promise<MarketplacePage> {
  const pageSize = options.pageSize ?? 12;
  const page = Math.max(1, options.page ?? 1);
  const from = (page - 1) * pageSize;

  let query = supabase
    .from('products')
    .select(PRODUCT_COLUMNS, { count: 'exact' })
    .eq('status', 'active');

  const search = options.search?.trim();
  if (search) {
    // Commas and parentheses are PostgREST's own syntax inside `or`, so a
    // search for "phone, cheap" would otherwise be read as two filters.
    const safe = search.replace(/[,()]/g, ' ').trim();
    if (safe) query = query.or(`name.ilike.%${safe}%,description.ilike.%${safe}%`);
  }

  if (options.categoryIds && options.categoryIds.length > 0) {
    query = query.in('category_id', options.categoryIds);
  }

  if (typeof options.minPrice === 'number' && Number.isFinite(options.minPrice)) {
    query = query.gte('usd_price', options.minPrice);
  }

  if (typeof options.maxPrice === 'number' && Number.isFinite(options.maxPrice)) {
    query = query.lte('usd_price', options.maxPrice);
  }

  if (typeof options.minRating === 'number' && Number.isFinite(options.minRating)) {
    query = query.gte('rating', options.minRating);
  }

  const order = ORDER_BY[options.sort ?? 'newest'];
  const { data, error, count } = await query
    .order(order.column, { ascending: order.ascending })
    // A stable tiebreak, so two listings at the same price do not swap places
    // between pages and cause one to appear twice and another not at all.
    .order('id', { ascending: true })
    .range(from, from + pageSize - 1);

  if (error) throw error;

  const total = count ?? 0;
  return {
    products: (data as unknown as ProductRow[]).map(mapProduct),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}
