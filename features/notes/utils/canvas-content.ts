"use client";

import { restore, serializeAsJSON } from "@excalidraw/excalidraw";
import type {
  AppState,
  BinaryFiles,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";

export function serializeCanvasContent(
  elements: readonly OrderedExcalidrawElement[],
  appState: AppState,
  files: BinaryFiles,
): string {
  return serializeAsJSON(elements, appState, files, "database");
}

export function parseCanvasContent(content: string): ExcalidrawInitialDataState {
  if (!content.trim()) {
    return { elements: [], appState: {} };
  }

  try {
    const data = JSON.parse(content) as {
      elements?: OrderedExcalidrawElement[];
      appState?: Partial<AppState>;
      files?: BinaryFiles;
    };

    const restored = restore(
      {
        elements: data.elements,
        appState: data.appState,
        files: data.files,
      },
      null,
      null,
    );

    return {
      elements: restored.elements,
      appState: restored.appState,
      files: restored.files,
    };
  } catch {
    return { elements: [], appState: {} };
  }
}
