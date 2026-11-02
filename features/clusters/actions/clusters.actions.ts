"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import type { Cluster } from "@/features/clusters/types";

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

export async function getClusters(): Promise<ActionResult<Cluster[]>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await getUser();

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
  } = await getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to create clusters." };
  }

  const { data, error } = await supabase
    .from("clusters")
    .insert({
      user_id: user.id,
      name: name.trim(),
      color: color || "#a6be98",
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/notes");
  revalidatePath("/flashcards");
  revalidatePath("/documents");
  revalidatePath("/clusters");
  return { data: data as Cluster, error: null };
}

export async function deleteCluster(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to delete clusters." };
  }

  const { error } = await supabase.from("clusters").delete().eq("id", id);

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/notes");
  revalidatePath("/flashcards");
  revalidatePath("/documents");
  revalidatePath("/clusters");
  return { data: { id }, error: null };
}

export async function updateCluster(
  id: string,
  name: string,
  color: string,
): Promise<ActionResult<Cluster>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to update clusters." };
  }

  const { data, error } = await supabase
    .from("clusters")
    .update({ name: name.trim(), color })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/notes");
  revalidatePath("/flashcards");
  revalidatePath("/documents");
  revalidatePath("/clusters");
  return { data: data as Cluster, error: null };
}
