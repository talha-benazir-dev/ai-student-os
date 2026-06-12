import { callAnthropicJson, stripMarkdownFences } from "@/lib/ai/anthropic";

export type ChartType = "bar" | "line" | "pie" | "area";

export type ChartSeries = {
  key: string;
  color: string;
  name: string;
};

export type ChartResult = {
  chartType: string;
  title: string;
  data: Record<string, unknown>[];
  xKey: string;
  series: ChartSeries[];
};

const CHART_SYSTEM_PROMPT = `You are a chart data generator. Return ONLY valid JSON with no markdown, no code fences, and no explanation.

The JSON must match this exact shape:
{
  "chartType": string,
  "title": string,
  "data": Record<string, any>[],
  "xKey": string,
  "series": { "key": string, "color": string, "name": string }[]
}

Rules:
- chartType must be one of: bar, line, pie, area
- Use violet-adjacent series colors from this palette: #7c5cfc, #3b82f6, #10b981, #f59e0b (cycle through them for multiple series)
- data must be an array of objects with consistent keys
- xKey must be a key present in every data object (category/label axis)
- series[].key must match numeric value keys in the data objects
- For pie charts, use a single series and data with one row per slice
- Generate realistic, meaningful sample data based on the user's prompt
- Return only the JSON object, nothing else`;

const SERIES_COLORS = ["#7c5cfc", "#3b82f6", "#10b981", "#f59e0b"];

function normalizeSeries(series: ChartSeries[]): ChartSeries[] {
  return series.map((s, i) => ({
    ...s,
    color: SERIES_COLORS[i % SERIES_COLORS.length],
  }));
}

export async function generateChart(
  prompt: string,
  chartType: ChartType,
): Promise<ChartResult> {
  const userPrompt = `Create a ${chartType} chart for: ${prompt}`;

  const raw = await callAnthropicJson(CHART_SYSTEM_PROMPT, userPrompt);
  const cleaned = stripMarkdownFences(raw);

  let parsed: ChartResult;
  try {
    parsed = JSON.parse(cleaned) as ChartResult;
  } catch {
    throw new Error("Failed to parse chart JSON from model response");
  }

  return {
    ...parsed,
    chartType: parsed.chartType ?? chartType,
    series: normalizeSeries(parsed.series ?? []),
  };
}
