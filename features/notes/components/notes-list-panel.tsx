import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NoteListSection } from "@/features/notes/components/note-list-section";
import type { Cluster } from "@/features/clusters/types";
import type { Note } from "@/features/notes/types";
import { cn } from "@/lib/utils";

type NotesListPanelProps = {
  notes: Note[];
  generalNotes: Note[];
  clustersWithNotes: Cluster[];
  activeNoteId: string | null;
  collapsedIds: Set<string>;
  isCreating: boolean;
  className?: string;
  showBorder?: boolean;
  onCreateClick: () => void;
  onToggleSectionCollapsed: (sectionId: string) => void;
  onSelectNote: (note: Note) => void;
  onDeleteRequest: (note: Note) => void;
  getClusterNotes: (clusterId: string) => Note[];
};

export function NotesListPanel({
  notes,
  generalNotes,
  clustersWithNotes,
  activeNoteId,
  collapsedIds,
  isCreating,
  className,
  showBorder = true,
  onCreateClick,
  onToggleSectionCollapsed,
  onSelectNote,
  onDeleteRequest,
  getClusterNotes,
}: NotesListPanelProps) {
  return (
    <div
      className={cn(
        "@container/note-list flex flex-col h-full min-w-0 bg-[#0f0f17]",
        showBorder && "border-r border-[#ffffff10]",
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#ffffff10] shrink-0">
        <h1 className="text-base font-semibold text-white">Notes</h1>
        <Button
          type="button"
          size="sm"
          onClick={onCreateClick}
          disabled={isCreating}
          className="h-8 bg-[#7c5cfc] hover:bg-[#6b4ce8] text-white shadow-[0_0_20px_-6px_rgba(124,92,252,0.6)]"
        >
          <Plus className="h-3.5 w-3.5 mr-1" aria-hidden />
          New
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0 [&>[data-radix-scroll-area-viewport]>div]:!block [&>[data-radix-scroll-area-viewport]>div]:min-w-0">
        <TooltipProvider delayDuration={300}>
          <div className="p-3 space-y-4 min-w-0">
            {notes.length === 0 ? (
              <div className="flex items-center justify-center px-3 py-16 text-center">
                <p className="text-sm text-white/40">
                  No notes yet. Create your first note.
                </p>
              </div>
            ) : (
              <>
                <NoteListSection
                  sectionId="general"
                  title="General"
                  count={generalNotes.length}
                  emptyMessage="No general notes yet."
                  notes={generalNotes}
                  activeNoteId={activeNoteId}
                  isCollapsed={collapsedIds.has("general")}
                  onToggleCollapsed={() => onToggleSectionCollapsed("general")}
                  onSelect={onSelectNote}
                  onDeleteRequest={onDeleteRequest}
                />
                {clustersWithNotes.map((cluster) => {
                  const clusterNotes = getClusterNotes(cluster.id);

                  return (
                    <NoteListSection
                      key={cluster.id}
                      sectionId={cluster.id}
                      title={cluster.name}
                      count={clusterNotes.length}
                      dotColor={cluster.color}
                      emptyMessage="No notes in this cluster."
                      notes={clusterNotes}
                      activeNoteId={activeNoteId}
                      isCollapsed={collapsedIds.has(cluster.id)}
                      onToggleCollapsed={() =>
                        onToggleSectionCollapsed(cluster.id)
                      }
                      onSelect={onSelectNote}
                      onDeleteRequest={onDeleteRequest}
                    />
                  );
                })}
              </>
            )}
          </div>
        </TooltipProvider>
      </ScrollArea>
    </div>
  );
}
