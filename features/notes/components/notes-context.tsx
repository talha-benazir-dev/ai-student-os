"use client";

import Link from "next/link";
import { WorkspaceIcon } from "@/components/workspace-icon";
import type { Note } from "@/features/notes/types";
import type { Cluster } from "@/features/clusters/types";

export function NotesContext({
  note,
  notes,
  clusters,
  onSelect,
}: {
  note: Note | null;
  notes: Note[];
  clusters: Cluster[];
  onSelect: (note: Note) => void;
}) {
  const cluster = clusters.find((c) => c.id === note?.cluster_id);
  const related = note?.cluster_id
    ? notes
        .filter((n) => n.cluster_id === note.cluster_id && n.id !== note.id)
        .slice(0, 4)
    : [];
  return (
    <aside
      className="workspace-context notes-context"
      aria-label="Note context"
    >
      <div>
        <p className="workspace-context-label">A good place to start</p>
        <h2>Keep it small.</h2>
        <p>
          Understand one concept before moving on to the next. Explain it in
          your own words.
        </p>
      </div>
      {cluster && (
        <div className="workspace-context-section">
          <p className="workspace-context-label">In this cluster</p>
          <Link
            href={`/clusters/${cluster.id}`}
            className="workspace-context-link"
          >
            <WorkspaceIcon name="clusters" className="size-4" />
            <span className="truncate">{cluster.name}</span>
          </Link>
          {related.map((n) => (
            <button
              type="button"
              key={n.id}
              onClick={() => onSelect(n)}
              className="workspace-context-link w-full text-left"
            >
              <WorkspaceIcon name="notes" className="size-4 shrink-0" />
              <span className="truncate">{n.title || "Untitled"}</span>
            </button>
          ))}
        </div>
      )}
      <div className="workspace-context-section">
        <p className="workspace-context-label">Put it into practice</p>
        <Link href="/flashcards?new=card" className="workspace-context-link">
          <WorkspaceIcon name="review" className="size-4 shrink-0" />
          Create a recall card
        </Link>
        <Link href="/tasks?new=task" className="workspace-context-link">
          <WorkspaceIcon name="tasks" className="size-4 shrink-0" />
          Plan a small next step
        </Link>
      </div>
      <p className="workspace-context-signoff">It all connects.</p>
    </aside>
  );
}
