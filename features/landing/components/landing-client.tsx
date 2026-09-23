"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const demoCards = [
  { front: "What inhibits phosphofructokinase-1?", back: "ATP and citrate — high energy charge slows glycolysis at its committed step." },
  { front: "SN2: what happens to stereochemistry?", back: "Inversion — backside attack flips the configuration (Walden inversion)." },
  { front: "Eigenvector, in one sentence?", back: "A vector that keeps its direction under a transformation, scaled by its eigenvalue." },
];

export function FlashDemo() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const card = demoCards[index];

  const next = (knew: boolean) => {
    if (knew) setKnown((k) => k + 1);
    setFlipped(false);
    setTimeout(() => setIndex((i) => (i + 1) % demoCards.length), 120);
  };

  return (
    <div>
      <button
        onClick={() => setFlipped((f) => !f)}
        className="w-full text-left [perspective:1200px]"
        aria-label="Flip flashcard"
      >
        <div
          className={cn(
            "relative min-h-44 rounded-xl border border-border bg-card p-6 transition-transform duration-300 [transform-style:preserve-3d]",
            flipped && "[transform:rotateY(180deg)]",
          )}
        >
          <div className="[backface-visibility:hidden]">
            <div className="text-xs text-muted-foreground mb-2">
              Card {index + 1} of {demoCards.length} · tap to flip
            </div>
            <div className="text-base font-medium leading-relaxed">
              {card.front}
            </div>
          </div>
          <div className="absolute inset-0 p-6 [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <div className="text-xs text-success mb-2">Answer</div>
            <div className="text-sm leading-relaxed text-muted-foreground">
              <span className="text-foreground">{card.back}</span>
            </div>
          </div>
        </div>
      </button>
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => next(false)}
          className="flex-1 rounded-md border border-border px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors inline-flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Still learning
        </button>
        <button
          onClick={() => next(true)}
          className="flex-1 rounded-md bg-primary px-3 py-2 text-[13px] text-primary-foreground font-medium inline-flex items-center justify-center gap-1.5"
        >
          <Check className="h-3.5 w-3.5" /> Got it
        </button>
      </div>
      <div className="text-xs text-muted-foreground mt-2 tabular-nums">
        {known} marked known this session · spaced for tomorrow
      </div>
    </div>
  );
}

const faqs = [
  {
    q: "How is this different from my notes app plus ChatGPT?",
    a: "Your notes app stores pages; Nucleus connects them. Upload a PDF and you get a summary, flashcards, and a quiz from the same source — and the AI answers from your materials, not the open web.",
  },
  {
    q: "I am behind on everything. Where do I start?",
    a: "Tonight's plan. Add your exam date, and Nucleus turns the pile into three tasks a night plus one focus block. Small enough to start, concrete enough to finish.",
  },
  {
    q: "Does the AI just give me answers?",
    a: "No. Quiz mode asks you questions and waits. It explains after you attempt, which is the part that actually builds memory — retrieval before review.",
  },
  {
    q: "What does the free plan include?",
    a: "Notes, tasks, and 50 AI messages a month. Pro unlocks unlimited summaries, flashcard generation, and the full analytics history.",
  },
];

export function Faq() {
  return (
    <Accordion type="single" collapsible className="divide-y divide-border">
      {faqs.map((f, i) => (
        <AccordionItem key={i} value={`item-${i}`} className="border-0">
          <AccordionTrigger className="text-left text-[15px] font-medium py-4 hover:no-underline">
            {f.q}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
            {f.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
