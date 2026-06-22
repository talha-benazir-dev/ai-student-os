import type { DashboardStudyPeriod, WeekStartsOn } from "@/features/analytics/types/period";

export type { DashboardStudyPeriod, WeekStartsOn };

export type UserSettings = {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro" | "enterprise";
  theme: string;
  study_hours_period: DashboardStudyPeriod;
  week_starts_on: WeekStartsOn;
  created_at: string;
  updated_at: string;
};

export type UpdateSettingsData = {
  name?: string;
  theme?: string;
  study_hours_period?: DashboardStudyPeriod;
  week_starts_on?: WeekStartsOn;
};
