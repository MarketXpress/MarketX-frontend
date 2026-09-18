import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

export default function StatCard({ label, value, sub, accent = false }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        accent ? "bg-accent-soft border-accent-line" : "bg-surface border-line"
      )}
    >
      <p className="text-[11px] font-bold text-ink-faint uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={cn(
          "text-2xl font-black tracking-tight",
          accent ? "text-accent" : "text-ink"
        )}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[11px] text-ink-faint mt-0.5 font-semibold">{sub}</p>
      )}
    </div>
  );
}
