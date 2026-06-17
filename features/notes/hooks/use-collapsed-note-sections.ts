"use client";

import { useCallback, useEffect, useState } from "react";

export const NOTES_COLLAPSED_SECTIONS_KEY = "nucleus_notes_collapsed_sections";

export function useCollapsedNoteSections() {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(NOTES_COLLAPSED_SECTIONS_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as unknown;
      if (Array.isArray(parsed)) {
        setCollapsedIds(
          new Set(parsed.filter((id): id is string => typeof id === "string")),
        );
      }
    } catch {
      // ignore invalid storage
    }
  }, []);

  const toggleSectionCollapsed = useCallback((sectionId: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      localStorage.setItem(
        NOTES_COLLAPSED_SECTIONS_KEY,
        JSON.stringify([...next]),
      );
      return next;
    });
  }, []);

  return { collapsedIds, toggleSectionCollapsed };
}
