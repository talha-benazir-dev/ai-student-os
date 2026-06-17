"use client";

import dynamic from "next/dynamic";
import type {
  AppState,
  BinaryFiles,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  ChevronLeft,
  FileCode,
  FileText,
  PenLine,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NotesListPanel } from "@/features/notes/components/notes-list-panel";
import { ReadmeMarkdownPreview } from "@/features/notes/components/readme-markdown-preview";
import { ReadmeViewToggle } from "@/features/notes/components/readme-view-toggle";
import { useReadmeViewMode } from "@/features/notes/hooks/use-readme-view-mode";
import { useCollapsedNoteSections } from "@/features/notes/hooks/use-collapsed-note-sections";
import { useNotesSplitView } from "@/features/notes/hooks/use-notes-split-view";
import { displayTitle } from "@/features/notes/utils/note-display";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import type { Cluster } from "@/features/clusters/types";
import type { Note, NoteType } from "@/features/notes/types";
import {
  createNote,
  deleteNote,
  updateNote,
} from "@/features/notes/actions/notes.actions";
import { UPGRADE_TOAST } from "@/lib/ai/constants";
import { usePlan } from "@/providers/plan-provider";

const ExcalidrawEditor = dynamic(
  () => import("@/features/notes/components/excalidraw-editor"),
  { ssr: false },
);

const ChartEditor = dynamic(
  () => import("@/features/notes/components/chart-editor"),
  { ssr: false },
);

const DiagramEditor = dynamic(
  () => import("@/features/notes/components/diagram-editor"),
  { ssr: false },
);

const GENERAL_CLUSTER_VALUE = "__general__";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface NotesPageProps {
  initialNotes: Note[];
  initialClusters: Cluster[];
  autoOpenCreate?: boolean;
}

function normalizeNotes(notes: Note[]): Note[] {
  return notes.map((n) => ({
    ...n,
    type: n.type ?? "text",
    cluster_id: n.cluster_id ?? null,
  }));
}

function sortNotesByUpdated(notes: Note[]): Note[] {
  return [...notes].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
}

function formatCreatedDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function clusterSelectValue(clusterId: string | null): string {
  return clusterId ?? GENERAL_CLUSTER_VALUE;
}

function clusterIdFromSelectValue(value: string): string | null {
  return value === GENERAL_CLUSTER_VALUE ? null : value;
}

function NoteClusterSelect({
  value,
  clusters,
  onChange,
  className,
}: {
  value: string | null;
  clusters: Cluster[];
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <Select value={clusterSelectValue(value)} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "h-8 w-[140px] border-[#ffffff10] bg-transparent text-white text-xs shadow-none",
          className,
        )}
      >
        <SelectValue placeholder="General" />
      </SelectTrigger>
      <SelectContent className="border-[#ffffff10] bg-[#0f0f17] text-white">
        <SelectItem value={GENERAL_CLUSTER_VALUE}>General</SelectItem>
        {clusters.map((cluster) => (
          <SelectItem key={cluster.id} value={cluster.id}>
            <span className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: cluster.color }}
                aria-hidden
              />
              {cluster.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function EditorCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClose}
      aria-label="Close note"
      className="h-8 w-8 text-white/45 hover:text-white/90 hover:bg-white/10"
    >
      <X className="h-4 w-4" />
    </Button>
  );
}

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  const label =
    status === "saving"
      ? "Saving..."
      : status === "saved"
        ? "Saved"
        : status === "error"
          ? "Error saving"
          : null;

  if (!label) return null;

  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        status === "error" ? "text-red-400" : "text-white/40",
      )}
      role="status"
      aria-live="polite"
    >
      {label}
    </span>
  );
}

