"use client";

import { BarChart3, Bell, ShieldCheck, TrendingUp } from "lucide-react";
import { useActivityFeed } from "@/context/ActivityFeedContext";

const cardStyles = [
  {
    label: "Total events",
    icon: BarChart3,
    valueKey: "total",
  },
  {
    label: "Unread items",
    icon: Bell,
    valueKey: "unread",
  },
  {
    label: "Listing actions",
    icon: TrendingUp,
    valueKey: "listing",
  },
  {
    label: "Security events",
    icon: ShieldCheck,
    valueKey: "security",
  },
] as const;

export default function ActivitySummaryCards() {
  const { activities, unreadCount } = useActivityFeed();

  const totals = {
    total: activities.length,
    unread: unreadCount,
    listing: activities.filter((item) => item.type === "listing").length,
    security: activities.filter((item) => item.type === "security").length,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cardStyles.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500">
                  {card.label}
                </p>
                <p className="mt-3 text-3xl font-black text-white">
                  {totals[card.valueKey]}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-blue-300">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
