import {
  README_VIEW_MODE_OPTIONS,
  type ReadmeViewMode,
} from "@/features/notes/constants/readme-view-mode";
import { cn } from "@/lib/utils";

type ReadmeViewToggleProps = {
  value: ReadmeViewMode;
  onChange: (mode: ReadmeViewMode) => void;
  className?: string;
};

export function ReadmeViewToggle({
  value,
  onChange,
  className,
}: ReadmeViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="README view mode"
      className={cn(
        "inline-flex items-stretch overflow-hidden rounded-lg border border-[#ffffff10] text-xs font-medium",
        className,
      )}
    >
      {README_VIEW_MODE_OPTIONS.map((option, index) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "px-3 py-1.5 transition-colors",
            index > 0 && "border-l border-[#ffffff10]",
            value === option.value
              ? "bg-white/10 text-white"
              : "text-white/50 hover:bg-white/5 hover:text-white/80",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
