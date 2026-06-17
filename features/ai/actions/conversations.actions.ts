"use server";

import { createClient } from "@/lib/supabase/server";
import { requireProAction } from "@/lib/ai/require-pro";
import type {
  AutonomyLevel,
  ChatAttachment,
  ToolResultCard,
} from "@/features/ai/types";

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

export type ConversationSummary = {
  id: string;
  title: string;
  updated_at: string;
  created_at: string;
};

export type ConversationRecord = ConversationSummary & {
  cluster_id: string | null;
  autonomy: AutonomyLevel;
  curriculum_mode: boolean;
};

export type StoredMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments: ChatAttachment[] | null;
  tool_results: ToolResultCard[] | null;
  created_at: string;
};

export type ConversationWithMessages = {
  conversation: ConversationRecord;
  messages: StoredMessage[];
};

function deriveTitle(content: string) {
  const trimmed = content.trim().replace(/\s+/g, " ");
  if (!trimmed) return "New chat";
  return trimmed.length > 60 ? `${trimmed.slice(0, 57)}...` : trimmed;
}

export async function listConversations(): Promise<
  ActionResult<ConversationSummary[]>
> {
  const gate = await requireProAction();
  if ("error" in gate) return { data: null, error: gate.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_conversations")
    .select("id, title, created_at, updated_at")
    .eq("user_id", gate.userId)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as ConversationSummary[], error: null };
}

export async function getConversation(
  id: string,
): Promise<ActionResult<ConversationWithMessages>> {
  const gate = await requireProAction();
  if ("error" in gate) return { data: null, error: gate.error };

  const supabase = await createClient();
  const { data: conversation, error: conversationError } = await supabase
    .from("ai_conversations")
    .select("id, title, created_at, updated_at, cluster_id, autonomy, curriculum_mode")
    .eq("id", id)
    .eq("user_id", gate.userId)
    .single();

  if (conversationError || !conversation) {
    return { data: null, error: conversationError?.message ?? "Not found" };
  }

  const { data: messages, error: messagesError } = await supabase
    .from("ai_messages")
    .select("id, role, content, attachments, tool_results, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  if (messagesError) return { data: null, error: messagesError.message };

  return {
    data: {
      conversation: conversation as ConversationRecord,
      messages: (messages ?? []) as StoredMessage[],
    },
    error: null,
  };
}

export async function createConversation(input: {
  title?: string;
  cluster_id?: string | null;
  autonomy?: AutonomyLevel;
  curriculum_mode?: boolean;
}): Promise<ActionResult<ConversationRecord>> {
  const gate = await requireProAction();
  if ("error" in gate) return { data: null, error: gate.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({
      user_id: gate.userId,
      title: input.title?.trim() || "New chat",
      cluster_id: input.cluster_id ?? null,
      autonomy: input.autonomy ?? "assisted",
      curriculum_mode: input.curriculum_mode ?? false,
    })
    .select("id, title, created_at, updated_at, cluster_id, autonomy, curriculum_mode")
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as ConversationRecord, error: null };
}

export async function appendChatTurn(input: {
  conversationId: string;
  userMessage: {
    content: string;
    attachments?: ChatAttachment[];
  };
  assistantMessage: {
    content: string;
    toolResults?: ToolResultCard[];
  };
  titleFromFirstMessage?: string;
}): Promise<ActionResult<null>> {
  const gate = await requireProAction();
  if ("error" in gate) return { data: null, error: gate.error };

  const supabase = await createClient();

  const { data: conversation, error: conversationError } = await supabase
    .from("ai_conversations")
    .select("id, title")
    .eq("id", input.conversationId)
    .eq("user_id", gate.userId)
    .single();

  if (conversationError || !conversation) {
    return { data: null, error: conversationError?.message ?? "Not found" };
  }

  const rows = [
    {
      conversation_id: input.conversationId,
      role: "user",
      content: input.userMessage.content,
      attachments: input.userMessage.attachments?.length
        ? input.userMessage.attachments
        : null,
      tool_results: null,
    },
    {
      conversation_id: input.conversationId,
      role: "assistant",
      content: input.assistantMessage.content,
      attachments: null,
      tool_results: input.assistantMessage.toolResults?.length
        ? input.assistantMessage.toolResults
        : null,
    },
  ];

  const { error: insertError } = await supabase.from("ai_messages").insert(rows);
  if (insertError) return { data: null, error: insertError.message };

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (
    input.titleFromFirstMessage &&
    conversation.title === "New chat"
  ) {
    updates.title = deriveTitle(input.titleFromFirstMessage);
  }

  const { error: updateError } = await supabase
    .from("ai_conversations")
    .update(updates)
    .eq("id", input.conversationId)
    .eq("user_id", gate.userId);

  if (updateError) return { data: null, error: updateError.message };
  return { data: null, error: null };
}

export async function deleteConversation(
  id: string,
): Promise<ActionResult<null>> {
  const gate = await requireProAction();
  if ("error" in gate) return { data: null, error: gate.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("ai_conversations")
    .delete()
    .eq("id", id)
    .eq("user_id", gate.userId);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}
