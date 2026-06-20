import Link from "next/link";

export default function HeroBanners() {
  return (
    <div className="flex gap-3">
      {/* Main banner (2/3 width) */}
      <div className="flex-[2] relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 flex flex-col justify-between min-h-[200px] overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <span className="inline-block bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3">
            🔐 Escrow Protected
          </span>
          <h1 className="text-2xl font-black text-white leading-tight tracking-tight mb-2">
            Buy anything.<br />Pay with crypto.
          </h1>
          <p className="text-gray-400 text-xs leading-relaxed mb-4">
            Every purchase secured by Stellar smart contracts.<br />Zero risk, full speed.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
          >
            Shop Now →
          </Link>
        </div>
      </div>

      {/* Side banners (1/3 width, stacked) */}
      <div className="flex-1 flex flex-col gap-3">
        <Link
          href="/?category=Electronics"
          className="flex-1 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4 hover:border-emerald-300 transition-colors group"
        >
          <div className="text-lg mb-1">📱</div>
          <p className="text-sm font-black text-gray-900 group-hover:text-emerald-700 transition-colors">New Arrivals</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Up to 30% off</p>
        </Link>
        <Link
          href="/?category=Fashion"
          className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 hover:border-blue-300 transition-colors group"
        >
          <div className="text-lg mb-1">🌟</div>
          <p className="text-sm font-black text-gray-900 group-hover:text-blue-700 transition-colors">Top Sellers</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Verified merchants</p>
        </Link>
      </div>
    </div>
  );
}
