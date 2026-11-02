"use client";

import { useCallback, useMemo } from "react";
import { useStoredPreference } from "@/hooks/use-stored-preference";

export const NOTES_COLLAPSED_SECTIONS_KEY = "nucleus_notes_collapsed_sections";

export function useCollapsedNoteSections() {
  const [stored, setStored] = useStoredPreference(NOTES_COLLAPSED_SECTIONS_KEY, "[]");
  const collapsedIds = useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(stored);
      return new Set<string>(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []);
    } catch { return new Set<string>(); }
  }, [stored]);
  const toggleSectionCollapsed = useCallback((sectionId: string) => {
    const next = new Set(collapsedIds);
    if (next.has(sectionId)) next.delete(sectionId);
    else next.add(sectionId);
    setStored(JSON.stringify([...next]));
  }, [collapsedIds, setStored]);
  return { collapsedIds, toggleSectionCollapsed };
}
