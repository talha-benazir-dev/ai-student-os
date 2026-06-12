import { generateChart, type ChartType } from "@/lib/ai/generate-chart";
import { requirePro } from "@/lib/ai/require-pro";

type RequestBody = {
  prompt: string;
  chartType: ChartType;
};

const VALID_CHART_TYPES: ChartType[] = ["bar", "line", "pie", "area"];

export async function POST(req: Request) {
  const gate = await requirePro();
  if ("error" in gate) return gate.error;

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { prompt, chartType } = body;

  if (!prompt?.trim()) {
    return Response.json({ error: "prompt is required" }, { status: 400 });
  }

  if (!VALID_CHART_TYPES.includes(chartType)) {
    return Response.json({ error: "Invalid chartType" }, { status: 400 });
  }

  try {
    const result = await generateChart(prompt.trim(), chartType);
    return Response.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate chart";
    return Response.json({ error: message }, { status: 500 });
  }
}
