"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Cluster } from "@/features/tasks/types";

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

export async function getClusters(): Promise<ActionResult<Cluster[]>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to view clusters." };
  }

  const { data, error } = await supabase
    .from("clusters")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data ?? []) as Cluster[], error: null };
}

export async function createCluster(
  name: string,
  color: string,
): Promise<ActionResult<Cluster>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to create clusters." };
  }

  const { data, error } = await supabase
    .from("clusters")
    .insert({
      user_id: user.id,
      name: name.trim(),
      color: color || "#7c5cfc",
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath("/tasks");
  return { data: data as Cluster, error: null };
}

export async function deleteCluster(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to delete clusters." };
  }

  const { error } = await supabase.from("clusters").delete().eq("id", id);

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath("/tasks");
  return { data: { id }, error: null };
}
