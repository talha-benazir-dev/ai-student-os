"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { runOnboardingSetup } from "@/features/onboarding/lib/run-onboarding-setup";
import type { OnboardingData, Profile } from "@/features/onboarding/types";

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

export async function ensureProfile(userId: string): Promise<ActionResult<Profile>> {
  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (fetchError) {
    return { data: null, error: fetchError.message };
  }

  if (existing) {
    return { data: existing as Profile, error: null };
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      name: "",
      study_stage: "undergraduate",
      subjects: [],
      onboarded: false,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as Profile, error: null };
}

export async function getProfile(): Promise<ActionResult<Profile>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in." };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return ensureProfile(user.id);
  }

  return { data: data as Profile, error: null };
}

export async function completeOnboarding(
  onboardingData: OnboardingData,
): Promise<ActionResult<Profile>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        name: onboardingData.name,
        country: onboardingData.country,
        study_stage: onboardingData.study_stage,
        subjects: onboardingData.subjects,
        onboarded: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select()
    .single();

  if (profileError || !profile) {
    return { data: null, error: "Something went wrong. Please try again." };
  }

  const { error: setupError } = await runOnboardingSetup(supabase, {
    userId: user.id,
    data: onboardingData,
  });

  if (setupError) {
    return { data: null, error: setupError };
  }

  const { data: completed, error: completeError } = await supabase
    .from("profiles")
    .update({ onboarded: true, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select()
    .single();

  if (completeError || !completed) {
    return { data: null, error: "Something went wrong. Please try again." };
  }

  return { data: completed as Profile, error: null };
}
