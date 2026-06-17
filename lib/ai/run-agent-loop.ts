import { executeToolCall } from "@/lib/ai/execute-tool";
import {
  ANTHROPIC_API_URL,
  ANTHROPIC_HAIKU_MODEL,
  getAnthropicHeaders,
} from "@/lib/ai/anthropic";
import type { AnthropicMessage } from "@/lib/ai/format-messages";
import { nucleusTools } from "@/features/ai/tools/index";

export type AgentStreamEvent =
  | { type: "text"; value: string }
  | { type: "tool_result"; value: unknown }
  | { type: "done" }
  | { type: "error"; value: string };

type AnthropicContentBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string };

type AnthropicResponseBlock = {
  type: string;
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
};

export type AgentLoopConfig = {
  system: string;
  messages: AnthropicMessage[];
  userId: string;
  model?: string;
  maxTokens?: number;
  maxIterations?: number;
  maxTotalWriteOps?: number;
  onEvent: (event: AgentStreamEvent) => void;
};

function isWriteTool(name: string) {
  return name.startsWith("create_");
}

export async function runAgentLoop({
  system,
  messages,
  userId,
  model = ANTHROPIC_HAIKU_MODEL,
  maxTokens = 8096,
  maxIterations = 15,
  maxTotalWriteOps,
  onEvent,
}: AgentLoopConfig): Promise<void> {
  const anthropicMessages: AnthropicMessage[] = [...messages];
  let writeOpsUsed = 0;
  let iterations = 0;

  while (iterations < maxIterations) {
    iterations++;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: getAnthropicHeaders(),
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        stream: false,
        cache_control: { type: "ephemeral" },
        system,
        tools: nucleusTools,
        tool_choice: { type: "auto" },
        messages: anthropicMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${errorText}`);
    }

    const data = (await response.json()) as {
      stop_reason: string;
      content: AnthropicResponseBlock[];
    };

    for (const block of data.content) {
      if (block.type === "text" && block.text) {
        onEvent({ type: "text", value: block.text });
      }
    }

    if (data.stop_reason === "end_turn") {
      break;
    }

    const toolUseBlocks = data.content.filter((block) => block.type === "tool_use");
    if (toolUseBlocks.length === 0) {
      break;
    }

    anthropicMessages.push({
      role: "assistant",
      content: data.content as AnthropicContentBlock[],
    });

    const toolResults: AnthropicContentBlock[] = [];

    for (const toolBlock of toolUseBlocks) {
      if (!toolBlock.id || !toolBlock.name) continue;

      let resultString: string;

      if (
        isWriteTool(toolBlock.name) &&
        maxTotalWriteOps != null &&
        writeOpsUsed >= maxTotalWriteOps
      ) {
        resultString = JSON.stringify({
          error:
            "Assisted mode allows only one creation per message. Output your plan and tell the user to switch to Autonomous mode for multi-step workflows.",
        });
      } else {
        try {
          resultString = await executeToolCall(
            toolBlock.name,
            toolBlock.input ?? {},
            userId,
          );
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Tool execution failed";
          resultString = JSON.stringify({ error: message });
        }

        if (isWriteTool(toolBlock.name)) {
          writeOpsUsed++;
        }
      }

      let toolResult: unknown;
      try {
        toolResult = JSON.parse(resultString);
      } catch {
        toolResult = { raw: resultString };
      }

      if (isWriteTool(toolBlock.name)) {
        onEvent({ type: "tool_result", value: toolResult });
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: toolBlock.id,
        content: resultString,
      });
    }

    anthropicMessages.push({
      role: "user",
      content: toolResults,
    });
  }

  onEvent({ type: "done" });
}

type TextStreamEvent = {
  type: string;
  delta?: { type: string; text?: string };
};

export type TextOnlyChatConfig = {
  system: string;
  messages: AnthropicMessage[];
  model?: string;
  maxTokens?: number;
  onEvent: (event: AgentStreamEvent) => void;
};

export async function runTextOnlyChat({
  system,
  messages,
  model = ANTHROPIC_HAIKU_MODEL,
  maxTokens = 4096,
  onEvent,
}: TextOnlyChatConfig): Promise<void> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: getAnthropicHeaders(),
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      stream: true,
      cache_control: { type: "ephemeral" },
      system,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${errorText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;

      const payload = line.slice(6).trim();
      if (!payload || payload === "[DONE]") continue;

      const event = JSON.parse(payload) as TextStreamEvent;

      if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
        if (event.delta.text) {
          onEvent({ type: "text", value: event.delta.text });
        }
      }

      if (event.type === "message_stop") {
        onEvent({ type: "done" });
        return;
      }
    }
  }

  onEvent({ type: "done" });
}
