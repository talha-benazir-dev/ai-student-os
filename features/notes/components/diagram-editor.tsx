"use client";

import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";
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
import type {
  DiagramResult,
  DiagramType,
} from "@/lib/ai/generate-diagram";

const DIAGRAM_TYPES: DiagramType[] = ["flowchart", "mindmap"];

const EMPTY_DIAGRAM: DiagramResult = {
  diagramType: "flowchart",
  title: "",
  nodes: [],
  edges: [],
};

const NODE_CLASSNAME =
  "bg-[#0f0f17] border border-[#7c5cfc] text-white text-sm rounded-lg px-3 py-2";

function parseDiagramContent(content: string): DiagramResult {
  if (!content.trim()) return EMPTY_DIAGRAM;
  try {
    return JSON.parse(content) as DiagramResult;
  } catch {
    return EMPTY_DIAGRAM;
  }
}

function toFlowNodes(diagram: DiagramResult): Node[] {
  return diagram.nodes.map((node) => ({
    id: node.id,
    position: { x: node.x, y: node.y },
    data: { label: node.label },
    type: node.nodeType ?? "default",
    className: NODE_CLASSNAME,
  }));
}

function toFlowEdges(diagram: DiagramResult): Edge[] {
  return diagram.edges.map((edge) => ({
    id: `${edge.from}-${edge.to}`,
    source: edge.from,
    target: edge.to,
    label: edge.label,
    style: { stroke: "#ffffff30" },
    labelStyle: { fill: "#ffffff80", fontSize: 10 },
  }));
}

type DiagramEditorProps = {
  content: string;
  onChange: (content: string) => void;
  canGenerate?: boolean;
};

export default function DiagramEditor({
  content,
  onChange,
  canGenerate = true,
}: DiagramEditorProps) {
  const initial = useMemo(() => parseDiagramContent(content), [content]);
  const [diagram, setDiagram] = useState<DiagramResult>(initial);
  const [prompt, setPrompt] = useState("");
  const [diagramType, setDiagramType] = useState<DiagramType>(
    (initial.diagramType as DiagramType) || "flowchart",
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const flowNodes = useMemo(() => toFlowNodes(diagram), [diagram]);
  const flowEdges = useMemo(() => toFlowEdges(diagram), [diagram]);
  const flowKey = useMemo(
    () => diagram.nodes.map((n) => n.id).join("-") || "empty",
    [diagram.nodes],
  );

  const hasDiagram = diagram.nodes.length > 0;

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error("Enter a prompt describing your diagram");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-diagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          diagramType,
          existing: hasDiagram ? diagram : undefined,
        }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        if (parseAiApiError(res.status, data) === "upgrade_required") {
          toast.error(UPGRADE_TOAST);
        } else {
          toast.error(data.error ?? "Failed to generate diagram");
        }
        return;
      }

      const result = data as unknown as DiagramResult;
      setDiagram(result);
      onChange(JSON.stringify(result));
      toast.success(hasDiagram ? "Diagram updated" : "Diagram created");
    } catch {
      toast.error("Failed to generate diagram");
    } finally {
      setIsGenerating(false);
    }
  }, [diagram, diagramType, hasDiagram, onChange, prompt]);

  return (
    <div className="flex flex-col gap-6 h-full">
      {!canGenerate ? (
        <div className="rounded-lg border border-[#7c5cfc]/30 bg-[#7c5cfc]/10 px-4 py-3 text-sm text-white/80 shrink-0">
          Upgrade to Pro to generate new diagrams.
        </div>
      ) : (
        <div className="space-y-3 shrink-0">
          <div className="space-y-2">
            <Label className="text-white/70">
              {hasDiagram ? "Describe changes" : "Describe your diagram"}
            </Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                hasDiagram
                  ? "e.g. Add a node for ATP synthesis, or rename Sunlight to Solar energy"
                  : "e.g. Photosynthesis process from sunlight to glucose"
              }
              className="min-h-[80px] border-[#ffffff10] bg-[#0f0f17] text-white placeholder:text-white/30 resize-none"
            />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label className="text-white/70">Diagram type</Label>
              <Select
                value={diagramType}
                onValueChange={(v) => setDiagramType(v as DiagramType)}
              >
                <SelectTrigger className="w-[140px] border-[#ffffff10] bg-[#0f0f17] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#ffffff10] bg-[#0f0f17] text-white">
                  {DIAGRAM_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t === "mindmap" ? "Mind map" : "Flowchart"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={isGenerating}
              className="bg-[#7c5cfc] hover:bg-[#6b4ce8] text-white"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {hasDiagram ? "Apply" : "Generate"}
            </Button>
          </div>
        </div>
      )}

      {hasDiagram ? (
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {diagram.title ? (
            <h3 className="text-sm font-medium text-white shrink-0">
              {diagram.title}
            </h3>
          ) : null}
          <div className="h-[480px] rounded-xl overflow-hidden border border-[#ffffff10] bg-[#0f0f17]">
            <ReactFlow
              key={flowKey}
              nodes={flowNodes}
              edges={flowEdges}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#ffffff10" />
              <Controls className="!bg-[#0f0f17] !border-[#ffffff10] !shadow-none [&>button]:!bg-[#0f0f17] [&>button]:!border-[#ffffff10] [&>button]:!text-white [&>button:hover]:!bg-[#16161f]" />
            </ReactFlow>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-[#ffffff10] bg-[#0f0f17]/50 p-8">
          <p className="text-sm text-white/40 text-center">
            {hasDiagram
              ? "Describe changes above and click Apply to update the diagram."
              : "Describe a diagram and click Generate to visualize it."}
          </p>
        </div>
      )}
    </div>
  );
}
