"use client";

import React from "react";

export type ProductCardVariant = "default" | "featured" | "compact";

export interface ProductCardProps {
  name: string;
  description?: string;
  priceInCents: number;
  currency?: string;
  imageUrl?: string;
  imageAlt?: string;
  badge?: string;
  inStock?: boolean;
  variant?: ProductCardVariant;
  onAddToCart?: () => void;
  onClick?: () => void;
  className?: string;
}

function formatPrice(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function ProductCard({
  name,
  description,
  priceInCents,
  currency = "USD",
  imageUrl,
  imageAlt,
  badge,
  inStock = true,
  variant = "default",
  onAddToCart,
  onClick,
  className = "",
}: ProductCardProps) {
  const isCompact = variant === "compact";
  const isFeatured = variant === "featured";

  return (
    <article
      onClick={onClick}
      className={[
        "group relative flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm",
        "transition-shadow duration-200 hover:shadow-md",
        isFeatured ? "ring-2 ring-indigo-500" : "",
        onClick ? "cursor-pointer" : "",
        isCompact ? "flex-row" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="product-card"
    >
      {/* Image */}
      <div
        className={[
          "relative overflow-hidden bg-slate-100",
          isCompact ? "w-28 shrink-0 rounded-l-2xl" : "rounded-t-2xl",
          isFeatured ? "h-56" : isCompact ? "h-full" : "h-44",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {imageUrl ? (
          // ✅ FIX: Use a standard <img> tag instead of next/image.
          // next/image requires a running Next.js server for the image optimisation API
          // which is not available in Storybook. The `object-cover` class replicates the
          // same visual behaviour. For production, swap back to <Image> in the real app.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={imageAlt ?? name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full min-h-[7rem] w-full items-center justify-center text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        {badge && (
          <span className="absolute left-2 top-2 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">
            {badge}
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-white">
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{name}</h3>
        {description && !isCompact && (
          <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          <span
            className={[
              "font-bold tabular-nums",
              isFeatured ? "text-lg text-indigo-600" : "text-sm text-slate-800",
            ].join(" ")}
          >
            {formatPrice(priceInCents, currency)}
          </span>
          {onAddToCart && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              disabled={!inStock}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white
                         transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add to cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;