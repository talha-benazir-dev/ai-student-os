import { cn } from "@/lib/utils";

export function NucleusMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("size-7 shrink-0", className)}
      aria-hidden="true"
    >
      <path d="M5 26V6h5l12 20h5V6h-5v12L10 6H5v20Z" fill="currentColor" />
      <path d="M10 26V14l7 12h-7Z" fill="currentColor" opacity=".45" />
    </svg>
  );
}
