"use client";

import { useMemo, useState } from "react";
import { History, Search, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteConversation } from "@/features/ai/actions/conversations.actions";
import type { ConversationSummary } from "@/features/ai/actions/conversations.actions";
import { toast } from "sonner";

type ChatHistorySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  isLoading: boolean;
  onSelect: (id: string) => void;
  onRefresh: () => Promise<void>;
  onDeleted: (id: string) => void;
};

type HistoryGroup = {
  label: string;
  items: ConversationSummary[];
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function groupConversations(conversations: ConversationSummary[]): HistoryGroup[] {
  const today = startOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: Record<string, ConversationSummary[]> = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };

  for (const conversation of conversations) {
    const updated = startOfDay(new Date(conversation.updated_at));
    if (updated.getTime() === today.getTime()) {
      groups.Today.push(conversation);
    } else if (updated.getTime() === yesterday.getTime()) {
      groups.Yesterday.push(conversation);
    } else {
      groups.Earlier.push(conversation);
    }
  }

  return (["Today", "Yesterday", "Earlier"] as const)
    .map((label) => ({ label, items: groups[label] }))
    .filter((group) => group.items.length > 0);
}

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function ChatHistorySheet({
  open,
  onOpenChange,
  conversations,
  activeConversationId,
  isLoading,
  onSelect,
  onRefresh,
  onDeleted,
}: ChatHistorySheetProps) {
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return conversations;
    return conversations.filter((conversation) =>
      conversation.title.toLowerCase().includes(trimmed),
    );
  }, [conversations, query]);

  const groups = useMemo(() => groupConversations(filtered), [filtered]);

  const handleDelete = async (
    event: React.MouseEvent,
    id: string,
  ) => {
    event.stopPropagation();
    setDeletingId(id);
    const result = await deleteConversation(id);
    setDeletingId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    onDeleted(id);
    void onRefresh();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-l-[#ffffff10] bg-card p-0 sm:max-w-sm [&>button]:text-muted-foreground [&>button]:hover:text-white"
      >
        <SheetHeader className="border-b border-[#ffffff10] px-5 py-4 text-left">
          <SheetTitle className="flex items-center gap-2 text-white">
            <History className="h-4 w-4 text-primary" />
            Chat history
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Ctrl+H history · Ctrl+N new chat
          </SheetDescription>
        </SheetHeader>

        <div className="border-b border-[#ffffff10] px-4 py-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#ffffff10] bg-[#ffffff08] px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search chats..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {isLoading ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              Loading chats...
            </p>
          ) : groups.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              {query ? "No chats match your search." : "No saved chats yet."}
            </p>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {group.label}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={cn(
                          "group flex w-full items-center gap-2 rounded-xl px-1 py-1 transition-colors",
                          activeConversationId === conversation.id
                            ? "bg-primary/10"
                            : "hover:bg-[#ffffff08]",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => onSelect(conversation.id)}
                          className="min-w-0 flex-1 px-2 py-1.5 text-left"
                        >
                          <span className="block truncate text-sm text-white/80 group-hover:text-white">
                            {conversation.title}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-muted-foreground">
                            {formatRelativeTime(conversation.updated_at)}
                          </span>
                        </button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={deletingId === conversation.id}
                          onClick={(event) =>
                            void handleDelete(event, conversation.id)
                          }
                          className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
                          aria-label="Delete chat"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
