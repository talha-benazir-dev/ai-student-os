import type { Metadata } from "next";
import AIWorkspacePage from "@/features/ai/components/ai";
import { StudyAssistantGate } from "@/features/ai/components/pro-gate";
import { getWorkspaceProfile } from "@/lib/supabase/server";
import { isProPlan } from "@/lib/ai/plan";

export const metadata: Metadata = {
  title: "Study assistant — Nucleus",
  description: "Think through your material with a study partner.",
};

export default async function Page() {
  const { data: profile } = await getWorkspaceProfile();
  if (!isProPlan(profile?.plan ?? "free")) return <StudyAssistantGate />;
  return <AIWorkspacePage />;
}
