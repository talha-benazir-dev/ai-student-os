import type { Metadata } from "next";
import AIWorkspacePage from "@/features/ai/components/ai";
import { createClient } from "@/lib/supabase/server";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Workspace — Nucleus",
  description: "Your private research copilot.",
};

async function getPlan() {
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

function ProGate() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#7c5cfc]/20 bg-[#7c5cfc]/10 text-[#7c5cfc] shadow-[0_0_30px_-5px_rgba(124,92,252,0.3)]">
        <Lock className="h-7 w-7 animate-pulse" />
      </div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        AI is a Pro feature
      </h1>
      <p className="mb-8 max-w-md text-sm leading-relaxed text-white/55 sm:text-base">
        Upgrade to the Pro plan to access your personal AI study assistant,
        autonomous study tools, document summaries, and more.
      </p>
      <a
        href="/#pricing"
        className="inline-flex items-center justify-center rounded-xl bg-[#7c5cfc] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(124,92,252,0.35)] transition-all hover:bg-[#6a4ce0] hover:shadow-[0_4px_24px_rgba(124,92,252,0.5)]"
      >
        View Plans
      </a>
    </div>
  );
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConversationPage({ params }: PageProps) {
  const plan = await getPlan();
  if (plan === "free") return <ProGate />;

  const { id } = await params;
  return <AIWorkspacePage conversationId={id} />;
}
