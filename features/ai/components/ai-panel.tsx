"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChat } from "@/features/ai/hooks/use-chat";
import { useClusters } from "@/providers/clusters-provider";
import type { AutonomyLevel } from "@/features/ai/types";
import { ChatThread } from "@/features/ai/components/chat-thread";
import { ChatInput } from "@/features/ai/components/chat-input";

const AUTONOMY_OPTIONS: { value: AutonomyLevel; label: string }[] = [
  { value: "manual", label: "Manual" },
  { value: "assisted", label: "Assisted" },
  { value: "autonomous", label: "Autonomous" },
];

type AIPanelProps = {
  className?: string;
};

export function AIPanel({ className }: AIPanelProps = {}) {
  const { clusters } = useClusters();
  const {
    messages,
    isLoading,
    autonomy,
    selectedClusterId,
    selectedClusterName,
    curriculumMode,
    sendMessage,
    setAutonomy,
    setCluster,
    setCurriculumMode,
    setProfile,
  } = useChat();

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("name, study_stage, subjects, country")
        .eq("id", user.id)
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
    }

    fetchProfile();
  }, [setProfile]);

  return (
    <div
      className={cn(
        "flex flex-col px-4",
        className ?? "h-[calc(100vh-64px)]",
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[#ffffff08] py-4">
        <h1 className="text-xl font-semibold tracking-tight">AI Workspace</h1>
        <div className="flex items-center gap-3">
          <Select
            value={autonomy}
            onValueChange={(value) => setAutonomy(value as AutonomyLevel)}
          >
            <SelectTrigger className="h-8 w-32 rounded-lg border-[#ffffff10] bg-[#0f0f17] text-xs text-white/70">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AUTONOMY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        <ChatThread messages={messages} />
      </div>

      <div className="shrink-0 border-t border-[#ffffff08] py-4">
        <ChatInput
          onSend={sendMessage}
          isLoading={isLoading}
          clusters={clusters}
          selectedClusterId={selectedClusterId}
          selectedClusterName={selectedClusterName}
          curriculumMode={curriculumMode}
          onClusterSelect={setCluster}
          onCurriculumToggle={setCurriculumMode}
        />
      </div>
    </div>
  );
}
