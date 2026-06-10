import {
  CheckSquare,
  FileText,
  FolderPlus,
  Layers,
  type LucideIcon,
} from "lucide-react";
import type { ToolResultCard as ToolResultCardData } from "@/features/ai/types";

const ICONS: Record<ToolResultCardData["type"], LucideIcon> = {
  create_note: FileText,
  create_task: CheckSquare,
  create_flashcard: Layers,
  create_flashcard_set: Layers,
  create_cluster: FolderPlus,
};

type ToolResultCardProps = {
  card: ToolResultCardData;
};

export function ToolResultCard({ card }: ToolResultCardProps) {
  const Icon = ICONS[card.type];

  return (
    <div className="mt-2 flex items-start gap-3 rounded-xl border border-[#ffffff10] bg-[#0f0f17] px-4 py-3">
      <div className="w-0.5 shrink-0 self-stretch rounded-full bg-[#7c5cfc]" />
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#7c5cfc]" strokeWidth={2} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white">{card.title}</p>
        {card.subtitle ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{card.subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
