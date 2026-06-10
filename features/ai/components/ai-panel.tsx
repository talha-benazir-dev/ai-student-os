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

const MODE_OPTIONS = [
  { curriculumMode: false, label: "Normal" },
  { curriculumMode: true, label: "Curriculum" },
] as const;

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
    curriculumMode,
    autonomy,
    selectedClusterId,
    selectedClusterName,
    sendMessage,
    setCurriculumMode,
    setAutonomy,
    setCluster,
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
        .single();

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

  const clusterOptions = clusters.map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
  }));

  return (
    <div
      className={cn(
        "flex w-full flex-col",
        className ?? "h-[calc(100vh-80px)]",
      )}
    >
      <div className="flex items-center gap-3 border-b border-border px-1 py-3">
        <div className="flex items-center gap-1">
          {MODE_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setCurriculumMode(option.curriculumMode)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                curriculumMode === option.curriculumMode
                  ? "border-violet-500/30 bg-[#7c5cfc]/20 text-violet-400"
                  : "border-transparent text-muted-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <Select
          value={autonomy}
          onValueChange={(value) => setAutonomy(value as AutonomyLevel)}
        >
          <SelectTrigger className="h-8 w-[120px] text-xs">
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

        <div className="ml-auto">
          <Select
            value={selectedClusterId ?? "none"}
            onValueChange={(value) => {
              if (value === "none") {
                setCluster(null, null);
                return;
              }
              const cluster = clusters.find((c) => c.id === value);
              if (cluster) {
                setCluster(cluster.id, cluster.name);
              }
            }}
          >
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder="Scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No scope</SelectItem>
              {clusters.map((cluster) => (
                <SelectItem key={cluster.id} value={cluster.id}>
                  {cluster.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-1 py-4">
        <ChatThread messages={messages} />
      </div>

      <div className="border-t border-border px-1 py-3">
        <ChatInput
          onSend={sendMessage}
          isLoading={isLoading}
          clusters={clusterOptions}
          selectedClusterName={selectedClusterName}
          selectedClusterId={selectedClusterId}
          curriculumMode={curriculumMode}
          onClusterSelect={setCluster}
          onCurriculumToggle={setCurriculumMode}
        />
      </div>
    </div>
  );
}
