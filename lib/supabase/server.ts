import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

// React cache is scoped to one server render, never shared between students.
export const createClient = cache(async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );
});

export const getUser = cache(async function getUser() {
  const supabase = await createClient();
  return supabase.auth.getUser();
});

export const getWorkspaceProfile = cache(async function getWorkspaceProfile() {
  const {
    data: { user },
  } = await getUser();
  if (!user) return { data: null, error: null };
  const supabase = await createClient();
  return supabase
    .from("profiles")
    .select(
      "name, plan, onboarded, theme, study_hours_period, week_starts_on, dashboard_widgets, created_at, updated_at",
    )
    .eq("id", user.id)
    .maybeSingle();
});
