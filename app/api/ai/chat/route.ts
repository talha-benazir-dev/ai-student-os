import { executeToolCall } from "@/lib/ai/execute-tool";
import {
  toAnthropicMessages,
  type AnthropicMessage,
} from "@/lib/ai/format-messages";
import { requirePro } from "@/lib/ai/require-pro";
import { nucleusTools } from "@/features/ai/tools/index";
import { buildSystemPrompt } from "@/features/ai/prompts/index";
import type {
  AutonomyLevel,
  ChatAttachment,
  Profile,
} from "@/features/ai/types";

const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

type RequestBody = {
  messages: {
    role: "user" | "assistant";
    content: string;
    attachments?: ChatAttachment[];
  }[];
  autonomy: AutonomyLevel;
  selectedClusterId: string | null;
  selectedClusterName: string | null;
  curriculumMode: boolean;
  profile: Profile;
};

type AnthropicStreamEvent = {
  type: string;
  index?: number;
  content_block?: {
    type: string;
    id?: string;
    name?: string;
  };
  delta?: {
    type: string;
    text?: string;
    partial_json?: string;
  };
};

function getAnthropicHeaders(): HeadersInit {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
    "anthropic-beta": "prompt-caching-2024-07-31",
  };
}

async function callAnthropicContinuation(
  system: string,
  messages: AnthropicMessage[],
): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: getAnthropicHeaders(),
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 4096,
      stream: false,
      cache_control: { type: "ephemeral" },
      system,
      tools: nucleusTools,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${errorText}`);
  }

  const data = (await response.json()) as {
    content?: { type: string; text?: string }[];
  };

  const textBlock = data.content?.find((block) => block.type === "text");
  return textBlock?.text ?? "";
}

function enqueue(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  event: Record<string, unknown>,
) {
  controller.enqueue(
    encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
  );
}

export async function POST(req: Request) {
  const gate = await requirePro();
  if ("error" in gate) return gate.error;

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const {
    messages,
    curriculumMode,
    selectedClusterId,
    selectedClusterName,
    profile,
  } = body;

  const system = buildSystemPrompt(
    profile,
    curriculumMode,
    selectedClusterId,
    selectedClusterName,
  );

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let currentToolUseId: string | null = null;
      let currentToolName: string | null = null;
      let currentToolInputJson = "";
      const anthropicMessages = toAnthropicMessages(messages);

      try {
        const response = await fetch(ANTHROPIC_API_URL, {
          method: "POST",
          headers: getAnthropicHeaders(),
          body: JSON.stringify({
            model: ANTHROPIC_MODEL,
            max_tokens: 4096,
            stream: true,
            cache_control: { type: "ephemeral" },
            system,
            tools: nucleusTools,
            messages: anthropicMessages,
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

            const event = JSON.parse(payload) as AnthropicStreamEvent;

            switch (event.type) {
              case "content_block_start": {
                if (event.content_block?.type === "tool_use") {
                  currentToolUseId = event.content_block.id ?? null;
                  currentToolName = event.content_block.name ?? null;
                  currentToolInputJson = "";
                }
                break;
              }
              case "content_block_delta": {
                if (
                  event.delta?.type === "text_delta" &&
                  event.delta.text
                ) {
                  enqueue(controller, encoder, {
                    type: "text",
                    value: event.delta.text,
                  });
                } else if (
                  event.delta?.type === "input_json_delta" &&
                  event.delta.partial_json
                ) {
                  currentToolInputJson += event.delta.partial_json;
                }
                break;
              }
              case "content_block_stop": {
                if (currentToolName && currentToolUseId) {
                  let toolInput: Record<string, unknown> = {};
                  try {
                    toolInput = JSON.parse(
                      currentToolInputJson || "{}",
                    ) as Record<string, unknown>;
                  } catch {
                    toolInput = {};
                  }

                  const resultString = await executeToolCall(
                    currentToolName,
                    toolInput,
                    gate.userId,
                  );

                  let toolResult: unknown;
                  try {
                    toolResult = JSON.parse(resultString);
                  } catch {
                    toolResult = { error: "Invalid tool result" };
                  }

                  enqueue(controller, encoder, {
                    type: "tool_result",
                    value: toolResult,
                  });

                  anthropicMessages.push({
                    role: "assistant",
                    content: [
                      {
                        type: "tool_use",
                        id: currentToolUseId,
                        name: currentToolName,
                        input: toolInput,
                      },
                    ],
                  });
                  anthropicMessages.push({
                    role: "user",
                    content: [
                      {
                        type: "tool_result",
                        tool_use_id: currentToolUseId,
                        content: resultString,
                      },
                    ],
                  });

                  const continuationText = await callAnthropicContinuation(
                    system,
                    anthropicMessages,
                  );

                  if (continuationText) {
                    enqueue(controller, encoder, {
                      type: "text",
                      value: continuationText,
                    });
                  }

                  currentToolUseId = null;
                  currentToolName = null;
                  currentToolInputJson = "";
                }
                break;
              }
              case "message_stop": {
                enqueue(controller, encoder, { type: "done" });
                controller.close();
                return;
              }
            }
          }
        }

        enqueue(controller, encoder, { type: "done" });
        controller.close();
      } catch (err) {
        console.error("AI chat stream error:", err);
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred";
        enqueue(controller, encoder, {
          type: "text",
          value: `\n\nError: ${message}`,
        });
        enqueue(controller, encoder, { type: "done" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
