import {
  toAnthropicMessages,
  type AnthropicMessage,
} from "@/lib/ai/format-messages";
import {
  ANTHROPIC_HAIKU_MODEL,
  ANTHROPIC_SONNET_MODEL,
} from "@/lib/ai/anthropic";
import { requirePro } from "@/lib/ai/require-pro";
import {
  runAgentLoop,
  runTextOnlyChat,
  type AgentStreamEvent,
} from "@/lib/ai/run-agent-loop";
import { buildSystemPrompt } from "@/features/ai/prompts/index";
import type {
  AutonomyLevel,
  ChatAttachment,
  Profile,
} from "@/features/ai/types";

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

function enqueue(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  event: Record<string, unknown>,
) {
  controller.enqueue(
    encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
  );
}

function createStreamHandler(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
) {
  return (event: AgentStreamEvent) => {
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
}

async function runChatForAutonomy(
  autonomy: AutonomyLevel,
  system: string,
  anthropicMessages: AnthropicMessage[],
  userId: string,
  onEvent: (event: AgentStreamEvent) => void,
) {
  switch (autonomy) {
    case "manual":
      await runTextOnlyChat({
        system,
        messages: anthropicMessages,
        model: ANTHROPIC_HAIKU_MODEL,
        onEvent,
      });
      break;

    case "assisted":
      await runAgentLoop({
        system,
        messages: anthropicMessages,
        userId,
        model: ANTHROPIC_HAIKU_MODEL,
        maxIterations: 5,
        maxTotalWriteOps: 1,
        onEvent,
      });
      break;

    case "autonomous":
      await runAgentLoop({
        system,
        messages: anthropicMessages,
        userId,
        model: ANTHROPIC_SONNET_MODEL,
        maxIterations: 15,
        onEvent,
      });
      break;
  }
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
    autonomy = "assisted",
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
    autonomy,
  );

  const encoder = new TextEncoder();
  const anthropicMessages = toAnthropicMessages(messages);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const onEvent = createStreamHandler(controller, encoder);

      try {
        await runChatForAutonomy(
          autonomy,
          system,
          anthropicMessages,
          gate.userId,
          onEvent,
        );
      } catch (err) {
        console.error("[ai/chat] stream error:", err);
        onEvent({
          type: "error",
          value: "Something went wrong. Please try again.",
        });
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
