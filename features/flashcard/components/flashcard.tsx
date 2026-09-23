"use client";

import { useState } from "react";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { Plus, Play, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const decks = [
  { name: "Krebs cycle", cards: 20, mastery: 85, due: "4 due today", subject: "Biology" },
  { name: "SN1 / SN2 / E2", cards: 32, mastery: 62, due: "11 due today", subject: "Chemistry" },
  { name: "Eigenvectors", cards: 14, mastery: 40, due: "8 due today", subject: "Math" },
  { name: "Mitosis stages", cards: 18, mastery: 91, due: "Review Friday", subject: "Biology" },
  { name: "Cold War dates", cards: 24, mastery: 55, due: "6 due today", subject: "History" },
  { name: "Friction formulas", cards: 12, mastery: 30, due: "New deck", subject: "Physics" },
];

const reviewCards = [
  { front: "Which complex of the electron transport chain pumps no protons?", back: "Complex II (succinate dehydrogenase) — it feeds electrons in without pumping." },
  { front: "Zaitsev's rule predicts what?", back: "The more substituted alkene dominates in elimination — stability wins." },
  { front: "What does a determinant of zero tell you?", back: "The matrix is singular — it squashes space flat, no inverse exists." },
  { front: "First-line treatment logic for an SN1 substrate in a polar protic solvent?", back: "Ionization first: stable carbocation forms, nucleophile attacks from either face — racemization." },
  { front: "When did the Cuban Missile Crisis peak?", back: "October 1962 — thirteen days that anchor the whole Cold War timeline." },
];

export default function FlashcardsPage() {
  const [reviewing, setReviewing] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [finished, setFinished] = useState(false);
  const card = reviewCards[index % reviewCards.length];

  const answer = (knew: boolean) => {
    if (knew) setKnown((k) => k + 1);
    if (index + 1 >= reviewCards.length) {
      setFinished(true);
      return;
    }
    setFlipped(false);
    setTimeout(() => setIndex((i) => i + 1), 120);
  };

  const restart = () => {
    setIndex(0);
    setKnown(0);
    setFinished(false);
    setFlipped(false);
  };

  return (
    <AppShell showAI={false}>
      <div className="px-6 lg:px-8 py-6 mx-auto w-full max-w-6xl">
        <PageHeader
          title="Flashcards"
          description="120 cards across 6 decks · 29 due for review today."
          actions={
            <Button size="sm">
              <Plus className="h-4 w-4" /> New deck
            </Button>
          }
        />

        {/* Review session */}
        <div className="rounded-xl border border-border bg-card px-5 py-4 mb-6">
          {!reviewing ? (
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold tracking-tight">
                  Today&apos;s review is ready
                </div>
                <div className="text-[13px] text-muted-foreground mt-0.5">
                  29 cards · about 12 minutes · spaced for long-term retention.
                </div>
              </div>
              <Button size="sm" onClick={() => { setReviewing(true); restart(); }}>
                <Play className="h-4 w-4" /> Start review
              </Button>
            </div>
          ) : finished ? (
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold tracking-tight">
                  Session complete — {known} of {reviewCards.length} known
                </div>
                <div className="text-[13px] text-muted-foreground mt-0.5">
                  Missed cards return tomorrow. That&apos;s the whole system working.
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => setReviewing(false)}>
                  Back to decks
                </Button>
                <Button size="sm" onClick={restart}>
                  <RotateCcw className="h-4 w-4" /> Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-[1fr_280px] gap-5 items-start">
              <div>
                <button
                  onClick={() => setFlipped((f) => !f)}
                  className="w-full text-left [perspective:1200px]"
                  aria-label="Flip card"
                >
                  <div className={cn("relative min-h-40 rounded-lg border border-border bg-background p-5 transition-transform duration-300 [transform-style:preserve-3d]", flipped && "[transform:rotateY(180deg)]")}>
                    <div className="[backface-visibility:hidden]">
                      <div className="text-xs text-muted-foreground mb-2 tabular-nums">
                        Card {index + 1} of {reviewCards.length} · tap to flip
                      </div>
                      <div className="text-[15px] font-medium leading-relaxed">{card.front}</div>
                    </div>
                    <div className="absolute inset-0 p-5 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                      <div className="text-xs text-success mb-2">Answer</div>
                      <div className="text-sm text-muted-foreground leading-relaxed">{card.back}</div>
                    </div>
                  </div>
                </button>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => answer(false)}>
                    <RotateCcw className="h-3.5 w-3.5" /> Still learning
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => answer(true)}>
                    <Check className="h-3.5 w-3.5" /> Got it
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="text-[13px] font-medium">Session progress</div>
                <div className="text-2xl font-semibold tabular-nums mt-1">
                  {known}<span className="text-sm text-muted-foreground font-normal">/{reviewCards.length} known</span>
                </div>
                <div className="h-1.5 rounded-full bg-accent overflow-hidden mt-3">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((index + (flipped ? 1 : 0)) / reviewCards.length) * 100}%` }} />
                </div>
                <button onClick={() => setReviewing(false)} className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  End session
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((d) => (
            <button
              key={d.name}
              onClick={() => { setReviewing(true); restart(); }}
              className="text-left rounded-xl border border-border bg-card p-5 hover:border-ring transition-colors"
            >
              <div className="text-xs text-muted-foreground">{d.subject}</div>
              <div className="text-sm font-semibold tracking-tight mt-1">{d.name}</div>
              <div className="text-xs text-muted-foreground tabular-nums mt-0.5">
                {d.cards} cards · {d.due}
              </div>
              <div className="mt-4">
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Mastery</span>
                  <span className="text-xs font-medium tabular-nums">{d.mastery}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-accent overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${d.mastery}%` }} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
