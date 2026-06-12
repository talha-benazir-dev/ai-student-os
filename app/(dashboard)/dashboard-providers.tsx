"use client";

import type { ReactNode } from "react";
import { StudySessionProvider } from "@/providers/study-session-provider";
import { PlanProvider } from "@/providers/plan-provider";
import { AIDrawerProvider } from "@/providers/ai-drawer-provider";
import type { UserPlan } from "@/lib/ai/plan";

export function DashboardProviders({
  children,
  initialPlan,
}: {
  children: ReactNode;
  initialPlan: UserPlan;
}) {
  return (
    <PlanProvider initialPlan={initialPlan}>
      <AIDrawerProvider>
        <StudySessionProvider>{children}</StudySessionProvider>
      </AIDrawerProvider>
    </PlanProvider>
  );
}
