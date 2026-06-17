import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  FileCode,
  FileText,
  PenLine,
  Share2,
} from "lucide-react";
import type { NoteType } from "@/features/notes/types";

export type NoteTypeMeta = {
  label: string;
  icon: LucideIcon;
  className: string;
};

export const NOTE_TYPE_META: Record<NoteType, NoteTypeMeta> = {
  text: {
    label: "Text",
    icon: FileText,
    className: "bg-blue-500/15 text-blue-400",
  },
  readme: {
    label: "MD",
    icon: FileCode,
    className: "bg-green-500/15 text-green-400",
  },
  canvas: {
    label: "Canvas",
    icon: PenLine,
    className: "bg-purple-500/15 text-purple-400",
  },
  chart: {
    label: "Chart",
    icon: BarChart3,
    className: "bg-violet-500/15 text-violet-400",
  },
  diagram: {
    label: "Diagram",
    icon: Share2,
    className: "bg-violet-500/15 text-violet-400",
  },
};

export function resolveNoteType(type?: NoteType): NoteType {
  return type ?? "text";
}
