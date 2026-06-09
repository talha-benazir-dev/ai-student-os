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
    <Excalidraw initialData={initialData} onChange={onChange} theme="dark" />
  );
}
