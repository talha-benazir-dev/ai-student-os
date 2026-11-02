import type { Metadata } from "next";
import AIWorkspacePage from "@/features/ai/components/ai";
import { StudyAssistantGate } from "@/features/ai/components/pro-gate";
import { getWorkspaceProfile } from "@/lib/supabase/server";
import { isProPlan } from "@/lib/ai/plan";

export const metadata: Metadata = {
  title: "Study assistant — Nucleus",
  description: "Pick up your study conversation.",
};

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: profile } = await getWorkspaceProfile();
  if (!isProPlan(profile?.plan ?? "free")) return <StudyAssistantGate />;
  const { id } = await params;
  return <AIWorkspacePage conversationId={id} />;
}
