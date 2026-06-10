"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Check, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_ROWS = 4;

type ClusterOption = {
  id: string;
  name: string;
  color: string;
};

type ChatInputProps = {
  onSend: (message: string) => void;
  isLoading: boolean;
  clusters: ClusterOption[];
  selectedClusterName: string | null;
  selectedClusterId: string | null;
  curriculumMode: boolean;
  onClusterSelect: (id: string | null, name: string | null) => void;
  onCurriculumToggle: (val: boolean) => void;
};

export function ChatInput({
  onSend,
  isLoading,
  clusters,
  selectedClusterName,
  selectedClusterId,
  curriculumMode,
  onClusterSelect,
  onCurriculumToggle,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedCluster = clusters.find((c) => c.id === selectedClusterId);
  const showTopRow = Boolean(selectedClusterName) || curriculumMode;

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    const lineHeight = Number.parseFloat(getComputedStyle(el).lineHeight) || 20;
    const maxHeight = lineHeight * MAX_ROWS;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [value, resizeTextarea]);

  useEffect(() => {
    if (!popoverOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        popoverRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setPopoverOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [popoverOpen]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClusterSelect = (id: string | null, name: string | null) => {
    onClusterSelect(id, name);
    setPopoverOpen(false);
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[#ffffff10] bg-[#0f0f17] p-3">
      {showTopRow ? (
        <div className="flex flex-wrap items-center gap-2">
          {selectedClusterName ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#7c5cfc30] bg-[#7c5cfc1a] px-2.5 py-1 text-xs text-violet-300">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{
                  backgroundColor: selectedCluster?.color ?? "#7c5cfc",
                }}
              />
              {selectedClusterName}
              <button
                type="button"
                onClick={() => onClusterSelect(null, null)}
                className="inline-flex items-center justify-center opacity-70 hover:opacity-100"
                aria-label="Clear cluster"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ) : null}

          {curriculumMode ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#7c5cfc30] bg-[#7c5cfc1a] px-2.5 py-1 text-xs text-violet-300">
              Curriculum
              <button
                type="button"
                onClick={() => onCurriculumToggle(false)}
                className="inline-flex items-center justify-center opacity-70 hover:opacity-100"
                aria-label="Disable curriculum mode"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        <div className="relative">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setPopoverOpen((open) => !open)}
            className="rounded-xl border border-[#ffffff10] bg-[#ffffff08] p-2 hover:bg-[#ffffff12]"
            aria-label="Open options"
          >
            <Plus className="h-4 w-4 text-white" />
          </button>

          {popoverOpen ? (
            <div
              ref={popoverRef}
              className="absolute bottom-14 left-0 z-50 w-64 rounded-2xl border border-[#ffffff10] bg-[#0f0f17] p-3 shadow-xl"
            >
              <p className="mb-2 text-xs font-medium text-white/40">
                Assign to cluster
              </p>
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => handleClusterSelect(null, null)}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white hover:bg-[#ffffff08]"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-white/30" />
                  General
                  {selectedClusterId === null ? (
                    <Check className="ml-auto h-3.5 w-3.5 text-violet-400" />
                  ) : null}
                </button>
                {clusters.map((cluster) => (
                  <button
                    key={cluster.id}
                    type="button"
                    onClick={() =>
                      handleClusterSelect(cluster.id, cluster.name)
                    }
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white hover:bg-[#ffffff08]"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: cluster.color }}
                    />
                    {cluster.name}
                    {selectedClusterId === cluster.id ? (
                      <Check className="ml-auto h-3.5 w-3.5 text-violet-400" />
                    ) : null}
                  </button>
                ))}
              </div>

              <div className="my-2 border-t border-[#ffffff08]" />

              <p className="mb-2 text-xs font-medium text-white/40">
                Curriculum mode
              </p>
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-sm text-white">Align to my curriculum</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={curriculumMode}
                  onClick={() => onCurriculumToggle(!curriculumMode)}
                  className={cn(
                    "relative h-5 w-9 rounded-full transition-colors",
                    curriculumMode ? "bg-[#7c5cfc]" : "bg-[#ffffff15]",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                      curriculumMode ? "left-4" : "left-0.5",
                    )}
                  />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything…"
          autoComplete="off"
          disabled={isLoading}
          rows={1}
          className={cn(
            "min-h-[36px] flex-1 resize-none bg-transparent text-sm text-white outline-none",
            "placeholder:text-white/35 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || !value.trim()}
          className="rounded-xl bg-[#7c5cfc] p-2 hover:bg-[#8a6dfd] disabled:opacity-40"
          aria-label="Send message"
        >
          <ArrowUp className="h-4 w-4 text-white" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
