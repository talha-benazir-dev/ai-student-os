const WEEKS = 18;

// Deterministic intensity 0–4 per day so SSR and client agree.
function level(week: number, day: number) {
  const v = (week * 7 + day * 13 + week * day) % 10;
  if (v < 2) return 0;
  if (v < 4) return 1;
  if (v < 6) return 2;
  if (v < 8) return 3;
  return 4;
}

const shades = [
  "bg-accent",
  "bg-primary/25",
  "bg-primary/50",
  "bg-primary/75",
  "bg-primary",
];

export function StreakHeatmap() {
  return (
    <section className="rounded-xl border border-border bg-card mb-6">
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-border">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            Consistency
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            7-day streak · best 12 · 94 study days this term
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
          <span>Less</span>
          <span className="flex gap-1">
            {shades.map((s, i) => (
              <span key={i} className={`h-2.5 w-2.5 rounded-[3px] ${s}`} />
            ))}
          </span>
          <span>More</span>
        </div>
      </div>
      <div className="px-5 py-4 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {Array.from({ length: WEEKS }, (_, w) => (
            <div key={w} className="flex flex-col gap-1">
              {Array.from({ length: 7 }, (_, d) => (
                <span
                  key={d}
                  title={`Week ${w + 1}, day ${d + 1}: level ${level(w, d)}`}
                  className={`h-2.5 w-2.5 rounded-[3px] ${shades[level(w, d)]}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2 tabular-nums">
          <span>Nov</span>
          <span>Dec</span>
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
        </div>
      </div>
    </section>
  );
}
