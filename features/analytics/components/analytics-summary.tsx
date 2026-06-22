import { Clock, ListChecks, Timer, CheckCircle2 } from "lucide-react";
import type { AnalyticsSummary } from "@/features/analytics/types/index";
import { formatStudyHours } from "@/features/study-sessions/utils/format-study-hours";

interface AnalyticsSummaryProps {
  summary: AnalyticsSummary;
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground">{unit}</span>
        )}
      </div>
    </div>
  );
}

export function AnalyticsSummaryRow({ summary }: AnalyticsSummaryProps) {
  const avgDisplay =
    summary.avgSessionMinutes >= 60
      ? formatStudyHours(summary.avgSessionMinutes)
      : `${summary.avgSessionMinutes}m`;

  const studyDisplay = formatStudyHours(summary.studyMinutes);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <SummaryCard
        icon={Clock}
        label="Study hours"
        value={studyDisplay}
      />
      <SummaryCard
        icon={ListChecks}
        label="Sessions"
        value={summary.sessionCount.toString()}
      />
      <SummaryCard
        icon={Timer}
        label="Avg session"
        value={avgDisplay}
      />
      <SummaryCard
        icon={CheckCircle2}
        label="Tasks done"
        value={summary.tasksCompletedCount.toString()}
      />
    </div>
  );
}
