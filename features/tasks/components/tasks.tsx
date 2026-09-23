"use client";

import { useState } from "react";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { Plus, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  detail: string;
  time: string;
  priority: "high" | "medium" | "low";
  group: string;
};

const initial: Task[] = [
  { id: "1", title: "Review Krebs cycle flashcards", detail: "Biology · 20 cards", time: "25 min", priority: "high", group: "Today" },
  { id: "2", title: "Problem set 4 — eigenvectors", detail: "Math · Lec 12", time: "45 min", priority: "high", group: "Today" },
  { id: "3", title: "Summarize Cold War chapter", detail: "History · Ch. 9", time: "30 min", priority: "medium", group: "Today" },
  { id: "4", title: "Lab report — friction coefficients", detail: "Physics · verify second reading", time: "60 min", priority: "medium", group: "Tomorrow" },
  { id: "5", title: "SN1 / SN2 mechanism drills", detail: "Chemistry · Ch. 4", time: "35 min", priority: "medium", group: "Tomorrow" },
  { id: "6", title: "Pacific theater essay outline", detail: "History · 800 words", time: "50 min", priority: "low", group: "Later this week" },
  { id: "7", title: "Spaced review — mitosis deck", detail: "Biology · due Friday", time: "15 min", priority: "low", group: "Later this week" },
];

const dot = {
  high: "bg-destructive",
  medium: "bg-orange-400",
  low: "bg-muted-foreground",
} as const;

const order = ["Today", "Tomorrow", "Later this week"];

export default function TasksPage() {
  const [tasks, setTasks] = useState(initial);
  const [done, setDone] = useState<Set<string>>(new Set(["3"]));
  const [draft, setDraft] = useState("");

  const toggle = (id: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const add = () => {
    const title = draft.trim();
    if (!title) return;
    setTasks((t) => [
      ...t,
      { id: `n-${Date.now()}`, title, detail: "Inbox · estimate later", time: "—", priority: "low", group: "Today" },
    ]);
    setDraft("");
  };

  const totalDone = done.size;

  return (
    <AppShell showAI={false}>
      <div className="px-6 lg:px-8 py-6 mx-auto w-full max-w-3xl">
        <PageHeader
          title="Tasks"
          description={`${tasks.length} tasks · ${totalDone} complete · 2 focus blocks today.`}
          actions={
            <>
              <Button variant="outline" size="sm">
                <Timer className="h-4 w-4" /> Start focus
              </Button>
              <Button size="sm" onClick={() => document.getElementById("new-task")?.focus()}>
                <Plus className="h-4 w-4" /> Add task
              </Button>
            </>
          }
        />

        <div className="flex gap-2 mb-6">
          <Input
            id="new-task"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Add a task for today, then press Enter…"
            className="text-[13px]"
          />
          <Button size="sm" onClick={add} className="shrink-0 h-9">
            Add
          </Button>
        </div>

        <div className="space-y-6">
          {order.map((g) => {
            const group = tasks.filter((t) => t.group === g);
            if (!group.length) return null;
            const gDone = group.filter((t) => done.has(t.id)).length;
            return (
              <section key={g}>
                <div className="flex items-baseline justify-between mb-2">
                  <h2 className="text-sm font-semibold tracking-tight">{g}</h2>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {gDone}/{group.length} done
                  </span>
                </div>
                <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
                  {group.map((t) => {
                    const isDone = done.has(t.id);
                    return (
                      <button
                        key={t.id}
                        onClick={() => toggle(t.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors text-left"
                      >
                        <Checkbox checked={isDone} tabIndex={-1} aria-label={t.title} />
                        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dot[t.priority])} />
                        <span className="min-w-0 flex-1">
                          <span className={cn("block text-[13px] font-medium truncate", isDone && "line-through text-muted-foreground")}>
                            {t.title}
                          </span>
                          <span className="block text-xs text-muted-foreground truncate">
                            {t.detail}
                          </span>
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                          {t.time}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
