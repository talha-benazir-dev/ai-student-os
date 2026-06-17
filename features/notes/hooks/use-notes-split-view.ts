"use client";

import { useSyncExternalStore } from "react";
import { NOTES_SPLIT_VIEW_MIN_WIDTH } from "@/features/notes/constants/layout";

const SPLIT_VIEW_QUERY = `(min-width: ${NOTES_SPLIT_VIEW_MIN_WIDTH}px)`;

function subscribe(onStoreChange: () => void) {
  const mql = window.matchMedia(SPLIT_VIEW_QUERY);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia(SPLIT_VIEW_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/** True at `lg` and above — resizable list + editor. False on mobile — master-detail. */
export function useNotesSplitView() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
