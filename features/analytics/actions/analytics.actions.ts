"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { WidgetId } from "@/features/analytics/types/widgets";

type ActionResult<T> = { data: T | null; error: string | null };

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
  // Always exactly 2 widgets
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

// --- Data fetchers ---

export async function getDailyStudyTime(days: number = 30): Promise<ActionResult<{ date: string; minutes: number }[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: "Not authenticated." };

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("study_sessions")
    .select("started_at, duration_minutes")
    .eq("user_id", user.id)
    .not("duration_minutes", "is", null)
    .gte("started_at", since.toISOString());

  if (error) return { data: null, error: error.message };

  // Group by date
  const map: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    map[d.toISOString().split("T")[0]] = 0;
  }
  for (const s of data ?? []) {
    const date = s.started_at.split("T")[0];
    if (map[date] !== undefined) map[date] += s.duration_minutes ?? 0;
  }

  return { data: Object.entries(map).map(([date, minutes]) => ({ date, minutes })), error: null };
}

export async function getTaskCompletionRate(days: number = 30): Promise<ActionResult<{ date: string; completed: number }[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: "Not authenticated." };

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("tasks")
    .select("updated_at, completed")
    .eq("user_id", user.id)
    .eq("completed", true)
    .gte("updated_at", since.toISOString());

  if (error) return { data: null, error: error.message };

  const map: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    map[d.toISOString().split("T")[0]] = 0;
  }
  for (const t of data ?? []) {
    const date = t.updated_at.split("T")[0];
    if (map[date] !== undefined) map[date] += 1;
  }

  return { data: Object.entries(map).map(([date, completed]) => ({ date, completed })), error: null };
}

export async function getActivityHeatmap(): Promise<ActionResult<{ date: string; minutes: number }[]>> {
  // Last 91 days (13 weeks)
  return getDailyStudyTime(91);
}

export async function getClusterBreakdown(): Promise<ActionResult<{ name: string; minutes: number; color: string }[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: "Not authenticated." };

  const { data: sessions, error: sessionError } = await supabase
    .from("study_sessions")
    .select("cluster_id, duration_minutes")
    .eq("user_id", user.id)
    .not("cluster_id", "is", null)
    .not("duration_minutes", "is", null);

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
