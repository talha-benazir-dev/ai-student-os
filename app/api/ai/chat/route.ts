import { createClient } from "@/lib/supabase/server";
import { nucleusTools } from "@/features/ai/tools/index";
import { buildSystemPrompt } from "@/features/ai/prompts/index";
import type { AutonomyLevel, Profile } from "@/features/ai/types";

const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

type RequestBody = {
  messages: { role: "user" | "assistant"; content: string }[];
  autonomy: AutonomyLevel;
  selectedClusterId: string | null;
  selectedClusterName: string | null;
  curriculumMode: boolean;
  profile: Profile;
};

type AnthropicMessage = {
  role: "user" | "assistant";
  content: string | AnthropicContentBlock[];
};

type AnthropicContentBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string };

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

async function executeToolCall(
  toolName: string,
  toolInput: Record<string, unknown>,
  userId: string,
): Promise<string> {
  const supabase = await createClient();

  switch (toolName) {
    case "get_clusters": {
      const { data, error } = await supabase
        .from("clusters")
        .select("id, name, color")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify(data);
    }
    case "get_notes": {
      let query = supabase
        .from("notes")
        .select("id, title, type, cluster_id")
        .eq("user_id", userId);
      if (toolInput.cluster_id) {
        query = query.eq("cluster_id", toolInput.cluster_id as string);
      }
      const { data, error } = await query;
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify(data);
    }
    case "get_tasks": {
      let query = supabase
        .from("tasks")
        .select("id, title, completed, priority, cluster_id")
        .eq("user_id", userId);
      if (toolInput.cluster_id) {
        query = query.eq("cluster_id", toolInput.cluster_id as string);
      }
      const { data, error } = await query;
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify(data);
    }
    case "get_flashcards": {
      let query = supabase
        .from("flashcards")
        .select("id, front, back, difficulty, cluster_id")
        .eq("user_id", userId);
      if (toolInput.cluster_id) {
        query = query.eq("cluster_id", toolInput.cluster_id as string);
      }
      const { data, error } = await query;
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify(data);
    }
    case "create_cluster": {
      const { error } = await supabase.from("clusters").insert({
        user_id: userId,
        name: toolInput.name as string,
        color: toolInput.color as string,
      });
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify({
        type: "create_cluster",
        title: toolInput.name,
        subtitle: toolInput.color,
      });
    }
    case "create_note": {
      const { error } = await supabase.from("notes").insert({
        user_id: userId,
        title: toolInput.title as string,
        content: toolInput.content as string,
        type: toolInput.type as string,
        cluster_id: (toolInput.cluster_id as string | undefined) ?? null,
      });
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify({
        type: "create_note",
        title: toolInput.title,
        subtitle: toolInput.type,
        clusterName: null,
      });
    }
    case "create_task": {
      const { error } = await supabase.from("tasks").insert({
        user_id: userId,
        title: toolInput.title as string,
        completed: false,
        priority: toolInput.priority as string,
        due_date: (toolInput.due_date as string | undefined) ?? null,
        reward: (toolInput.reward as string | undefined) ?? "",
        importance_points: (toolInput.importance_points as number | undefined) ?? 10,
        cluster_id: (toolInput.cluster_id as string | undefined) ?? null,
      });
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify({
        type: "create_task",
        title: toolInput.title,
        subtitle: toolInput.priority,
      });
    }
    case "create_flashcard": {
      const today = new Date().toISOString().split("T")[0];
      const { error } = await supabase.from("flashcards").insert({
        user_id: userId,
        front: toolInput.front as string,
        back: toolInput.back as string,
        difficulty: toolInput.difficulty as string,
        cluster_id: (toolInput.cluster_id as string | undefined) ?? null,
        next_review: today,
        interval_days: 1,
        repetitions: 0,
      });
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify({
        type: "create_flashcard",
        title: toolInput.front,
        subtitle: toolInput.back,
      });
    }
    case "create_flashcard_set": {
      const cards = toolInput.cards as {
        front: string;
        back: string;
        difficulty: string;
      }[];
      const cluster_id = (toolInput.cluster_id as string | undefined) ?? null;
      const today = new Date().toISOString().split("T")[0];

      for (const card of cards) {
        const { error } = await supabase.from("flashcards").insert({
          user_id: userId,
          front: card.front,
          back: card.back,
          difficulty: card.difficulty,
          cluster_id,
          next_review: today,
          interval_days: 1,
          repetitions: 0,
        });
        if (error) return JSON.stringify({ error: error.message });
      }

      return JSON.stringify({
        type: "create_flashcard_set",
        title: `${cards.length} flashcards created`,
        subtitle: toolInput.cluster_id ? "Added to cluster" : "General",
      });
    }
    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}

function getAnthropicHeaders(): HeadersInit {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
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
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

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
      const anthropicMessages: AnthropicMessage[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const response = await fetch(ANTHROPIC_API_URL, {
          method: "POST",
          headers: getAnthropicHeaders(),
          body: JSON.stringify({
            model: ANTHROPIC_MODEL,
            max_tokens: 4096,
            stream: true,
            system,
            tools: nucleusTools,
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
                    user.id,
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
