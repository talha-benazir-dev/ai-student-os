import type { ChatAttachment } from "@/features/ai/types";

export type ApiChatMessage = {
  role: "user" | "assistant";
  content: string;
  attachments?: ChatAttachment[];
};

type AnthropicImageBlock = {
  type: "image";
  source: { type: "url"; url: string };
};

type AnthropicTextBlock = {
  type: "text";
  text: string;
};

type AnthropicToolUseBlock = {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
};

type AnthropicToolResultBlock = {
  type: "tool_result";
  tool_use_id: string;
  content: string;
};

export type AnthropicContentBlock =
  | AnthropicImageBlock
  | AnthropicTextBlock
  | AnthropicToolUseBlock
  | AnthropicToolResultBlock;

export type AnthropicMessage = {
  role: "user" | "assistant";
  content: string | AnthropicContentBlock[];
};

export function toAnthropicMessages(
  messages: ApiChatMessage[],
): AnthropicMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: toAnthropicContent(message),
  }));
}

function toAnthropicContent(
  message: ApiChatMessage,
): string | AnthropicContentBlock[] {
  if (message.role === "assistant") {
    return message.content;
  }

  const blocks: AnthropicContentBlock[] = [];

  for (const attachment of message.attachments ?? []) {
    blocks.push({
      type: "image",
      source: { type: "url", url: attachment.url },
    });
  }

  const text = message.content.trim();
  if (text) {
    blocks.push({ type: "text", text });
  }

  if (blocks.length === 0) {
    return message.content;
  }

  if (blocks.length === 1 && blocks[0].type === "text") {
    return blocks[0].text;
  }

  return blocks;
}
