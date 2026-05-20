"use server";

import { createClient } from "@/lib/supabase/server";
import type { Note } from "@/features/notes/types";

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

export async function getNotes(): Promise<ActionResult<Note[]>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to view notes." };
  }

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data ?? []) as Note[], error: null };
}

export async function createNote(
  title: string,
  content: string,
  subject: string,
): Promise<ActionResult<Note>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to create notes." };
  }

  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      title: title ?? "",
      content: content ?? "",
      subject: subject ?? "",
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as Note, error: null };
}

export async function updateNote(
  id: string,
  title: string,
  content: string,
  subject: string,
): Promise<ActionResult<Note>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to update notes." };
  }

  const { data, error } = await supabase
    .from("notes")
    .update({
      title: title ?? "",
      content: content ?? "",
      subject: subject ?? "",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as Note, error: null };
}

export async function deleteNote(id: string): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to delete notes." };
  }

  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: { id }, error: null };
}
