"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ArrowUpRight } from "lucide-react";
import {
  WorkspaceIcon,
  type WorkspaceIconName,
} from "@/components/workspace-icon";
import { useClusters } from "@/providers/clusters-provider";

const sections: Record<
  string,
  {
    name: string;
    icon: WorkspaceIconName;
    title: string;
    tip: string;
    next: string;
    href: string;
  }
> = {
  dashboard: {
    name: "Home",
    icon: "home",
    title: "One thing at a time.",
    tip: "Choose a small next step. Your workspace will still be here when you’re ready for the rest.",
    next: "Open your clusters",
    href: "/clusters",
  },
  clusters: {
    name: "Clusters",
    icon: "clusters",
    title: "It all connects.",
    tip: "A cluster brings one area of learning together: its notes, tasks, reading, and recall cards.",
    next: "Capture an idea",
    href: "/notes?new=note",
  },
  tasks: {
    name: "Tasks",
    icon: "tasks",
    title: "Make it achievable.",
    tip: "“Explain cell transport” is easier to start than “Study Biology”. Give each task a clear finish.",
    next: "Review your notes",
    href: "/notes",
  },
  documents: {
    name: "Documents",
    icon: "documents",
    title: "Read with a question.",
    tip: "Decide what you want to understand before opening a chapter. Capture the answer in your own words.",
    next: "Write a note",
    href: "/notes?new=note",
  },
  flashcards: {
    name: "Flashcards",
    icon: "review",
    title: "Try remembering first.",
    tip: "Pause before revealing an answer. That moment of recall is part of learning, even when it feels difficult.",
    next: "Find an idea to revisit",
    href: "/notes",
  },
  analytics: {
    name: "Analytics",
    icon: "analytics",
    title: "Notice your rhythm.",
    tip: "Look for patterns over time. A quiet day is a useful signal, not a score to make up for.",
    next: "Choose your next step",
    href: "/dashboard",
  },
  settings: {
    name: "Settings",
    icon: "settings",
    title: "Make room for you.",
    tip: "Set your workspace up around the way you study. You can change these choices whenever you need.",
    next: "Back to your work",
    href: "/dashboard",
  },
  ai: {
    name: "Study assistant",
    icon: "assistant",
    title: "Stay curious.",
    tip: "Ask for an explanation, then try putting it in your own words.",
    next: "Open your notes",
    href: "/notes",
  },
  notes: {
    name: "Notes",
    icon: "notes",
    title: "Keep it small.",
    tip: "Understand one concept before moving on to the next.",
    next: "Open your clusters",
    href: "/clusters",
  },
};

export function WorkspaceBreadcrumb() {
  const pathname = usePathname();
  const { clusters } = useClusters();
  const section = sections[pathname.split("/")[1]] ?? sections.dashboard;
  const cluster = pathname.startsWith("/clusters/")
    ? clusters.find((c) => c.id === pathname.split("/")[2])
    : null;
  return (
    <div className="workspace-topbar">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-3">
        <WorkspaceIcon name={section.icon} className="size-3.5 shrink-0" />
        {cluster ? (
          <>
            <Link href="/clusters">Clusters</Link>
            <ChevronRight className="size-3" />
            <span className="truncate text-foreground">{cluster.name}</span>
          </>
        ) : (
          <span>{section.name}</span>
        )}
      </nav>
      <span className="hidden sm:inline text-[11px] text-muted-foreground/70">
        Your personal workspace
      </span>
    </div>
  );
}

export function WorkspaceContext() {
  const pathname = usePathname();
  const { clusters } = useClusters();
  const section = sections[pathname.split("/")[1]] ?? sections.dashboard;
  if (pathname.startsWith("/notes") || pathname.startsWith("/ai")) return null;
  return (
    <aside className="workspace-context" aria-label="Study context">
      <div>
        <p className="workspace-context-label">A little direction</p>
        <h2>{section.title}</h2>
        <p>{section.tip}</p>
      </div>
      <div className="workspace-context-section">
        <p className="workspace-context-label">Continue learning</p>
        <Link href={section.href} className="workspace-context-link">
          <WorkspaceIcon name="notes" className="size-4 shrink-0" />
          {section.next}
          <ArrowUpRight className="size-3 shrink-0" />
        </Link>
      </div>
      <div className="workspace-context-section">
        <p className="workspace-context-label">Your clusters</p>
        {clusters.slice(0, 5).map((c) => (
          <Link
            key={c.id}
            href={`/clusters/${c.id}`}
            className="workspace-context-link"
          >
            <span
              className="size-1.5 shrink-0 rounded-sm"
              style={{ backgroundColor: c.color }}
            />
            <span className="truncate">{c.name}</span>
          </Link>
        ))}
        {clusters.length === 0 && (
          <Link href="/clusters?new=cluster" className="workspace-context-link">
            Create your first cluster
            <ArrowUpRight className="size-3" />
          </Link>
        )}
      </div>
      <p className="workspace-context-signoff">A place to make sense of it.</p>
    </aside>
  );
}
