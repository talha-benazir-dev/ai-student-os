"use client";

import { useEffect } from "react";
import { History, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useChat } from "@/features/ai/hooks/use-chat";
import { useClusters } from "@/providers/clusters-provider";
import type { AutonomyLevel } from "@/features/ai/types";
import { ChatThread } from "@/features/ai/components/chat-thread";
import { ChatInput } from "@/features/ai/components/chat-input";
import { ChatHistorySheet } from "@/features/ai/components/chat-history-sheet";

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
    conversationId,
    historyOpen,
    conversations,
    isLoadingHistory,
    sendMessage,
    setAutonomy,
    setCluster,
    setCurriculumMode,
    setProfile,
    newChat,
    openHistory,
    closeHistory,
    loadConversation,
    refreshConversations,
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
        "flex min-h-0 flex-col overflow-hidden px-4",
        className ?? "h-full",
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[#ffffff08] py-4">
        <h1 className="text-xl font-semibold tracking-tight">AI Workspace</h1>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={newChat}
            className="h-8 w-8 text-white/70 hover:bg-[#ffffff08] hover:text-white"
            title="New chat"
            aria-label="New chat"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={openHistory}
            className="h-8 w-8 text-white/70 hover:bg-[#ffffff08] hover:text-white"
            title="History (Ctrl+H)"
            aria-label="Chat history"
          >
            <History className="h-4 w-4" />
          </Button>
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

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-6">
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

      <ChatHistorySheet
        open={historyOpen}
        onOpenChange={(open) => (open ? openHistory() : closeHistory())}
        conversations={conversations}
        activeConversationId={conversationId}
        isLoading={isLoadingHistory}
        onSelect={(id) => void loadConversation(id)}
        onRefresh={refreshConversations}
        onDeleted={(id) => {
          if (conversationId === id) {
            newChat();
          }
        }}
      />
    </div>
  );
}
