"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  Command as CommandIcon,
  FileText,
  Layers,
  Plus,
  Search,
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

type CommandPaletteContextValue = {
  openCommand: () => void;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null,
);

function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error(
      "useCommandPalette must be used within CommandPaletteProvider",
    );
  }
  return ctx;
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [commandOpen, setCommandOpen] = useState(false);
  const [clusterModalOpen, setClusterModalOpen] = useState(false);

  const openCommand = useCallback(() => setCommandOpen(true), []);

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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      const key = e.key.toLowerCase();

      if (key === "k") {
        e.preventDefault();
        setCommandOpen(true);
        return;
      }

      if (!commandOpen) return;

      const action = CREATE_ACTIONS.find(
        (item) => item.shortcut?.toLowerCase() === key,
      );
      if (action) {
        e.preventDefault();
        runAction(action);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commandOpen, runAction]);

  return (
    <CommandPaletteContext.Provider value={{ openCommand }}>
      {children}

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
    </CommandPaletteContext.Provider>
  );
}

export function DashboardCreateMenu() {
  const { openCommand } = useCommandPalette();

  return (
    <Button
      type="button"
      onClick={openCommand}
      className="h-9 px-3 rounded-lg bg-gradient-violet text-white text-sm font-medium gap-1.5 shadow-[0_0_20px_-4px_oklch(0.66_0.21_295/0.6)] hover:scale-[1.02] transition hover:bg-gradient-violet"
    >
      <Plus className="h-4 w-4" />
      New
    </Button>
  );
}

export function DashboardCommandSearch() {
  const { openCommand } = useCommandPalette();

  return (
    <div className="relative mb-6 sm:mb-7 group">
      <button
        type="button"
        onClick={openCommand}
        className="relative w-full rounded-xl border border-border bg-card hover:border-primary/30 focus-visible:border-primary/40 focus-visible:shadow-[0_0_0_3px_oklch(0.66_0.21_295/0.12)] transition text-left cursor-pointer"
      >
        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <span className="block w-full bg-transparent pl-10 sm:pl-11 pr-16 sm:pr-32 py-3 sm:py-3.5 text-sm text-muted-foreground">
          Search or ask Nucleus AI…
        </span>
        <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          <span className="text-xs text-muted-foreground hidden lg:inline">
            Try
          </span>
          <span className="text-xs px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary-soft hidden lg:inline">
            summarize biology ch.3
          </span>
          <kbd
            suppressHydrationWarning
            className="font-mono text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 flex items-center gap-0.5"
          >
            <CommandIcon className="h-2.5 w-2.5" /> K
          </kbd>
        </div>
      </button>
    </div>
  );
}
