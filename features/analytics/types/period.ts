export type AnalyticsPeriod = "today" | "week" | "month" | "all";

export type DashboardStudyPeriod = "today" | "week" | "month";

/** 0 = Sunday … 6 = Saturday (matches JS Date.getDay()) */
export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DEFAULT_WEEK_STARTS_ON: WeekStartsOn = 1;

export const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  today: "Today",
  week: "This week",
  month: "This month",
  all: "All time",
};

export const DASHBOARD_PERIOD_OPTIONS: DashboardStudyPeriod[] = [
  "today",
  "week",
  "month",
];

export const WEEK_STARTS_ON_LABELS: Record<WeekStartsOn, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const WEEK_STARTS_ON_OPTIONS: WeekStartsOn[] = [0, 1, 2, 3, 4, 5, 6];
