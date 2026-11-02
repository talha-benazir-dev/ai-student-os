"use client";

import { useEffect, useRef, useState } from "react";
import { Timer, Square, Play, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useClusters } from "@/providers/clusters-provider";
import { useStudySession } from "@/providers/study-session-provider";

function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function formatDurationLabel(durationMinutes: number) {
  const h = Math.floor(durationMinutes / 60);
  const m = durationMinutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function StudyTimer() {
  const { clusters } = useClusters();
  const {
    isRunning,
    isLoading,
    isHydrating,
    selectedCluster,
    setSelectedCluster,
    elapsedSeconds,
    start,
    stop,
  } = useStudySession();
  const [showClusterPicker, setShowClusterPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowClusterPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleStart() {
    const ok = await start();
    if (!ok) {
      toast.error("Failed to start session.");
      return;
    }
    toast.success("Session started. Stay focused.");
  }

  async function handleStop() {
    const durationMinutes = await stop();
    if (durationMinutes === null) {
      toast.error("Failed to save session.");
      return;
    }
    toast.success(
      `Session saved — ${formatDurationLabel(durationMinutes)} logged.`,
    );
  }

  const selectedClusterData = clusters.find((c) => c.id === selectedCluster);

  return (
    <div className="relative flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
      <Timer
        className={cn(
          "h-4 w-4 shrink-0",
          isRunning ? "text-primary" : "text-muted-foreground",
        )}
      />

      <span
        className={cn(
          "text-sm font-mono tabular-nums w-16",
          isRunning ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {formatTime(elapsedSeconds)}
      </span>

      {!isRunning && (
        <div ref={pickerRef} className="relative">
          <button
            onClick={() => setShowClusterPicker((p) => !p)}
            disabled={isHydrating}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-accent/50 disabled:opacity-50"
          >
            {selectedClusterData ? (
              <>
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: selectedClusterData.color }}
                />
                <span className="max-w-[80px] truncate">
                  {selectedClusterData.name}
                </span>
              </>
            ) : (
              <span>General</span>
            )}
            <ChevronDown className="h-3 w-3 shrink-0" />
          </button>

          {showClusterPicker && (
            <div className="absolute top-full left-0 mt-1 z-50 min-w-[140px] rounded-xl border border-border bg-card shadow-lg overflow-hidden">
              <button
                onClick={() => {
                  setSelectedCluster(null);
                  setShowClusterPicker(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-accent/50 transition-colors",
                  !selectedCluster && "text-primary",
                )}
              >
                General
              </button>
              {clusters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCluster(c.id);
                    setShowClusterPicker(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-accent/50 transition-colors",
                    selectedCluster === c.id && "text-primary",
                  )}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!isRunning ? (
        <button
          onClick={handleStart}
          disabled={isLoading || isHydrating}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          <Play className="h-3 w-3" />
          {isHydrating ? "Loading…" : isLoading ? "Starting…" : "Start"}
        </button>
      ) : (
        <button
          onClick={handleStop}
          disabled={isLoading}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
        >
          <Square className="h-3 w-3" />
          Stop
        </button>
      )}
    </div>
  );
}
