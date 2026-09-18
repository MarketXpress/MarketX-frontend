"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  Shield,
  ChevronLeft,
  Heart,
  Share2,
  ShoppingCart,
  CheckCircle,
  Zap,
  Store,
  Package,
} from "lucide-react";
import type { Product } from "@/lib/products";
import { addToCart, isInCart, subscribeToCart } from "@/lib/cartStore";

export default function ProductDetailView({
  product,
  images,
  hasImages,
  related,
}: {
  product: Product;
  images: string[];
  hasImages: boolean;
  related: Product[];
}) {
  const [activeImg, setActiveImg] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);

  const inCart = useSyncExternalStore(
    subscribeToCart,
    () => isInCart(product.id),
    () => false,
  );

  const discountSaving = product.originalUsdPrice - product.usdPrice;

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-ink-faint mb-6">
          <Link href="/" className="hover:text-accent-hover transition-colors">Home</Link>
          <span>/</span>
          <span className="hover:text-accent-hover transition-colors cursor-pointer">{product.category}</span>
          <span>/</span>
          <span className="text-ink-muted truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-faint hover:text-accent-hover transition-colors mb-6"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Left: Image Gallery ── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative bg-surface border border-line rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
              {hasImages ? (
                <Image
                  src={images[activeImg]}
                  alt={`${product.name} — photograph ${activeImg + 1} of ${images.length}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                  <Package className="w-24 h-24 text-ink-faint" />
                </div>
              )}

              {/* Badge overlay */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.discountPercent > 0 && (
                  <span className="bg-accent text-on-accent text-[11px] font-bold px-2 py-0.5 rounded-md">
                    -{product.discountPercent}%
                  </span>
                )}
                {product.badge === "flash" && (
                  <span className="bg-orange-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                    <Zap className="w-3 h-3" /> Flash
                  </span>
                )}
                {product.badge === "hot" && (
                  <span className="bg-bad text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                    🔥 Hot
                  </span>
                )}
                {product.badge === "new" && (
                  <span className="bg-blue-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                    New
                  </span>
                )}
              </div>

              {/* Wishlist & Share */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <button
                  onClick={() => setWishlisted((v: boolean) => !v)}
                  className="w-8 h-8 rounded-full bg-surface shadow-sm border border-line flex items-center justify-center hover:border-red-300 transition-colors"
                  aria-label="Add to wishlist"
                >
                  <Heart
                    className={`w-4 h-4 ${wishlisted ? "fill-bad text-bad" : "text-ink-faint"}`}
                  />
                </button>
                <button
                  className="w-8 h-8 rounded-full bg-surface shadow-sm border border-line flex items-center justify-center hover:border-accent transition-colors"
                  aria-label="Share product"
                >
                  <Share2 className="w-4 h-4 text-ink-faint" />
                </button>
              </div>

              {/* Image counter pill */}
              {images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-ink/70 text-bg text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {activeImg + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((url, i) => (
                  <button
                    key={url}
                    onClick={() => setActiveImg(i)}
                    aria-label={`Show photograph ${i + 1}`}
                    aria-current={activeImg === i}
                    className={`relative w-16 h-16 overflow-hidden rounded-lg border-2 bg-surface-2 transition-colors ${
                      activeImg === i
                        ? "border-accent"
                        : "border-line hover:border-line-strong"
                    }`}
                  >
                    <Image src={url} alt="" fill sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product Info ── */}
          <div className="flex flex-col gap-5">
            {/* Category chip */}
            <span className="inline-flex w-fit text-[11px] font-semibold text-accent bg-accent-soft border border-accent-line px-2.5 py-0.5 rounded-full">
              {product.category}
            </span>

            {/* Name */}
            <h1 className="text-xl font-black text-ink leading-snug">
              {product.name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(product.rating)
                        ? "fill-warn text-warn"
                        : "text-gray-200 fill-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-ink-muted">{product.rating}</span>
              <span className="text-xs text-ink-faint">({product.reviewCount} reviews)</span>
            </div>

            {/* Pricing */}
            <div className="bg-surface border border-line rounded-xl p-4 space-y-2">
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-black text-accent">
                  ${product.usdPrice.toLocaleString()}
                </span>
                {product.originalUsdPrice > product.usdPrice && (
                  <span className="text-base text-ink-faint line-through">
                    ${product.originalUsdPrice.toLocaleString()}
                  </span>
                )}
                {discountSaving > 0 && (
                  <span className="text-xs font-bold text-accent bg-accent-soft px-2 py-0.5 rounded-full">
                    Save ${discountSaving}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-ink-muted">
                  {product.xlmPrice.toLocaleString()} XLM
                </span>
                <span className="text-xs text-ink-faint">≈ ${product.usdPrice}</span>
                <span className="text-[10px] text-ink-faint bg-surface-2 px-1.5 py-0.5 rounded font-medium">
                  Stellar Network
                </span>
              </div>
            </div>

            {/* Escrow trust strip */}
            <div className="flex items-start gap-2.5 bg-accent-soft border border-accent-line rounded-xl p-3.5">
              <Shield className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-ok">Protected by Stellar Escrow</p>
                <p className="text-[11px] text-accent leading-relaxed mt-0.5">
                  Funds are held in a smart contract until you confirm delivery. Safe, transparent, and trustless.
                </p>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => addToCart(product.id)}
                className="w-full py-3.5 bg-accent hover:bg-accent-hover text-on-accent font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                {inCart ? "Add another to cart" : "Add to cart"}
              </button>

              <div className="rounded-xl border border-line bg-surface-2 px-4 py-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Shield className="w-4 h-4 text-accent" />
                  Buying with escrow is not live yet
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  Payment means funding a Stellar smart contract that holds your money until you
                  confirm the item arrived. That is the next phase of the project — you can save
                  items until then.
                </p>
              </div>
            </div>

            {/* Delivery / guarantee chips */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: <CheckCircle className="w-3.5 h-3.5 text-accent" />, label: "Buyer Protection" },
                { icon: <Package className="w-3.5 h-3.5 text-accent" />, label: "Fast Shipping" },
                { icon: <Shield className="w-3.5 h-3.5 text-accent" />, label: "Secure Payment" },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1 text-[11px] font-semibold text-ink-muted bg-surface border border-line px-2.5 py-1 rounded-full"
                >
                  {icon}
                  {label}
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h2 className="text-sm font-black text-ink">About this item</h2>
                <p className="text-sm text-ink-muted leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Seller card */}
            <div className="bg-surface border border-line rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-black text-ink">Seller</h2>
                <Link
                  href={`/seller/${product.sellerId}`}
                  className="text-xs font-semibold text-accent hover:text-accent-hover"
                >
                  View store →
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-on-accent text-sm font-black shrink-0">
                  {product.seller.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/seller/${product.sellerId}`}
                      className="truncate text-sm font-bold text-ink hover:text-accent"
                    >
                      {product.seller}
                    </Link>
                    <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" />
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-warn text-warn" />
                      <span className="text-[11px] font-semibold text-ink-muted">
                        {product.sellerRating ?? "N/A"}
                      </span>
                    </div>
                    {product.sellerSales != null && (
                      <div className="flex items-center gap-1">
                        <Store className="w-3 h-3 text-ink-faint" />
                        <span className="text-[11px] text-ink-faint">
                          {product.sellerSales.toLocaleString()} sales
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button className="shrink-0 text-[11px] font-semibold text-accent bg-accent-soft border border-accent-line px-3 py-1.5 rounded-lg hover:bg-accent-hover hover:text-on-accent hover:border-accent transition-colors">
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Related products strip ── */}
        <RelatedProducts category={product.category} related={related} />
      </div>
    </div>
  );
}

function RelatedProducts({
  category,
  related,
}: {
  category: string;
  related: Product[];
}) {
  if (related.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-black text-ink">More in {category}</h2>
        <Link href="/" className="text-xs font-semibold text-accent hover:text-accent-hover">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {related.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.id}`}
            className="bg-surface border border-line rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
          >
            <div className="relative h-32 bg-surface-2 flex items-center justify-center">
              <Package className="w-12 h-12 text-ink-faint" />
              {p.discountPercent > 0 && (
                <span className="absolute top-2 left-2 bg-accent text-on-accent text-[10px] font-bold px-1.5 py-0.5 rounded">
                  -{p.discountPercent}%
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs text-ink-muted font-semibold line-clamp-2 min-h-[2.5rem] leading-snug mb-1">
                {p.name}
              </p>
              <span className="text-sm font-black text-accent">${p.usdPrice}</span>
              <p className="text-[10px] text-ink-faint font-semibold">
                ≈ {p.xlmPrice.toLocaleString()} XLM
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
