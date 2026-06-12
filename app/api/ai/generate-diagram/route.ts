import { generateDiagram, type DiagramType } from "@/lib/ai/generate-diagram";
import { requirePro } from "@/lib/ai/require-pro";

type RequestBody = {
  prompt: string;
  diagramType: DiagramType;
};

const VALID_DIAGRAM_TYPES: DiagramType[] = ["flowchart", "mindmap"];

export async function POST(req: Request) {
  const gate = await requirePro();
  if ("error" in gate) return gate.error;

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { prompt, diagramType } = body;

  if (!prompt?.trim()) {
    return Response.json({ error: "prompt is required" }, { status: 400 });
  }

  if (!VALID_DIAGRAM_TYPES.includes(diagramType)) {
    return Response.json({ error: "Invalid diagramType" }, { status: 400 });
  }

  try {
    const result = await generateDiagram(prompt.trim(), diagramType);
    return Response.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate diagram";
    return Response.json({ error: message }, { status: 500 });
  }
}
