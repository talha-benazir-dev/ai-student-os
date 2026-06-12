"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { UPGRADE_TOAST } from "@/lib/ai/constants";
import { usePlan } from "@/providers/plan-provider";

export type DrawerContext =
  | {
      type: "document";
      documentId: string;
      documentTitle: string;
      rawText: string;
    }
  | { type: "cluster"; clusterIds: string[]; clusterNames: string[] }
  | { type: "manual" };

type AIDrawerContextType = {
  isOpen: boolean;
  context: DrawerContext | null;
  openDrawer: (context: DrawerContext) => void;
  closeDrawer: () => void;
};

const AIDrawerContext = createContext<AIDrawerContextType | null>(null);

export function AIDrawerProvider({ children }: { children: ReactNode }) {
  const { isPro } = usePlan();
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<DrawerContext | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDrawer = useCallback(
    (ctx: DrawerContext) => {
      if (!isPro) {
        toast.error(UPGRADE_TOAST);
        return;
      }

      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setContext(ctx);
      setIsOpen(true);
    },
    [isPro],
  );

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    closeTimeoutRef.current = setTimeout(() => {
      setContext(null);
      closeTimeoutRef.current = null;
    }, 300);
  }, []);

  return (
    <AIDrawerContext.Provider
      value={{ isOpen, context, openDrawer, closeDrawer }}
    >
      {children}
    </AIDrawerContext.Provider>
  );
}

export function useAIDrawer() {
  const ctx = useContext(AIDrawerContext);
  if (!ctx) {
    throw new Error("useAIDrawer must be used within AIDrawerProvider");
  }
  return ctx;
}
