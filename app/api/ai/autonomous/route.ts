import { requirePro } from "@/lib/ai/require-pro";
import { ANTHROPIC_SONNET_MODEL } from "@/lib/ai/anthropic";
import {
  runAgentLoop,
  type AgentStreamEvent,
} from "@/lib/ai/run-agent-loop";
import { buildAutonomousPrompt } from "@/features/ai/prompts/index";
import type { DrawerContext } from "@/providers/ai-drawer-provider";
import type { Profile } from "@/features/ai/types";

type RequestBody = {
  context: DrawerContext;
  answers: Record<string, string>;
  profile: Profile;
  clusters: { id: string; name: string; color: string }[];
};

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
      const onEvent = (event: AgentStreamEvent) => {
        switch (event.type) {
          case "text":
            enqueue(controller, encoder, { type: "text", value: event.value });
            break;
          case "tool_result":
            enqueue(controller, encoder, {
              type: "tool_result",
              value: event.value,
            });
            break;
          case "done":
            enqueue(controller, encoder, { type: "done" });
            controller.close();
            break;
          case "error":
            enqueue(controller, encoder, {
              type: "text",
              value: `\n\nError: ${event.value}`,
            });
            enqueue(controller, encoder, { type: "done" });
            controller.close();
            break;
        }
      };

      try {
        await runAgentLoop({
          system,
          messages: [
            {
              role: "user",
              content:
                "Execute the full autonomous workflow now. Call all required tools immediately — do not describe what you will do, just do it.",
            },
          ],
          userId: gate.userId,
          model: ANTHROPIC_SONNET_MODEL,
          maxIterations: 15,
          onEvent,
        });
      } catch (err) {
        console.error("AI autonomous stream error:", err);
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred";
        onEvent({ type: "error", value: message });
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
