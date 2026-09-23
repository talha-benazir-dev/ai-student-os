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
import { Sheet, SheetContent } from "@/components/ui/sheet";
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
      <div className="px-4 py-3 border-b border-border">
        <div className="text-xs text-muted-foreground">Working from</div>
        <div className="text-[13px] font-medium truncate mt-0.5">
          Organic Chemistry — Ch. 4
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-4">
        <div className="flex gap-2.5">
          <div className="h-6 w-6 shrink-0 rounded-md bg-accent flex items-center justify-center mt-0.5">
            <Sparkles className="h-3 w-3 text-foreground" />
          </div>
          <div className="rounded-lg bg-card border border-border px-3.5 py-2.5 text-[13px] leading-relaxed">
            <span className="font-medium">
              Organic Chemistry — Chapter 4
            </span>
            . Want a 3-minute summary, key reactions, or a 10-card deck?
          </div>
        </div>
        <div className="flex justify-end">
          <div className="rounded-lg bg-primary px-3.5 py-2.5 text-[13px] text-primary-foreground max-w-[80%]">
            Give me the key reactions with mechanisms.
          </div>
        </div>
        <div className="flex gap-2.5">
          <div className="h-6 w-6 shrink-0 rounded-md bg-accent flex items-center justify-center mt-0.5">
            <Sparkles className="h-3 w-3 text-foreground" />
          </div>
          <div className="rounded-lg bg-card border border-border px-3.5 py-2.5 text-[13px] leading-relaxed space-y-2">
            <div>Three core reactions in Ch. 4:</div>
            <ul className="space-y-1.5 text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-border">—</span>
                <span>
                  <span className="text-foreground font-medium">SN1</span> ·
                  carbocation, racemization
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-border">—</span>
                <span>
                  <span className="text-foreground font-medium">SN2</span> ·
                  backside attack, inversion
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-border">—</span>
                <span>
                  <span className="text-foreground font-medium">E2</span> ·
                  anti-periplanar geometry
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border space-y-2.5">
        <div className="grid grid-cols-2 gap-1.5">
          {suggestions.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-left"
            >
              <Icon className="h-3 w-3 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
        <div className="relative flex items-center gap-2">
          <Input
            placeholder="Ask about your studies…"
            className="pr-11 text-[13px]"
          />
          <Button
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </>
  );
}

function PanelHeader({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 h-14 border-b border-border">
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-foreground" />
        <span className="text-[13px] font-semibold">Nucleus AI</span>
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
          Expand
        </button>
      )}
    </div>
  );
}

export function AIPanel() {
  return (
    <aside className="hidden xl:flex w-80 shrink-0 flex-col border-l border-border bg-sidebar sticky top-0 h-screen">
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
        className="p-0 w-full sm:w-96 bg-sidebar flex flex-col"
      >
        <PanelHeader onClose={() => onOpenChange(false)} />
        <PanelBody />
      </SheetContent>
    </Sheet>
  );
}
