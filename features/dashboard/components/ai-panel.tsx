"use client";

import { Sparkles, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AIPanel as AIChatPanel } from "@/features/ai/components/ai-panel";

function PanelHeader({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="absolute inset-0 rounded-full bg-primary/20 blur-md" />
        </div>
        <span className="text-sm font-semibold">Nucleus AI</span>
        <span className="rounded border border-success/25 bg-success/10 px-1.5 py-0.5 text-[10px] tracking-widest text-success">
          LIVE
        </span>
      </div>
      {onClose ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      ) : (
        <button className="text-xs text-muted-foreground transition hover:text-foreground">
          Open ↗
        </button>
      )}
    </div>
  );
}

export function AIPanel() {
  return (
    <aside className="hidden w-[360px] shrink-0 flex-col border-l border-border bg-sidebar xl:flex">
      <PanelHeader />
      <AIChatPanel className="min-h-0 flex-1" />
    </aside>
  );
}

export function AIPanelSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col border-l-border bg-sidebar p-0 sm:w-[380px] [&>button]:hidden"
      >
        <SheetTitle className="sr-only">Nucleus AI Panel</SheetTitle>
        <PanelHeader onClose={() => onOpenChange(false)} />
        <AIChatPanel className="min-h-0 flex-1" />
      </SheetContent>
    </Sheet>
  );
}
