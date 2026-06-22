import { Suspense } from "react";
import { Pin } from "lucide-react";
import {
  getDashboardWidgets,
  getDailyStudyTimeForPeriod,
  getTaskCompletionRateForPeriod,
  getActivityHeatmap,
  getClusterBreakdown,
  getAnalyticsSummary,
  getSessionHistory,
  getTasksByCluster,
} from "@/features/analytics/actions/analytics.actions";
import {
  ALL_WIDGETS,
  WIDGET_LABELS,
  widgetDescription,
  type WidgetId,
} from "@/features/analytics/types/widgets";
import type { AnalyticsPeriod } from "@/features/analytics/types/period";
import {
  DailyStudyTimeChart,
  TaskCompletionChart,
  ActivityHeatmap,
  ClusterBreakdownBars,
} from "@/features/analytics/components/charts";
import { WidgetPinButton } from "@/features/analytics/components/widget-pin-button";
import { PeriodToggle } from "@/features/analytics/components/period-toggle";
import { AnalyticsSummaryRow } from "@/features/analytics/components/analytics-summary";
import { SessionHistoryTable } from "@/features/analytics/components/session-history-table";
import { TasksByClusterChart } from "@/features/analytics/components/tasks-by-cluster-chart";

interface AnalyticsPageProps {
  period: AnalyticsPeriod;
}

export default async function AnalyticsPage({ period }: AnalyticsPageProps) {
  const [
    { data: pinned },
    { data: summary },
    { data: dailyStudy },
    { data: taskCompletion },
    { data: heatmap },
    { data: clusterBreakdown },
    { data: tasksByCluster },
    { data: sessionHistory },
  ] = await Promise.all([
    getDashboardWidgets(),
    getAnalyticsSummary(period),
    getDailyStudyTimeForPeriod(period),
    getTaskCompletionRateForPeriod(period),
    getActivityHeatmap(),
    getClusterBreakdown(period),
    getTasksByCluster(period),
    getSessionHistory(period, 10, 0),
  ]);

  const pinnedWidgets = pinned ?? ["daily_study_time", "activity_heatmap"];

  const chartMap: Record<WidgetId, React.ReactNode> = {
    daily_study_time: <DailyStudyTimeChart data={dailyStudy ?? []} />,
    task_completion_rate: <TaskCompletionChart data={taskCompletion ?? []} />,
    activity_heatmap: <ActivityHeatmap data={heatmap ?? []} />,
    cluster_breakdown: <ClusterBreakdownBars data={clusterBreakdown ?? []} />,
    tasks_by_cluster: <TasksByClusterChart data={tasksByCluster ?? []} />,
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-10 mx-auto w-full max-w-[1400px]">
      <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">
        Analytics
      </h1>
      <p className="text-sm text-muted-foreground mt-1 mb-6">
        A long view of your focus and consistency.
      </p>

      <div className="mb-6">
        <Suspense fallback={null}>
          <PeriodToggle period={period} />
        </Suspense>
      </div>

      {summary && (
        <div className="mb-8">
          <AnalyticsSummaryRow summary={summary} />
        </div>
      )}

      <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
        <Pin className="h-3 w-3" />
        Pin 2 charts to show on your dashboard.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {ALL_WIDGETS.map((id) => {
          const isPinned = pinnedWidgets.includes(id);
          return (
            <div key={id} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold">
                    {WIDGET_LABELS[id].title}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {widgetDescription(id, period)}
                  </p>
                </div>
                <WidgetPinButton
                  widgetId={id}
                  isPinned={isPinned}
                  pinnedWidgets={pinnedWidgets as WidgetId[]}
                />
              </div>
              {chartMap[id]}
            </div>
          );
        })}
      </div>

      <section className="rounded-2xl border border-border bg-card px-6 pt-6 pb-2">
        <h2 className="text-sm font-semibold">Session history</h2>
        <p className="text-xs text-muted-foreground mt-0.5 mb-4">
          Individual study sessions for the selected period.
        </p>
        <SessionHistoryTable
          period={period}
          initialRows={sessionHistory?.rows ?? []}
          initialHasMore={sessionHistory?.hasMore ?? false}
        />
      </section>
    </div>
  );
}
