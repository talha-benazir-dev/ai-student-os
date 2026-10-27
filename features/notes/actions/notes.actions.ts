"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { requireProAction } from "@/lib/ai/require-pro";
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
  } = await getUser();

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

export type CreateNoteInput = {
  title: string;
  type: NoteType;
  content: string;
  cluster_id?: string | null;
};

export async function createNote(
  typeOrInput: NoteType | CreateNoteInput,
  cluster_id?: string | null,
  overrides?: { title?: string; content?: string },
): Promise<ActionResult<Note>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to create notes." };
  }

  const isInputObject =
    typeof typeOrInput === "object" && typeOrInput !== null && "type" in typeOrInput;

  const type = isInputObject ? typeOrInput.type : typeOrInput;
  const resolvedClusterId = isInputObject
    ? (typeOrInput.cluster_id ?? null)
    : (cluster_id ?? null);
  const title = isInputObject
    ? typeOrInput.title
    : (overrides?.title ?? "Untitled");
  const content = isInputObject
    ? typeOrInput.content
    : (overrides?.content ?? "");

  if (type === "chart" || type === "diagram") {
    const gate = await requireProAction();
    if ("error" in gate) {
      return { data: null, error: gate.error };
    }
  }

  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      title,
      content,
      cluster_id: resolvedClusterId,
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
  } = await getUser();

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
  } = await getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to delete notes." };
  }

  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: { id }, error: null };
}
