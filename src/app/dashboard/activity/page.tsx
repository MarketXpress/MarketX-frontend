"use client";

import ActivityFeedPanel from "@/components/activity/ActivityFeedPanel";
import ActivitySummaryCards from "@/components/activity/ActivitySummaryCards";

export default function ActivityPage() {
  return (
    <main className="min-h-screen bg-bg px-6 pb-20 pt-14">
      <div className="mx-auto max-w-6xl py-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-line bg-accent-soft px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-accent">
            User Dashboard
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-ink md:text-4xl">
            Activity Feed
          </h1>
          <p className="mt-3 max-w-2xl text-ink-faint">
            See the latest marketplace actions, profile changes, and security events in a single timeline.
          </p>
        </div>

        <div className="space-y-8">
          <ActivitySummaryCards />
          <ActivityFeedPanel />
        </div>
      </div>
    </main>
  );
}
