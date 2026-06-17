"use client";

import { memo } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoteTypeBadge } from "@/features/notes/components/note-type-badge";
import { TruncatedText } from "@/features/notes/components/truncated-text";
import type { Note } from "@/features/notes/types";
import {
  displayTitle,
  formatRelativeTime,
} from "@/features/notes/utils/note-display";
import { cn } from "@/lib/utils";

type NoteListItemProps = {
  note: Note;
  isActive: boolean;
  onSelect: (note: Note) => void;
  onDeleteRequest: (note: Note) => void;
};

export const NoteListItem = memo(function NoteListItem({
  note,
  isActive,
  onSelect,
  onDeleteRequest,
}: NoteListItemProps) {
  const title = displayTitle(note.title);

  return (
    <div
      role="listitem"
      className={cn(
        "group grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 rounded-lg border border-transparent px-3 h-[64px] transition-all",
        isActive
          ? "bg-[#16161f] border-l-2 border-l-[#7c5cfc] border-[#ffffff10] shadow-[0_0_24px_-8px_rgba(124,92,252,0.35)] pl-[10px]"
          : "hover:bg-[#14141c] border-l-2 border-l-transparent",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(note)}
        className="min-w-0 flex h-full flex-col justify-center text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cfc]/50 rounded-lg"
      >
        <TruncatedText
          text={title}
          className="text-sm font-medium text-white/90"
        />
        <p className="mt-1 truncate text-[11px] text-white/40">
          {formatRelativeTime(note.updated_at)}
        </p>
      </button>

      <NoteTypeBadge type={note.type} />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteRequest(note);
        }}
        aria-label={`Delete ${title}`}
        className={cn(
          "h-8 w-8 shrink-0 self-center text-white/35 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200",
          "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 focus-visible:opacity-100 cursor-pointer",
          isActive && "sm:opacity-100",
        )}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
});
