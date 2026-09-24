"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ArrowUpRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleTask } from "@/features/tasks/actions/tasks.actions";
import type { Task } from "@/features/tasks/types";
import { cn } from "@/lib/utils";

export type TonightTask = Pick<Task, "id" | "title" | "priority" | "due_date" | "completed">;

const dot = {
  high: "bg-destructive",
  medium: "bg-orange-400",
  low: "bg-muted-foreground",
} as const;

export function TonightPanel({ tasks }: { tasks: TonightTask[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (tasks.length === 0) return null;

  const doneCount = tasks.filter((t) => t.completed).length;

  const onToggle = (task: TonightTask) => {
    startTransition(async () => {
      await toggleTask(task.id, !task.completed);
      router.refresh();
    });
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">Tonight&apos;s plan</h2>
          <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
            {doneCount} of {tasks.length} done · highest priority first
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-1.5 w-24 rounded-full bg-accent overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(doneCount / tasks.length) * 100}%` }}
            />
          </div>
          <Link
            href="/tasks"
            className="text-xs text-muted-foreground hover:text-foreground transition inline-flex items-center gap-1"
          >
            All tasks <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
      <div className="divide-y divide-border rounded-xl border border-border/60 overflow-hidden">
        {tasks.map((t) => (
          <button
            key={t.id}
            onClick={() => onToggle(t)}
            disabled={pending}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/30 transition-colors disabled:opacity-60"
          >
            <Checkbox checked={t.completed} tabIndex={-1} aria-label={t.title} />
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dot[t.priority])} />
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block text-sm font-medium truncate",
                  t.completed && "line-through text-muted-foreground",
                )}
              >
                {t.title}
              </span>
            </span>
            {t.completed ? (
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-success/15 text-success shrink-0">
                <Check className="h-3.5 w-3.5" />
              </span>
            ) : (
              t.due_date && (
                <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                  {new Date(t.due_date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
