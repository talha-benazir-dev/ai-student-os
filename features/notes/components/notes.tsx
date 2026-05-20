"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  FileText,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { cn } from "@/lib/utils";
import type { Note } from "@/features/notes/types";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "@/features/notes/actions/notes.actions";

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

function noteMatchesQuery(note: Note, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    note.title.toLowerCase().includes(q) ||
    note.content.toLowerCase().includes(q) ||
    note.subject.toLowerCase().includes(q)
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
  onSelect: (id: string) => void;
  onDeleteRequest: (note: Note) => void;
}) {
  return (
    <div
      className={cn(
        "group relative flex items-start gap-1 rounded-lg transition-all duration-200 border border-transparent",
        isActive
          ? "bg-[#16161f] border-l-2 border-l-[#7c5cfc] border-[#ffffff10] shadow-[0_0_24px_-8px_rgba(124,92,252,0.35)]"
          : "hover:bg-[#14141c] border-l-2 border-l-transparent",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(note.id)}
        className={cn(
          "flex-1 min-w-0 text-left py-2.5 pl-3 pr-1 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cfc]/50 rounded-lg",
          isActive && "pl-[10px]",
        )}
      >
        <p className="text-sm font-medium text-white/90 truncate pr-6">
          {displayTitle(note.title)}
        </p>
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
          "h-7 w-7 shrink-0 mt-1.5 mr-1.5 text-white/35 hover:text-red-400 hover:bg-red-400/10",
          "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
          isActive && "opacity-100",
        )}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
});

