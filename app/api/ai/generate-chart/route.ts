import { generateChart, type ChartResult, type ChartType } from "@/lib/ai/generate-chart";
import { requirePro } from "@/lib/ai/require-pro";

type RequestBody = {
  prompt: string;
  chartType: ChartType;
  existing?: ChartResult;
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

  const { prompt, chartType, existing } = body;

  if (!prompt?.trim()) {
    return Response.json({ error: "prompt is required" }, { status: 400 });
  }

  if (!VALID_CHART_TYPES.includes(chartType)) {
    return Response.json({ error: "Invalid chartType" }, { status: 400 });
  }

  try {
    const result = await generateChart(prompt.trim(), chartType, existing);
    return Response.json(result);
  } catch (err) {
    console.error("[generate-chart] error:", err);
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}
