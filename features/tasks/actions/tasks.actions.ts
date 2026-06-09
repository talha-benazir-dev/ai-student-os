"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from "@/features/tasks/types";

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

export async function getTasks(): Promise<ActionResult<Task[]>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to view tasks." };
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data ?? []) as Task[], error: null };
}

export async function createTask(
  input: CreateTaskInput,
): Promise<ActionResult<Task>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to create tasks." };
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      title: input.title.trim(),
      completed: false,
      priority: input.priority ?? "medium",
      due_date: input.due_date || null,
      reward: input.reward ?? "",
      importance_points: input.importance_points ?? 10,
      cluster_id: input.cluster_id ?? null,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath("/tasks");
  return { data: data as Task, error: null };
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput,
): Promise<ActionResult<Task>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to update tasks." };
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) updates.title = input.title.trim();
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.due_date !== undefined) updates.due_date = input.due_date || null;
  if (input.reward !== undefined) updates.reward = input.reward;
  if (input.importance_points !== undefined) {
    updates.importance_points = input.importance_points;
  }
  if (input.cluster_id !== undefined) updates.cluster_id = input.cluster_id;

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath("/tasks");
  return { data: data as Task, error: null };
}

export async function toggleTask(
  id: string,
  completed: boolean,
): Promise<ActionResult<Task>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to update tasks." };
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      completed,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath("/tasks");
  return { data: data as Task, error: null };
}

export async function deleteTask(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to delete tasks." };
  }

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath("/tasks");
  return { data: { id }, error: null };
}
