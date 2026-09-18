import Link from "next/link";

/**
 * The three banners at the top of the home page.
 *
 * The large one is a deliberately dark panel in both themes, so its text uses
 * fixed light values rather than the ink tokens — those invert, and an
 * inverting foreground on a fixed dark ground goes invisible in one of the two
 * modes. The two small ones are ordinary surfaces and do follow the tokens.
 */
export default function HeroBanners() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex min-h-[200px] flex-[2] flex-col justify-between overflow-hidden rounded-xl bg-[#14151D] p-6">
        {/* A soft accent bloom, purely decorative. */}
        <div
          className="absolute right-0 top-0 h-48 w-48 -translate-y-1/2 translate-x-1/2 rounded-full bg-accent/25 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10">
          <span className="mb-3 inline-block rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80">
            Escrow protected
          </span>

          <h1 className="mb-2 text-2xl font-extrabold leading-tight tracking-tight text-white">
            Buy anything.
            <br />
            Pay with crypto.
          </h1>

          <p className="mb-4 text-xs leading-relaxed text-white/60">
            The money sits in a Stellar smart contract until you confirm the item arrived.
            <br />
            Not with us, and not with the seller.
          </p>

          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#14151D] transition-colors hover:bg-white/90"
          >
            Browse the marketplace →
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <Link
          href="/?category=Electronics"
          className="group flex-1 rounded-xl border border-accent-line bg-accent-soft p-4 transition-colors hover:border-accent"
        >
          <p className="text-sm font-bold text-ink transition-colors group-hover:text-accent">
            New arrivals
          </p>
          <p className="mt-0.5 text-[11px] text-ink-muted">Listed in the last seven days</p>
        </Link>

        <Link
          href="/?category=Fashion"
          className="group flex-1 rounded-xl border border-line bg-surface-2 p-4 transition-colors hover:border-line-strong"
        >
          <p className="text-sm font-bold text-ink transition-colors group-hover:text-accent">
            Top sellers
          </p>
          <p className="mt-0.5 text-[11px] text-ink-muted">Ranked by completed deals</p>
        </Link>
      </div>
    </div>
  );
}