const NotesSidebar = memo(function NotesSidebar({
  notes,
  filteredNotes,
  selectedId,
  searchQuery,
  isLoading,
  isCreating,
  onSearchChange,
  onSelect,
  onCreate,
  onDeleteRequest,
}: {
  notes: Note[];
  filteredNotes: Note[];
  selectedId: string | null;
  searchQuery: string;
  isLoading: boolean;
  isCreating: boolean;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDeleteRequest: (note: Note) => void;
}) {
  const hasNotes = notes.length > 0;
  const hasResults = filteredNotes.length > 0;

  return (
    <aside
      className="flex flex-col w-full lg:w-[280px] shrink-0 border-r border-[#ffffff10] bg-[#0a0a0f]"
      aria-label="Notes list"
    >
      <div className="p-4 space-y-3 border-b border-[#ffffff10]">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35 pointer-events-none"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search notes…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search notes"
            className="pl-9 h-9 bg-[#111118] border-[#ffffff10] text-white/90 placeholder:text-white/35 focus-visible:ring-[#7c5cfc]/40"
          />
        </div>
        <Button
          type="button"
          onClick={onCreate}
          disabled={isCreating}
          className="w-full bg-[#7c5cfc] hover:bg-[#6b4ce8] text-white shadow-[0_0_20px_-6px_rgba(124,92,252,0.6)]"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New Note
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 space-y-1">
          {isLoading ? (
            <div className="px-3 py-8 text-center text-sm text-white/40">
              Loading notes…
            </div>
          ) : !hasNotes ? (
            <SidebarEmptyState />
          ) : !hasResults ? (
            <SearchEmptyState query={searchQuery} />
          ) : (
            filteredNotes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                isActive={note.id === selectedId}
                onSelect={onSelect}
                onDeleteRequest={onDeleteRequest}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  );
});

function SidebarEmptyState() {
  return (
    <div className="px-3 py-10 text-center">
      <div className="inline-flex h-10 w-10 rounded-xl bg-[#7c5cfc]/10 border border-[#7c5cfc]/25 items-center justify-center mb-3">
        <FileText className="h-4 w-4 text-[#7c5cfc]" aria-hidden />
      </div>
      <p className="text-sm font-medium text-white/80">No notes yet</p>
      <p className="text-xs text-white/40 mt-1 leading-relaxed">
        Create your first note to start capturing ideas.
      </p>
    </div>
  );
}

function SearchEmptyState({ query }: { query: string }) {
  return (
    <div className="px-3 py-10 text-center">
      <p className="text-sm font-medium text-white/80">No matches</p>
      <p className="text-xs text-white/40 mt-1">
        Nothing found for &ldquo;{query.trim()}&rdquo;
      </p>
    </div>
  );
}

const NoteEditor = memo(function NoteEditor({
  note,
  onSaved,
  onClose,
}: {
  note: Note;
  onSaved: (note: Note) => void;
  onClose: () => void;
}) {
  const isPending = note.id.startsWith("temp-");
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
  const prevNoteIdRef = useRef(note.id);
  const persistRef = useRef<(() => Promise<void>) | null>(null);

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
    if (isPending || isSavingRef.current) return;

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
  }, [content, isPending, note.id, onSaved, subject, title]);

  useEffect(() => {
    persistRef.current = persist;
  }, [persist]);

  // Sync local draft when switching notes; preserve draft when temp id becomes real.
  useEffect(() => {
    const prevId = prevNoteIdRef.current;
    prevNoteIdRef.current = note.id;

    if (prevId.startsWith("temp-") && !note.id.startsWith("temp-")) {
      noteIdRef.current = note.id;
      queueMicrotask(() => {
        void persistRef.current?.();
      });
      return;
    }

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
    // note.title/content/subject intentionally omitted — only re-sync when id changes
  }, [note.id]);

  useEffect(() => {
    if (isPending) return;

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
  }, [title, content, subject, isPending, persist, clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handleSaveNow = () => {
    clearTimers();
    void persist();
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById(`note-content-${note.id}`)?.focus();
    }
  };

  const statusLabel =
    isPending
      ? "Creating…"
      : saveStatus === "saving"
        ? "Saving…"
        : saveStatus === "saved"
          ? "Saved"
          : saveStatus === "error"
            ? "Error saving"
            : null;

  return (
    <section
      className="flex flex-col flex-1 min-w-0 bg-[#0a0a0f]"
      aria-label="Note editor"
    >
      <header className="flex items-start justify-between gap-4 px-6 sm:px-10 pt-6 pb-4 border-b border-[#ffffff10]">
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
        <div className="flex items-center gap-2 shrink-0 pt-1">
          {statusLabel && (
            <span
              className={cn(
                "text-xs tabular-nums mr-1",
                saveStatus === "error"
                  ? "text-red-400"
                  : "text-white/40",
              )}
              role="status"
              aria-live="polite"
            >
              {statusLabel}
            </span>
          )}
          <Button
            type="button"
            onClick={handleSaveNow}
            disabled={isPending || saveStatus === "saving"}
            className="h-8 px-3.5 bg-[#7c5cfc] hover:bg-[#6b4ce8] text-white text-xs font-medium shadow-[0_0_16px_-4px_rgba(124,92,252,0.5)]"
          >
            Save
          </Button>
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

      <footer className="px-6 sm:px-10 py-4 border-t border-[#ffffff10]">
        <p className="text-xs text-white/35">
          Created {formatCreatedDate(note.created_at)}
        </p>
      </footer>
    </section>
  );
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
          Pick a note from the sidebar or create a new one to begin writing in
          your calm workspace.
        </p>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const filteredNotes = useMemo(
    () => notes.filter((n) => noteMatchesQuery(n, searchQuery)),
    [notes, searchQuery],
  );

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId],
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedId(null);
  }, []);

  const requestDelete = useCallback((note: Note) => {
    setNoteToDelete(note);
  }, []);

  const handleNoteSaved = useCallback((updated: Note) => {
    setNotes((prev) => {
      const next = prev.map((n) => (n.id === updated.id ? updated : n));
      return [...next].sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
    });
  }, []);

  const handleCreate = useCallback(async () => {
    if (isCreating) return;

    const tempId = `temp-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const optimistic: Note = {
      id: tempId,
      user_id: "",
      title: "",
      content: "",
      subject: "",
      created_at: now,
      updated_at: now,
    };

    setIsCreating(true);
    setNotes((prev) => [optimistic, ...prev]);
    setSelectedId(tempId);
    setSearchQuery("");

    const { data, error } = await createNote("", "", "");
    setIsCreating(false);

    if (error || !data) {
      setNotes((prev) => prev.filter((n) => n.id !== tempId));
      setSelectedId((current) => (current === tempId ? null : current));
      return;
    }

    setNotes((prev) => {
      const draft = prev.find((n) => n.id === tempId);
      const merged: Note = {
        ...data,
        title: draft?.title ?? data.title,
        content: draft?.content ?? data.content,
        subject: draft?.subject ?? data.subject,
      };
      return [merged, ...prev.filter((n) => n.id !== tempId)];
    });
    setSelectedId(data.id);
  }, [isCreating]);

  const handleRestore = useCallback((note: Note) => {
    setNotes((prev) => {
      const exists = prev.some((n) => n.id === note.id);
      const next = exists ? prev : [note, ...prev];
      return [...next].sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
    });
    setSelectedId(note.id);
  }, []);

  const handleDeleted = useCallback((id: string) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      setSelectedId((current) => (current === id ? null : current));
      return next;
    });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!noteToDelete) return;

    const target = noteToDelete;
    const id = target.id;

    if (id.startsWith("temp-")) {
      handleDeleted(id);
      setNoteToDelete(null);
      return;
    }

    setIsDeleting(true);
    handleDeleted(id);
    const { error } = await deleteNote(id);
    setIsDeleting(false);
    setNoteToDelete(null);

    if (error) {
      handleRestore(target);
    }
  }, [noteToDelete, handleDeleted, handleRestore]);

  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        void handleCreate();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleCreate]);

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
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        <NotesSidebar
          notes={notes}
          filteredNotes={filteredNotes}
          selectedId={selectedId}
          searchQuery={searchQuery}
          isLoading={isLoading}
          isCreating={isCreating}
          onSearchChange={setSearchQuery}
          onSelect={handleSelect}
          onCreate={() => void handleCreate()}
          onDeleteRequest={requestDelete}
        />
        {selectedNote ? (
          <NoteEditor
            note={selectedNote}
            onSaved={handleNoteSaved}
            onClose={handleClose}
          />
        ) : (
          <EditorEmptyState />
        )}
      </div>

      <AlertDialog
        open={noteToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setNoteToDelete(null);
        }}
      >
        <AlertDialogContent className="bg-[#111118] border-[#ffffff10]">
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
