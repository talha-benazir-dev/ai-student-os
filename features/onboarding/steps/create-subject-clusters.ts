import { clusterColorForIndex } from "@/features/clusters/constants";
import type { createClient } from "@/lib/supabase/server";
import type {
  OnboardingSetupContext,
  OnboardingSetupStepResult,
} from "@/features/onboarding/types";

export const CREATE_SUBJECT_CLUSTERS_STEP = "create_subject_clusters";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function createSubjectClusters(
  supabase: SupabaseServerClient,
  ctx: OnboardingSetupContext,
): Promise<OnboardingSetupStepResult> {
  const { userId, data } = ctx;
  const subjects = data.subjects.map((s) => s.trim()).filter(Boolean);

  if (subjects.length === 0) {
    return { step: CREATE_SUBJECT_CLUSTERS_STEP, error: null };
  }

  const { data: existingClusters, error: fetchError } = await supabase
    .from("clusters")
    .select("name")
    .eq("user_id", userId);

  if (fetchError) {
    console.error(
      "[onboarding] create_subject_clusters fetch:",
      fetchError.message,
    );
    return { step: CREATE_SUBJECT_CLUSTERS_STEP, error: fetchError.message };
  }

  const existingNames = new Set(
    (existingClusters ?? []).map((c) => c.name.toLowerCase()),
  );

  const newSubjects = subjects.filter(
    (name) => !existingNames.has(name.toLowerCase()),
  );

  if (newSubjects.length === 0) {
    return { step: CREATE_SUBJECT_CLUSTERS_STEP, error: null };
  }

  const rows = newSubjects.map((name, index) => ({
    user_id: userId,
    name,
    color: clusterColorForIndex(index),
  }));

  const { error } = await supabase.from("clusters").insert(rows);

  if (error) {
    console.error("[onboarding] create_subject_clusters:", error.message);
    return { step: CREATE_SUBJECT_CLUSTERS_STEP, error: error.message };
  }

  return { step: CREATE_SUBJECT_CLUSTERS_STEP, error: null };
}
