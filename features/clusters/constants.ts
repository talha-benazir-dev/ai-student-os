export const CLUSTER_COLORS = [
  "#a6be98",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
] as const;

export const DEFAULT_CLUSTER_COLOR = CLUSTER_COLORS[0];

export function clusterColorForIndex(index: number): string {
  return CLUSTER_COLORS[index % CLUSTER_COLORS.length];
}
