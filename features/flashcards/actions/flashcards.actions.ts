"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Flashcard, FlashcardUpdate } from "../types";

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

export async function getFlashcards(): Promise<ActionResult<Flashcard[]>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to view flashcards." };
  }

  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as Flashcard[], error: null };
}

export async function getDueFlashcards(): Promise<ActionResult<Flashcard[]>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to view flashcards." };
  }

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .lte("next_review", today)
    .order("next_review", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as Flashcard[], error: null };
}

export async function createFlashcard(
  front: string,
  back: string,
  cluster_id: string | null = null,
): Promise<ActionResult<Flashcard>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to create flashcards." };
  }

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("flashcards")
    .insert({
      user_id: user.id,
      front,
      back,
      cluster_id,
      difficulty: "medium",
      next_review: today,
      interval_days: 1,
      repetitions: 0,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  revalidatePath("/flashcards");
  return { data: data as Flashcard, error: null };
}

export async function updateFlashcard(
  id: string,
  fields: FlashcardUpdate,
): Promise<ActionResult<Flashcard>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to update flashcards." };
  }

  const updates: Record<string, unknown> = {};

  if (fields.front !== undefined) updates.front = fields.front;
  if (fields.back !== undefined) updates.back = fields.back;
  if (fields.cluster_id !== undefined) updates.cluster_id = fields.cluster_id;
  if (fields.difficulty !== undefined) updates.difficulty = fields.difficulty;
  if (fields.next_review !== undefined) updates.next_review = fields.next_review;
  if (fields.interval_days !== undefined) {
    updates.interval_days = fields.interval_days;
  }
  if (fields.repetitions !== undefined) updates.repetitions = fields.repetitions;

  const { data, error } = await supabase
    .from("flashcards")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  revalidatePath("/flashcards");
  return { data: data as Flashcard, error: null };
}

export async function reviewFlashcard(
  id: string,
  rating: "easy" | "medium" | "hard",
): Promise<ActionResult<Flashcard>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to review flashcards." };
  }

  const { data: card, error: getError } = await supabase
    .from("flashcards")
    .select("*")
    .eq("id", id)
    .single();

  if (getError || !card) {
    return { data: null, error: getError?.message || "Flashcard not found." };
  }

  let { interval_days, repetitions } = card;
  const difficulty = rating;

  if (rating === "hard") {
    interval_days = 1;
    repetitions = 0;
  } else if (rating === "medium") {
    interval_days = Math.max(2, interval_days * 2);
    repetitions += 1;
  } else if (rating === "easy") {
    interval_days = Math.max(3, interval_days * 3);
    repetitions += 1;
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval_days);
  const next_review = nextReviewDate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("flashcards")
    .update({
      interval_days,
      repetitions,
      difficulty,
      next_review,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  revalidatePath("/flashcards");
  return { data: data as Flashcard, error: null };
}

export async function deleteFlashcard(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to delete flashcards." };
  }

  const { error } = await supabase.from("flashcards").delete().eq("id", id);

  if (error) return { data: null, error: error.message };

  revalidatePath("/flashcards");
  return { data: { id }, error: null };
}
