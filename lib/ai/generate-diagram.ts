import { callAnthropicJson, stripMarkdownFences } from "@/lib/ai/anthropic";

export type DiagramType = "flowchart" | "mindmap";

export type DiagramNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  shape: "rect" | "circle" | "diamond";
  nodeType?: string;
};

export type DiagramEdge = {
  from: string;
  to: string;
  label?: string;
};

export type DiagramResult = {
  diagramType: string;
  title: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
};

const DIAGRAM_SYSTEM_PROMPT = `You are a diagram layout generator. Return ONLY valid JSON with no markdown, no code fences, and no explanation.

The JSON must match this exact shape:
{
  "diagramType": string,
  "title": string,
  "nodes": { "id": string, "label": string, "x": number, "y": number, "shape": "rect" | "circle" | "diamond", "nodeType": string }[],
  "edges": { "from": string, "to": string, "label"?: string }[]
}

Rules:
- diagramType must be one of: flowchart, mindmap
- For flowcharts: use mostly "rect" shapes, layout top-to-bottom or left-to-right with clear spacing (at least 150px between node centers)
- For mind maps: central node at center (e.g. x:400, y:300), branch nodes radiating outward with "circle" or "rect" shapes
- Pre-calculate x,y positions so nodes are spread out and never stacked on top of each other
- Use a coordinate space roughly 800x600; keep all nodes within x:80-720, y:60-540
- Every edge "from" and "to" must reference valid node ids
- nodeType must be "default" for all nodes (used by React Flow)
- Return only the JSON object, nothing else

When editing an existing diagram (current diagram JSON is provided):
- Infer intent from the user's message: edit unless they clearly want a full replacement (e.g. "start over", "replace this", "make a new diagram about")
- Preserve unchanged nodes, edges, labels, and x/y positions where possible
- Apply only the requested changes; return the FULL updated diagram JSON, not a patch
- For new nodes, place them with clear spacing and avoid overlapping existing nodes
- Keep existing node ids stable when modifying nodes in place`;

function normalizeDiagram(result: DiagramResult): DiagramResult {
  return {
    ...result,
    nodes: result.nodes.map((node) => ({
      ...node,
      nodeType: node.nodeType ?? "default",
    })),
  };
}

export async function generateDiagram(
  prompt: string,
  diagramType: DiagramType,
  existing?: DiagramResult,
): Promise<DiagramResult> {
  const hasExisting = existing && existing.nodes.length > 0;
  const userPrompt = hasExisting
    ? `Current ${diagramType} diagram:\n${JSON.stringify(existing)}\n\nUser request: ${prompt}\n\nApply the request to the current diagram. Return the full updated JSON.`
    : `Create a ${diagramType} diagram for: ${prompt}`;

  const raw = await callAnthropicJson(DIAGRAM_SYSTEM_PROMPT, userPrompt);
  const cleaned = stripMarkdownFences(raw);

  try {
    const parsed = JSON.parse(cleaned) as DiagramResult;
    return normalizeDiagram(parsed);
  } catch {
    throw new Error("Failed to parse diagram JSON from model response");
  }
}
