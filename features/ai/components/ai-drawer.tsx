"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";
import {
  useAIDrawer,
  type DrawerContext,
} from "@/providers/ai-drawer-provider";
import { useClusters } from "@/providers/clusters-provider";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/features/ai/types";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const DrawerChat = dynamic(
  () => import("./drawer-chat").then((module) => module.DrawerChat),
  {
    ssr: false,
    loading: () => (
      <p role="status" className="p-6 text-sm text-muted-foreground">
        Opening study assistant…
      </p>
    ),
  },
);

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
    if (!isOpen || profileLoaded) return;
    let cancelled = false;
    async function fetchProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setProfileLoaded(true);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("name, study_stage, subjects, country")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;
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

    void fetchProfile().catch(() => {
      if (!cancelled) setProfileLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, profileLoaded]);

  const clusterOptions = clusters.map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
  }));

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeDrawer();
      }}
    >
      <SheetContent
        side="right"
        aria-describedby={undefined}
        className="flex w-full flex-col gap-0 border-l border-border bg-background p-0 sm:max-w-[480px]"
      >
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border pl-4 pr-12">
          <Sparkles className="size-4 shrink-0 text-primary" />
          <SheetTitle className="truncate text-sm font-medium">
            {context ? getDrawerTitle(context) : "Study assistant"}
          </SheetTitle>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">
          {!profileLoaded ? (
            <p role="status" className="p-6 text-sm text-muted-foreground">
              Opening study assistant…
            </p>
          ) : !profile ? (
            <div className="p-6 text-sm text-muted-foreground">
              <p>Your study profile couldn’t load.</p>
              <button
                onClick={() => setProfileLoaded(false)}
                className="mt-3 text-primary underline"
              >
                Try again
              </button>
            </div>
          ) : isOpen && context ? (
            <DrawerChat
              key={getDrawerChatKey(context)}
              context={context}
              clusters={clusterOptions}
              profile={profile}
            />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
