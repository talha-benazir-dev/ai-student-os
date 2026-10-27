"use client";

import { createContext, useContext } from "react";
import { useStoredPreference } from "@/hooks/use-stored-preference";
import { LayoutGrid, List, Sparkles, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const NotesViewContext = createContext<{
  view: "grid" | "list";
  setView: (view: "grid" | "list") => void;
}>({
  view: "grid",
  setView: () => {},
});

type Note = {
  id: string;
  title: string;
  content: string | null;
  updated_at: string;
};

type Props = { notes: Note[] };

function NotesViewProvider({ children }: { children: React.ReactNode }) {
  const [storedView, setStoredView] = useStoredPreference("nucleus_notes_view", "list");
  const view = storedView === "grid" ? "grid" : "list";

  const handleToggle = (newView: "grid" | "list") => {
    setStoredView(newView);
  };

  return (
    <NotesViewContext.Provider value={{ view, setView: handleToggle }}>
      {children}
    </NotesViewContext.Provider>
  );
}

export function NotesViewToggle() {
  const { view, setView } = useContext(NotesViewContext);

  return (
    <div className="flex items-center gap-1">
      <button
        aria-label="Show notes as cards"
        onClick={() => setView("grid")}
        className={`p-1.5 rounded-md transition ${
          view === "grid"
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        aria-label="Show notes as a list"
        onClick={() => setView("list")}
        className={`p-1.5 rounded-md transition ${
          view === "list"
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        }`}
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function RecentNotes({ notes }: Props) {
  return (
    <NotesViewProvider>
      <RecentNotesContent notes={notes} />
    </NotesViewProvider>
  );
}

export function RecentNotesSection({ notes }: Props) {
  return (
    <NotesViewProvider>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold">Recent notes</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Picked up where you left off
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NotesViewToggle />
          <Link
            href="/notes"
            className="text-xs text-primary-soft hover:text-foreground transition inline-flex items-center gap-1"
          >
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
      <RecentNotesContent notes={notes} />
    </NotesViewProvider>
  );
}

function RecentNotesContent({ notes }: Props) {
  const { view } = useContext(NotesViewContext);

  return (
    <>
      {notes.length > 0 ? (
        view === "grid" ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                href={`/notes?note=${encodeURIComponent(note.id)}`}
                title={note.title || "Untitled"}
                time={getRelativeTime(note.updated_at)}
                body={extractPlainText(note.content)}
                tags={[]}
                ai={false}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notes.map((note) => (
              <NoteCardList
                key={note.id}
                href={`/notes?note=${encodeURIComponent(note.id)}`}
                title={note.title || "Untitled"}
                time={getRelativeTime(note.updated_at)}
                tags={[]}
                ai={false}
              />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-10 px-4 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
          <p>Capture a thought from your latest lesson.</p>
          <Link href="/notes?new=note" className="mt-3 inline-flex text-xs text-primary hover:underline">Write your first note</Link>
        </div>
      )}
    </>
  );
}

function getRelativeTime(dateString: string): string {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function extractPlainText(content: string | null): string {
  if (!content) return "Open to continue reading.";
  // Strip markdown headings, bold, italic, code blocks, links
  const plain = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\n+/g, " ")
    .trim();
  return plain.length > 120
    ? plain.substring(0, 120) + "..."
    : plain || "No content yet.";
}

function NoteCard({
  href,
  title,
  time,
  body,
  tags,
  ai,
}: {
  href: string;
  title: string;
  time: string;
  body: string;
  tags: string[];
  ai?: boolean;
}) {
  return (
    <Link href={href} className="block rounded-lg border border-border bg-background/50 p-4 hover:border-primary/30 hover:bg-background transition-colors group">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="text-sm font-medium leading-tight">{title}</h3>
        <span className="text-[11px] text-muted-foreground shrink-0">
          {time}
        </span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{body}</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        {tags.map((t) => (
          <span
            key={t}
            className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-white/5 text-muted-foreground"
          >
            {t}
          </span>
        ))}
        {ai && (
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-success/10 border border-success/25 text-success inline-flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5" /> AI summary
          </span>
        )}
      </div>
    </Link>
  );
}

function NoteCardList({
  href,
  title,
  time,
  tags,
  ai,
}: {
  href: string;
  title: string;
  time: string;
  tags: string[];
  ai?: boolean;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 py-3 px-3 rounded-md border border-border bg-background/50 hover:border-primary/30 hover:bg-background transition-colors group">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-medium truncate">{title}</h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            {tags.map((t) => (
              <span
                key={t}
                className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-white/5 text-muted-foreground"
              >
                {t}
              </span>
            ))}
            {ai && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 border border-success/25 text-success inline-flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" /> AI summary
              </span>
            )}
          </div>
        </div>
      </div>
      <span className="text-[11px] text-muted-foreground shrink-0">{time}</span>
    </Link>
  );
}
