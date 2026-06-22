import { createSubjectClusters } from "./create-subject-clusters";
import type { createClient } from "@/lib/supabase/server";
import type {
  OnboardingSetupContext,
  OnboardingSetupStepResult,
} from "@/features/onboarding/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type OnboardingSetupStep = {
  name: string;
  run: (
    supabase: SupabaseServerClient,
    ctx: OnboardingSetupContext,
  ) => Promise<OnboardingSetupStepResult>;
};

export const ONBOARDING_SETUP_STEPS: OnboardingSetupStep[] = [
  { name: "create_subject_clusters", run: createSubjectClusters },
];
