"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Check, ImagePlus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAIDrawer } from "@/providers/ai-drawer-provider";
import { useClusters } from "@/providers/clusters-provider";
import { ChatAttachmentStrip } from "@/features/ai/components/chat-attachment-strip";
import { useAutoResizeTextarea } from "@/features/ai/hooks/use-auto-resize-textarea";
import { useChatAttachments } from "@/features/ai/hooks/use-chat-attachments";
import {
  CHAT_COMPOSER_ATTACH_BUTTON_CLASS,
  CHAT_COMPOSER_SEND_BUTTON_CLASS,
  CHAT_COMPOSER_TEXTAREA_CLASS,
  chatComposerRowClass,
} from "@/features/ai/lib/chat-composer-styles";
import type { ChatAttachment } from "@/features/ai/types";
import { toast } from "sonner";

const MAX_ROWS = 4;

const slashCommands = [
  { command: "/studypack", description: "Generate a study pack from a document" },
  { command: "/autopilot", description: "Set up a full study plan for a cluster" },
  { command: "/note", description: "Create a note" },
  { command: "/task", description: "Create a task" },
  { command: "/flashcard", description: "Create flashcards" },
];

type ClusterOption = {
  id: string;
  name: string;
  color: string;
};

type ChatInputProps = {
  onSend: (message: string, attachments?: ChatAttachment[]) => void;
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
  const { openDrawer } = useAIDrawer();
  const { clusters: contextClusters } = useClusters();
  const [value, setValue] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [slashOpen, setSlashOpen] = useState(false);
  const [autopilotPickerOpen, setAutopilotPickerOpen] = useState(false);
  const { textareaRef, isMultiline } = useAutoResizeTextarea(value, MAX_ROWS);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const slashRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    pending,
    isUploading,
    hasAttachments,
    addFile,
    removeAttachment,
    handlePaste,
    uploadAll,
  } = useChatAttachments();

  const selectedCluster = clusters.find((c) => c.id === selectedClusterId);
  const showTopRow = Boolean(selectedClusterName) || curriculumMode;
  const canSend =
    !isLoading && !isUploading && (value.trim().length > 0 || hasAttachments);
  const showSlashMenu =
    slashOpen && /^\/\S*$/.test(value) && value.length > 0;
  const filteredSlashCommands = slashCommands.filter(
    (item) => value === "/" || item.command.startsWith(value),
  );

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

  useEffect(() => {
    if (!slashOpen && !autopilotPickerOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        slashRef.current?.contains(target) ||
        textareaRef.current?.contains(target)
      ) {
        return;
      }
      setSlashOpen(false);
      setAutopilotPickerOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [slashOpen, autopilotPickerOpen, textareaRef]);

  const handleSlashSelect = (command: string) => {
    if (command === "/studypack") {
      setValue("");
      setSlashOpen(false);
      // TODO: replace with document picker when document selector UI is built
      openDrawer({ type: "manual" });
      return;
    }

    if (command === "/autopilot") {
      setValue("");
      setSlashOpen(false);

      if (contextClusters.length === 0) {
        setValue("You have no clusters yet. Create one first.");
        return;
      }

      if (contextClusters.length === 1) {
        openDrawer({
          type: "cluster",
          clusterIds: [contextClusters[0].id],
          clusterNames: [contextClusters[0].name],
        });
        return;
      }

      setAutopilotPickerOpen(true);
      return;
    }

    setValue(`${command} `);
    setSlashOpen(false);
  };

  const handleAutopilotClusterSelect = (cluster: ClusterOption) => {
    openDrawer({
      type: "cluster",
      clusterIds: [cluster.id],
      clusterNames: [cluster.name],
    });
    setAutopilotPickerOpen(false);
  };

  const handleSend = async () => {
    const trimmed = value.trim();
    if ((!trimmed && !hasAttachments) || isLoading || isUploading) return;

    try {
      const attachments = await uploadAll();
      onSend(trimmed, attachments);
      setValue("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Image upload failed";
      toast.error(message);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      addFile(file);
    }
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      addFile(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleClusterSelect = (id: string | null, name: string | null) => {
    onClusterSelect(id, name);
    setPopoverOpen(false);
  };

  return (
    <div
      className="flex flex-col gap-2 rounded-2xl border border-[#ffffff10] bg-card p-3"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      {showTopRow ? (
        <div className="flex flex-wrap items-center gap-2">
          {selectedClusterName ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs text-primary-soft">
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
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs text-primary-soft">
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

      {autopilotPickerOpen ? (
        <div
          ref={slashRef}
          className="rounded-2xl border border-[#ffffff10] bg-card p-2 shadow-xl"
        >
          <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">
            Choose a cluster for Autopilot
          </p>
          <div className="flex max-h-48 flex-col gap-0.5 overflow-y-auto overscroll-contain">
            {contextClusters.map((cluster) => (
              <button
                key={cluster.id}
                type="button"
                onClick={() => handleAutopilotClusterSelect(cluster)}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white hover:bg-[#ffffff08]"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: cluster.color }}
                />
                {cluster.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {showSlashMenu && filteredSlashCommands.length > 0 ? (
        <div
          ref={slashRef}
          className="rounded-2xl border border-[#ffffff10] bg-card p-2 shadow-xl"
        >
          <div className="flex flex-col gap-0.5">
            {filteredSlashCommands.map((item) => (
              <button
                key={item.command}
                type="button"
                onClick={() => handleSlashSelect(item.command)}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-[#ffffff08]"
              >
                <span className="text-sm font-medium text-primary">
                  {item.command}
                </span>
                <span className="text-xs text-muted-foreground">{item.description}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <ChatAttachmentStrip
        pending={pending}
        onRemove={removeAttachment}
      />

      <div className={chatComposerRowClass(isMultiline)}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="relative">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setPopoverOpen((open) => !open)}
            className={CHAT_COMPOSER_ATTACH_BUTTON_CLASS}
            aria-label="Open options"
          >
            <Plus className="h-4 w-4 text-white" />
          </button>

          {popoverOpen ? (
            <div
              ref={popoverRef}
              className="absolute bottom-14 left-0 z-50 w-64 rounded-2xl border border-[#ffffff10] bg-card p-3 shadow-xl"
            >
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Assign to cluster
              </p>
              <div className="flex max-h-48 flex-col gap-0.5 overflow-y-auto overscroll-contain">
                <button
                  type="button"
                  onClick={() => handleClusterSelect(null, null)}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white hover:bg-[#ffffff08]"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-white/30" />
                  General
                  {selectedClusterId === null ? (
                    <Check className="ml-auto h-3.5 w-3.5 text-primary" />
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
                      <Check className="ml-auto h-3.5 w-3.5 text-primary" />
                    ) : null}
                  </button>
                ))}
              </div>

              <div className="my-2 border-t border-[#ffffff08]" />

              <button
                type="button"
                onClick={() => {
                  setPopoverOpen(false);
                  fileInputRef.current?.click();
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white hover:bg-[#ffffff08]"
              >
                <ImagePlus className="h-4 w-4 text-primary" />
                Attach image
              </button>

              <div className="my-2 border-t border-[#ffffff08]" />

              <p className="mb-2 text-xs font-medium text-muted-foreground">
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
                    curriculumMode ? "bg-primary" : "bg-[#ffffff15]",
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
          onChange={(e) => {
            const next = e.target.value;
            setValue(next);
            if (next.startsWith("/")) {
              setSlashOpen(true);
              setAutopilotPickerOpen(false);
            } else {
              setSlashOpen(false);
            }
          }}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything… paste an image to include it"
          autoComplete="off"
          disabled={isLoading || isUploading}
          rows={1}
          className={CHAT_COMPOSER_TEXTAREA_CLASS}
        />

        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={!canSend}
          className={CHAT_COMPOSER_SEND_BUTTON_CLASS}
          aria-label="Send message"
        >
          <ArrowUp className="h-4 w-4 text-white" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
