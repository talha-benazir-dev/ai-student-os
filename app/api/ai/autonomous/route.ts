import { executeToolCall } from "@/lib/ai/execute-tool";
import { requirePro } from "@/lib/ai/require-pro";
import { nucleusTools } from "@/features/ai/tools/index";
import { buildAutonomousPrompt } from "@/features/ai/prompts/index";
import type { DrawerContext } from "@/providers/ai-drawer-provider";
import type { Profile } from "@/features/ai/types";

const ANTHROPIC_MODEL = "claude-sonnet-4-6";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

type RequestBody = {
  context: DrawerContext;
  answers: Record<string, string>;
  profile: Profile;
  clusters: { id: string; name: string; color: string }[];
};

type AnthropicMessage = {
  role: "user" | "assistant";
  content: string | AnthropicContentBlock[];
};

type AnthropicContentBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string };

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

  const { context, answers, profile, clusters } = body;

  const system = buildAutonomousPrompt(context, answers, profile, clusters);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const anthropicMessages: AnthropicMessage[] = [
        {
          role: "user",
          content:
            "Execute the full autonomous workflow now. Call all required tools immediately — do not describe what you will do, just do it.",
        },
      ];

      try {
        // Agentic loop — keep calling until no more tool calls
        let iterations = 0;
        const MAX_ITERATIONS = 15;

        while (iterations < MAX_ITERATIONS) {
          iterations++;

          const response = await fetch(ANTHROPIC_API_URL, {
            method: "POST",
            headers: getAnthropicHeaders(),
            body: JSON.stringify({
              model: ANTHROPIC_MODEL,
              max_tokens: 8096,
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
            content: Array<{
              type: string;
              text?: string;
              id?: string;
              name?: string;
              input?: Record<string, unknown>;
            }>;
          };

          // Stream any text blocks to the client immediately
          for (const block of data.content) {
            if (block.type === "text" && block.text) {
              enqueue(controller, encoder, { type: "text", value: block.text });
            }
          }

          // If no tool calls — we're done
          if (data.stop_reason === "end_turn") {
            break;
          }

          // Collect all tool_use blocks
          const toolUseBlocks = data.content.filter((b) => b.type === "tool_use");

          if (toolUseBlocks.length === 0) {
            break;
          }

          // Add assistant message with all content blocks
          anthropicMessages.push({
            role: "assistant",
            content: data.content as AnthropicContentBlock[],
          });

          // Execute all tool calls and collect results
          const toolResults: AnthropicContentBlock[] = [];

          for (const toolBlock of toolUseBlocks) {
            if (!toolBlock.id || !toolBlock.name) continue;

            const resultString = await executeToolCall(
              toolBlock.name,
              toolBlock.input ?? {},
              gate.userId,
            );

            let toolResult: unknown;
            try {
              toolResult = JSON.parse(resultString);
            } catch {
              toolResult = { raw: resultString };
            }

            // Only enqueue tool_result for write operations (not reads)
            const isWriteOp = toolBlock.name.startsWith("create_");
            if (isWriteOp) {
              enqueue(controller, encoder, {
                type: "tool_result",
                value: toolResult,
              });
            }

            toolResults.push({
              type: "tool_result",
              tool_use_id: toolBlock.id,
              content: resultString,
            });
          }

          // Add all tool results as one user message
          anthropicMessages.push({
            role: "user",
            content: toolResults,
          });
        }

        enqueue(controller, encoder, { type: "done" });
        controller.close();
      } catch (err) {
        console.error("AI autonomous stream error:", err);
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
