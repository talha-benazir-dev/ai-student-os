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
    <div className="excalidraw-nucleus-wrapper">
      {/* CSS overrides to strip Excalidraw branding and match Nucleus theme */}
      <style>{`
        .excalidraw-nucleus-wrapper {
          height: 100%;
          width: 100%;
          --color-primary: #7c5cfc;
          --color-primary-darker: #6644f0;
          --color-primary-darkest: #5533dd;
          --color-primary-light: #7c5cfc33;
          --color-surface-primary-container: #0f0f17;
          --color-surface-low: #0f0f17;
          --color-surface-mid: #111118;
          --color-surface-high: #16161f;
          --color-surface-highest: #1a1a24;
          --color-on-surface: #ffffff;
          --color-on-surface-muted: #888899;
        }

        /* Hide Excalidraw footer / branding bar */
        .excalidraw .layer-ui__wrapper__footer-center {
          display: none !important;
        }

        /* Hide "Made with Excalidraw" and the logo */
        .excalidraw .layer-ui__wrapper__footer-right {
          display: none !important;
        }

        /* Hide the main menu hamburger button */
        .excalidraw .main-menu-trigger {
          display: none !important;
        }

        /* Match canvas background to Nucleus dark */
        .excalidraw .excalidraw-canvas {
          background-color: #0a0a0f !important;
        }

        /* Style the toolbar to match Nucleus */
        .excalidraw .layer-ui__wrapper {
          --toolbar-border: #ffffff10;
        }

        .excalidraw .Island {
          background-color: #111118 !important;
          border-color: #ffffff20 !important;
          box-shadow: 0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px #ffffff15 !important;
        }

        .excalidraw .ToolIcon__icon {
          color: #ffffff !important;
        }

        .excalidraw .ToolIcon:hover .ToolIcon__icon {
          background-color: #7c5cfc22 !important;
        }

        .excalidraw .ToolIcon--selected .ToolIcon__icon {
          background-color: #7c5cfc33 !important;
          color: #7c5cfc !important;
        }

        /* Collaboration button — hide it */
        .excalidraw .collab-button {
          display: none !important;
        }

        /* Hide the share button */
        .excalidraw .share-button {
          display: none !important;
        }

        /* Welcome screen — hide completely */
        .excalidraw .welcome-screen-container {
          display: none !important;
        }
      `}</style>

      <Excalidraw
        initialData={initialData}
        onChange={onChange}
        theme="dark"
        UIOptions={{
          welcomeScreen: false,
          canvasActions: {
            loadScene: false,
            saveToActiveFile: false,
            toggleTheme: false,
            changeViewBackgroundColor: true,
            export: false,
          },
        }}
      />
    </div>
  );
}
