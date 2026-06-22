import type { AnalyticsPeriod } from "@/features/analytics/types/period";

// Widget IDs — locked names
export type WidgetId =
  | "daily_study_time"
  | "task_completion_rate"
  | "activity_heatmap"
  | "cluster_breakdown"
  | "tasks_by_cluster";

export const ALL_WIDGETS: WidgetId[] = [
  "daily_study_time",
  "task_completion_rate",
  "activity_heatmap",
  "cluster_breakdown",
  "tasks_by_cluster",
];

export const WIDGET_LABELS: Record<
  WidgetId,
  { title: string; description: string; periodAware?: boolean }
> = {
  daily_study_time: {
    title: "Daily Study Time",
    description: "Minutes studied per day",
    periodAware: true,
  },
  task_completion_rate: {
    title: "Task Completion",
    description: "Tasks completed per day",
    periodAware: true,
  },
  activity_heatmap: {
    title: "Activity Heatmap",
    description: "Last 90 days — consistency view",
    periodAware: false,
  },
  cluster_breakdown: {
    title: "Cluster Breakdown",
    description: "Time per cluster",
    periodAware: true,
  },
  tasks_by_cluster: {
    title: "Tasks by Cluster",
    description: "Completed vs open tasks and points per cluster",
    periodAware: true,
  },
};

export function widgetDescription(
  id: WidgetId,
  period: AnalyticsPeriod,
): string {
  const base = WIDGET_LABELS[id].description;
  if (!WIDGET_LABELS[id].periodAware) return base;
  const periodNote =
    period === "all"
      ? "all time"
      : period === "today"
        ? "today"
        : period === "week"
          ? "this week"
          : "this month";
  if (id === "cluster_breakdown") {
    return `Time per cluster (${periodNote}, calendar)`;
  }
  if (id === "tasks_by_cluster") {
    return `Completed vs open tasks (${periodNote}, calendar)`;
  }
  if (id === "daily_study_time" || id === "task_completion_rate") {
    return `${base} (${periodNote}, calendar)`;
  }
  return `${base} (${periodNote})`;
}
