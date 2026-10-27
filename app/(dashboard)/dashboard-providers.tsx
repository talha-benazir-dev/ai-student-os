"use client";

import type { ReactNode } from "react";
import {
  StudySessionProvider,
  type ActiveStudySession,
} from "@/providers/study-session-provider";
import { PlanProvider } from "@/providers/plan-provider";
import { AIDrawerProvider } from "@/providers/ai-drawer-provider";
import type { UserPlan } from "@/lib/ai/plan";

export function DashboardProviders({
  children,
  initialPlan,
  initialSession,
}: {
  children: ReactNode;
  initialPlan: UserPlan;
  initialSession: ActiveStudySession | null;
}) {
  return (
    <PlanProvider initialPlan={initialPlan}>
      <AIDrawerProvider>
        <StudySessionProvider initialSession={initialSession}>
          {children}
        </StudySessionProvider>
      </AIDrawerProvider>
    </PlanProvider>
  );
}
