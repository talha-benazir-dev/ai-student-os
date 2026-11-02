import type { SVGProps } from "react";

export type WorkspaceIconName =
  | "home"
  | "clusters"
  | "notes"
  | "tasks"
  | "documents"
  | "review"
  | "assistant"
  | "analytics"
  | "settings";

// One optical size and stroke across the navigation and page headings.
const paths: Record<WorkspaceIconName, React.ReactNode> = {
  home: (
    <>
      <path d="m4 10 8-6 8 6v10H4Z" />
      <path d="M9 20v-7h6v7M8 9h.01" />
    </>
  ),
  clusters: (
    <>
      <rect x="3.5" y="3.5" width="6" height="6" rx="1.5" />
      <rect x="14.5" y="3.5" width="6" height="6" rx="1.5" />
      <rect x="3.5" y="14.5" width="6" height="6" rx="1.5" />
      <path d="M14.5 17.5h6m-3-3v6M9.5 6.5h5M6.5 9.5v5" />
    </>
  ),
  notes: (
    <>
      <path d="M6 3.5h8l4 4v13H6Z" />
      <path d="M14 3.5v4h4M9 12h6M9 16h4" />
    </>
  ),
  tasks: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="m8 11 3 3 5-6M8 17h8" />
    </>
  ),
  documents: (
    <>
      <path d="M7 3.5h8l4 4v12H7Z" />
      <path d="M15 3.5v4h4M4 7v14h11M10 12h6M10 15h4" />
    </>
  ),
  review: (
    <>
      <path d="m3 8 9-4 9 4-9 4ZM3 12l9 4 9-4M3 16l9 4 9-4" />
    </>
  ),
  assistant: (
    <>
      <path d="M5 5h14v11h-8l-5 4v-4H5Z" />
      <path d="M9 9h6M9 12h4" />
    </>
  ),
  analytics: (
    <>
      <path d="M4 4v16h16M8 16v-4M12 16V8M16 16v-6" />
      <path d="m8 8 4-4 4 2 4-3" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h16M4 17h16" />
      <rect x="8" y="4" width="4" height="6" rx="1" />
      <rect x="14" y="14" width="4" height="6" rx="1" />
    </>
  ),
};

export function WorkspaceIcon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: WorkspaceIconName }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
