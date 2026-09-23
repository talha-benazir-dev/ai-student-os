"use client";

import { useEffect, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const tonightTasks = [
  { id: "t1", title: "Review Krebs cycle flashcards", detail: "Biology · 20 cards · 25 min" },
  { id: "t2", title: "Problem set 4 — eigenvectors", detail: "Math · Lec 12 · 45 min" },
  { id: "t3", title: "SN1 / SN2 mechanism drills", detail: "Chemistry · Ch. 4 · 35 min" },
];

const presets = [25, 45, 60];

function format(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function TonightPlan() {
  const [done, setDone] = useState<Set<string>>(new Set(["t1"]));
  const [minutes, setMinutes] = useState(45);
  const [left, setLeft] = useState(45 * 60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectPreset = (p: number) => {
    setMinutes(p);
    setLeft(p * 60);
    setFinished(false);
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    timer.current = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          setFinished(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running]);

  const toggle = (id: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const total = minutes * 60;
  const progress = 1 - left / total;
  const R = 52;
  const C = 2 * Math.PI * R;
  const doneCount = done.size;

  return (
    <section className="rounded-xl border border-border bg-card mb-6 overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            Tonight&apos;s plan
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {doneCount} of {tonightTasks.length} tasks done
            {finished ? " · focus block complete" : ""}
          </p>
        </div>
        <div className="h-1.5 w-28 rounded-full bg-accent overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(doneCount / tonightTasks.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Tasks */}
        <div className="divide-y divide-border">
          {tonightTasks.map((t) => {
            const isDone = done.has(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggle(t.id)}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-accent/30 transition-colors"
              >
                <Checkbox checked={isDone} tabIndex={-1} aria-label={t.title} />
                <span
                  className={cn(
                    "h-8 w-8 rounded-md flex items-center justify-center shrink-0 transition-colors",
                    isDone ? "bg-success/15 text-success" : "bg-accent text-muted-foreground",
                  )}
                >
                  <Check className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-[13px] font-medium truncate",
                      isDone && "line-through text-muted-foreground",
                    )}
                  >
                    {t.title}
                  </span>
                  <span className="block text-xs text-muted-foreground truncate">
                    {t.detail}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Focus timer */}
        <div className="p-5 flex items-center gap-5">
          <div className="relative h-32 w-32 shrink-0">
            <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
              <circle
                cx="60"
                cy="60"
                r={R}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r={R}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - progress)}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-semibold tabular-nums tracking-tight">
                {finished ? "Done" : format(left)}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {running ? "focusing" : finished ? "well done" : "ready"}
              </span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium">Deep focus block</div>
            <div className="text-xs text-muted-foreground mt-0.5 mb-3">
              One block, one subject, phone away.
            </div>
            <div className="inline-flex rounded-md border border-border p-0.5 text-xs mb-3">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => selectPreset(p)}
                  className={cn(
                    "px-2.5 py-1 rounded tabular-nums",
                    minutes === p
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {p}m
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  if (finished) {
                    setLeft(minutes * 60);
                    setFinished(false);
                  }
                  setRunning((r) => !r);
                }}
              >
                {running ? (
                  <>
                    <Pause className="h-3.5 w-3.5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />{" "}
                    {finished ? "Again" : left < total ? "Resume" : "Start"}
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setRunning(false);
                  setLeft(minutes * 60);
                  setFinished(false);
                }}
                aria-label="Reset timer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
