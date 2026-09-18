import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./supabase/client";

const STORAGE_KEY = "marketx_wishlist";

let inMemoryWishlist: string[] | null = null;
let activeUserId: string | null = null;
let initPromise: Promise<string[]> | null = null;

/**
 * Returns the current wishlist product IDs synchronously for immediate rendering.
 */
export function getWishlist(): string[] {
  if (inMemoryWishlist !== null) {
    return [...inMemoryWishlist];
  }
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw ?? "[]");
    inMemoryWishlist = Array.isArray(parsed) ? parsed : [];
    return [...inMemoryWishlist];
  } catch {
    inMemoryWishlist = [];
    return [];
  }
}

/**
 * Checks if a specific product is in the wishlist.
 */
export function isWishlisted(id: string): boolean {
  return getWishlist().includes(id);
}

/**
 * Fetches the wishlist IDs from the database for a signed-in user.
 */
export async function fetchDbWishlist(
  supabase: SupabaseClient,
  userId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch wishlist from database:", error);
    return [];
  }

  return (data || []).map((row: { product_id: string }) => row.product_id);
}

/**
 * Synchronizes the wishlist state on user auth changes (sign in, sign out, switch account).
 * Merges any local items into the database upon sign-in, clears localStorage, and updates the in-memory cache.
 */
export async function syncWishlistWithUser(
  supabase: SupabaseClient,
  user: { id: string } | null,
): Promise<string[]> {
  if (!user) {
    activeUserId = null;
    inMemoryWishlist = null;
    const list = getWishlist();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("wishlist-change"));
    }
    return list;
  }

  activeUserId = user.id;

  // Retrieve any anonymous/guest items saved in localStorage
  let localItems: string[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        localItems = JSON.parse(raw);
        if (!Array.isArray(localItems)) localItems = [];
      }
    } catch {
      localItems = [];
    }
  }

  // If there were local items, merge them into the database
  if (localItems.length > 0) {
    const rows = localItems.map((productId) => ({
      user_id: user.id,
      product_id: productId,
    }));

    const { error: upsertError } = await supabase
      .from("wishlist_items")
      .upsert(rows, { onConflict: "user_id,product_id", ignoreDuplicates: true });

    if (!upsertError && typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Load complete remote state
  const dbItems = await fetchDbWishlist(supabase, user.id);
  inMemoryWishlist = dbItems;

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("wishlist-change"));
  }

  return dbItems;
}

/**
 * Initializes the wishlist cache, attempting to resolve current auth session if present.
 */
export async function initWishlist(client?: SupabaseClient): Promise<string[]> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const supabase = client || (typeof window !== "undefined" ? createClient() : null);
      if (!supabase) return getWishlist();

      const { data } = await supabase.auth.getSession();
      const user = data.session?.user ?? null;
      return await syncWishlistWithUser(supabase, user ? { id: user.id } : null);
    } catch (err) {
      console.error("Error initializing wishlist:", err);
      return getWishlist();
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

/**
 * Optimistically toggles a product in the wishlist.
 * If signed in, updates the database asynchronously and reverts state if the write fails.
 * If signed out, stores in localStorage.
 *
 * @returns {boolean} Optimistic new wishlisted state (true if added, false if removed).
 */
export function toggleWishlist(
  id: string,
  client?: SupabaseClient,
  userId?: string,
): boolean {
  const current = getWishlist();
  const exists = current.includes(id);
  const next = exists ? current.filter((x) => x !== id) : [id, ...current];

  // Optimistic update
  inMemoryWishlist = next;
  const uid = userId || activeUserId;

  if (!uid && typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("wishlist-change"));
  }

  const supabase = client || (typeof window !== "undefined" ? createClient() : null);

  // If user is authenticated or client is provided, persist asynchronously to the database
  if (supabase) {
    (async () => {
      try {
        let effectiveUserId = uid;
        if (!effectiveUserId) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            effectiveUserId = data.session.user.id;
            activeUserId = effectiveUserId;
          }
        }

        if (!effectiveUserId) {
          // Anonymous mode: persistence in localStorage is already done
          return;
        }

        if (exists) {
          // Remove from database
          const { error } = await supabase
            .from("wishlist_items")
            .delete()
            .eq("user_id", effectiveUserId)
            .eq("product_id", id);

          if (error) throw error;
        } else {
          // Add to database
          const { error } = await supabase
            .from("wishlist_items")
            .upsert(
              { user_id: effectiveUserId, product_id: id },
              { onConflict: "user_id,product_id", ignoreDuplicates: true },
            );

          if (error) throw error;
        }
      } catch (err) {
        console.error("Wishlist sync failed, rolling back optimistic state:", err);
        // Rollback state
        inMemoryWishlist = current;
        if (!uid && typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("wishlist-change"));
        }
      }
    })();
  }

  return !exists;
}

/**
 * Resets the internal state (mainly for testing).
 */
export function _resetWishlistState(): void {
  inMemoryWishlist = null;
  activeUserId = null;
  initPromise = null;
}
