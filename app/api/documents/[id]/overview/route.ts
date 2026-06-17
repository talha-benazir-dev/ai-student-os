import { createClient } from "@/lib/supabase/server";
import { generateDocumentOverview } from "@/lib/ai/generate-document-overview";
import { requirePro } from "@/lib/ai/require-pro";

const MIN_RAW_TEXT_LENGTH = 20;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requirePro();
  if ("error" in gate) return gate.error;

  const { id } = await params;

  const supabase = await createClient();
  const { data: document, error: fetchError } = await supabase
    .from("documents")
    .select("id, title, raw_text, ai_summary")
    .eq("id", id)
    .eq("user_id", gate.userId)
    .single();

  if (fetchError || !document) {
    return Response.json({ error: "Document not found" }, { status: 404 });
  }

  if (document.ai_summary) {
    return Response.json({ overview: document.ai_summary });
  }

  const rawText = document.raw_text?.trim() ?? "";
  if (rawText.length < MIN_RAW_TEXT_LENGTH) {
    return Response.json({ error: "no_text" }, { status: 422 });
  }

  try {
    const overview = await generateDocumentOverview(document.title, rawText);

    const { error: updateError } = await supabase
      .from("documents")
      .update({ ai_summary: overview })
      .eq("id", id)
      .eq("user_id", gate.userId);

    if (updateError) {
      console.error("Failed to cache document overview:", updateError);
      return Response.json(
        { error: "Failed to save overview" },
        { status: 500 },
      );
    }

    return Response.json({ overview });
  } catch (err) {
    console.error("Document overview generation error:", err);
    return Response.json(
      { error: "Failed to generate overview" },
      { status: 500 },
    );
  }
}
