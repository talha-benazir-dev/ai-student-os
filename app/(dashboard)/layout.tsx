import { AppShell } from "@/features/dashboard/components/app-shell";
import { DashboardProviders } from "./dashboard-providers";
import { createClient } from "@/lib/supabase/server";
import type { UserPlan } from "@/lib/ai/plan";

async function getUserPlan(): Promise<UserPlan> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "free";

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (profile?.plan === "pro" || profile?.plan === "enterprise") {
    return profile.plan;
  }

  return "free";
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const plan = await getUserPlan();

  return (
    <DashboardProviders initialPlan={plan}>
      <AppShell>{children}</AppShell>
    </DashboardProviders>
  );
}
