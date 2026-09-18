"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Heart, ShoppingCart, Check } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Product } from "@/lib/products";
import { isWishlisted, toggleWishlist } from "@/lib/wishlistStore";
import { addToCart, isInCart, subscribeToCart } from "@/lib/cartStore";
import { formatUsd, formatXlm } from "@/lib/money";
import { cn } from "@/lib/utils";

/**
 * One listing in a grid.
 *
 * It used to draw a grey square where the photograph goes — every card on the
 * site, regardless of how many images the listing had. Sellers were uploading
 * nothing because nothing they uploaded was ever shown.
 */
export default function ProductCard({ product }: { product: Product }) {
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const update = () => setWishlisted(isWishlisted(product.id));
    update();
    window.addEventListener("wishlist-change", update);
    return () => window.removeEventListener("wishlist-change", update);
  }, [product.id]);

  function handleWishlist(event: React.MouseEvent) {
    // The card is a link; without this the click navigates as well.
    event.preventDefault();
    event.stopPropagation();
    setWishlisted(toggleWishlist(product.id));
  }

  // Subscribed rather than read once, so adding from the product page is
  // reflected on a card for the same item still on screen behind it.
  const inCart = useSyncExternalStore(
    subscribeToCart,
    () => isInCart(product.id),
    () => false,
  );

  const cover = product.images?.[0];

  return (
    <div className="group relative overflow-hidden rounded-lg border border-line bg-surface transition-shadow hover:shadow-panel">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-surface-2">
          {cover ? (
            <Image
              src={cover}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid h-full place-items-center text-xs text-ink-faint">
              No photograph
            </div>
          )}

          {product.discountPercent > 0 && (
            <span className="absolute left-2 top-2 rounded bg-deal-bg px-1.5 py-0.5 text-[11px] font-bold text-deal">
              −{product.discountPercent}%
            </span>
          )}

          {product.badge && <Badge badge={product.badge} />}
        </div>
      </Link>

      {/* Outside the Link, so a screen reader announces it as its own control
          rather than as part of the listing's name. */}
      <button
        type="button"
        onClick={handleWishlist}
        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-surface/90 backdrop-blur transition-colors hover:bg-surface"
        aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        aria-pressed={wishlisted}
      >
        <Heart
          className={cn(
            "h-3.5 w-3.5 transition-colors",
            wishlisted ? "fill-bad text-bad" : "text-ink-faint",
          )}
          aria-hidden="true"
        />
      </button>

      <div className="p-3">
        <Link href={`/product/${product.id}`}>
          <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-snug text-ink">
            {product.name}
          </p>
        </Link>

        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="tnum text-base font-bold text-ink">
            {formatUsd(product.usdPrice)}
          </span>
          {product.originalUsdPrice > product.usdPrice && (
            <span className="tnum text-xs text-ink-faint line-through">
              {formatUsd(product.originalUsdPrice)}
            </span>
          )}
        </div>
        <p className="tnum mt-0.5 text-[11px] text-ink-faint">
          ≈ {formatXlm(product.xlmPrice)}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2">
          {product.reviewCount > 0 ? (
            <span className="flex items-center gap-1 text-[11px]">
              <Star className="h-3 w-3 fill-warn text-warn" aria-hidden="true" />
              <span className="tnum font-semibold text-ink-muted">{product.rating.toFixed(1)}</span>
              <span className="tnum text-ink-faint">({product.reviewCount})</span>
            </span>
          ) : (
            <span className="text-[11px] text-ink-faint">No reviews yet</span>
          )}

          {/* Every listing is somebody's. Making the seller reachable from the
              grid is what turns a pile of items into a marketplace of people
              you can look up before you buy. */}
          <Link
            href={`/seller/${product.sellerId}`}
            className="truncate text-[11px] text-ink-muted underline-offset-2 hover:text-accent hover:underline"
          >
            {product.seller}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => addToCart(product.id)}
          className={cn(
            "mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px] font-semibold transition-colors",
            inCart
              ? "border-ok-line bg-ok-bg text-ok"
              : "border-accent-line bg-accent-soft text-accent hover:bg-accent hover:text-on-accent",
          )}
        >
          {inCart ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              In cart — add another
            </>
          ) : (
            <>
              <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
              Add to cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

const BADGES = {
  flash: { label: "Flash", className: "bg-bad text-white" },
  hot: { label: "Hot", className: "bg-warn text-white" },
  new: { label: "New", className: "bg-accent text-on-accent" },
} as const;

function Badge({ badge }: { badge: "flash" | "hot" | "new" }) {
  const { label, className } = BADGES[badge];
  return (
    <span
      className={cn(
        "absolute bottom-2 left-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        className,
      )}
    >
      {label}
    </span>
  );
}
