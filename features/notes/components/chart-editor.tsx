"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { parseAiApiError, UPGRADE_TOAST } from "@/lib/ai/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ChartResult, ChartType } from "@/lib/ai/generate-chart";

const CHART_TYPES: ChartType[] = ["bar", "line", "pie", "area"];

const EMPTY_CHART: ChartResult = {
  chartType: "bar",
  title: "",
  data: [],
  xKey: "",
  series: [],
};

function parseChartContent(content: string): ChartResult {
  if (!content.trim()) return EMPTY_CHART;
  try {
    return JSON.parse(content) as ChartResult;
  } catch {
    return EMPTY_CHART;
  }
}

const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: "#0f0f17",
    border: "1px solid #ffffff15",
    borderRadius: "8px",
    color: "#fff",
  },
  labelStyle: { color: "#fff" },
};

type ChartEditorProps = {
  content: string;
  onChange: (content: string) => void;
  canGenerate?: boolean;
};

export default function ChartEditor({
  content,
  onChange,
  canGenerate = true,
}: ChartEditorProps) {
  const initial = useMemo(() => parseChartContent(content), [content]);
  const [chart, setChart] = useState<ChartResult>(initial);
  const [prompt, setPrompt] = useState("");
  const [chartType, setChartType] = useState<ChartType>(
    (initial.chartType as ChartType) || "bar",
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const hasChart = chart.data.length > 0 && chart.series.length > 0;

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error("Enter a prompt describing your chart");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          chartType,
          existing: hasChart ? chart : undefined,
        }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        if (parseAiApiError(res.status, data) === "upgrade_required") {
          toast.error(UPGRADE_TOAST);
        } else {
          toast.error(data.error ?? "Failed to generate chart");
        }
        return;
      }

      const result = data as unknown as ChartResult;
      setChart(result);
      onChange(JSON.stringify(result));
      toast.success(hasChart ? "Chart updated" : "Chart created");
    } catch {
      toast.error("Failed to generate chart");
    } finally {
      setIsGenerating(false);
    }
  }, [chart, chartType, hasChart, onChange, prompt]);

  const resolvedType = (chart.chartType as ChartType) || chartType;

  return (
    <div className="flex flex-col gap-6 h-full">
      {!canGenerate ? (
        <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-white/80 shrink-0">
          Upgrade to Pro to generate new charts.
        </div>
      ) : (
        <div className="space-y-3 shrink-0">
          <div className="space-y-2">
            <Label className="text-white/70">
              {hasChart ? "Describe changes" : "Describe your chart"}
            </Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                hasChart
                  ? "e.g. Add June with 45 hours, or change the title to Weekly Study Time"
                  : "e.g. Monthly study hours for the past 6 months"
              }
              className="min-h-[80px] border-[#ffffff10] bg-card text-white placeholder:text-muted-foreground resize-none"
            />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label className="text-white/70">Chart type</Label>
              <Select
                value={chartType}
                onValueChange={(v) => setChartType(v as ChartType)}
              >
                <SelectTrigger className="w-[140px] border-[#ffffff10] bg-card text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#ffffff10] bg-card text-white">
                  {CHART_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={isGenerating}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {hasChart ? "Apply" : "Generate"}
            </Button>
          </div>
        </div>
      )}

      {hasChart ? (
        <div className="flex-1 min-h-0 rounded-xl border border-[#ffffff10] bg-card p-4">
          {chart.title ? (
            <h3 className="text-sm font-medium text-white mb-4">{chart.title}</h3>
          ) : null}
          <ResponsiveContainer width="100%" height={320}>
            {resolvedType === "pie" ? (
              <PieChart>
                <Tooltip {...chartTooltipStyle} />
                <Legend wrapperStyle={{ color: "#fff" }} />
                <Pie
                  data={chart.data}
                  dataKey={chart.series[0]?.key}
                  nameKey={chart.xKey}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: "#ffffff50" }}
                >
                  {chart.data.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        chart.series[i % chart.series.length]?.color ??
                        "#7c5cfc"
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            ) : resolvedType === "line" ? (
              <LineChart data={chart.data}>
                <CartesianGrid stroke="#ffffff15" />
                <XAxis
                  dataKey={chart.xKey}
                  tick={{ fill: "#fff", fontSize: 12 }}
                  axisLine={{ stroke: "#ffffff15" }}
                  tickLine={{ stroke: "#ffffff15" }}
                />
                <YAxis
                  tick={{ fill: "#fff", fontSize: 12 }}
                  axisLine={{ stroke: "#ffffff15" }}
                  tickLine={{ stroke: "#ffffff15" }}
                />
                <Tooltip {...chartTooltipStyle} />
                <Legend wrapperStyle={{ color: "#fff" }} />
                {chart.series.map((s) => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.name}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={{ fill: s.color }}
                  />
                ))}
              </LineChart>
            ) : resolvedType === "area" ? (
              <AreaChart data={chart.data}>
                <CartesianGrid stroke="#ffffff15" />
                <XAxis
                  dataKey={chart.xKey}
                  tick={{ fill: "#fff", fontSize: 12 }}
                  axisLine={{ stroke: "#ffffff15" }}
                  tickLine={{ stroke: "#ffffff15" }}
                />
                <YAxis
                  tick={{ fill: "#fff", fontSize: 12 }}
                  axisLine={{ stroke: "#ffffff15" }}
                  tickLine={{ stroke: "#ffffff15" }}
                />
                <Tooltip {...chartTooltipStyle} />
                <Legend wrapperStyle={{ color: "#fff" }} />
                {chart.series.map((s) => (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.name}
                    stroke={s.color}
                    fill={s.color}
                    fillOpacity={0.25}
                  />
                ))}
              </AreaChart>
            ) : (
              <BarChart data={chart.data}>
                <CartesianGrid stroke="#ffffff15" />
                <XAxis
                  dataKey={chart.xKey}
                  tick={{ fill: "#fff", fontSize: 12 }}
                  axisLine={{ stroke: "#ffffff15" }}
                  tickLine={{ stroke: "#ffffff15" }}
                />
                <YAxis
                  tick={{ fill: "#fff", fontSize: 12 }}
                  axisLine={{ stroke: "#ffffff15" }}
                  tickLine={{ stroke: "#ffffff15" }}
                />
                <Tooltip {...chartTooltipStyle} />
                <Legend wrapperStyle={{ color: "#fff" }} />
                {chart.series.map((s) => (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={s.name}
                    fill={s.color}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-[#ffffff10] bg-card/50 p-8">
          <p className="text-sm text-muted-foreground text-center">
            {hasChart
              ? "Describe changes above and click Apply to update the chart."
              : "Describe a chart and click Generate to visualize your data."}
          </p>
        </div>
      )}
    </div>
  );
}
