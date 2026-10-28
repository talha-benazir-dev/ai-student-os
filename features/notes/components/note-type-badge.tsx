import {
  NOTE_TYPE_META,
  resolveNoteType,
} from "@/features/notes/constants/note-type-meta";
import type { NoteType } from "@/features/notes/types";
import { cn } from "@/lib/utils";

type NoteTypeBadgeProps = {
  type?: NoteType;
  className?: string;
};

export function NoteTypeBadge({ type, className }: NoteTypeBadgeProps) {
  const resolved = resolveNoteType(type);
  const meta = NOTE_TYPE_META[resolved];
  const Icon = meta.icon;

  return (
    <span
      title={meta.label}
      aria-label={`Note type: ${meta.label}`}
      className={cn(
        "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-sm px-1.5 text-[10px] font-medium",
        "bg-white/[.035] text-muted-foreground",
        className,
      )}
    >
      <Icon className="h-3 w-3 @[280px]/note-list:hidden" aria-hidden />
      <span className="hidden @[280px]/note-list:inline">{meta.label}</span>
    </span>
  );
}
