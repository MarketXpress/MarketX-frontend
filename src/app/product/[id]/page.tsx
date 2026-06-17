"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
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
import { mockProducts, ProductMock } from "@/lib/mockData";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const product = mockProducts.find((p) => p.id === id);

  if (!product) notFound();

  const images = product!.images ?? [];
  const hasImages = images.length > 0;

  return <ProductDetailView product={product!} images={images} hasImages={hasImages} />;
}

function ProductDetailView({
  product,
  images,
  hasImages,
}: {
  product: ProductMock;
  images: string[];
  hasImages: boolean;
}) {
  const [activeImg, setActiveImg] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);

  const discountSaving = product.originalUsdPrice - product.usdPrice;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="hover:text-emerald-600 transition-colors cursor-pointer">{product.category}</span>
          <span>/</span>
          <span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-emerald-600 transition-colors mb-6"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Left: Image Gallery ── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
              {hasImages ? (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Package className="w-24 h-24 text-gray-300" />
                </div>
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Package className="w-24 h-24 text-gray-300" />
                </div>
              )}

              {/* Badge overlay */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.discountPercent > 0 && (
                  <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                    -{product.discountPercent}%
                  </span>
                )}
                {product.badge === "flash" && (
                  <span className="bg-orange-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                    <Zap className="w-3 h-3" /> Flash
                  </span>
                )}
                {product.badge === "hot" && (
                  <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
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
                  className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:border-red-300 transition-colors"
                  aria-label="Add to wishlist"
                >
                  <Heart
                    className={`w-4 h-4 ${wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                  />
                </button>
                <button
                  className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:border-emerald-300 transition-colors"
                  aria-label="Share product"
                >
                  <Share2 className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Image counter pill */}
              {images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {activeImg + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg border-2 bg-gray-100 flex items-center justify-center transition-colors ${
                      activeImg === i
                        ? "border-emerald-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Package className="w-6 h-6 text-gray-300" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product Info ── */}
          <div className="flex flex-col gap-5">
            {/* Category chip */}
            <span className="inline-flex w-fit text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              {product.category}
            </span>

            {/* Name */}
            <h1 className="text-xl font-black text-gray-900 leading-snug">
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
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200 fill-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-700">{product.rating}</span>
              <span className="text-xs text-gray-400">({product.reviewCount} reviews)</span>
            </div>

            {/* Pricing */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-black text-emerald-600">
                  ${product.usdPrice.toLocaleString()}
                </span>
                {product.originalUsdPrice > product.usdPrice && (
                  <span className="text-base text-gray-400 line-through">
                    ${product.originalUsdPrice.toLocaleString()}
                  </span>
                )}
                {discountSaving > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Save ${discountSaving}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-gray-700">
                  {product.xlmPrice.toLocaleString()} XLM
                </span>
                <span className="text-xs text-gray-400">≈ ${product.usdPrice}</span>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-medium">
                  Stellar Network
                </span>
              </div>
            </div>

            {/* Escrow trust strip */}
            <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
              <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-800">Protected by Stellar Escrow</p>
                <p className="text-[11px] text-emerald-700 leading-relaxed mt-0.5">
                  Funds are held in a smart contract until you confirm delivery. Safe, transparent, and trustless.
                </p>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-2.5">
              <button className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
                <Shield className="w-4 h-4" />
                Buy with Escrow
              </button>
              <button className="w-full py-3 border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 text-gray-700 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors">
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>

            {/* Delivery / guarantee chips */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />, label: "Buyer Protection" },
                { icon: <Package className="w-3.5 h-3.5 text-emerald-600" />, label: "Fast Shipping" },
                { icon: <Shield className="w-3.5 h-3.5 text-emerald-600" />, label: "Secure Payment" },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-full"
                >
                  {icon}
                  {label}
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h2 className="text-sm font-black text-gray-900">About this item</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Seller card */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-black text-gray-900">Seller</h2>
                <Link
                  href="#"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  View store →
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-black shrink-0">
                  {product.seller.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-gray-900 truncate">{product.seller}</p>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-[11px] font-semibold text-gray-600">
                        {product.sellerRating ?? "N/A"}
                      </span>
                    </div>
                    {product.sellerSales != null && (
                      <div className="flex items-center gap-1">
                        <Store className="w-3 h-3 text-gray-400" />
                        <span className="text-[11px] text-gray-400">
                          {product.sellerSales.toLocaleString()} sales
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button className="shrink-0 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors">
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Related products strip ── */}
        <RelatedProducts currentId={product.id} category={product.category} />
      </div>
    </div>
  );
}

function RelatedProducts({
  currentId,
  category,
}: {
  currentId: string;
  category: string;
}) {
  const related = mockProducts
    .filter((p) => p.id !== currentId && p.category === category)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-black text-gray-900">More in {category}</h2>
        <Link href="/" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {related.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.id}`}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
          >
            <div className="relative h-32 bg-gray-100 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-300" />
              {p.discountPercent > 0 && (
                <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  -{p.discountPercent}%
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs text-gray-700 font-semibold line-clamp-2 min-h-[2.5rem] leading-snug mb-1">
                {p.name}
              </p>
              <span className="text-sm font-black text-emerald-600">${p.usdPrice}</span>
              <p className="text-[10px] text-gray-400 font-semibold">
                ≈ {p.xlmPrice.toLocaleString()} XLM
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
