import { Pin } from "lucide-react";
import {
  getDashboardWidgets,
  getDailyStudyTime,
  getTaskCompletionRate,
  getActivityHeatmap,
  getClusterBreakdown,
} from "@/features/analytics/actions/analytics.actions";
import { ALL_WIDGETS, WIDGET_LABELS, type WidgetId } from "@/features/analytics/types/widgets";
import {
  DailyStudyTimeChart,
  TaskCompletionChart,
  ActivityHeatmap,
  ClusterBreakdownBars,
} from "@/features/analytics/components/charts";
import { WidgetPinButton } from "@/features/analytics/components/widget-pin-button";

export default async function AnalyticsPage() {
  const [
    { data: pinned },
    { data: dailyStudy },
    { data: taskCompletion },
    { data: heatmap },
    { data: clusterBreakdown },
  ] = await Promise.all([
    getDashboardWidgets(),
    getDailyStudyTime(30),
    getTaskCompletionRate(30),
    getActivityHeatmap(),
    getClusterBreakdown(),
  ]);

  const pinnedWidgets = pinned ?? ["daily_study_time", "activity_heatmap"];

  const chartMap: Record<WidgetId, React.ReactNode> = {
    daily_study_time: <DailyStudyTimeChart data={dailyStudy ?? []} />,
    task_completion_rate: <TaskCompletionChart data={taskCompletion ?? []} />,
    activity_heatmap: <ActivityHeatmap data={heatmap ?? []} />,
    cluster_breakdown: <ClusterBreakdownBars data={clusterBreakdown ?? []} />,
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-10 mx-auto w-full max-w-[1400px]">
      <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">Analytics</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-2">
        A long view of your focus and consistency.
      </p>
      <p className="text-xs text-muted-foreground mb-8 flex items-center gap-1.5">
        <Pin className="h-3 w-3" />
        Pin 2 charts to show on your dashboard.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {ALL_WIDGETS.map((id) => {
          const isPinned = pinnedWidgets.includes(id);
          return (
            <div key={id} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold">{WIDGET_LABELS[id].title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{WIDGET_LABELS[id].description}</p>
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
    </div>
  );
}
