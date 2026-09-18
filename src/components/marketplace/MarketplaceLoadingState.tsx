// components/Marketplace/MarketplaceLoadingState.tsx

export default function MarketplaceLoadingState() {
  return (
    <div className="w-full py-12 flex flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 border-4 border-line-strong border-t-blue-500 rounded-full animate-spin" />
      <p className="text-sm text-ink-faint">Loading marketplace items...</p>
    </div>
  );
}