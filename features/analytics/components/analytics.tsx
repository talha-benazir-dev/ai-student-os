import { WorkspacePageHeader } from "@/features/dashboard/components/workspace-page";
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
  ClusterBreakdownAnalytics,
} from "@/features/analytics/components/charts";
import { WidgetPinButton } from "@/features/analytics/components/widget-pin-button";
import { PeriodToggle } from "@/features/analytics/components/period-toggle";
import { AnalyticsSummaryRow } from "@/features/analytics/components/analytics-summary";
import { SessionHistoryTable } from "@/features/analytics/components/session-history-table";
import { TasksByClusterChart } from "@/features/analytics/components/tasks-by-cluster-chart";

interface AnalyticsPageProps {
  period: AnalyticsPeriod;
}

const DAILY_TREND_WIDGETS: WidgetId[] = [
  "daily_study_time",
  "task_completion_rate",
];

export default async function AnalyticsPage({ period }: AnalyticsPageProps) {
  const showDailyTrendCharts = period !== "today";

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
    showDailyTrendCharts
      ? getDailyStudyTimeForPeriod(period)
      : Promise.resolve({ data: [], error: null }),
    showDailyTrendCharts
      ? getTaskCompletionRateForPeriod(period)
      : Promise.resolve({ data: [], error: null }),
    getActivityHeatmap(),
    getClusterBreakdown(period),
    getTasksByCluster(period),
    getSessionHistory(period, 10, 0),
  ]);

  const pinnedWidgets = pinned ?? ["daily_study_time", "activity_heatmap"];

  const visibleWidgets = showDailyTrendCharts
    ? ALL_WIDGETS
    : ALL_WIDGETS.filter((id) => !DAILY_TREND_WIDGETS.includes(id));

  const chartMap: Record<WidgetId, React.ReactNode> = {
    daily_study_time: <DailyStudyTimeChart data={dailyStudy ?? []} />,
    task_completion_rate: <TaskCompletionChart data={taskCompletion ?? []} />,
    activity_heatmap: <ActivityHeatmap data={heatmap ?? []} />,
    cluster_breakdown: (
      <ClusterBreakdownAnalytics data={clusterBreakdown ?? []} />
    ),
    tasks_by_cluster: <TasksByClusterChart data={tasksByCluster ?? []} />,
  };

  return (
    <div className="workspace-page">
      <WorkspacePageHeader
        icon="analytics"
        title="Analytics"
        description="Notice when you focus best. Build a rhythm that works for you."
      />

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
        {visibleWidgets.map((id) => {
          const isPinned = pinnedWidgets.includes(id);
          return (
            <div
              key={id}
              className="rounded-lg border border-border bg-transparent p-6"
            >
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

      <section className="rounded-lg border border-border bg-transparent px-6 pt-6 pb-2">
        <h2 className="text-sm font-semibold">Session history</h2>
        <p className="text-xs text-muted-foreground mt-0.5 mb-4">
          Individual study sessions for the selected period.
        </p>
        <SessionHistoryTable
          key={period}
          period={period}
          initialRows={sessionHistory?.rows ?? []}
          initialHasMore={sessionHistory?.hasMore ?? false}
        />
      </section>
    </div>
  );
}
