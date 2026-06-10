"use client";

import { AIPanel } from "@/features/ai/components/ai-panel";

export default function AIWorkspacePage() {
  return (
    <div className="mx-auto flex h-[calc(100vh-80px)] w-full max-w-[1100px] flex-col px-4 sm:px-6 lg:px-10 xl:px-12">
      <div className="shrink-0 py-6 sm:py-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
          AI Workspace
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your private research copilot.
        </p>
      </div>
      <AIPanel className="min-h-0 flex-1" />
    </div>
  );
}
