import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ensureProfile,
  getProfile,
} from "@/features/onboarding/actions/onboarding.actions";
import { OnboardingFlow } from "@/features/onboarding/components/onboarding-flow";

export const metadata: Metadata = {
  title: "Welcome — Nucleus",
  description: "Set up your Nucleus study profile.",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await ensureProfile(user.id);

  const { data: profile } = await getProfile();

  if (profile?.onboarded === true) {
    redirect("/dashboard");
  }

  const googleName =
    (user.user_metadata?.full_name as string | undefined) ?? "";

  return <OnboardingFlow prefillName={googleName} />;
}
