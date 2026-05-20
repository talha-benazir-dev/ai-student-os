export default function Loading() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-8 mx-auto w-full max-w-[1400px] animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start justify-between gap-4 mb-7">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-muted/60" />
          <div className="h-4 w-72 rounded-md bg-muted/40" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-muted/40" />
          <div className="h-9 w-20 rounded-lg bg-muted/40" />
        </div>
      </div>

      {/* Search bar skeleton */}
      <div className="h-12 w-full rounded-xl bg-muted/40 mb-7" />

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card/50 p-4 h-24" />
        ))}
      </div>

      {/* Chart section skeleton */}
      <div className="rounded-2xl border border-border bg-card/50 p-6 mb-6 h-56" />

      {/* Content rows skeleton */}
      <div className="rounded-2xl border border-border bg-card/50 p-6 mb-6">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-5 rounded-md bg-muted/40" style={{ width: `${80 - i * 8}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
