"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { isProPlan, type UserPlan } from "@/lib/ai/plan";

type PlanContextValue = {
  plan: UserPlan;
  isPro: boolean;
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({
  initialPlan,
  children,
}: {
  initialPlan: UserPlan;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({
      plan: initialPlan,
      isPro: isProPlan(initialPlan),
    }),
    [initialPlan],
  );

  return (
    <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
  );
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) {
    throw new Error("usePlan must be used within PlanProvider");
  }
  return ctx;
}
