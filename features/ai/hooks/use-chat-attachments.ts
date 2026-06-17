"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import type { ChatAttachment } from "@/features/ai/types";

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_ATTACHMENTS = 3;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type PendingAttachment = {
  id: string;
  file: File;
  previewUrl: string;
};

function isAllowedImage(file: File) {
  return ALLOWED_TYPES.has(file.type);
}

export function useChatAttachments() {
  const [pending, setPending] = useState<PendingAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const pendingRef = useRef(pending);
  pendingRef.current = pending;

  useEffect(() => {
    return () => {
      for (const item of pendingRef.current) {
        URL.revokeObjectURL(item.previewUrl);
      }
    };
  }, []);

  const addFile = useCallback((file: File) => {
    if (!isAllowedImage(file)) {
      toast.error("Only JPEG, PNG, WebP, and GIF images are supported.");
      return;
    }

    if (file.size > MAX_BYTES) {
      toast.error("Image must be 10 MB or smaller.");
      return;
    }

    setPending((current) => {
      if (current.length >= MAX_ATTACHMENTS) {
        toast.error(`You can attach up to ${MAX_ATTACHMENTS} images.`);
        return current;
      }

      return [
        ...current,
        {
          id: nanoid(),
          file,
          previewUrl: URL.createObjectURL(file),
        },
      ];
    });
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setPending((current) => {
      const target = current.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return current.filter((item) => item.id !== id);
    });
  }, []);

  const clearAttachments = useCallback(() => {
    setPending((current) => {
      for (const item of current) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return [];
    });
  }, []);

  const handlePaste = useCallback(
    (event: React.ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (!item.type.startsWith("image/")) continue;

        const file = item.getAsFile();
        if (!file) continue;

        event.preventDefault();
        addFile(file);
        return;
      }
    },
    [addFile],
  );

  const uploadAll = useCallback(async (): Promise<ChatAttachment[]> => {
    const files = pendingRef.current;
    if (files.length === 0) return [];

    setIsUploading(true);

    try {
      const uploaded: ChatAttachment[] = [];

      for (const item of files) {
        const formData = new FormData();
        formData.append("file", item.file);

        const response = await fetch("/api/ai/attach-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(data.error ?? "Image upload failed");
        }

        const data = (await response.json()) as ChatAttachment;
        uploaded.push(data);
      }

      clearAttachments();
      return uploaded;
    } finally {
      setIsUploading(false);
    }
  }, [clearAttachments]);

  return {
    pending,
    isUploading,
    hasAttachments: pending.length > 0,
    addFile,
    removeAttachment,
    clearAttachments,
    handlePaste,
    uploadAll,
  };
}
