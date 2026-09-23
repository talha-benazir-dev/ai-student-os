"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  LayoutDashboard,
  FileText,
  CheckSquare,
  FolderOpen,
  Layers,
  Sparkles,
  BarChart3,
  Settings,
  Timer,
  Plus,
} from "lucide-react";

const pages = [
  { icon: LayoutDashboard, label: "Go to Dashboard", href: "/dashboard" },
  { icon: FileText, label: "Go to Notes", href: "/notes" },
  { icon: CheckSquare, label: "Go to Tasks", href: "/tasks" },
  { icon: FolderOpen, label: "Go to Documents", href: "/documents" },
  { icon: Layers, label: "Go to Flashcards", href: "/flashcards" },
  { icon: Sparkles, label: "Go to AI Workspace", href: "/ai" },
  { icon: BarChart3, label: "Go to Analytics", href: "/analytics" },
  { icon: Settings, label: "Go to Settings", href: "/settings" },
];

const actions = [
  { icon: Timer, label: "Start a 45-minute focus block", href: "/dashboard" },
  { icon: Plus, label: "Review tonight's plan", href: "/dashboard" },
  { icon: Layers, label: "Start flashcard review", href: "/flashcards" },
  { icon: Sparkles, label: "Ask Nucleus AI", href: "/ai" },
];

export function CommandBar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5 mb-6 hover:border-ring transition-colors text-left"
      >
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground flex-1">
          Search notes, files, or jump anywhere…
        </span>
        <kbd className="font-mono text-[11px] text-muted-foreground border border-border rounded px-1.5 py-0.5 shrink-0">
          ⌘K
        </kbd>
      </button>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Command menu"
        className="fixed left-1/2 top-[20%] -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg rounded-xl border border-border bg-popover shadow-2xl overflow-hidden z-50"
        overlayClassName="fixed inset-0 bg-black/60 z-50"
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Command.Input
            placeholder="Type a page or action…"
            className="w-full bg-transparent py-3.5 text-sm placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
            Nothing found. Try &quot;flashcards&quot; or &quot;focus&quot;.
          </Command.Empty>
          <Command.Group
            heading="Pages"
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground"
          >
            {pages.map(({ icon: Icon, label, href }) => (
              <Command.Item
                key={label}
                onSelect={() => go(href)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm cursor-pointer data-[selected=true]:bg-accent"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group
            heading="Actions"
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground"
          >
            {actions.map(({ icon: Icon, label, href }) => (
              <Command.Item
                key={label}
                onSelect={() => go(href)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm cursor-pointer data-[selected=true]:bg-accent"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command.Dialog>
    </>
  );
}