function useNoteAutoSave(note: Note, onSaved: (note: Note) => void) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const lastSavedRef = useRef({
    title: note.title,
    content: note.content,
  });
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedFadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);
  const noteIdRef = useRef(note.id);

  const clearTimers = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    if (savedFadeRef.current) {
      clearTimeout(savedFadeRef.current);
      savedFadeRef.current = null;
    }
  }, []);

  const persist = useCallback(async () => {
    if (isSavingRef.current) return;

    const payload = { title, content };
    const last = lastSavedRef.current;
    if (payload.title === last.title && payload.content === last.content) {
      return;
    }

    isSavingRef.current = true;
    setSaveStatus("saving");

    const { data, error } = await updateNote(note.id, { title, content });

    isSavingRef.current = false;

    if (error || !data) {
      setSaveStatus("error");
      return;
    }

    lastSavedRef.current = {
      title: data.title,
      content: data.content,
    };
    onSaved(data);
    setSaveStatus("saved");

    savedFadeRef.current = setTimeout(() => {
      setSaveStatus((s) => (s === "saved" ? "idle" : s));
    }, 2000);
  }, [content, note.id, onSaved, title]);

  useEffect(() => {
    if (noteIdRef.current === note.id) return;

    noteIdRef.current = note.id;
    setTitle(note.title);
    setContent(note.content);
    lastSavedRef.current = {
      title: note.title,
      content: note.content,
    };
    setSaveStatus("idle");
    clearTimers();
  }, [note.id, note.title, note.content, clearTimers]);

  useEffect(() => {
    clearTimers();
    saveTimerRef.current = setTimeout(() => {
      void persist();
    }, 800);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [title, content, persist, clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return {
    title,
    setTitle,
    content,
    setContent,
    saveStatus,
  };
}

const NOTE_TYPE_OPTIONS: {
  type: NoteType;
  icon: typeof FileText;
  label: string;
  description: string;
  aiOnly?: boolean;
}[] = [
  {
    type: "text",
    icon: FileText,
    label: "Text Note",
    description: "Rich text editor with formatting",
  },
  {
    type: "readme",
    icon: FileCode,
    label: "README",
    description: "Markdown document with reading mode",
  },
  {
    type: "canvas",
    icon: PenLine,
    label: "Canvas",
    description: "Freehand drawing with Excalidraw",
  },
  {
    type: "chart",
    icon: BarChart3,
    label: "Chart",
    description: "AI-generated data visualizations",
    aiOnly: true,
  },
  {
    type: "diagram",
    icon: Share2,
    label: "Diagram",
    description: "AI-generated flowcharts and mind maps",
    aiOnly: true,
  },
];

function NoteTypePickerModal({
  open,
  onOpenChange,
  clusters,
  onSelect,
  isCreating,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clusters: Cluster[];
  onSelect: (type: NoteType, clusterId: string | null) => void;
  isCreating: boolean;
}) {
  const { isPro } = usePlan();
  const [clusterId, setClusterId] = useState(GENERAL_CLUSTER_VALUE);

  const handleTypeSelect = (type: NoteType, aiOnly?: boolean) => {
    if (aiOnly && !isPro) {
      toast.error(UPGRADE_TOAST);
      return;
    }
    onSelect(type, clusterIdFromSelectValue(clusterId));
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setClusterId(GENERAL_CLUSTER_VALUE);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#0f0f17] border-[#ffffff10] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Create a new note</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-white/70">Cluster</Label>
            <NoteClusterSelect
              value={clusterIdFromSelectValue(clusterId)}
              clusters={clusters}
              onChange={setClusterId}
              className="w-full max-w-xs"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {NOTE_TYPE_OPTIONS.map(
              ({ type, icon: Icon, label, description, aiOnly }) => (
                <button
                  key={type}
                  type="button"
                  disabled={isCreating}
                  onClick={() => handleTypeSelect(type, aiOnly)}
                  className={cn(
                    "flex flex-col items-start gap-3 rounded-xl border border-[#ffffff10] bg-[#0a0a0f] p-4 text-left transition-colors",
                    "hover:border-[#7c5cfc]/50 hover:bg-[#16161f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cfc]/50",
                    isCreating && "opacity-50 pointer-events-none",
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7c5cfc]/10 border border-[#7c5cfc]/25">
                    <Icon className="h-5 w-5 text-[#7c5cfc]" aria-hidden />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{label}</p>
                      {aiOnly ? (
                        <span className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[#7c5cfc]/20 text-[#7c5cfc]">
                          AI
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-white/45 mt-1 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </button>
              ),
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type NoteEditorLayout = "split" | "stacked";

type EditorToolbarProps = {
  note: Note;
  clusters: Cluster[];
  saveStatus: SaveStatus;
  layout: NoteEditorLayout;
  onClusterChange: (value: string) => void;
  onClose: () => void;
};

function EditorToolbar({
  note,
  clusters,
  saveStatus,
  layout,
  onClusterChange,
  onClose,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <NoteClusterSelect
        value={note.cluster_id}
        clusters={clusters}
        onChange={onClusterChange}
      />
      <SaveStatusIndicator status={saveStatus} />
      {layout === "split" ? <EditorCloseButton onClose={onClose} /> : null}
    </div>
  );
}

function NoteEditorBackButton({ onClose }: { onClose: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClose}
      aria-label="Back to notes"
      className="h-8 w-8 shrink-0 text-white/45 hover:text-white/90 hover:bg-white/10"
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>
  );
}

const TextNoteEditor = memo(function TextNoteEditor({
  note,
  clusters,
  layout,
  onSaved,
  onClose,
  onClusterChange,
}: {
  note: Note;
  clusters: Cluster[];
  layout: NoteEditorLayout;
  onSaved: (note: Note) => void;
  onClose: () => void;
  onClusterChange: (value: string) => void;
}) {
  const { title, setTitle, content, setContent, saveStatus } = useNoteAutoSave(
    note,
    onSaved,
  );

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById(`note-content-${note.id}`)?.focus();
    }
  };

  return (
    <section className="flex flex-col h-full w-full min-w-0 min-h-0 bg-[#0a0a0f]">
      <header className="flex items-start justify-between gap-4 px-4 sm:px-6 lg:px-10 pt-4 lg:pt-6 pb-4 border-b border-[#ffffff10] shrink-0">
        <div className="flex flex-1 min-w-0 items-start gap-2">
          {layout === "stacked" ? <NoteEditorBackButton onClose={onClose} /> : null}
          <div className="flex-1 min-w-0">
          <label htmlFor={`note-title-${note.id}`} className="sr-only">
            Note title
          </label>
          <input
            id={`note-title-${note.id}`}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            placeholder="Untitled"
            className="w-full bg-transparent text-2xl sm:text-3xl font-semibold tracking-tight text-white/95 placeholder:text-white/25 focus:outline-none"
          />
          </div>
        </div>
        <EditorToolbar
          note={note}
          clusters={clusters}
          saveStatus={saveStatus}
          layout={layout}
          onClusterChange={onClusterChange}
          onClose={onClose}
        />
      </header>

      <div className="flex-1 min-h-0 overflow-hidden px-6 sm:px-10 py-4">
        <label htmlFor={`note-content-${note.id}`} className="sr-only">
          Note content
        </label>
        <Textarea
          id={`note-content-${note.id}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing…"
          className="h-full min-h-0 resize-none border-0 bg-transparent shadow-none text-base sm:text-[17px] leading-relaxed text-white/85 placeholder:text-white/25 focus-visible:ring-0 p-0 rounded-none"
        />
      </div>

      <footer className="px-6 sm:px-10 py-4 border-t border-[#ffffff10] shrink-0">
        <p className="text-xs text-white/35">
          Created {formatCreatedDate(note.created_at)}
        </p>
      </footer>
    </section>
  );
});

const ReadmeNoteEditor = memo(function ReadmeNoteEditor({
  note,
  clusters,
  layout,
  onSaved,
  onClose,
  onClusterChange,
}: {
  note: Note;
  clusters: Cluster[];
  layout: NoteEditorLayout;
  onSaved: (note: Note) => void;
  onClose: () => void;
  onClusterChange: (value: string) => void;
}) {
  const { title, setTitle, content, setContent, saveStatus } = useNoteAutoSave(
    note,
    onSaved,
  );
  const { viewMode, setViewMode } = useReadmeViewMode();

  return (
    <section className="flex flex-col h-full w-full min-w-0 min-h-0 bg-[#0a0a0f]">
      <header className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-10 pt-4 lg:pt-6 pb-4 border-b border-[#ffffff10] shrink-0">
        <div className="flex flex-1 min-w-0 items-center gap-2">
          {layout === "stacked" ? <NoteEditorBackButton onClose={onClose} /> : null}
          <label htmlFor={`readme-title-${note.id}`} className="sr-only">
            Note title
          </label>
          <input
            id={`readme-title-${note.id}`}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="flex-1 min-w-0 bg-transparent text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-white/95 placeholder:text-white/25 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ReadmeViewToggle value={viewMode} onChange={setViewMode} />
          <EditorToolbar
            note={note}
            clusters={clusters}
            saveStatus={saveStatus}
            layout={layout}
            onClusterChange={onClusterChange}
            onClose={onClose}
          />
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-hidden">
        {viewMode === "reading" ? (
          <ReadmeMarkdownPreview content={content} reading />
        ) : viewMode === "source" ? (
          <>
            <label htmlFor={`readme-content-${note.id}`} className="sr-only">
              Markdown content
            </label>
            <textarea
              id={`readme-content-${note.id}`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Write markdown here…"
              className="w-full h-full resize-none border-0 bg-[#0a0a0f] font-mono text-sm leading-relaxed text-white/85 placeholder:text-white/25 focus:outline-none p-6 sm:px-10"
            />
          </>
        ) : (
          <ResizablePanelGroup orientation="horizontal" className="h-full">
            <ResizablePanel defaultSize="50%" minSize="25%">
              <label htmlFor={`readme-content-${note.id}`} className="sr-only">
                Markdown content
              </label>
              <textarea
                id={`readme-content-${note.id}`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# Write markdown here…"
                className="w-full h-full resize-none border-0 bg-[#0a0a0f] font-mono text-sm leading-relaxed text-white/85 placeholder:text-white/25 focus:outline-none p-6"
              />
            </ResizablePanel>
            <ResizableHandle withHandle className="bg-[#ffffff10] w-px" />
            <ResizablePanel defaultSize="50%" minSize="25%">
              <ReadmeMarkdownPreview content={content} />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </section>
  );
});

const canvasContentUtils = () =>
  import("@/features/notes/utils/canvas-content");

function getInitialData(content: string): ExcalidrawInitialDataState {
  try {
    const parsed = JSON.parse(content) as {
      elements?: OrderedExcalidrawElement[];
      appState?: Partial<AppState>;
    };
    return {
      elements: parsed.elements ?? [],
      appState: {
        ...(parsed.appState ?? {}),
        collaborators: new Map(),
      },
    };
  } catch {
    return {
      elements: [],
      appState: {
        collaborators: new Map(),
      },
    };
  }
}

const CanvasNoteEditor = memo(function CanvasNoteEditor({
  note,
  clusters,
  layout,
  onSaved,
  onClose,
  onClusterChange,
}: {
  note: Note;
  clusters: Cluster[];
  layout: NoteEditorLayout;
  onSaved: (note: Note) => void;
  onClose: () => void;
  onClusterChange: (value: string) => void;
}) {
  const { title, setTitle, setContent, saveStatus } = useNoteAutoSave(
    note,
    onSaved,
  );
  const initialData = useMemo(() => getInitialData(note.content), [note.id]);

  const handleCanvasChange = useCallback(
    (
      elements: readonly OrderedExcalidrawElement[],
      appState: AppState,
      files: BinaryFiles,
    ) => {
      void canvasContentUtils().then(({ serializeCanvasContent }) => {
        setContent(serializeCanvasContent(elements, appState, files));
      });
    },
    [setContent],
  );

  return (
    <section className="flex flex-col h-full w-full min-w-0 min-h-0 bg-[#0a0a0f]">
      <header className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-10 pt-4 lg:pt-6 pb-4 border-b border-[#ffffff10] shrink-0">
        <div className="flex flex-1 min-w-0 items-center gap-2">
          {layout === "stacked" ? <NoteEditorBackButton onClose={onClose} /> : null}
          <label htmlFor={`canvas-title-${note.id}`} className="sr-only">
            Note title
          </label>
          <input
            id={`canvas-title-${note.id}`}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="flex-1 min-w-0 bg-transparent text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-white/95 placeholder:text-white/25 focus:outline-none"
          />
        </div>
        <EditorToolbar
          note={note}
          clusters={clusters}
          saveStatus={saveStatus}
          layout={layout}
          onClusterChange={onClusterChange}
          onClose={onClose}
        />
      </header>

      <div className="flex-1 min-h-0 relative w-full h-full overflow-visible">
        <ExcalidrawEditor
          key={note.id}
          initialData={initialData}
          onChange={handleCanvasChange}
        />
      </div>
    </section>
  );
});

const ChartNoteEditor = memo(function ChartNoteEditor({
  note,
  clusters,
  layout,
  onSaved,
  onClose,
  onClusterChange,
}: {
  note: Note;
  clusters: Cluster[];
  layout: NoteEditorLayout;
  onSaved: (note: Note) => void;
  onClose: () => void;
  onClusterChange: (value: string) => void;
}) {
  const { isPro } = usePlan();
  const { title, setTitle, content, setContent, saveStatus } = useNoteAutoSave(
    note,
    onSaved,
  );

  return (
    <section className="flex flex-col h-full w-full min-w-0 min-h-0 bg-[#0a0a0f]">
      <header className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-10 pt-4 lg:pt-6 pb-4 border-b border-[#ffffff10] shrink-0">
        <div className="flex flex-1 min-w-0 items-center gap-2">
          {layout === "stacked" ? <NoteEditorBackButton onClose={onClose} /> : null}
          <label htmlFor={`chart-title-${note.id}`} className="sr-only">
            Note title
          </label>
          <input
            id={`chart-title-${note.id}`}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="flex-1 min-w-0 bg-transparent text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-white/95 placeholder:text-white/25 focus:outline-none"
          />
        </div>
        <EditorToolbar
          note={note}
          clusters={clusters}
          saveStatus={saveStatus}
          layout={layout}
          onClusterChange={onClusterChange}
          onClose={onClose}
        />
      </header>

      <div className="flex-1 min-h-0 overflow-auto px-6 sm:px-10 py-4">
        <ChartEditor
          key={note.id}
          content={content}
          onChange={setContent}
          canGenerate={isPro}
        />
      </div>
    </section>
  );
});

const DiagramNoteEditor = memo(function DiagramNoteEditor({
  note,
  clusters,
  layout,
  onSaved,
  onClose,
  onClusterChange,
}: {
  note: Note;
  clusters: Cluster[];
  layout: NoteEditorLayout;
  onSaved: (note: Note) => void;
  onClose: () => void;
  onClusterChange: (value: string) => void;
}) {
  const { isPro } = usePlan();
  const { title, setTitle, content, setContent, saveStatus } = useNoteAutoSave(
    note,
    onSaved,
  );

  return (
    <section className="flex flex-col h-full w-full min-w-0 min-h-0 bg-[#0a0a0f]">
      <header className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-10 pt-4 lg:pt-6 pb-4 border-b border-[#ffffff10] shrink-0">
        <div className="flex flex-1 min-w-0 items-center gap-2">
          {layout === "stacked" ? <NoteEditorBackButton onClose={onClose} /> : null}
          <label htmlFor={`diagram-title-${note.id}`} className="sr-only">
            Note title
          </label>
          <input
            id={`diagram-title-${note.id}`}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="flex-1 min-w-0 bg-transparent text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-white/95 placeholder:text-white/25 focus:outline-none"
          />
        </div>
        <EditorToolbar
          note={note}
          clusters={clusters}
          saveStatus={saveStatus}
          layout={layout}
          onClusterChange={onClusterChange}
          onClose={onClose}
        />
      </header>

      <div className="flex-1 min-h-0 overflow-auto px-6 sm:px-10 py-4">
        <DiagramEditor
          key={note.id}
          content={content}
          onChange={setContent}
          canGenerate={isPro}
        />
      </div>
    </section>
  );
});

const NoteEditor = memo(function NoteEditor({
  note,
  clusters,
  layout,
  onSaved,
  onClose,
  onClusterChange,
}: {
  note: Note;
  clusters: Cluster[];
  layout: NoteEditorLayout;
  onSaved: (note: Note) => void;
  onClose: () => void;
  onClusterChange: (value: string) => void;
}) {
  switch (note.type) {
    case "readme":
      return (
        <ReadmeNoteEditor
          note={note}
          clusters={clusters}
          layout={layout}
          onSaved={onSaved}
          onClose={onClose}
          onClusterChange={onClusterChange}
        />
      );
    case "canvas":
      return (
        <CanvasNoteEditor
          note={note}
          clusters={clusters}
          layout={layout}
          onSaved={onSaved}
          onClose={onClose}
          onClusterChange={onClusterChange}
        />
      );
    case "chart":
      return (
        <ChartNoteEditor
          note={note}
          clusters={clusters}
          layout={layout}
          onSaved={onSaved}
          onClose={onClose}
          onClusterChange={onClusterChange}
        />
      );
    case "diagram":
      return (
        <DiagramNoteEditor
          note={note}
          clusters={clusters}
          layout={layout}
          onSaved={onSaved}
          onClose={onClose}
          onClusterChange={onClusterChange}
        />
      );
    default:
      return (
        <TextNoteEditor
          note={note}
          clusters={clusters}
          layout={layout}
          onSaved={onSaved}
          onClose={onClose}
          onClusterChange={onClusterChange}
        />
      );
  }
});

function EditorEmptyState() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#0a0a0f] p-8">
      <div className="text-center max-w-sm">
        <div className="inline-flex h-14 w-14 rounded-2xl bg-[#7c5cfc]/10 border border-[#7c5cfc]/25 items-center justify-center mb-5">
          <Sparkles className="h-6 w-6 text-[#7c5cfc]" aria-hidden />
        </div>
        <h2 className="text-lg font-medium text-white/90">Select a note</h2>
        <p className="text-sm text-white/40 mt-2 leading-relaxed">
          Pick a note from the list or create a new one to begin.
        </p>
      </div>
    </div>
  );
}

export default function NotesPage({
  initialNotes,
  initialClusters,
  autoOpenCreate = false,
}: NotesPageProps) {
  const router = useRouter();
  const normalizedInitial = useMemo(
    () => normalizeNotes(initialNotes),
    [initialNotes],
  );
  const isSplitView = useNotesSplitView();

  const [notes, setNotes] = useState<Note[]>(normalizedInitial);
  const [clusters] = useState<Cluster[]>(initialClusters);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { collapsedIds, toggleSectionCollapsed } = useCollapsedNoteSections();

  useEffect(() => {
    if (!isSplitView || activeNote || notes.length === 0) return;
    setActiveNote(notes[0]);
  }, [isSplitView, activeNote, notes]);

  useEffect(() => {
    if (!autoOpenCreate) return;
    setPickerOpen(true);
    router.replace("/notes", { scroll: false });
  }, [autoOpenCreate, router]);

  const generalNotes = useMemo(
    () => sortNotesByUpdated(notes.filter((n) => n.cluster_id === null)),
    [notes],
  );

  const clustersWithNotes = useMemo(
    () =>
      clusters.filter((cluster) =>
        notes.some((n) => n.cluster_id === cluster.id),
      ),
    [clusters, notes],
  );

  const getClusterNotes = useCallback(
    (clusterId: string) =>
      sortNotesByUpdated(notes.filter((n) => n.cluster_id === clusterId)),
    [notes],
  );

  const handleNoteSaved = useCallback((updated: Note) => {
    setNotes((prev) => {
      const next = prev.map((n) => (n.id === updated.id ? updated : n));
      return sortNotesByUpdated(next);
    });
    setActiveNote((prev) => (prev?.id === updated.id ? updated : prev));
  }, []);

  const handleCreate = useCallback(
    async (type: NoteType, clusterId: string | null) => {
      if (isCreating) return;

      setIsCreating(true);
      const { data, error } = await createNote(type, clusterId);
      setIsCreating(false);
      setPickerOpen(false);

      if (error || !data) {
        toast.error(error ?? "Failed to create note");
        return;
      }

      setNotes((prev) => sortNotesByUpdated([data, ...prev]));
      setActiveNote(data);
      toast.success("Note created");
    },
    [isCreating],
  );

  const handleClose = useCallback(() => {
    setActiveNote(null);
  }, []);

  const handleSelectNote = useCallback((note: Note) => {
    setActiveNote(note);
  }, []);

  const handleClusterChange = useCallback(
    async (value: string) => {
      if (!activeNote) return;

      const targetClusterId = clusterIdFromSelectValue(value);
      const previousClusterId = activeNote.cluster_id;
      const noteId = activeNote.id;

      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, cluster_id: targetClusterId } : n,
        ),
      );
      setActiveNote((prev) =>
        prev ? { ...prev, cluster_id: targetClusterId } : null,
      );

      const { data, error } = await updateNote(noteId, {
        cluster_id: targetClusterId,
      });

      if (error || !data) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === noteId ? { ...n, cluster_id: previousClusterId } : n,
          ),
        );
        setActiveNote((prev) =>
          prev ? { ...prev, cluster_id: previousClusterId } : null,
        );
        toast.error(error ?? "Failed to move note");
        return;
      }

      const cluster = clusters.find((c) => c.id === targetClusterId);
      toast.success(
        targetClusterId === null
          ? "Moved to General"
          : `Moved to ${cluster?.name ?? "cluster"}`,
      );
    },
    [activeNote, clusters],
  );

  const requestDelete = useCallback((note: Note) => {
    setNoteToDelete(note);
  }, []);

  const handleDeleted = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setActiveNote((current) => (current?.id === id ? null : current));
  }, []);

  const handleRestore = useCallback((note: Note) => {
    setNotes((prev) => {
      const exists = prev.some((n) => n.id === note.id);
      const next = exists ? prev : [note, ...prev];
      return sortNotesByUpdated(next);
    });
    setActiveNote(note);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!noteToDelete) return;

    const target = noteToDelete;
    const id = target.id;

    setIsDeleting(true);
    handleDeleted(id);
    const { error } = await deleteNote(id);
    setIsDeleting(false);
    setNoteToDelete(null);

    if (error) {
      toast.error(error);
      handleRestore(target);
    } else {
      toast.success("Note deleted");
    }
  }, [noteToDelete, handleDeleted, handleRestore]);

  const listPanelProps = {
    notes,
    generalNotes,
    clustersWithNotes,
    activeNoteId: activeNote?.id ?? null,
    collapsedIds,
    isCreating,
    onCreateClick: () => setPickerOpen(true),
    onToggleSectionCollapsed: toggleSectionCollapsed,
    onSelectNote: handleSelectNote,
    onDeleteRequest: requestDelete,
    getClusterNotes,
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] lg:h-[100dvh] max-h-[100dvh] bg-[#0a0a0f]">
      {isSplitView ? (
        <ResizablePanelGroup
          id="notes-layout"
          orientation="horizontal"
          className="flex-1 min-h-0"
        >
          <ResizablePanel
            id="notes-list"
            defaultSize={280}
            minSize={240}
            maxSize={420}
            className="min-w-0"
          >
            <NotesListPanel {...listPanelProps} />
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-[#ffffff10] w-px" />

          <ResizablePanel id="notes-editor" minSize="40%">
            <div className="h-full w-full min-w-0 overflow-visible bg-[#0a0a0f]">
              {activeNote ? (
                <NoteEditor
                  note={activeNote}
                  clusters={clusters}
                  layout="split"
                  onSaved={handleNoteSaved}
                  onClose={handleClose}
                  onClusterChange={(value) => void handleClusterChange(value)}
                />
              ) : (
                <EditorEmptyState />
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="flex flex-1 min-h-0">
          {activeNote ? (
            <div className="h-full w-full min-w-0">
              <NoteEditor
                note={activeNote}
                clusters={clusters}
                layout="stacked"
                onSaved={handleNoteSaved}
                onClose={handleClose}
                onClusterChange={(value) => void handleClusterChange(value)}
              />
            </div>
          ) : (
            <NotesListPanel
              {...listPanelProps}
              showBorder={false}
              className="w-full"
            />
          )}
        </div>
      )}

      <NoteTypePickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        clusters={clusters}
        onSelect={(type, clusterId) => void handleCreate(type, clusterId)}
        isCreating={isCreating}
      />

      <AlertDialog
        open={noteToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setNoteToDelete(null);
        }}
      >
        <AlertDialogContent className="bg-[#0f0f17] border-[#ffffff10]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{displayTitle(noteToDelete?.title ?? "")}&rdquo; will be
              permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#ffffff10]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
