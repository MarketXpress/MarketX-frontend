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
      return "border-accent-line bg-accent-soft text-accent";
    case "warning":
      return "border-warn-line bg-warn-bg text-warn";
    default:
      return "border-blue-200 bg-blue-50 text-blue-600";
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
    <section className="rounded-2xl border border-line bg-surface p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-line bg-accent-soft px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-accent">
            <HeartPulse className="h-3.5 w-3.5" />
            Activity Feed
          </div>
          <h2 className="mt-3 text-xl font-black tracking-tight text-ink md:text-2xl">
            Recent user activity
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-faint">
            Keep track of listings, order updates, profile changes, and security events in one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="rounded-xl border border-line bg-surface-2 px-4 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint">
              Unread
            </p>
            <p className="mt-1 text-xl font-black text-ink">{unreadCount}</p>
          </div>
          <button
            type="button"
            onClick={markAllAsRead}
            className="rounded-xl border border-line bg-surface px-4 py-3 text-sm font-bold text-ink-muted transition-colors hover:bg-surface-2"
          >
            Mark all read
          </button>
          <button
            type="button"
            onClick={clearActivities}
            className="rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm font-bold text-ink-faint transition-colors hover:bg-surface-2"
          >
            Clear feed
          </button>
        </div>
      </div>

      <div className={cn("space-y-3", compact && "space-y-2")}>
        {activities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface-2 px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink-faint">
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
                  "group flex gap-4 rounded-xl border p-4 transition-all hover:border-line-strong hover:bg-surface-2",
                  activity.isRead ? "border-line bg-surface" : "border-blue-200 bg-blue-50",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                    severityTone(activity.severity),
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-ink">{activity.title}</h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-ink-faint">
                        {activity.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-ink-faint">
                      <Clock3 className="h-3.5 w-3.5" />
                      {timeAgo(activity.timestamp)}
                    </div>
                  </div>

                  {activity.href ? (
                    <Link
                      href={activity.href}
                      className="mt-2 inline-flex text-xs font-bold text-accent transition-colors hover:text-accent-hover"
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
