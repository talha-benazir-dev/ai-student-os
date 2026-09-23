import { AppShell } from "@/features/dashboard/components/app-shell";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { Plus, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type Task = {
  title: string;
  detail: string;
  time: string;
  priority: "high" | "medium" | "low";
  done?: boolean;
};

const groups: { heading: string; tasks: Task[] }[] = [
  {
    heading: "Today",
    tasks: [
      { title: "Review Krebs cycle flashcards", detail: "Biology · 20 cards", time: "25 min", priority: "high" },
      { title: "Problem set 4 — eigenvectors", detail: "Math · Lec 12", time: "45 min", priority: "high" },
      { title: "Summarize Cold War chapter", detail: "History · Ch. 9", time: "30 min", priority: "medium", done: true },
    ],
  },
  {
    heading: "Tomorrow",
    tasks: [
      { title: "Lab report — friction coefficients", detail: "Physics · verify μ₂", time: "60 min", priority: "medium" },
      { title: "SN1 / SN2 mechanism drills", detail: "Chemistry · Ch. 4", time: "35 min", priority: "medium" },
    ],
  },
  {
    heading: "Later this week",
    tasks: [
      { title: "Pacific theater essay outline", detail: "History · 800 words", time: "50 min", priority: "low" },
      { title: "Spaced review — mitosis deck", detail: "Biology · due Friday", time: "15 min", priority: "low" },
    ],
  },
];

const dot = {
  high: "bg-destructive",
  medium: "bg-orange-400",
  low: "bg-muted-foreground",
} as const;

export default function TasksPage() {
  return (
    <AppShell showAI={false}>
      <div className="px-6 lg:px-8 py-6 mx-auto w-full max-w-3xl">
        <PageHeader
          title="Tasks"
          description="7 tasks this week · 1 complete · 2 focus blocks today."
          actions={
            <>
              <Button variant="outline" size="sm">
                <Timer className="h-4 w-4" /> Start focus
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4" /> Add task
              </Button>
            </>
          }
        />

        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g.heading}>
              <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-sm font-semibold tracking-tight">
                  {g.heading}
                </h2>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {g.tasks.filter((t) => t.done).length}/{g.tasks.length} done
                </span>
              </div>
              <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
                {g.tasks.map((t) => (
                  <div
                    key={t.title}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors"
                  >
                    <Checkbox checked={t.done} aria-label={t.title} />
                    <span
                      className={cn("h-1.5 w-1.5 rounded-full shrink-0", dot[t.priority])}
                    />
                    <div className="min-w-0 flex-1">
                      <div
                        className={cn(
                          "text-[13px] font-medium truncate",
                          t.done && "line-through text-muted-foreground",
                        )}
                      >
                        {t.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {t.detail}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                      {t.time}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
