"use client";

import { X } from "lucide-react";
import type { PendingAttachment } from "@/features/ai/hooks/use-chat-attachments";
import type { ChatAttachment } from "@/features/ai/types";

type ChatAttachmentStripProps = {
  pending?: PendingAttachment[];
  uploaded?: ChatAttachment[];
  onRemove?: (id: string) => void;
};

export function ChatAttachmentStrip({
  pending = [],
  uploaded = [],
  onRemove,
}: ChatAttachmentStripProps) {
  if (pending.length === 0 && uploaded.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {pending.map((item) => (
        <div
          key={item.id}
          className="relative h-16 w-16 overflow-hidden rounded-lg border border-[#ffffff15] bg-[#ffffff08]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.previewUrl}
            alt="Attached image preview"
            className="h-full w-full object-cover"
          />
          {onRemove ? (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5 text-white hover:bg-black"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </div>
      ))}

      {uploaded.map((item, index) => (
        <div
          key={`${item.url}-${index}`}
          className="h-16 w-16 overflow-hidden rounded-lg border border-[#ffffff15] bg-[#ffffff08]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.url}
            alt="Attached image"
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
