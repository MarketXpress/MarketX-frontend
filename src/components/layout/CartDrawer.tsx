"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ShoppingCart, X } from "lucide-react";
import { mockProducts } from "@/lib/mockData";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const cartItems = mockProducts.slice(0, 3).map((product, index) => ({
  ...product,
  quantity: index === 0 ? 2 : 1,
}));

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subtotalUsd = cartItems.reduce(
    (total, item) => total + item.usdPrice * item.quantity,
    0,
  );
  const subtotalXlm = cartItems.reduce(
    (total, item) => total + item.xlmPrice * item.quantity,
    0,
  );
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-[60]" role="presentation">
      <button
        type="button"
        aria-label="Close cart drawer"
        className="absolute inset-0 bg-gray-900/40"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
              Cart
            </p>
            <h2 id="cart-drawer-title" className="text-lg font-black text-gray-900">
              {itemCount} items ready
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close cart drawer"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">{item.name}</p>
                  <p className="mt-1 text-xs text-gray-500">Sold by {item.seller}</p>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                    <span className="rounded-full bg-white px-2 py-1 font-semibold text-gray-600">
                      Qty {item.quantity}
                    </span>
                    <span className="font-black text-gray-900">
                      {item.xlmPrice * item.quantity} XLM
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 bg-white px-5 py-4">
          <div className="space-y-2 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-black text-gray-900">{subtotalXlm.toLocaleString()} XLM</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">USD estimate</span>
              <span className="font-semibold text-gray-700">
                ${subtotalUsd.toLocaleString()}
              </span>
            </div>
          </div>

          <Link
            href="/dashboard/orders"
            onClick={onClose}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
          >
            Go to Checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}
