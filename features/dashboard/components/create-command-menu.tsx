"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  FileText,
  Layers,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { CreateClusterModal } from "@/features/clusters/components/create-cluster-modal";

type CreateAction = {
  id: string;
  label: string;
  description: string;
  icon: typeof Plus;
  shortcut?: string;
  keywords: string[];
  href?: string;
  action?: "cluster";
};

const CREATE_ACTIONS: CreateAction[] = [
  {
    id: "task",
    label: "New Task",
    description: "Add a study mission",
    icon: CheckSquare,
    shortcut: "T",
    keywords: ["task", "todo", "mission"],
    href: "/tasks?new=task",
  },
  {
    id: "note",
    label: "New Note",
    description: "Text, markdown, or canvas",
    icon: FileText,
    shortcut: "N",
    keywords: ["note", "write", "readme", "canvas"],
    href: "/notes?new=note",
  },
  {
    id: "flashcard",
    label: "New Flashcard",
    description: "Spaced repetition card",
    icon: Sparkles,
    shortcut: "F",
    keywords: ["flashcard", "card", "review", "study"],
    href: "/flashcards?new=card",
  },
  {
    id: "cluster",
    label: "New Cluster",
    description: "Group tasks, notes, and cards",
    icon: Layers,
    shortcut: "C",
    keywords: ["cluster", "group", "folder", "subject"],
    action: "cluster",
  },
];

export function DashboardCreateMenu() {
  const router = useRouter();
  const [commandOpen, setCommandOpen] = useState(false);
  const [clusterModalOpen, setClusterModalOpen] = useState(false);

  const openCommand = useCallback(() => setCommandOpen(true), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openCommand();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openCommand]);

  const runAction = useCallback(
    (item: CreateAction) => {
      setCommandOpen(false);

      if (item.action === "cluster") {
        setClusterModalOpen(true);
        return;
      }

      if (item.href) {
        router.push(item.href);
      }
    },
    [router],
  );

  return (
    <>
      <Button
        type="button"
        onClick={openCommand}
        className="h-9 px-3 rounded-lg bg-gradient-violet text-white text-sm font-medium gap-1.5 shadow-[0_0_20px_-4px_oklch(0.66_0.21_295/0.6)] hover:scale-[1.02] transition hover:bg-gradient-violet"
      >
        <Plus className="h-4 w-4" />
        New
      </Button>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Create something in Nucleus…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Create">
            {CREATE_ACTIONS.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.keywords.join(" ")}`}
                  onSelect={() => runAction(item)}
                >
                  <Icon className="text-muted-foreground" />
                  <div className="flex flex-col min-w-0">
                    <span>{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </div>
                  {item.shortcut ? (
                    <CommandShortcut>⌘{item.shortcut}</CommandShortcut>
                  ) : null}
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigate">
            <CommandItem
              value="tasks notes flashcards documents"
              onSelect={() => {
                setCommandOpen(false);
                router.push("/tasks");
              }}
            >
              <CheckSquare className="text-muted-foreground" />
              <span>Go to Tasks</span>
            </CommandItem>
            <CommandItem
              value="notes library writing"
              onSelect={() => {
                setCommandOpen(false);
                router.push("/notes");
              }}
            >
              <FileText className="text-muted-foreground" />
              <span>Go to Notes</span>
            </CommandItem>
            <CommandItem
              value="flashcards study review"
              onSelect={() => {
                setCommandOpen(false);
                router.push("/flashcards");
              }}
            >
              <Sparkles className="text-muted-foreground" />
              <span>Go to Flashcards</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <CreateClusterModal
        open={clusterModalOpen}
        onOpenChange={setClusterModalOpen}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
