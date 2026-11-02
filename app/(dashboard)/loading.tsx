export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto w-full max-w-[1400px] px-6 py-10 sm:px-10"
    >
      <span className="sr-only">Loading workspace</span>
      <div aria-hidden="true" className="space-y-7">
        <div className="h-7 w-44 rounded bg-muted" />
        <div className="h-4 w-64 max-w-full rounded bg-muted/70" />
        <div className="h-44 rounded-lg border border-border bg-card" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-64 rounded-lg border border-border bg-card" />
          <div className="h-64 rounded-lg border border-border bg-card" />
        </div>
      </div>
    </div>
  );
}
