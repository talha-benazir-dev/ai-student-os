"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  UserSettings,
  UpdateSettingsData,
} from "@/features/settings/types";
import { revalidatePath } from "next/cache";

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

export async function getSettings(): Promise<ActionResult<UserSettings>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to view settings." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return { data: null, error: profileError.message };
  }

  const settings: UserSettings = {
    id: user.id,
    name: profile?.name || "",
    email: user.email || "",
    plan: (profile?.plan as "free" | "pro" | "enterprise") || "free",
    theme: profile?.theme || "Obsidian (default)",
    created_at: profile?.created_at || user.created_at,
    updated_at: profile?.updated_at || user.updated_at,
  };

  return { data: settings, error: null };
}

export async function updateSettings(
  settingsData: UpdateSettingsData,
): Promise<ActionResult<UserSettings>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "You must be signed in to update settings." };
  }

  const updateData: Record<string, string | Date> = {
    updated_at: new Date().toISOString(),
  };

  if (settingsData.name !== undefined) {
    updateData.name = settingsData.name;
  }

  if (settingsData.plan !== undefined) {
    updateData.plan = settingsData.plan;
  }

  if (settingsData.theme !== undefined) {
    updateData.theme = settingsData.theme;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath("/settings");

  const settings: UserSettings = {
    id: user.id,
    name: data.name || "",
    email: user.email || "",
    plan: (data.plan as "free" | "pro" | "enterprise") || "free",
    theme: data.theme || "Obsidian (default)",
    created_at: data.created_at,
    updated_at: data.updated_at,
  };

  return { data: settings, error: null };
}
