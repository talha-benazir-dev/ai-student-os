import { revalidatePath } from "next/cache";
import { ONBOARDING_SETUP_STEPS } from "@/features/onboarding/steps";
import type { createClient } from "@/lib/supabase/server";
import type {
  OnboardingSetupContext,
  OnboardingSetupStepResult,
} from "@/features/onboarding/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const CLUSTER_PATHS = [
  "/dashboard",
  "/tasks",
  "/notes",
  "/flashcards",
  "/documents",
  "/clusters",
] as const;

export async function runOnboardingSetup(
  supabase: SupabaseServerClient,
  ctx: OnboardingSetupContext,
): Promise<{ results: OnboardingSetupStepResult[]; error: string | null }> {
  const results: OnboardingSetupStepResult[] = [];

  for (const step of ONBOARDING_SETUP_STEPS) {
    const result = await step.run(supabase, ctx);
    results.push(result);

    if (result.error) {
      return {
        results,
        error: "Failed to set up your study space. Please try again.",
      };
    }
  }

  for (const path of CLUSTER_PATHS) {
    revalidatePath(path);
  }

  return { results, error: null };
}
