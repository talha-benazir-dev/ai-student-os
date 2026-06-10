// Widget IDs — locked names
export type WidgetId =
  | "daily_study_time"
  | "task_completion_rate"
  | "activity_heatmap"
  | "cluster_breakdown";

export const ALL_WIDGETS: WidgetId[] = [
  "daily_study_time",
  "task_completion_rate",
  "activity_heatmap",
  "cluster_breakdown",
];

export const WIDGET_LABELS: Record<WidgetId, { title: string; description: string }> = {
  daily_study_time: { title: "Daily Study Time", description: "Minutes studied per day" },
  task_completion_rate: { title: "Task Completion", description: "Tasks completed per day" },
  activity_heatmap: { title: "Activity Heatmap", description: "90-day consistency map" },
  cluster_breakdown: { title: "Cluster Breakdown", description: "Time per cluster (lifetime)" },
};
