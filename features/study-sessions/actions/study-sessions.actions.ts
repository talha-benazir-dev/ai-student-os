"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

export async function startSession(
  clusterId?: string | null
): Promise<ActionResult<{ id: string; started_at: string }>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: "Not authenticated." };

  const { data, error } = await supabase
    .from("study_sessions")
    .insert({
      user_id: user.id,
      cluster_id: clusterId ?? null,
      started_at: new Date().toISOString(),
    })
    .select("id, started_at")
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function endSession(
  sessionId: string,
  durationMinutes: number
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: "Not authenticated." };

  const { data: session, error: fetchError } = await supabase
    .from("study_sessions")
    .select("cluster_id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (fetchError) return { data: null, error: fetchError.message };

  const { error } = await supabase
    .from("study_sessions")
    .update({
      ended_at: new Date().toISOString(),
      duration_minutes: durationMinutes,
    })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) return { data: null, error: error.message };

  // Update streak after session is written
  await updateStreak(user.id, durationMinutes);

  revalidatePath("/dashboard");
  revalidatePath("/clusters");
  if (session?.cluster_id) {
    revalidatePath(`/clusters/${session.cluster_id}`);
  }
  return { data: { id: sessionId }, error: null };
}

// Called internally after endSession — not exported as a server action
async function updateStreak(userId: string, sessionMinutes: number) {
  // Only count sessions >= 15 minutes toward streak
  if (sessionMinutes < 15) return;

  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Get today's total study minutes
  const { data: todaySessions } = await supabase
    .from("study_sessions")
    .select("duration_minutes")
    .eq("user_id", userId)
    .gte("started_at", `${today}T00:00:00.000Z`)
    .lte("started_at", `${today}T23:59:59.999Z`)
    .not("duration_minutes", "is", null);

  const todayTotal = (todaySessions ?? []).reduce(
    (sum, s) => sum + (s.duration_minutes ?? 0),
    0
  );

  // Only proceed if today's total crosses 15 min threshold
  if (todayTotal < 15) return;

  // Fetch existing streak row
  const { data: existing } = await supabase
    .from("streaks")
    .select("current_streak, longest_streak, last_study_date")
    .eq("user_id", userId)
    .single();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newCurrent = 1;

  if (existing) {
    if (existing.last_study_date === today) {
      // Already counted today — no change needed
      return;
    } else if (existing.last_study_date === yesterdayStr) {
      // Consecutive day — increment
      newCurrent = existing.current_streak + 1;
    } else {
      // Streak broken — reset
      newCurrent = 1;
    }
  }

  const newLongest = existing
    ? Math.max(existing.longest_streak, newCurrent)
    : newCurrent;

  await supabase.from("streaks").upsert(
    {
      user_id: userId,
      current_streak: newCurrent,
      longest_streak: newLongest,
      last_study_date: today,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}

export async function getStreakData(): Promise<
  ActionResult<{ current_streak: number; longest_streak: number }>
> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: "Not authenticated." };

  const { data, error } = await supabase
    .from("streaks")
    .select("current_streak, longest_streak")
    .eq("user_id", user.id)
    .single();

  if (error || !data) return { data: { current_streak: 0, longest_streak: 0 }, error: null };
  return { data, error: null };
}

export async function getWeeklyStudyMinutes(): Promise<ActionResult<number>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: "Not authenticated." };

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data, error } = await supabase
    .from("study_sessions")
    .select("duration_minutes")
    .eq("user_id", user.id)
    .not("duration_minutes", "is", null)
    .gte("started_at", weekAgo.toISOString());

  if (error) return { data: null, error: error.message };
  const total = (data ?? []).reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0);
  return { data: total, error: null };
}

export async function getClusterStudyMinutes(
  clusterId: string
): Promise<ActionResult<number>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: "Not authenticated." };

  const { data, error } = await supabase
    .from("study_sessions")
    .select("duration_minutes")
    .eq("user_id", user.id)
    .eq("cluster_id", clusterId)
    .not("duration_minutes", "is", null);

  if (error) return { data: null, error: error.message };
  const total = (data ?? []).reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0);
  return { data: total, error: null };
}

export async function getClusterStudyMinutesMap(): Promise<
  ActionResult<Record<string, number>>
> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: "Not authenticated." };

  const { data, error } = await supabase
    .from("study_sessions")
    .select("cluster_id, duration_minutes")
    .eq("user_id", user.id)
    .not("cluster_id", "is", null)
    .not("duration_minutes", "is", null);

  if (error) return { data: null, error: error.message };

  const map: Record<string, number> = {};
  for (const session of data ?? []) {
    if (!session.cluster_id) continue;
    map[session.cluster_id] =
      (map[session.cluster_id] ?? 0) + (session.duration_minutes ?? 0);
  }
  return { data: map, error: null };
}
