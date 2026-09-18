/**
 * The cart.
 *
 * Per-browser, in localStorage, following the same shape as
 * `wishlistStore.ts`. A cart is a pre-purchase convenience rather than a
 * record that has to survive a device change — the record that matters is the
 * order, and that will live in the database next to the escrow.
 *
 * It stores product ids and quantities, never product objects. The cart it
 * replaced held whole copies of listings, which meant a cart kept showing the
 * old price after a seller edited it, and showed items from a catalogue that
 * no longer existed.
 */

const STORAGE_KEY = "marketx_cart";
const CHANGE_EVENT = "cart-change";

export interface CartLine {
  productId: string;
  quantity: number;
}

/** Guards against a single fat-fingered listing emptying someone's wallet. */
export const MAX_QUANTITY_PER_LINE = 99;

/**
 * The parsed cart, cached.
 *
 * `useSyncExternalStore` compares snapshots by identity, so handing it a
 * freshly parsed array on every read would re-render forever. The cache is
 * invalidated only by a write.
 */
let snapshot: CartLine[] = [];
let snapshotIsStale = true;

const EMPTY: CartLine[] = [];

function parse(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Written by an older version of this app, or by hand. Anything that is
    // not a usable line is dropped rather than allowed to reach the UI as
    // `undefined` or `NaN`.
    return parsed.flatMap((entry): CartLine[] => {
      if (typeof entry?.productId !== "string") return [];
      const quantity = Number(entry.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) return [];
      return [{ productId: entry.productId, quantity: Math.min(quantity, MAX_QUANTITY_PER_LINE) }];
    });
  } catch {
    return [];
  }
}

export function getCart(): CartLine[] {
  if (typeof window === "undefined") return EMPTY;
  if (snapshotIsStale) {
    try {
      snapshot = parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      // Private browsing can refuse storage. The cart then lives for this
      // page view only, which is better than throwing on every render.
      snapshot = EMPTY;
    }
    snapshotIsStale = false;
  }
  return snapshot;
}

/** The server cannot know what is in a browser's cart. */
export function getServerCart(): CartLine[] {
  return EMPTY;
}

export function getCartCount(): number {
  return getCart().reduce((total, line) => total + line.quantity, 0);
}

function write(lines: CartLine[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Not persisted, but the in-memory snapshot below still updates, so the
    // cart works for this session.
  }
  snapshot = lines;
  snapshotIsStale = false;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function addToCart(productId: string, quantity = 1): void {
  const lines = getCart();
  const existing = lines.find((line) => line.productId === productId);

  write(
    existing
      ? lines.map((line) =>
          line.productId === productId
            ? { ...line, quantity: Math.min(line.quantity + quantity, MAX_QUANTITY_PER_LINE) }
            : line,
        )
      : [...lines, { productId, quantity: Math.min(quantity, MAX_QUANTITY_PER_LINE) }],
  );
}

/** A quantity of zero or less removes the line, which is what the − button does at 1. */
export function setQuantity(productId: string, quantity: number): void {
  if (quantity < 1) {
    removeFromCart(productId);
    return;
  }

  write(
    getCart().map((line) =>
      line.productId === productId
        ? { ...line, quantity: Math.min(quantity, MAX_QUANTITY_PER_LINE) }
        : line,
    ),
  );
}

export function removeFromCart(productId: string): void {
  write(getCart().filter((line) => line.productId !== productId));
}

export function clearCart(): void {
  write([]);
}

export function isInCart(productId: string): boolean {
  return getCart().some((line) => line.productId === productId);
}

/**
 * Subscribes to cart changes.
 *
 * A set, not a single slot. The previous implementation kept one callback in a
 * module variable, so the second component to subscribe silently replaced the
 * first — with a drawer and a header badge both listening, only one of them
 * ever updated.
 *
 * `storage` is included so a change in another tab is reflected here.
 */
export function subscribeToCart(onChange: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return;
    snapshotIsStale = true;
    onChange();
  };

  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", handleStorage);
  };
}
