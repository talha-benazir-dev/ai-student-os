"use client";

import "@excalidraw/excalidraw/index.css";
import { Excalidraw } from "@excalidraw/excalidraw";
import type {
  AppState,
  BinaryFiles,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";

type Props = {
  initialData: ExcalidrawInitialDataState;
  onChange: (
    elements: readonly OrderedExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles,
  ) => void;
};

export default function ExcalidrawEditor({ initialData, onChange }: Props) {
  return (
    <Excalidraw
      initialData={initialData}
      onChange={onChange}
      theme="dark"
      UIOptions={{
        canvasActions: {
          // Hide things that don't fit your app structure
          loadScene: false, // Hide their manual file upload icon
          saveToActiveFile: false, // Hide default save icon since you auto-save to Supabase
          toggleTheme: false, // Hide theme toggle to lock it to Nucleus dark theme
          changeViewBackgroundColor: true, // Keep true if you want students to change panel colors
        },
      }}
    />
  );
}
