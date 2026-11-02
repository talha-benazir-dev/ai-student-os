import { createClient, getUser } from "@/lib/supabase/server";
import { isProPlan } from "@/lib/ai/plan";

export type { UserPlan } from "@/lib/ai/plan";
export { isProPlan } from "@/lib/ai/plan";

export async function requirePro(): Promise<
  { error: Response } | { userId: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await getUser();

  if (authError || !user) {
    return {
      error: new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (!profile || !isProPlan(profile.plan)) {
    return {
      error: new Response(JSON.stringify({ error: "upgrade_required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  return { userId: user.id };
}

export async function requireProAction(): Promise<
  { error: string } | { userId: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (!profile || !isProPlan(profile.plan)) {
    return { error: "AI features require a Pro plan." };
  }

  return { userId: user.id };
}
