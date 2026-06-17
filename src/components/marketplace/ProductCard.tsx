import Link from "next/link";
import { Star } from "lucide-react";
import { ProductMock } from "@/lib/mockData";

export default function ProductCard({ product }: { product: ProductMock }) {
  return (
    <Link href={`/product/${product.id}`} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group block">
      {/* Image placeholder */}
      <div className="relative h-36 bg-gray-100 flex items-center justify-center">
        <div className="w-16 h-16 bg-gray-200 rounded-lg" />
        {product.discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            -{product.discountPercent}%
          </span>
        )}
        {product.badge === "flash" && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            ⚡ Flash
          </span>
        )}
        {product.badge === "hot" && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            🔥 Hot
          </span>
        )}
        {product.badge === "new" && (
          <span className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            New
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <p className="text-xs text-gray-600 line-clamp-2 min-h-[2.5rem] leading-snug mb-2">
          {product.name}
        </p>

        <div className="flex items-baseline gap-1.5 mb-0.5">
          <span className="text-base font-black text-emerald-600">${product.usdPrice}</span>
          {product.originalUsdPrice > product.usdPrice && (
            <span className="text-xs text-gray-400 line-through">${product.originalUsdPrice}</span>
          )}
        </div>
        <p className="text-[10px] text-gray-400 font-semibold mb-2">
          ≈ {product.xlmPrice.toLocaleString()} XLM
        </p>

        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-semibold text-gray-600">{product.rating}</span>
          <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
        </div>

        <button className="w-full py-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors">
          + Add to Cart
        </button>
      </div>
    </Link>
  );
}
