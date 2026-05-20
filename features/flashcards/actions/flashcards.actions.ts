"use server";

import { createClient } from "@/lib/supabase/server";
import type { Flashcard } from "../types";

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

export async function getFlashcards(): Promise<ActionResult<Flashcard[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

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
  const { data: { user }, error: authError } = await supabase.auth.getUser();

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
  subject: string
): Promise<ActionResult<Flashcard>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

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
      subject: subject || "",
      difficulty: "medium",
      next_review: today,
      interval_days: 1,
      repetitions: 0,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Flashcard, error: null };
}

export async function updateFlashcard(
  id: string,
  front: string,
  back: string,
  subject: string
): Promise<ActionResult<Flashcard>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to update flashcards." };
  }

  const { data, error } = await supabase
    .from("flashcards")
    .update({
      front,
      back,
      subject: subject || "",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Flashcard, error: null };
}

export async function reviewFlashcard(
  id: string,
  rating: "easy" | "medium" | "hard"
): Promise<ActionResult<Flashcard>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

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
  return { data: data as Flashcard, error: null };
}

export async function deleteFlashcard(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to delete flashcards." };
  }

  const { error } = await supabase.from("flashcards").delete().eq("id", id);

  if (error) return { data: null, error: error.message };
  return { data: { id }, error: null };
}
