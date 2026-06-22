export type AnalyticsSummary = {
  studyMinutes: number;
  sessionCount: number;
  avgSessionMinutes: number;
  tasksCompletedCount: number;
};

export type SessionHistoryRow = {
  id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number;
  cluster_name: string;
  cluster_color: string;
};

export type SessionHistoryResult = {
  rows: SessionHistoryRow[];
  hasMore: boolean;
};

export type TaskClusterRow = {
  name: string;
  color: string;
  completedCount: number;
  completedPoints: number;
  pendingCount: number;
  pendingPoints: number;
};

export type ClusterBreakdownItem = {
  name: string;
  minutes: number;
  color: string;
};
