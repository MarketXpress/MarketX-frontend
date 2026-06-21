const STORAGE_KEY = "marketx_wishlist";

export function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function isWishlisted(id: string): boolean {
  return getWishlist().includes(id);
}

export function toggleWishlist(id: string): boolean {
  const current = getWishlist();
  const idx = current.indexOf(id);
  const next = idx === -1 ? [...current, id] : current.filter((x) => x !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("wishlist-change"));
  return idx === -1;
}
