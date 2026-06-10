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
import ReactMarkdown from "react-markdown";
import {
  FileCode,
  FileText,
  PenLine,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
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

const ExcalidrawEditor = dynamic(
  () => import("@/features/notes/components/excalidraw-editor"),
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

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = Date.now();
  const diffSec = Math.floor((now - date.getTime()) / 1000);

  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatCreatedDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function displayTitle(title: string): string {
  const trimmed = title.trim();
  return trimmed || "Untitled";
}

function clusterSelectValue(clusterId: string | null): string {
  return clusterId ?? GENERAL_CLUSTER_VALUE;
}

function clusterIdFromSelectValue(value: string): string | null {
  return value === GENERAL_CLUSTER_VALUE ? null : value;
}

function NoteTypeBadge({ type }: { type?: NoteType }) {
  const resolved = type ?? "text";
  const config = {
    text: { label: "Text", className: "bg-blue-500/15 text-blue-400" },
    readme: { label: "MD", className: "bg-green-500/15 text-green-400" },
    canvas: { label: "Canvas", className: "bg-purple-500/15 text-purple-400" },
  }[resolved];

  return (
    <span
      className={cn(
        "text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
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
    description: "Markdown with live preview",
  },
  {
    type: "canvas",
    icon: PenLine,
    label: "Canvas",
    description: "Freehand drawing with Excalidraw",
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
  const [clusterId, setClusterId] = useState(GENERAL_CLUSTER_VALUE);

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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {NOTE_TYPE_OPTIONS.map(
              ({ type, icon: Icon, label, description }) => (
                <button
                  key={type}
                  type="button"
                  disabled={isCreating}
                  onClick={() =>
                    onSelect(type, clusterIdFromSelectValue(clusterId))
                  }
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
                    <p className="text-sm font-medium text-white">{label}</p>
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

function SectionCountBadge({ count }: { count: number }) {
  return (
    <span className="text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded-full bg-white/10 text-white/50">
      {count}
    </span>
  );
}

function NoteListSection({
  title,
  count,
  dotColor,
  emptyMessage,
  notes,
  activeNoteId,
  onSelect,
  onDeleteRequest,
}: {
  title: string;
  count: number;
  dotColor?: string;
  emptyMessage: string;
  notes: Note[];
  activeNoteId: string | null;
  onSelect: (note: Note) => void;
  onDeleteRequest: (note: Note) => void;
}) {
  return (
    <section className="space-y-1">
      <div className="flex items-center gap-2 px-2 py-1.5">
        {dotColor ? (
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: dotColor }}
            aria-hidden
          />
        ) : null}
        <h2 className="text-xs font-medium text-white/60 truncate">{title}</h2>
        <SectionCountBadge count={count} />
      </div>
      {notes.length === 0 ? (
        <p className="px-2 py-3 text-xs text-white/30">{emptyMessage}</p>
      ) : (
        notes.map((note) => (
          <NoteListItem
            key={note.id}
            note={note}
            isActive={note.id === activeNoteId}
            onSelect={onSelect}
            onDeleteRequest={onDeleteRequest}
          />
        ))
      )}
    </section>
  );
}

const NoteListItem = memo(function NoteListItem({
  note,
  isActive,
  onSelect,
  onDeleteRequest,
}: {
  note: Note;
  isActive: boolean;
  onSelect: (note: Note) => void;
  onDeleteRequest: (note: Note) => void;
}) {
  return (
    <div
      className={cn(
        "group relative flex items-start gap-1 rounded-lg transition-all border border-transparent",
        isActive
          ? "bg-[#16161f] border-l-2 border-l-[#7c5cfc] border-[#ffffff10] shadow-[0_0_24px_-8px_rgba(124,92,252,0.35)]"
          : "hover:bg-[#14141c] border-l-2 border-l-transparent",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(note)}
        className={cn(
          "flex-1 min-w-0 text-left py-2.5 pl-3 pr-3 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cfc]/50 rounded-lg",
          isActive && "pl-[10px]",
        )}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="text-sm font-medium text-white/90 truncate flex-1 min-w-0">
            {displayTitle(note.title)}
          </p>
          <NoteTypeBadge type={note.type} />
        </div>
        <p className="text-[11px] text-white/40 mt-1 pr-8">
          {formatRelativeTime(note.updated_at)}
        </p>
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteRequest(note);
        }}
        aria-label={`Delete ${displayTitle(note.title)}`}
        className={cn(
          "absolute right-3 bottom-2.5 h-7 w-7 text-white/35 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200",
          "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 cursor-pointer",
          isActive && "opacity-100",
        )}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
});

type EditorToolbarProps = {
  note: Note;
  clusters: Cluster[];
  saveStatus: SaveStatus;
  onClusterChange: (value: string) => void;
  onClose: () => void;
};

function EditorToolbar({
  note,
  clusters,
  saveStatus,
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
      <EditorCloseButton onClose={onClose} />
    </div>
  );
}

const TextNoteEditor = memo(function TextNoteEditor({
  note,
  clusters,
  onSaved,
  onClose,
  onClusterChange,
}: {
  note: Note;
  clusters: Cluster[];
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
      <header className="flex items-start justify-between gap-4 px-6 sm:px-10 pt-6 pb-4 border-b border-[#ffffff10] shrink-0">
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
        <EditorToolbar
          note={note}
          clusters={clusters}
          saveStatus={saveStatus}
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
  onSaved,
  onClose,
  onClusterChange,
}: {
  note: Note;
  clusters: Cluster[];
  onSaved: (note: Note) => void;
  onClose: () => void;
  onClusterChange: (value: string) => void;
}) {
  const { title, setTitle, content, setContent, saveStatus } = useNoteAutoSave(
    note,
    onSaved,
  );

  return (
    <section className="flex flex-col h-full w-full min-w-0 min-h-0 bg-[#0a0a0f]">
      <header className="flex items-center justify-between gap-4 px-6 sm:px-10 pt-6 pb-4 border-b border-[#ffffff10] shrink-0">
        <label htmlFor={`readme-title-${note.id}`} className="sr-only">
          Note title
        </label>
        <input
          id={`readme-title-${note.id}`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="flex-1 min-w-0 bg-transparent text-2xl sm:text-3xl font-semibold tracking-tight text-white/95 placeholder:text-white/25 focus:outline-none"
        />
        <EditorToolbar
          note={note}
          clusters={clusters}
          saveStatus={saveStatus}
          onClusterChange={onClusterChange}
          onClose={onClose}
        />
      </header>

      <div className="flex-1 min-h-0 overflow-hidden">
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
            <ScrollArea className="h-full bg-[#0f0f17]">
              <div className="p-6 prose prose-invert max-w-none readme-preview">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-white text-2xl font-bold mb-4 mt-6 first:mt-0">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-white text-xl font-semibold mb-3 mt-5">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-white text-lg font-semibold mb-2 mt-4">
                        {children}
                      </h3>
                    ),
                    h4: ({ children }) => (
                      <h4 className="text-white text-base font-semibold mb-2 mt-3">
                        {children}
                      </h4>
                    ),
                    h5: ({ children }) => (
                      <h5 className="text-white text-sm font-semibold mb-2 mt-3">
                        {children}
                      </h5>
                    ),
                    h6: ({ children }) => (
                      <h6 className="text-white text-sm font-medium mb-2 mt-3">
                        {children}
                      </h6>
                    ),
                    p: ({ children }) => (
                      <p className="text-zinc-300 mb-3 leading-relaxed">
                        {children}
                      </p>
                    ),
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        className="text-[#7c5cfc] hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    code: ({ className, children }) => {
                      const isBlock = className?.includes("language-");
                      if (isBlock) {
                        return (
                          <code className="block bg-zinc-800 rounded p-3 text-sm text-zinc-200 overflow-x-auto my-3">
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className="bg-zinc-800 rounded px-1.5 py-0.5 text-sm text-zinc-200">
                          {children}
                        </code>
                      );
                    },
                    pre: ({ children }) => (
                      <pre className="bg-zinc-800 rounded p-3 overflow-x-auto my-3">
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {content || "_Nothing to preview yet._"}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
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
  onSaved,
  onClose,
  onClusterChange,
}: {
  note: Note;
  clusters: Cluster[];
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
      <header className="flex items-center justify-between gap-4 px-6 sm:px-10 pt-6 pb-4 border-b border-[#ffffff10] shrink-0">
        <label htmlFor={`canvas-title-${note.id}`} className="sr-only">
          Note title
        </label>
        <input
          id={`canvas-title-${note.id}`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="flex-1 min-w-0 bg-transparent text-2xl sm:text-3xl font-semibold tracking-tight text-white/95 placeholder:text-white/25 focus:outline-none"
        />
        <EditorToolbar
          note={note}
          clusters={clusters}
          saveStatus={saveStatus}
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

const NoteEditor = memo(function NoteEditor({
  note,
  clusters,
  onSaved,
  onClose,
  onClusterChange,
}: {
  note: Note;
  clusters: Cluster[];
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

  const [notes, setNotes] = useState<Note[]>(normalizedInitial);
  const [clusters] = useState<Cluster[]>(initialClusters);
  const [activeNote, setActiveNote] = useState<Note | null>(
    normalizedInitial.length > 0 ? normalizedInitial[0] : null,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] lg:h-[100dvh] max-h-[100dvh] bg-[#0a0a0f]">
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
          className="bg-[#0f0f17]"
        >
          <div className="flex flex-col h-full border-r border-[#ffffff10]">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#ffffff10] shrink-0">
              <h1 className="text-base font-semibold text-white">Notes</h1>
              <Button
                type="button"
                size="sm"
                onClick={() => setPickerOpen(true)}
                disabled={isCreating}
                className="h-8 bg-[#7c5cfc] hover:bg-[#6b4ce8] text-white shadow-[0_0_20px_-6px_rgba(124,92,252,0.6)]"
              >
                <Plus className="h-3.5 w-3.5 mr-1" aria-hidden />
                New
              </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
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
                      title="General"
                      count={generalNotes.length}
                      emptyMessage="No general notes yet."
                      notes={generalNotes}
                      activeNoteId={activeNote?.id ?? null}
                      onSelect={handleSelectNote}
                      onDeleteRequest={requestDelete}
                    />
                    {clustersWithNotes.map((cluster) => {
                      const clusterNotes = sortNotesByUpdated(
                        notes.filter((n) => n.cluster_id === cluster.id),
                      );

                      return (
                        <NoteListSection
                          key={cluster.id}
                          title={cluster.name}
                          count={clusterNotes.length}
                          dotColor={cluster.color}
                          emptyMessage="No notes in this cluster."
                          notes={clusterNotes}
                          activeNoteId={activeNote?.id ?? null}
                          onSelect={handleSelectNote}
                          onDeleteRequest={requestDelete}
                        />
                      );
                    })}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-[#ffffff10] w-px" />

        <ResizablePanel id="notes-editor" minSize="40%">
          <div className="h-full w-full min-w-0 overflow-visible bg-[#0a0a0f]">
            {activeNote ? (
              <NoteEditor
                note={activeNote}
                clusters={clusters}
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
