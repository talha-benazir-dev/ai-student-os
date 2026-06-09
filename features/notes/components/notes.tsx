"use client";

import "@excalidraw/excalidraw/index.css";
import dynamic from "next/dynamic";
import type {
  AppState,
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
import ReactMarkdown from "react-markdown";
import {
  FileCode,
  FileText,
  PenLine,
  Plus,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import type { Note, NoteType } from "@/features/notes/types";
import {
  createNote,
  getNotes,
  updateNote,
} from "@/features/notes/actions/notes.actions";

const Excalidraw = dynamic(
  () =>
    import("@excalidraw/excalidraw").then((mod) => ({
      default: mod.Excalidraw,
    })),
  { ssr: false },
);

type SaveStatus = "idle" | "saving" | "saved" | "error";

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

function NoteTypeBadge({ type }: { type: NoteType }) {
  const config = {
    text: { label: "Text", className: "bg-blue-500/15 text-blue-400" },
    readme: { label: "MD", className: "bg-green-500/15 text-green-400" },
    canvas: { label: "Canvas", className: "bg-purple-500/15 text-purple-400" },
  }[type];

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

function useNoteAutoSave(
  note: Note,
  onSaved: (note: Note) => void,
) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [subject, setSubject] = useState(note.subject);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const lastSavedRef = useRef({
    title: note.title,
    content: note.content,
    subject: note.subject,
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

    const payload = { title, content, subject };
    const last = lastSavedRef.current;
    if (
      payload.title === last.title &&
      payload.content === last.content &&
      payload.subject === last.subject
    ) {
      return;
    }

    isSavingRef.current = true;
    setSaveStatus("saving");

    const { data, error } = await updateNote(note.id, title, content, subject);

    isSavingRef.current = false;

    if (error || !data) {
      setSaveStatus("error");
      return;
    }

    lastSavedRef.current = {
      title: data.title,
      content: data.content,
      subject: data.subject,
    };
    onSaved(data);
    setSaveStatus("saved");

    savedFadeRef.current = setTimeout(() => {
      setSaveStatus((s) => (s === "saved" ? "idle" : s));
    }, 2000);
  }, [content, note.id, onSaved, subject, title]);

  useEffect(() => {
    if (noteIdRef.current === note.id) return;

    noteIdRef.current = note.id;
    setTitle(note.title);
    setContent(note.content);
    setSubject(note.subject);
    lastSavedRef.current = {
      title: note.title,
      content: note.content,
      subject: note.subject,
    };
    setSaveStatus("idle");
    clearTimers();
  }, [note.id, note.title, note.content, note.subject, clearTimers]);

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
  }, [title, content, subject, persist, clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return {
    title,
    setTitle,
    content,
    setContent,
    subject,
    setSubject,
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
  onSelect,
  isCreating,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: NoteType) => void;
  isCreating: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f0f17] border-[#ffffff10] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Create a new note</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {NOTE_TYPE_OPTIONS.map(({ type, icon: Icon, label, description }) => (
            <button
              key={type}
              type="button"
              disabled={isCreating}
              onClick={() => onSelect(type)}
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
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const NoteListItem = memo(function NoteListItem({
  note,
  isActive,
  onSelect,
}: {
  note: Note;
  isActive: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(note.id)}
      className={cn(
        "w-full text-left rounded-lg px-3 py-2.5 transition-all border border-transparent",
        isActive
          ? "bg-[#16161f] border-l-2 border-l-[#7c5cfc] border-[#ffffff10]"
          : "hover:bg-[#14141c] border-l-2 border-l-transparent",
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <p className="text-sm font-medium text-white/90 truncate flex-1 min-w-0">
          {displayTitle(note.title)}
        </p>
        <NoteTypeBadge type={note.type} />
      </div>
      {note.subject.trim() ? (
        <p className="text-xs text-[#7c5cfc]/80 mt-0.5 truncate">
          {note.subject}
        </p>
      ) : (
        <p className="text-xs text-white/30 mt-0.5">No subject</p>
      )}
      <p className="text-[11px] text-white/40 mt-1">
        {formatRelativeTime(note.updated_at)}
      </p>
    </button>
  );
});

const TextNoteEditor = memo(function TextNoteEditor({
  note,
  onSaved,
}: {
  note: Note;
  onSaved: (note: Note) => void;
}) {
  const { title, setTitle, content, setContent, subject, setSubject, saveStatus } =
    useNoteAutoSave(note, onSaved);

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById(`note-content-${note.id}`)?.focus();
    }
  };

  return (
    <section className="flex flex-col flex-1 min-w-0 min-h-0 bg-[#0a0a0f]">
      <header className="flex items-start justify-between gap-4 px-6 sm:px-10 pt-6 pb-4 border-b border-[#ffffff10] shrink-0">
        <div className="flex-1 min-w-0 space-y-3">
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
          <label htmlFor={`note-subject-${note.id}`} className="sr-only">
            Subject
          </label>
          <input
            id={`note-subject-${note.id}`}
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (optional)"
            className="w-full max-w-md bg-transparent text-sm text-[#7c5cfc]/90 placeholder:text-white/30 focus:outline-none"
          />
        </div>
        <div className="shrink-0 pt-1">
          <SaveStatusIndicator status={saveStatus} />
        </div>
      </header>

      <div className="flex-1 min-h-0 px-6 sm:px-10 py-4">
        <label htmlFor={`note-content-${note.id}`} className="sr-only">
          Note content
        </label>
        <Textarea
          id={`note-content-${note.id}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing…"
          className="h-full min-h-[280px] resize-none border-0 bg-transparent shadow-none text-base sm:text-[17px] leading-relaxed text-white/85 placeholder:text-white/25 focus-visible:ring-0 p-0"
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
  onSaved,
}: {
  note: Note;
  onSaved: (note: Note) => void;
}) {
  const { title, setTitle, content, setContent, saveStatus } = useNoteAutoSave(
    note,
    onSaved,
  );

  return (
    <section className="flex flex-col flex-1 min-w-0 min-h-0 bg-[#0a0a0f]">
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
        <SaveStatusIndicator status={saveStatus} />
      </header>

      <div className="flex-1 min-h-0">
        <ResizablePanelGroup orientation="horizontal" className="h-full">
          <ResizablePanel defaultSize={50} minSize={25}>
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
          <ResizableHandle className="bg-[#ffffff10]" />
          <ResizablePanel defaultSize={50} minSize={25}>
            <ScrollArea className="h-full">
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
                      <p className="text-zinc-300 mb-3 leading-relaxed">{children}</p>
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

function parseCanvasContent(content: string): ExcalidrawInitialDataState {
  if (!content.trim()) {
    return { elements: [], appState: {} };
  }
  try {
    const parsed = JSON.parse(content) as {
      elements?: readonly OrderedExcalidrawElement[];
      appState?: Partial<AppState>;
    };
    return {
      elements: parsed.elements ?? [],
      appState: parsed.appState ?? {},
    };
  } catch {
    return { elements: [], appState: {} };
  }
}

const CanvasNoteEditor = memo(function CanvasNoteEditor({
  note,
  onSaved,
}: {
  note: Note;
  onSaved: (note: Note) => void;
}) {
  const { title, setTitle, setContent, saveStatus } = useNoteAutoSave(
    note,
    onSaved,
  );

  const initialData = useMemo(
    () => parseCanvasContent(note.content),
    [note.id],
  );

  const handleCanvasChange = useCallback(
    (
      elements: readonly OrderedExcalidrawElement[],
      appState: AppState,
    ) => {
      setContent(JSON.stringify({ elements, appState }));
    },
    [setContent],
  );

  return (
    <section className="flex flex-col flex-1 min-w-0 min-h-0 bg-[#0a0a0f]">
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
        <SaveStatusIndicator status={saveStatus} />
      </header>

      <div className="flex-1 min-h-0 relative">
        <Excalidraw
          key={note.id}
          initialData={initialData}
          onChange={handleCanvasChange}
          theme="dark"
        />
      </div>
    </section>
  );
});

const NoteEditor = memo(function NoteEditor({
  note,
  onSaved,
}: {
  note: Note;
  onSaved: (note: Note) => void;
}) {
  switch (note.type) {
    case "readme":
      return <ReadmeNoteEditor note={note} onSaved={onSaved} />;
    case "canvas":
      return <CanvasNoteEditor note={note} onSaved={onSaved} />;
    default:
      return <TextNoteEditor note={note} onSaved={onSaved} />;
  }
});

function EditorEmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center bg-[#0a0a0f] p-8">
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

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const initialSelectDone = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      const { data, error } = await getNotes();
      if (cancelled) return;

      if (error) {
        setLoadError(error);
        setNotes([]);
      } else {
        setNotes(data ?? []);
        if (!initialSelectDone.current && data && data.length > 0) {
          setSelectedId(data[0].id);
          initialSelectDone.current = true;
        }
      }
      setIsLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId],
  );

  const handleNoteSaved = useCallback((updated: Note) => {
    setNotes((prev) => {
      const next = prev.map((n) => (n.id === updated.id ? updated : n));
      return [...next].sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
    });
  }, []);

  const handleCreate = useCallback(
    async (type: NoteType) => {
      if (isCreating) return;

      setIsCreating(true);
      const { data, error } = await createNote(type);
      setIsCreating(false);
      setPickerOpen(false);

      if (error || !data) {
        toast.error(error ?? "Failed to create note");
        return;
      }

      setNotes((prev) => [data, ...prev]);
      setSelectedId(data.id);
      toast.success("Note created");
    },
    [isCreating],
  );

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] lg:h-[100dvh] max-h-[100dvh] bg-[#0a0a0f]">
      {loadError && (
        <div
          className="px-4 py-2 text-sm text-red-400 bg-red-400/10 border-b border-red-400/20"
          role="alert"
        >
          {loadError}
        </div>
      )}

      <ResizablePanelGroup orientation="horizontal" className="flex-1 min-h-0">
        <ResizablePanel
          defaultSize={28}
          minSize={20}
          maxSize={40}
          className="bg-[#0a0a0f] border-r border-[#ffffff10]"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#ffffff10] shrink-0">
              <h1 className="text-base font-semibold text-white">Notes</h1>
              <Button
                type="button"
                size="sm"
                onClick={() => setPickerOpen(true)}
                disabled={isCreating}
                className="h-8 bg-[#7c5cfc] hover:bg-[#6b4ce8] text-white"
              >
                <Plus className="h-3.5 w-3.5 mr-1" aria-hidden />
                New
              </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="p-3 space-y-1">
                {isLoading ? (
                  <div className="px-3 py-8 text-center text-sm text-white/40">
                    Loading notes…
                  </div>
                ) : notes.length === 0 ? (
                  <div className="flex items-center justify-center px-3 py-16 text-center">
                    <p className="text-sm text-white/40">
                      No notes yet. Create your first note.
                    </p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <NoteListItem
                      key={note.id}
                      note={note}
                      isActive={note.id === selectedId}
                      onSelect={setSelectedId}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle className="bg-[#ffffff10]" />

        <ResizablePanel defaultSize={72} minSize={40}>
          {selectedNote ? (
            <NoteEditor note={selectedNote} onSaved={handleNoteSaved} />
          ) : (
            <EditorEmptyState />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>

      <NoteTypePickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(type) => void handleCreate(type)}
        isCreating={isCreating}
      />
    </div>
  );
}
