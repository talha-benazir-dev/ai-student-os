import { ChevronRight } from "lucide-react";
import { NoteListItem } from "@/features/notes/components/note-list-item";
import type { Note } from "@/features/notes/types";
import { cn } from "@/lib/utils";

function SectionCountBadge({ count }: { count: number }) {
  return (
    <span className="text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded-full bg-white/10 text-muted-foreground shrink-0">
      {count}
    </span>
  );
}

type NoteListSectionProps = {
  sectionId: string;
  title: string;
  count: number;
  dotColor?: string;
  emptyMessage: string;
  notes: Note[];
  activeNoteId: string | null;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  onSelect: (note: Note) => void;
  onDeleteRequest: (note: Note) => void;
};

export function NoteListSection({
  title,
  count,
  dotColor,
  emptyMessage,
  notes,
  activeNoteId,
  isCollapsed,
  onToggleCollapsed,
  onSelect,
  onDeleteRequest,
}: NoteListSectionProps) {
  return (
    <section className="space-y-1" aria-label={title}>
      <button
        type="button"
        onClick={onToggleCollapsed}
        className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 min-w-0 text-left transition-colors hover:bg-white/[0.03]"
        aria-expanded={!isCollapsed}
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
            !isCollapsed && "rotate-90",
          )}
          aria-hidden
        />
        {dotColor ? (
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: dotColor }}
            aria-hidden
          />
        ) : null}
        <h2 className="text-xs font-medium text-muted-foreground truncate min-w-0 flex-1">
          {title}
        </h2>
        <SectionCountBadge count={count} />
      </button>
      {!isCollapsed ? (
        notes.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div role="list" className="space-y-1">
            {notes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                isActive={note.id === activeNoteId}
                onSelect={onSelect}
                onDeleteRequest={onDeleteRequest}
              />
            ))}
          </div>
        )
      ) : null}
    </section>
  );
}
