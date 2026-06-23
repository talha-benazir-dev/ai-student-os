"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { WidgetId } from "@/features/analytics/types/widgets";
import type { AnalyticsPeriod } from "@/features/analytics/types/period";
import type { WeekStartsOn } from "@/features/analytics/types/period";
import type {
  AnalyticsSummary,
  ClusterBreakdownItem,
  SessionHistoryResult,
  TaskClusterRow,
} from "@/features/analytics/types/index";
import {
  getFullPeriodDateKeys,
  getPeriodSince,
  isDateKeyInPeriod,
  isDueDateInPeriod,
  localDateKey,
  localDateKeyFromISO,
  localDateRange,
  parseWeekStartsOn,
  startOfLocalDayDaysAgo,
} from "@/features/analytics/lib/date-utils";

type ActionResult<T> = { data: T | null; error: string | null };

const GENERAL_CLUSTER_NAME = "General";
const GENERAL_CLUSTER_COLOR = "#ffffff40";

async function fetchWeekStartsOn(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<WeekStartsOn> {
  const { data } = await supabase
    .from("profiles")
    .select("week_starts_on")
    .eq("id", userId)
    .single();
  return parseWeekStartsOn(data?.week_starts_on);
}

function periodSinceIso(
  period: AnalyticsPeriod,
  weekStartsOn: WeekStartsOn,
): string | null {
  const since = getPeriodSince(period, weekStartsOn);
  return since ? since.toISOString() : null;
}

export async function getDashboardWidgets(): Promise<ActionResult<WidgetId[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: "Not authenticated." };

  const { data, error } = await supabase
    .from("profiles")
    .select("dashboard_widgets")
    .eq("id", user.id)
    .single();

  if (error || !data) return { data: ["daily_study_time", "activity_heatmap"], error: null };
  return { data: (data.dashboard_widgets ?? ["daily_study_time", "activity_heatmap"]) as WidgetId[], error: null };
}

export async function setDashboardWidgets(widgets: WidgetId[]): Promise<ActionResult<null>> {
  if (widgets.length !== 2) return { data: null, error: "Select exactly 2 widgets." };

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: "Not authenticated." };

  const { error } = await supabase
    .from("profiles")
    .update({ dashboard_widgets: widgets, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { data: null, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  return { data: null, error: null };
}

export async function getAnalyticsSummary(
  period: AnalyticsPeriod,
): Promise<ActionResult<AnalyticsSummary>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: "Not authenticated." };

  const weekStartsOn = await fetchWeekStartsOn(supabase, user.id);
  const sinceIso = periodSinceIso(period, weekStartsOn);

  let sessionsQuery = supabase
    .from("study_sessions")
    .select("duration_minutes")
    .eq("user_id", user.id)
    .not("duration_minutes", "is", null);

  if (sinceIso) {
    sessionsQuery = sessionsQuery.gte("started_at", sinceIso);
  }

  let tasksQuery = supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("completed", true);

  if (sinceIso) {
    tasksQuery = tasksQuery.gte("updated_at", sinceIso);
  }

  const [sessionsResult, tasksResult] = await Promise.all([
    sessionsQuery,
    tasksQuery,
  ]);

  if (sessionsResult.error) {
    return { data: null, error: sessionsResult.error.message };
  }
  if (tasksResult.error) {
    return { data: null, error: tasksResult.error.message };
  }

  const sessions = sessionsResult.data ?? [];
  const studyMinutes = sessions.reduce(
    (sum, s) => sum + (s.duration_minutes ?? 0),
    0,
  );
  const sessionCount = sessions.length;
  const avgSessionMinutes =
    sessionCount > 0 ? Math.round(studyMinutes / sessionCount) : 0;

  return {
    data: {
      studyMinutes,
      sessionCount,
      avgSessionMinutes,
      tasksCompletedCount: tasksResult.count ?? 0,
    },
    error: null,
  };
}

export async function getDailyStudyTimeForPeriod(
  period: AnalyticsPeriod,
): Promise<ActionResult<{ date: string; minutes: number }[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: "Not authenticated." };

  const weekStartsOn = await fetchWeekStartsOn(supabase, user.id);
  const dateKeys = getFullPeriodDateKeys(period, weekStartsOn);
  const since = getPeriodSince(period, weekStartsOn);

  let query = supabase
    .from("study_sessions")
    .select("started_at, duration_minutes")
    .eq("user_id", user.id)
    .not("duration_minutes", "is", null);

  if (since) {
    query = query.gte("started_at", since.toISOString());
  } else {
    const rollingSince = startOfLocalDayDaysAgo(364);
    query = query.gte("started_at", rollingSince.toISOString());
  }

  const { data, error } = await query;

  if (error) return { data: null, error: error.message };

  const map: Record<string, number> = Object.fromEntries(
    dateKeys.map((date) => [date, 0]),
  );
  for (const s of data ?? []) {
    const date = localDateKeyFromISO(s.started_at);
    if (map[date] !== undefined) map[date] += s.duration_minutes ?? 0;
  }

  return {
    data: Object.entries(map).map(([date, minutes]) => ({ date, minutes })),
    error: null,
  };
}

