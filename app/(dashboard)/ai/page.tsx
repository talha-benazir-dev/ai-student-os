import type { Metadata } from "next";
import AIWorkspacePage from "@/features/ai/components/ai";

export const metadata: Metadata = {
  title: "AI Workspace — Nucleus",
  description: "Your private research copilot.",
};

export default function Page() {
  return <AIWorkspacePage />;
}
