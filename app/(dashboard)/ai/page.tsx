import type { Metadata } from "next";
import AIWorkspacePage from "@/features/ai/components/ai";
import { createClient } from "@/lib/supabase/server";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Workspace — Nucleus",
  description: "Your private research copilot.",
};

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let plan = "free";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();
    if (profile?.plan) {
      plan = profile.plan;
    }
  }

  if (plan === "free") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7c5cfc]/10 border border-[#7c5cfc]/20 mb-6 text-[#7c5cfc] shadow-[0_0_30px_-5px_rgba(124,92,252,0.3)]">
          <Lock className="h-7 w-7 animate-pulse" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
          AI is a Pro feature
        </h1>
        <p className="text-sm sm:text-base text-white/55 max-w-md mb-8 leading-relaxed">
          Upgrade to the Pro plan to access your personal AI study assistant, autonomous study tools, document summaries, and more.
        </p>
        <a
          href="/#pricing"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold bg-[#7c5cfc] hover:bg-[#6a4ce0] text-white transition-all shadow-[0_4px_20px_rgba(124,92,252,0.35)] hover:shadow-[0_4px_24px_rgba(124,92,252,0.5)]"
        >
          View Plans
        </a>
      </div>
    );
  }

  return <AIWorkspacePage />;
}