export async function getDailyStudyTime(days: number = 30): Promise<ActionResult<{ date: string; minutes: number }[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: "Not authenticated." };

  const since = startOfLocalDayDaysAgo(days - 1);

  const { data, error } = await supabase
    .from("study_sessions")
    .select("started_at, duration_minutes")
    .eq("user_id", user.id)
    .not("duration_minutes", "is", null)
    .gte("started_at", since.toISOString());

  if (error) return { data: null, error: error.message };

  const minuteMap: Record<string, number> = Object.fromEntries(
    localDateRange(days).map((date) => [date, 0]),
  );
  for (const s of data ?? []) {
    const date = localDateKeyFromISO(s.started_at);
    if (minuteMap[date] !== undefined) minuteMap[date] += s.duration_minutes ?? 0;
  }

  const filled: { date: string; minutes: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = localDateKey(d);
    filled.push({ date: key, minutes: minuteMap[key] ?? 0 });
  }

  return { data: filled, error: null };
}

export async function getTaskCompletionRateForPeriod(
  period: AnalyticsPeriod,
): Promise<ActionResult<{ date: string; completed: number }[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: "Not authenticated." };

  const weekStartsOn = await fetchWeekStartsOn(supabase, user.id);
  const dateKeys = getFullPeriodDateKeys(period, weekStartsOn);
  const since = getPeriodSince(period, weekStartsOn);

  let query = supabase
    .from("tasks")
    .select("updated_at, completed")
    .eq("user_id", user.id)
    .eq("completed", true);

  if (since) {
    query = query.gte("updated_at", since.toISOString());
  } else {
    const rollingSince = startOfLocalDayDaysAgo(364);
    query = query.gte("updated_at", rollingSince.toISOString());
  }

  const { data, error } = await query;

  if (error) return { data: null, error: error.message };

  const map: Record<string, number> = Object.fromEntries(
    dateKeys.map((date) => [date, 0]),
  );
  for (const t of data ?? []) {
    const date = localDateKeyFromISO(t.updated_at);
    if (map[date] !== undefined) map[date] += 1;
  }

  return {
    data: Object.entries(map).map(([date, completed]) => ({ date, completed })),
    error: null,
  };
}

export async function getTaskCompletionRate(days: number = 30): Promise<ActionResult<{ date: string; completed: number }[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: "Not authenticated." };

  const since = startOfLocalDayDaysAgo(days - 1);

  const { data, error } = await supabase
    .from("tasks")
    .select("updated_at, completed")
    .eq("user_id", user.id)
    .eq("completed", true)
    .gte("updated_at", since.toISOString());

  if (error) return { data: null, error: error.message };

  const map: Record<string, number> = Object.fromEntries(
    localDateRange(days).map((date) => [date, 0]),
  );
  for (const t of data ?? []) {
    const date = localDateKeyFromISO(t.updated_at);
    if (map[date] !== undefined) map[date] += 1;
  }

  return { data: Object.entries(map).map(([date, completed]) => ({ date, completed })), error: null };
}

export async function getActivityHeatmap(): Promise<ActionResult<{ date: string; minutes: number }[]>> {
  return getDailyStudyTime(91);
}

export async function getClusterBreakdown(
  period: AnalyticsPeriod = "all",
): Promise<ActionResult<ClusterBreakdownItem[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: "Not authenticated." };

  const weekStartsOn = await fetchWeekStartsOn(supabase, user.id);
  const sinceIso = periodSinceIso(period, weekStartsOn);

  let sessionsQuery = supabase
    .from("study_sessions")
    .select("cluster_id, duration_minutes, started_at")
    .eq("user_id", user.id)
    .not("cluster_id", "is", null)
    .not("duration_minutes", "is", null);

  if (sinceIso) {
    sessionsQuery = sessionsQuery.gte("started_at", sinceIso);
  }

  const { data: sessions, error: sessionError } = await sessionsQuery;

  if (sessionError) return { data: null, error: sessionError.message };

  const { data: clusters, error: clusterError } = await supabase
    .from("clusters")
    .select("id, name, color")
    .eq("user_id", user.id);

  if (clusterError) return { data: null, error: clusterError.message };

  const map: Record<string, number> = {};
  for (const s of sessions ?? []) {
    if (!s.cluster_id) continue;
    map[s.cluster_id] = (map[s.cluster_id] ?? 0) + (s.duration_minutes ?? 0);
  }

  const result = (clusters ?? [])
    .filter((c) => map[c.id] > 0)
    .map((c) => ({ name: c.name, minutes: map[c.id], color: c.color }))
    .sort((a, b) => b.minutes - a.minutes);

  return { data: result, error: null };
}

