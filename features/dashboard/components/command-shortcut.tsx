import { Command } from "lucide-react";

/**
 * Keyboard shortcut hint (⌘K). suppressHydrationWarning on <kbd>
 * handles any next/font inline style mismatch — no use client needed.
 */
export function CommandShortcut() {
  return (
    <kbd
      suppressHydrationWarning
      className="font-mono text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 flex items-center gap-0.5"
    >
      <Command className="h-2.5 w-2.5" /> K
    </kbd>
  );
}
