"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductMock, mockProducts } from "@/lib/mockData";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Cart mock data — three items from mockProducts so the badge count matches
// ---------------------------------------------------------------------------

interface CartItem {
  product: ProductMock;
  quantity: number;
}

const initialCartItems: CartItem[] = [
  { product: mockProducts[0], quantity: 1 }, // Samsung Galaxy A55 5G
  { product: mockProducts[1], quantity: 2 }, // Nike Air Max 270
  { product: mockProducts[4], quantity: 1 }, // Anker 65W GaN Charger
];

// ---------------------------------------------------------------------------
// Public helpers so the Navbar badge stays in sync
// ---------------------------------------------------------------------------

let cartSubscriber: (() => void) | null = null;
let _cartItems: CartItem[] = [...initialCartItems];

export function getCartItems(): CartItem[] {
  return _cartItems;
}

export function getCartCount(): number {
  return _cartItems.reduce((sum, item) => sum + item.quantity, 0);
}

export function subscribeToCart(cb: () => void) {
  cartSubscriber = cb;
  return () => {
    if (cartSubscriber === cb) cartSubscriber = null;
  };
}

function notifyCartChange() {
  cartSubscriber?.();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [items, setItems] = useState<CartItem[]>(_cartItems);

  // Keep module-level state in sync with component state
  useEffect(() => {
    _cartItems = items;
    notifyCartChange();
  }, [items]);

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // --- cart operations ----------------------------------------------------

  function updateQuantity(productId: string, delta: number) {
    setItems((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }

  // --- subtotals ----------------------------------------------------------

  const subtotalUsd = items.reduce(
    (sum, item) => sum + item.product.usdPrice * item.quantity,
    0
  );

  const subtotalXlm = items.reduce(
    (sum, item) => sum + item.product.xlmPrice * item.quantity,
    0
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-14 border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-black text-gray-900">
                  Cart{" "}
                  {items.length > 0 && (
                    <span className="text-gray-400 font-normal">
                      ({getCartCount()} items)
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close cart"
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5 text-center">
                <ShoppingBag className="w-12 h-12 text-gray-200" />
                <p className="text-sm font-semibold text-gray-500">
                  Your cart is empty
                </p>
                <p className="text-xs text-gray-400">
                  Add items from the marketplace to get started.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors"
                >
                  Browse Marketplace
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-3 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <div className="w-8 h-8 bg-gray-200 rounded" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {item.product.category} · {item.product.seller}
                        </p>

                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-sm font-black text-emerald-600">
                            ${(item.product.usdPrice * item.quantity).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">
                            ≈{" "}
                            {(
                              item.product.xlmPrice * item.quantity
                            ).toLocaleString()}{" "}
                            XLM
                          </span>
                        </div>

                        {/* Quantity controls + remove */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, -1)
                              }
                              aria-label="Decrease quantity"
                              className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-semibold text-gray-700">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, 1)
                              }
                              aria-label="Increase quantity"
                              className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.product.id)}
                            aria-label={`Remove ${item.product.name}`}
                            className="p-1 rounded text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-5 py-4 space-y-3 shrink-0">
                  {/* Subtotal */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Subtotal</span>
                      <span className="text-sm font-black text-gray-900">
                        ${subtotalUsd.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">
                        ≈ {subtotalXlm.toLocaleString()} XLM
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {items.length} item{items.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-bold transition-all active:scale-[0.98]",
                      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20"
                    )}
                  >
                    Go to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