export async function getSessionHistory(
  period: AnalyticsPeriod,
  limit: number = 50,
  offset: number = 0,
): Promise<ActionResult<SessionHistoryResult>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: "Not authenticated." };

  const weekStartsOn = await fetchWeekStartsOn(supabase, user.id);
  const sinceIso = periodSinceIso(period, weekStartsOn);

  let query = supabase
    .from("study_sessions")
    .select("id, started_at, ended_at, duration_minutes, cluster_id")
    .eq("user_id", user.id)
    .not("duration_minutes", "is", null)
    .order("started_at", { ascending: false })
    .range(offset, offset + limit);

  if (sinceIso) {
    query = query.gte("started_at", sinceIso);
  }

  const { data: sessions, error: sessionError } = await query;

  if (sessionError) return { data: null, error: sessionError.message };

  const pageRows = sessions ?? [];
  const hasMore = pageRows.length > limit;
  const pageSlice = hasMore ? pageRows.slice(0, limit) : pageRows;

  const clusterIds = [
    ...new Set(
      pageSlice
        .map((s) => s.cluster_id)
        .filter((id): id is string => id !== null),
    ),
  ];

  const clusterMap: Record<string, { name: string; color: string }> = {};
  if (clusterIds.length > 0) {
    const { data: clusters } = await supabase
      .from("clusters")
      .select("id, name, color")
      .eq("user_id", user.id)
      .in("id", clusterIds);

    for (const c of clusters ?? []) {
      clusterMap[c.id] = { name: c.name, color: c.color };
    }
  }

  const rows = pageSlice.map((s) => {
    const cluster = s.cluster_id ? clusterMap[s.cluster_id] : null;
    return {
      id: s.id,
      started_at: s.started_at,
      ended_at: s.ended_at,
      duration_minutes: s.duration_minutes ?? 0,
      cluster_name: cluster?.name ?? GENERAL_CLUSTER_NAME,
      cluster_color: cluster?.color ?? GENERAL_CLUSTER_COLOR,
    };
  });

  return {
    data: {
      rows,
      hasMore,
    },
    error: null,
  };
}

export async function getTasksByCluster(
  period: AnalyticsPeriod,
): Promise<ActionResult<TaskClusterRow[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: "Not authenticated." };

  const weekStartsOn = await fetchWeekStartsOn(supabase, user.id);
  const since = getPeriodSince(period, weekStartsOn);

  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("cluster_id, completed, updated_at, due_date, importance_points")
    .eq("user_id", user.id);

  if (tasksError) return { data: null, error: tasksError.message };

  const { data: clusters, error: clusterError } = await supabase
    .from("clusters")
    .select("id, name, color")
    .eq("user_id", user.id);

  if (clusterError) return { data: null, error: clusterError.message };

  type Bucket = {
    name: string;
    color: string;
    completedCount: number;
    completedPoints: number;
    pendingCount: number;
    pendingPoints: number;
  };

  const buckets: Record<string, Bucket> = {};

  function ensureBucket(id: string, name: string, color: string): Bucket {
    if (!buckets[id]) {
      buckets[id] = {
        name,
        color,
        completedCount: 0,
        completedPoints: 0,
        pendingCount: 0,
        pendingPoints: 0,
      };
    }
    return buckets[id];
  }

  for (const c of clusters ?? []) {
    ensureBucket(c.id, c.name, c.color);
  }
  ensureBucket("general", GENERAL_CLUSTER_NAME, GENERAL_CLUSTER_COLOR);

  for (const task of tasks ?? []) {
    const clusterId = task.cluster_id ?? "general";
    const cluster = clusters?.find((c) => c.id === task.cluster_id);
    const bucket = ensureBucket(
      clusterId,
      cluster?.name ?? GENERAL_CLUSTER_NAME,
      cluster?.color ?? GENERAL_CLUSTER_COLOR,
    );
    const points = task.importance_points ?? 0;

    if (task.completed) {
      if (since && new Date(task.updated_at) < since) continue;
      const dateKey = localDateKeyFromISO(task.updated_at);
      if (!isDateKeyInPeriod(dateKey, period, weekStartsOn)) continue;
      bucket.completedCount += 1;
      bucket.completedPoints += points;
    } else {
      const dueKey = task.due_date;
      const inPeriod =
        period === "all"
          ? true
          : dueKey
            ? isDueDateInPeriod(dueKey, period, weekStartsOn)
            : clusterId === "general";

      if (!inPeriod) continue;
      bucket.pendingCount += 1;
      bucket.pendingPoints += points;
    }
  }

  const result = Object.values(buckets)
    .filter(
      (b) =>
        b.completedCount > 0 ||
        b.pendingCount > 0,
    )
    .sort(
      (a, b) =>
        b.completedCount +
        b.pendingCount -
        (a.completedCount + a.pendingCount),
    );

  return { data: result, error: null };
}
