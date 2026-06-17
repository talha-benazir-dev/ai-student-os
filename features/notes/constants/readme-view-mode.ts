export type ReadmeViewMode = "reading" | "split" | "source";

export const README_VIEW_MODE_STORAGE_KEY = "nucleus_notes_readme_view_mode";

export const README_VIEW_MODE_OPTIONS: {
  value: ReadmeViewMode;
  label: string;
}[] = [
  { value: "reading", label: "Document" },
  { value: "split", label: "Both" },
  { value: "source", label: "Source" },
];

export function isReadmeViewMode(value: string): value is ReadmeViewMode {
  return value === "reading" || value === "split" || value === "source";
}
