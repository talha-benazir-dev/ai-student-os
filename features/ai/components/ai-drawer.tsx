"use client";

import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { useAIDrawer, type DrawerContext } from "@/providers/ai-drawer-provider";
import { useClusters } from "@/providers/clusters-provider";
import { DrawerChat } from "@/features/ai/components/drawer-chat";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/features/ai/types";
import { cn } from "@/lib/utils";

function getDrawerTitle(context: DrawerContext): string {
  switch (context.type) {
    case "document":
      return `Study Pack — ${context.documentTitle}`;
    case "cluster":
      return `Autopilot — ${context.clusterNames.join(", ")}`;
    case "manual":
      return "Nucleus AI";
  }
}

function getDrawerChatKey(context: DrawerContext): string {
  switch (context.type) {
    case "document":
      return `document-${context.documentId}`;
    case "cluster":
      return `cluster-${context.clusterIds.join("-")}`;
    case "manual":
      return "manual";
  }
}

export function AIDrawer() {
  const { isOpen, context, closeDrawer } = useAIDrawer();
  const { clusters } = useClusters();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("name, study_stage, subjects, country")
        .limit(1)
        .maybeSingle();

      if (data) {
        setProfile({
          name: data.name ?? "",
          study_stage: data.study_stage ?? "",
          subjects: data.subjects ?? [],
          country: data.country ?? "",
        });
      }

      setProfileLoaded(true);
    }

    void fetchProfile();
  }, []);

  const clusterOptions = clusters.map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
  }));

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      ) : null}

      <div
        className={cn(
          "fixed bottom-0 right-0 top-0 z-50 flex w-full flex-col border-l border-[#ffffff10] bg-[#0a0a0f] shadow-2xl transition-transform duration-300 ease-in-out md:w-[480px]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#ffffff08] p-4">
          <div className="flex min-w-0 items-center gap-2">
            <Sparkles className="h-[18px] w-[18px] shrink-0 text-violet-400" />
            <h2 className="truncate text-sm font-medium text-white">
              {context ? getDrawerTitle(context) : "Nucleus AI"}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="rounded-lg p-2 hover:bg-[#ffffff08]"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {isOpen && context && profileLoaded ? (
            <DrawerChat
              key={getDrawerChatKey(context)}
              context={context}
              clusters={clusterOptions}
              profile={profile}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
