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

  const { error } = await supabase
    .from("study_sessions")
    .update({
      ended_at: new Date().toISOString(),
      duration_minutes: durationMinutes,
    })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) return { data: null, error: error.message };
  revalidatePath("/dashboard");
  return { data: { id: sessionId }, error: null };
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
