"use client";

import { useEffect, useMemo } from "react";
import { History, Plus, Sparkles } from "lucide-react";
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
import { suggestsAutonomousMode } from "@/features/ai/lib/autonomy";

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
    conversationTitle,
    historyOpen,
    conversations,
    isLoadingHistory,
    sendMessage,
    setAutonomy,
    switchToAutonomousAndRun,
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

  const isSavedChat = Boolean(conversationId && messages.length > 0);
  const headerTitle = conversationTitle ?? (isSavedChat ? "Saved chat" : "New chat");

  const showAutonomousPrompt = useMemo(() => {
    if (isLoading || autonomy === "autonomous") return false;

    const lastAssistant = [...messages]
      .reverse()
      .find((message) => message.role === "assistant" && !message.isStreaming);

    return lastAssistant ? suggestsAutonomousMode(lastAssistant.content) : false;
  }, [autonomy, isLoading, messages]);

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden px-4",
        className ?? "h-full",
      )}
    >
      <div className="flex shrink-0 flex-col gap-2 border-b border-[#ffffff08] py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              AI Workspace
            </p>
            <h1 className="truncate text-lg font-semibold tracking-tight text-white">
              {headerTitle}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={newChat}
              className="h-8 gap-1.5 px-2.5 text-white/70 hover:bg-[#ffffff08] hover:text-white"
              title="New chat (Ctrl+N)"
              aria-label="New chat"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden text-xs sm:inline">New</span>
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
              <SelectTrigger
                className={cn(
                  "h-8 w-32 rounded-lg border-[#ffffff10] bg-card text-xs text-white/70",
                  showAutonomousPrompt &&
                    "animate-pulse border-violet-400/50 ring-1 ring-violet-400/30",
                )}
              >
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
        {isSavedChat ? (
          <p className="text-xs text-muted-foreground">
            Messages stay in this chat until you start a{" "}
            <button
              type="button"
              onClick={newChat}
              className="text-primary-soft underline-offset-2 hover:underline"
            >
              new chat
            </button>
            .
          </p>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-6">
        <ChatThread messages={messages} />
      </div>

      {showAutonomousPrompt ? (
        <div className="shrink-0 border-t border-[#ffffff08] px-1 py-3">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">
                Ready to execute this plan?
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Switch to Autonomous mode to create everything automatically.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              disabled={isLoading}
              onClick={() => void switchToAutonomousAndRun()}
              className="shrink-0 gap-1.5 bg-primary hover:bg-primary text-primary-foreground"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Switch & run
            </Button>
          </div>
        </div>
      ) : null}

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
