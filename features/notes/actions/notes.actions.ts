"use server";

import { createClient } from "@/lib/supabase/server";
import type { Note, NoteType, NoteUpdate } from "@/features/notes/types";

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
  type: NoteType = "text",
  cluster_id?: string | null,
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
      title: "Untitled",
      content: "",
      cluster_id: cluster_id ?? null,
      type,
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
  fields: NoteUpdate,
): Promise<ActionResult<Note>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to update notes." };
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (fields.title !== undefined) updates.title = fields.title ?? "";
  if (fields.content !== undefined) updates.content = fields.content ?? "";
  if (fields.cluster_id !== undefined) updates.cluster_id = fields.cluster_id;

  const { data, error } = await supabase
    .from("notes")
    .update(updates)
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
