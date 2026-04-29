"use client";

import Link from "next/link";
import {
  Clock3,
  HeartPulse,
  Package,
  ShieldCheck,
  Settings2,
  BadgeCheck,
  type LucideIcon,
  Sparkles,
  Bell,
} from "lucide-react";
import { useActivityFeed } from "@/context/ActivityFeedContext";
import { cn } from "@/lib/utils";
import type { ActivityItem, ActivitySeverity, ActivityType } from "@/lib/activityFeed";

const ICONS: Record<ActivityType, LucideIcon> = {
  listing: Package,
  order: BadgeCheck,
  profile: Settings2,
  payment: Sparkles,
  notification: Bell,
  security: ShieldCheck,
};

function severityTone(severity: ActivitySeverity) {
  switch (severity) {
    case "success":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "warning":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    default:
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
  }
}

function timeAgo(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ActivityFeedPanel({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { activities, unreadCount, markAllAsRead, clearActivities } = useActivityFeed();

  return (
    <section className="rounded-[2.5rem] border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-2xl">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-blue-300">
            <HeartPulse className="h-3.5 w-3.5" />
            Activity Feed
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-white md:text-3xl">
            Recent user activity
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-400">
            Keep track of listings, order updates, profile changes, and security events in one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
              Unread
            </p>
            <p className="mt-1 text-xl font-black text-white">{unreadCount}</p>
          </div>
          <button
            type="button"
            onClick={markAllAsRead}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            Mark all read
          </button>
          <button
            type="button"
            onClick={clearActivities}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold text-neutral-300 transition-colors hover:bg-white/5"
          >
            Clear feed
          </button>
        </div>
      </div>

      <div className={cn("space-y-4", compact && "space-y-3")}>
        {activities.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 px-6 py-12 text-center">
            <p className="text-sm font-medium text-neutral-400">
              No recent activity yet. Actions you take across the app will appear here.
            </p>
          </div>
        ) : (
          activities.map((activity: ActivityItem) => {
            const Icon = ICONS[activity.type];
            return (
              <article
                key={activity.id}
                className={cn(
                  "group flex gap-4 rounded-3xl border p-4 transition-all hover:border-white/20 hover:bg-white/5",
                  activity.isRead ? "border-white/10 bg-black/20" : "border-blue-500/20 bg-blue-500/5",
                )}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
                    severityTone(activity.severity),
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">{activity.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-400">
                        {activity.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                      <Clock3 className="h-3.5 w-3.5" />
                      {timeAgo(activity.timestamp)}
                    </div>
                  </div>

                  {activity.href ? (
                    <Link
                      href={activity.href}
                      className="mt-3 inline-flex text-sm font-bold text-blue-300 transition-colors hover:text-blue-200"
                    >
                      View related page
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
