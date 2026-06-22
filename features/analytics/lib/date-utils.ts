import type {
  AnalyticsPeriod,
  DashboardStudyPeriod,
  WeekStartsOn,
} from "@/features/analytics/types/period";
import { DEFAULT_WEEK_STARTS_ON } from "@/features/analytics/types/period";

/** YYYY-MM-DD in the user's local timezone */
export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Convert an ISO timestamp to a local calendar date key */
export function localDateKeyFromISO(isoString: string): string {
  return localDateKey(new Date(isoString));
}

/** Start of local day, N days before today (for rolling windows e.g. heatmap) */
export function startOfLocalDayDaysAgo(days: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

/** Build an ordered list of local date keys for the last N days (inclusive of today) */
export function localDateRange(days: number): string[] {
  const keys: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (days - 1 - i));
    keys.push(localDateKey(d));
  }
  return keys;
}

export function parseWeekStartsOn(
  raw: number | string | null | undefined,
): WeekStartsOn {
  const n = typeof raw === "string" ? parseInt(raw, 10) : raw;
  if (typeof n === "number" && n >= 0 && n <= 6) {
    return n as WeekStartsOn;
  }
  return DEFAULT_WEEK_STARTS_ON;
}

/** Start of the current calendar week (local midnight), based on user's week start day */
export function getStartOfCalendarWeek(
  weekStartsOn: WeekStartsOn,
  now: Date = new Date(),
): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

/** Start of the current calendar month (local midnight) */
export function getStartOfCalendarMonth(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d;
}

/** Lower bound for bounded periods; null for all-time */
export function getPeriodSince(
  period: AnalyticsPeriod,
  weekStartsOn: WeekStartsOn = DEFAULT_WEEK_STARTS_ON,
): Date | null {
  if (period === "all") return null;
  if (period === "today") {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === "week") return getStartOfCalendarWeek(weekStartsOn);
  return getStartOfCalendarMonth();
}

/** Ordered date keys from period start through today (all-time → last 365 days) */
export function getPeriodDateKeys(
  period: AnalyticsPeriod,
  weekStartsOn: WeekStartsOn = DEFAULT_WEEK_STARTS_ON,
): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (period === "all") {
    return localDateRange(365);
  }
  if (period === "today") {
    return [localDateKey(today)];
  }

  const start =
    period === "week"
      ? getStartOfCalendarWeek(weekStartsOn, today)
      : getStartOfCalendarMonth(today);

  const keys: string[] = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    keys.push(localDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

/** Validate URL/search param period; defaults to week */
export function parseAnalyticsPeriod(raw: string | undefined): AnalyticsPeriod {
  if (raw === "today" || raw === "week" || raw === "month" || raw === "all") {
    return raw;
  }
  return "week";
}

/** Validate dashboard study hours period from profile */
export function parseDashboardStudyPeriod(
  raw: string | null | undefined,
): DashboardStudyPeriod {
  if (raw === "today" || raw === "week" || raw === "month") {
    return raw;
  }
  return "week";
}

/** Days in the chart range for a calendar period */
export function periodToChartDays(
  period: AnalyticsPeriod,
  weekStartsOn: WeekStartsOn = DEFAULT_WEEK_STARTS_ON,
): number {
  return getPeriodDateKeys(period, weekStartsOn).length;
}

/** Check if a local date key falls within a calendar period */
export function isDateKeyInPeriod(
  dateKey: string,
  period: AnalyticsPeriod,
  weekStartsOn: WeekStartsOn = DEFAULT_WEEK_STARTS_ON,
): boolean {
  if (period === "all") return true;
  return getPeriodDateKeys(period, weekStartsOn).includes(dateKey);
}

/** Open tasks: due on or after period start through today */
export function isDueDateInPeriod(
  dueDateKey: string,
  period: AnalyticsPeriod,
  weekStartsOn: WeekStartsOn = DEFAULT_WEEK_STARTS_ON,
): boolean {
  if (period === "all") return true;
  const since = getPeriodSince(period, weekStartsOn);
  if (!since) return true;
  const startKey = localDateKey(since);
  const todayKey = localDateKey(new Date());
  return dueDateKey >= startKey && dueDateKey <= todayKey;
}
