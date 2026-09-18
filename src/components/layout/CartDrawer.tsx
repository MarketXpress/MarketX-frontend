"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Minus, Plus, ShoppingBag, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getProductsByIds, type Product } from "@/lib/products";
import {
  getCart,
  getServerCart,
  removeFromCart,
  setQuantity,
  subscribeToCart,
  type CartLine,
} from "@/lib/cartStore";
import { formatUsd, formatXlm } from "@/lib/money";

/**
 * The cart drawer.
 *
 * It used to open with three items in it for everybody — a hardcoded array of
 * mock products, so a brand-new account was shown a badge reading 4 and a cart
 * containing things it had never clicked. On a product whose whole pitch is
 * that it can be trusted with your money, that was the worst possible first
 * impression.
 *
 * Lines are ids and quantities; the listings behind them are fetched fresh
 * each time the drawer opens, so a price the seller has since changed is the
 * price shown.
 */

export { getCartCount, subscribeToCart } from "@/lib/cartStore";

const EMPTY_PRODUCTS = new Map<string, Product>();

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const supabase = useMemo(() => createClient(), []);
  const lines = useSyncExternalStore(subscribeToCart, getCart, getServerCart);

  // The fetch result is stored together with the id list it was fetched for,
  // which lets "is it loading" be derived rather than tracked in its own
  // state. A separate isLoading flag would have to be raised in the effect
  // body, and setting state there costs a second render pass every time the
  // drawer opens.
  const [loaded, setLoaded] = useState<{
    ids: string;
    products: Map<string, Product>;
  } | null>(null);
  const [failedIds, setFailedIds] = useState<string | null>(null);

  // Only fetched while the drawer is open — there is no reason to query the
  // catalogue for a panel nobody has opened.
  const ids = lines.map((line) => line.productId).join(",");

  const isStale = loaded?.ids !== ids;
  const isLoading = isOpen && ids !== "" && isStale && failedIds !== ids;
  const loadFailed = failedIds === ids;
  const products = isStale ? EMPTY_PRODUCTS : loaded.products;

  useEffect(() => {
    if (!isOpen || ids === "" || !isStale) return;

    let active = true;

    getProductsByIds(supabase, ids.split(","))
      .then((found) => {
        if (!active) return;
        setLoaded({ ids, products: new Map(found.map((p) => [p.id, p])) });
        setFailedIds(null);
      })
      .catch(() => {
        if (active) setFailedIds(ids);
      });

    return () => {
      active = false;
    };
  }, [isOpen, ids, isStale, supabase]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // A listing the seller has since unpublished or deleted comes back missing.
  // Those lines are separated out and named rather than silently dropped —
  // somebody who put an item in their cart should be told it is gone, not left
  // to wonder where it went.
  const resolved: { line: CartLine; product: Product }[] = [];
  let unavailable = 0;

  for (const line of lines) {
    const product = products.get(line.productId);
    if (product) resolved.push({ line, product });
    else if (!isLoading && !loadFailed) unavailable += 1;
  }

  const subtotalUsd = resolved.reduce(
    (total, { line, product }) => total + product.usdPrice * line.quantity,
    0,
  );
  const subtotalXlm = resolved.reduce(
    (total, { line, product }) => total + product.xlmPrice * line.quantity,
    0,
  );
  const itemCount = lines.reduce((total, line) => total + line.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="relative flex h-full w-full max-w-md flex-col bg-surface shadow-modal"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="text-sm font-bold text-ink">
                  Cart{" "}
                  {itemCount > 0 && (
                    <span className="tnum font-normal text-ink-faint">
                      ({itemCount} {itemCount === 1 ? "item" : "items"})
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close cart"
                className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
                <ShoppingBag className="h-12 w-12 text-ink-faint" aria-hidden="true" />
                <p className="text-sm font-semibold text-ink">Your cart is empty</p>
                <p className="text-xs text-ink-muted">
                  Add something from the marketplace to get started.
                </p>
                <Link
                  href="/marketplace"
                  onClick={onClose}
                  className="mt-2 rounded-lg border border-accent-line bg-accent-soft px-5 py-2 text-xs font-semibold text-accent transition-colors hover:border-accent hover:bg-accent hover:text-on-accent"
                >
                  Browse the marketplace
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                  {isLoading && resolved.length === 0 && (
                    <p className="flex items-center justify-center gap-2 py-8 text-sm text-ink-muted">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Loading your cart…
                    </p>
                  )}

                  {loadFailed && (
                    <p className="flex items-start gap-2 rounded-md border border-bad-line bg-bad-bg px-3 py-2 text-xs text-ink">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bad" aria-hidden="true" />
                      Could not load your cart. Check your connection and reopen it.
                    </p>
                  )}

                  {unavailable > 0 && (
                    <p className="flex items-start gap-2 rounded-md border border-warn-line bg-warn-bg px-3 py-2 text-xs text-ink">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" aria-hidden="true" />
                      {unavailable === 1 ? "An item is" : `${unavailable} items are`} no longer
                      for sale and {unavailable === 1 ? "has" : "have"} been left out of the total.
                    </p>
                  )}

                  {resolved.map(({ line, product }) => (
                    <div
                      key={product.id}
                      className="flex gap-3 border-b border-line pb-4 last:border-b-0 last:pb-0"
                    >
                      <Link
                        href={`/product/${product.id}`}
                        onClick={onClose}
                        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-2"
                      >
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="grid h-full place-items-center text-[10px] text-ink-faint">
                            No photo
                          </span>
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/product/${product.id}`}
                          onClick={onClose}
                          className="line-clamp-1 text-xs font-semibold text-ink hover:text-accent"
                        >
                          {product.name}
                        </Link>
                        <p className="mt-0.5 text-[10px] text-ink-faint">
                          {product.category} · {product.seller}
                        </p>

                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="tnum text-sm font-bold text-ink">
                            {formatUsd(product.usdPrice * line.quantity)}
                          </span>
                          <span className="tnum text-[10px] text-ink-faint">
                            ≈ {formatXlm(product.xlmPrice * line.quantity)}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setQuantity(product.id, line.quantity - 1)}
                              aria-label={`Decrease quantity of ${product.name}`}
                              className="flex h-6 w-6 items-center justify-center rounded border border-line text-ink-faint transition-colors hover:border-accent hover:text-accent"
                            >
                              <Minus className="h-3 w-3" aria-hidden="true" />
                            </button>
                            <span className="tnum w-7 text-center text-xs font-semibold text-ink-muted">
                              {line.quantity}
                            </span>
                            <button
                              onClick={() => setQuantity(product.id, line.quantity + 1)}
                              aria-label={`Increase quantity of ${product.name}`}
                              className="flex h-6 w-6 items-center justify-center rounded border border-line text-ink-faint transition-colors hover:border-accent hover:text-accent"
                            >
                              <Plus className="h-3 w-3" aria-hidden="true" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(product.id)}
                            aria-label={`Remove ${product.name} from cart`}
                            className="rounded p-1 text-ink-faint transition-colors hover:text-bad"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="shrink-0 space-y-3 border-t border-line px-5 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-ink-muted">Subtotal</span>
                      <span className="tnum text-sm font-bold text-ink">
                        {formatUsd(subtotalUsd)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="tnum text-[10px] text-ink-faint">
                        ≈ {formatXlm(subtotalXlm)}
                      </span>
                      <span className="tnum text-[10px] text-ink-faint">
                        {resolved.length} {resolved.length === 1 ? "listing" : "listings"}
                      </span>
                    </div>
                  </div>

                  {/* Checkout is not built. It cannot be: paying means funding
                      an escrow contract, and that is the next phase of the
                      project. The button said "Go to Checkout" and linked to a
                      route that does not exist, so it 404'd. Saying so is
                      better than a dead link or a button that does nothing. */}
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed rounded-lg bg-surface-3 py-2.5 text-sm font-bold text-ink-faint"
                  >
                    Checkout
                  </button>
                  <p className="text-center text-[11px] leading-relaxed text-ink-faint">
                    Paying means funding a Stellar escrow, which is not live yet. Your cart is
                    saved.
                  </p>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
