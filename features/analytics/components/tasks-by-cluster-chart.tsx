import { cn } from "@/lib/utils";
import type { TaskClusterRow } from "@/features/analytics/types/index";

interface TasksByClusterChartProps {
  data: TaskClusterRow[];
}

export function TasksByClusterChart({ data }: TasksByClusterChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-6 text-center">
        No tasks in this period.
      </p>
    );
  }

  const maxPoints = Math.max(
    ...data.map((item) => item.completedPoints + item.pendingPoints),
    1,
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        data.length > 6 && "max-h-[280px] overflow-y-auto pr-1",
      )}
    >
      {data.map((item) => {
        const total = item.completedCount + item.pendingCount;
        const completedPct = total > 0 ? (item.completedCount / total) * 100 : 0;
        const pendingPct = total > 0 ? (item.pendingCount / total) * 100 : 0;
        const pointsPct =
          maxPoints > 0 ? (item.completedPoints / maxPoints) * 100 : 0;

        return (
          <div
            key={item.name}
            className="rounded-lg px-2 py-2 hover:bg-accent/30 transition-colors space-y-1.5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: item.color }}
                />
                <span className="text-xs truncate text-muted-foreground">
                  {item.name}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                {item.completedCount} done · {item.pendingCount} open
              </span>
            </div>
            <div className="h-2 rounded-full bg-border/40 overflow-hidden flex">
              {item.completedCount > 0 && (
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${completedPct}%`,
                    backgroundColor: item.color,
                    opacity: 0.9,
                  }}
                />
              )}
              {item.pendingCount > 0 && (
                <div
                  className="h-full transition-all border-l border-background/20"
                  style={{
                    width: `${pendingPct}%`,
                    backgroundColor: item.color,
                    opacity: 0.25,
                  }}
                />
              )}
            </div>
            <div className="h-1 rounded-full bg-border/20 overflow-hidden">
              <div
                className="h-full transition-all"
                style={{
                  width: `${pointsPct}%`,
                  backgroundColor: item.color,
                  opacity: 0.6,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground tabular-nums">
              <span>{item.completedPoints} pts earned</span>
              <span>{item.pendingPoints} pts open</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
