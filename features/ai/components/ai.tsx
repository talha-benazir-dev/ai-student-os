"use client";

import { AIPanel } from "@/features/ai/components/ai-panel";
import { ChatProvider } from "@/providers/chat-provider";

type AIWorkspacePageProps = {
  conversationId?: string;
};

export default function AIWorkspacePage({
  conversationId,
}: AIWorkspacePageProps = {}) {
  return (
    <ChatProvider
      key={conversationId ?? "new"}
      initialConversationId={conversationId ?? null}
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <AIPanel className="h-full min-h-0" />
      </div>
    </ChatProvider>
  );
}
