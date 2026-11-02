import { createClient } from "@/lib/supabase/server";
import { createNote } from "@/features/notes/actions/notes.actions";
import { generateChart, type ChartType } from "@/lib/ai/generate-chart";
import { generateDiagram, type DiagramType } from "@/lib/ai/generate-diagram";
import {
  MAX_FLASHCARDS_PER_SET,
  normalizeFlashcardSetInput,
} from "@/lib/ai/normalize-flashcard-set";

export async function executeToolCall(
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
    case "create_chart_note": {
      try {
        const result = await generateChart(
          toolInput.prompt as string,
          toolInput.chartType as ChartType,
        );
        const cluster_id =
          (toolInput.cluster_id as string | undefined) ?? null;

        const { error } = await createNote({
          title: toolInput.title as string,
          type: "chart",
          content: JSON.stringify(result),
          cluster_id,
        });

        if (error) {
          return JSON.stringify({ error });
        }

        let clusterName: string | null = null;
        if (cluster_id) {
          const { data: cluster } = await supabase
            .from("clusters")
            .select("name")
            .eq("id", cluster_id)
            .single();
          clusterName = cluster?.name ?? null;
        }

        return JSON.stringify({
          type: "create_note",
          title: toolInput.title,
          clusterName,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to generate chart";
        return JSON.stringify({ error: message });
      }
    }
    case "create_diagram_note": {
      try {
        const result = await generateDiagram(
          toolInput.prompt as string,
          toolInput.diagramType as DiagramType,
        );
        const cluster_id =
          (toolInput.cluster_id as string | undefined) ?? null;

        const { error } = await createNote({
          title: toolInput.title as string,
          type: "diagram",
          content: JSON.stringify(result),
          cluster_id,
        });

        if (error) {
          return JSON.stringify({ error });
        }

        let clusterName: string | null = null;
        if (cluster_id) {
          const { data: cluster } = await supabase
            .from("clusters")
            .select("name")
            .eq("id", cluster_id)
            .single();
          clusterName = cluster?.name ?? null;
        }

        return JSON.stringify({
          type: "create_note",
          title: toolInput.title,
          clusterName,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to generate diagram";
        return JSON.stringify({ error: message });
      }
    }
    case "create_flashcard_set": {
      const normalized = normalizeFlashcardSetInput(toolInput.cards);
      if ("error" in normalized) {
        return JSON.stringify({ error: normalized.error });
      }

      const { cards, truncated } = normalized;
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

      const subtitle = truncated
        ? `Added to cluster (capped at ${MAX_FLASHCARDS_PER_SET} cards — call again for more)`
        : toolInput.cluster_id
          ? "Added to cluster"
          : "General";

      return JSON.stringify({
        type: "create_flashcard_set",
        title: `${cards.length} flashcards created`,
        subtitle,
      });
    }
    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}
