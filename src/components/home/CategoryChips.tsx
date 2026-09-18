import Link from "next/link";

const CHIPS = [
  { emoji: "📱", label: "Electronics", value: "Electronics" },
  { emoji: "👗", label: "Fashion", value: "Fashion" },
  { emoji: "🏠", label: "Home", value: "Home" },
  { emoji: "💄", label: "Beauty", value: "Beauty" },
  { emoji: "⚽", label: "Sports", value: "Sports" },
  { emoji: "🎮", label: "Gaming", value: "Gaming" },
  { emoji: "🖼️", label: "NFTs", value: "NFTs" },
  { emoji: "📦", label: "More", value: "" },
];

export default function CategoryChips() {
  return (
    <section>
      <h2 className="text-base font-black text-ink mb-4">Shop by Category</h2>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {CHIPS.map((chip) => (
          <Link
            key={chip.value || "more"}
            href={chip.value ? `/?category=${chip.value}` : "/"}
            className="flex flex-col items-center gap-1.5 p-3 bg-surface border border-line rounded-xl hover:border-accent hover:bg-accent-soft transition-colors group"
          >
            <span className="text-2xl">{chip.emoji}</span>
            <span className="text-[11px] font-semibold text-ink-muted group-hover:text-accent-hover text-center">
              {chip.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
