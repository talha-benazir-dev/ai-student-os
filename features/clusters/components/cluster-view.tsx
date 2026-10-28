"use client";

import { WorkspaceIcon } from "@/components/workspace-icon";
import Link from "next/link";
import {
  ArrowLeft,
  CheckSquare,
  FileText,
  FolderOpen,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Cluster } from "@/features/clusters/types";
import type { Note } from "@/features/notes/types";
import type { Task } from "@/features/tasks/types";
import type { Flashcard } from "@/features/flashcards/types";
import type { Document } from "@/features/documents/types";
import { formatStudyHours } from "@/features/study-sessions/utils/format-study-hours";

interface ClusterViewProps {
  cluster: Cluster;
  studyMinutes: number;
  initialNotes: Note[];
  initialTasks: Task[];
  initialFlashcards: Flashcard[];
  initialDocuments: Document[];
}

interface SectionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  sectionTitle: string;
  count: number;
  featurePath: string;
  children: React.ReactNode;
}

function SectionCard({
  icon: Icon,
  sectionTitle,
  count,
  featurePath,
  children,
}: SectionCardProps) {
  return (
    <div className="cluster-resource">
      <div className="cluster-resource-heading">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{sectionTitle}</span>
          <span className="text-xs text-muted-foreground">({count})</span>
        </div>
        <Link
          href={`/${featurePath}`}
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          View all →
        </Link>
      </div>
      <div className="cluster-resource-content">{children}</div>
    </div>
  );
}

export function ClusterView({
  cluster,
  studyMinutes,
  initialNotes,
  initialTasks,
  initialFlashcards,
  initialDocuments,
}: ClusterViewProps) {
  const totalCount =
    initialNotes.length +
    initialTasks.length +
    initialFlashcards.length +
    initialDocuments.length;

  return (
    <div className="workspace-page">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/clusters"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Back to clusters"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="cluster-tile-icon" style={{ color: cluster.color }}>
            <WorkspaceIcon name="clusters" className="size-5" />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold">{cluster.name}</h1>
            <p className="text-sm text-muted-foreground">{totalCount} items</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-mono tabular-nums font-medium">
            {formatStudyHours(studyMinutes)}
          </p>
          <p className="text-xs text-muted-foreground">studied</p>
        </div>
      </div>

      <p className="mb-8 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Everything you’re learning about {cluster.name}, connected in one place.
        Open a note to continue, or choose an area to add something new.
      </p>
      <div className="cluster-map">
        <SectionCard
          icon={FileText}
          sectionTitle="Notes"
          count={initialNotes.length}
          featurePath="notes"
        >
          {initialNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No notes in this cluster yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {initialNotes.map((note) => (
                <Link
                  href={`/notes?note=${note.id}`}
                  key={note.id}
                  className="flex items-center justify-between border-b border-border/50 py-2 last:border-0 hover:text-primary"
                >
                  <span className="truncate text-sm">
                    {note.title || "Untitled"}
                  </span>
                  <span className="ml-4 shrink-0 text-xs text-muted-foreground">
                    {note.type}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={CheckSquare}
          sectionTitle="Tasks"
          count={initialTasks.length}
          featurePath="tasks"
        >
          {initialTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tasks in this cluster yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {initialTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 border-b border-border/50 py-2 last:border-0"
                >
                  <div
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      task.priority === "high"
                        ? "bg-red-400"
                        : task.priority === "medium"
                          ? "bg-yellow-400"
                          : "bg-green-400",
                    )}
                  />
                  <span
                    className={cn(
                      "flex-1 truncate text-sm",
                      task.completed && "text-muted-foreground line-through",
                    )}
                  >
                    {task.title}
                  </span>
                  {task.due_date && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {task.due_date}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={Layers}
          sectionTitle="Flashcards"
          count={initialFlashcards.length}
          featurePath="flashcards"
        >
          {initialFlashcards.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No flashcards in this cluster yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {initialFlashcards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between border-b border-border/50 py-2 last:border-0"
                >
                  <span className="flex-1 truncate text-sm">{card.front}</span>
                  <span
                    className={cn(
                      "ml-4 shrink-0 rounded-full px-2 py-0.5 text-xs",
                      card.difficulty === "easy"
                        ? "bg-green-500/15 text-green-400"
                        : card.difficulty === "hard"
                          ? "bg-red-500/15 text-red-400"
                          : "bg-yellow-500/15 text-yellow-400",
                    )}
                  >
                    {card.difficulty}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={FolderOpen}
          sectionTitle="Documents"
          count={initialDocuments.length}
          featurePath="documents"
        >
          {initialDocuments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No documents in this cluster yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {initialDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between border-b border-border/50 py-2 last:border-0"
                >
                  <span className="flex-1 truncate text-sm">{doc.title}</span>
                  <span className="ml-4 shrink-0 text-xs text-muted-foreground">
                    {doc.file_size
                      ? `${(doc.file_size / 1024 / 1024).toFixed(1)} MB`
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
