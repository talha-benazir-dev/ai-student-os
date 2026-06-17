"use client";

import { useCallback, useState } from "react";
import {
  isReadmeViewMode,
  README_VIEW_MODE_STORAGE_KEY,
  type ReadmeViewMode,
} from "@/features/notes/constants/readme-view-mode";

function readStoredViewMode(): ReadmeViewMode {
  if (typeof window === "undefined") return "reading";

  const saved = localStorage.getItem(README_VIEW_MODE_STORAGE_KEY);
  return saved && isReadmeViewMode(saved) ? saved : "reading";
}

export function useReadmeViewMode() {
  const [viewMode, setViewModeState] = useState<ReadmeViewMode>(readStoredViewMode);

  const setViewMode = useCallback((mode: ReadmeViewMode) => {
    setViewModeState(mode);
    localStorage.setItem(README_VIEW_MODE_STORAGE_KEY, mode);
  }, []);

  return { viewMode, setViewMode };
}
