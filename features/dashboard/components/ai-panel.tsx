"use client";

import {
  Sparkles,
  ArrowUp,
  BookOpen,
  Layers,
  MessageCircleQuestion,
  Wand2,
  X,
} from "lucide-react";
// import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const suggestions = [
  { icon: BookOpen, label: "Summarize chapter" },
  { icon: Layers, label: "Generate 10 flashcards" },
  { icon: MessageCircleQuestion, label: "Quiz me on this PDF" },
  { icon: Wand2, label: "Explain simply" },
];

function PanelBody() {
  return (
    <>
      <div className="px-5 py-4 border-b border-border">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Context
        </div>
        <div className="text-sm">Organic Chemistry — Ch. 4 PDF</div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-5 space-y-4">
        <div className="flex gap-3">
          <div className="h-7 w-7 shrink-0 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-3 text-sm leading-relaxed">
            {/* I've parsed{" "} */}
            <span className="text-foreground font-medium">
              Organic Chemistry — Chapter 4
            </span>
            . Want a 3-minute summary, key reactions, or a 10-card deck?
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <div className="rounded-2xl rounded-tr-sm bg-primary/10 border border-primary/20 px-4 py-3 text-sm max-w-[78%]">
            Give me the key reactions with mechanisms.
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-7 w-7 shrink-0 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-3 text-sm leading-relaxed space-y-2">
            <div>Three core reactions in Ch. 4:</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                • <span className="text-foreground">SN1</span> — carbocation,
                racemization
              </li>
              <li>
                • <span className="text-foreground">SN2</span> — backside
                attack, inversion
              </li>
              <li>
                • <span className="text-foreground">E2</span> — anti-periplanar
                geometry
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-border space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 hover:bg-accent hover:border-primary/30 transition-colors px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Icon className="h-3 w-3" /> {label}
            </button>
          ))}
        </div>
        <div className="relative flex items-center gap-2">
          <Input
            placeholder="Ask anything about your studies…"
            className="pr-12"
          />
          <Button
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

function PanelHeader({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 h-16 border-b border-border">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="absolute inset-0 blur-md bg-primary/20 rounded-full" />
        </div>
        <span className="text-sm font-semibold">Nucleus AI</span>
        <span className="text-[10px] tracking-widest px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/25">
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
        <button className="text-xs text-muted-foreground hover:text-foreground transition">
          Open ↗
        </button>
      )}
    </div>
  );
}

export function AIPanel() {
  return (
    <aside className="hidden xl:flex w-[360px] shrink-0 flex-col border-l border-border bg-sidebar">
      <PanelHeader />
      <PanelBody />
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
        className="p-0 w-full sm:w-[380px] bg-sidebar border-l-border [&>button]:hidden"
      >
        <SheetTitle className="sr-only">Nucleus AI Panel</SheetTitle>
        <PanelHeader onClose={() => onOpenChange(false)} />
        <PanelBody />
      </SheetContent>
    </Sheet>
  );
}
