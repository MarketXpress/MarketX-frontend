"use client";

export default function AssetCardSkeleton() {
  return (
    <div className="rounded-2xl bg-surface border border-line overflow-hidden h-full flex flex-col animate-pulse">
      <div className="h-48 bg-surface-2 relative shrink-0">
        <div className="absolute top-4 left-4 w-16 h-6 bg-surface-3 rounded-full" />
        <div className="absolute top-4 right-4 w-20 h-6 bg-surface-3 rounded-full" />
      </div>
      <div className="p-5 grow flex flex-col justify-between gap-5">
        <div>
          <div className="flex justify-between items-start gap-4 mb-3">
            <div className="h-5 bg-surface-2 rounded-lg w-3/4" />
            <div className="h-5 bg-surface-2 rounded-lg w-1/4 shrink-0" />
          </div>
          <div className="h-4 bg-surface-2 rounded-lg w-12" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-7 bg-surface-2 rounded-lg w-20" />
          <div className="h-4 bg-surface-2 rounded-lg w-24" />
        </div>
      </div>
    </div>
  );
}
