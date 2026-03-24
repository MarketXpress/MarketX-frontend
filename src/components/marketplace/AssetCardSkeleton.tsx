"use client";

export default function AssetCardSkeleton() {
  return (
    <div className="rounded-[2.5rem] bg-white/5 border border-white/10 overflow-hidden h-full flex flex-col animate-pulse">
      <div className="h-56 bg-neutral-800/50 relative shrink-0">
        <div className="absolute top-6 left-6 w-16 h-6 bg-white/10 rounded-full" />
        <div className="absolute top-6 right-6 w-20 h-6 bg-white/10 rounded-full" />
      </div>
      <div className="p-8 bg-black/40 flex-grow flex flex-col justify-between gap-6">
        <div>
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="h-6 bg-white/10 rounded-lg w-3/4" />
            <div className="h-6 bg-white/10 rounded-lg w-1/4 shrink-0" />
          </div>
          <div className="h-4 bg-white/10 rounded-lg w-12" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-8 bg-white/10 rounded-lg w-20" />
          <div className="h-4 bg-white/10 rounded-lg w-24" />
        </div>
      </div>
    </div>
  );
}
