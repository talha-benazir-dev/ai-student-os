"use server";

import { createClient } from "@/lib/supabase/server";
import type { Task } from "@/features/tasks/types";

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
  title: string,
  priority: Task["priority"],
  due_date: string | null,
  subject: string,
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
      title: title ?? "",
      completed: false,
      priority: priority ?? "medium",
      due_date: due_date || null,
      subject: subject ?? "",
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as Task, error: null };
}

export async function updateTask(
  id: string,
  title: string,
  priority: Task["priority"],
  due_date: string | null,
  subject: string,
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
      title: title ?? "",
      priority: priority ?? "medium",
      due_date: due_date || null,
      subject: subject ?? "",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

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

  return { data: { id }, error: null };
}
