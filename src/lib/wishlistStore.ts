import type { ProductMock } from "@/lib/mockData";

const WISHLIST_STORAGE_KEY = "marketxpress:wishlist";
const listeners = new Set<() => void>();

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readWishlistIds() {
  if (!canUseStorage()) return [];

  try {
    const saved = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function writeWishlistIds(ids: string[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
}

function emitWishlistChange() {
  listeners.forEach((listener) => listener());
}

export function getWishlistIds() {
  return readWishlistIds();
}

export function isWishlisted(productId: string) {
  return readWishlistIds().includes(productId);
}

export function toggleWishlist(productId: string) {
  const ids = readWishlistIds();
  const nextIds = ids.includes(productId)
    ? ids.filter((id) => id !== productId)
    : [...ids, productId];

  writeWishlistIds(nextIds);
  emitWishlistChange();
  return nextIds.includes(productId);
}

export function getWishlistProducts(products: ProductMock[]) {
  const ids = readWishlistIds();
  const productsById = new Map(products.map((product) => [product.id, product]));
  return ids
    .map((id) => productsById.get(id))
    .filter((product): product is ProductMock => Boolean(product));
}

export function subscribeToWishlist(listener: () => void) {
  listeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === WISHLIST_STORAGE_KEY) listener();
  };

  if (canUseStorage()) {
    window.addEventListener("storage", handleStorage);
  }

  return () => {
    listeners.delete(listener);
    if (canUseStorage()) {
      window.removeEventListener("storage", handleStorage);
    }
  };
}
