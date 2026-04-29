"use client";

import ActivityFeedPanel from "@/components/activity/ActivityFeedPanel";
import ActivitySummaryCards from "@/components/activity/ActivitySummaryCards";

export default function ActivityPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 pb-20 pt-32 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-blue-300">
            User Dashboard
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tighter md:text-5xl">
            Activity Feed
          </h1>
          <p className="mt-4 max-w-2xl text-neutral-400">
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
