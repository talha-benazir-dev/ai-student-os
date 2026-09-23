import { AppShell } from "@/features/dashboard/components/app-shell";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { Plus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const decks = [
  { name: "Krebs cycle", cards: 20, mastery: 85, due: "4 due today", subject: "Biology" },
  { name: "SN1 / SN2 / E2", cards: 32, mastery: 62, due: "11 due today", subject: "Chemistry" },
  { name: "Eigenvectors", cards: 14, mastery: 40, due: "8 due today", subject: "Math" },
  { name: "Mitosis stages", cards: 18, mastery: 91, due: "Review Friday", subject: "Biology" },
  { name: "Cold War dates", cards: 24, mastery: 55, due: "6 due today", subject: "History" },
  { name: "Friction formulas", cards: 12, mastery: 30, due: "New deck", subject: "Physics" },
];

export default function FlashcardsPage() {
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

        {/* Review banner — the one action that matters */}
        <div className="rounded-xl border border-border bg-card px-5 py-4 mb-6 flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold tracking-tight">
              Today&apos;s review is ready
            </div>
            <div className="text-[13px] text-muted-foreground mt-0.5">
              29 cards · about 12 minutes · spaced for long-term retention.
            </div>
          </div>
          <Button size="sm">
            <Play className="h-4 w-4" /> Start review
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((d) => (
            <div
              key={d.name}
              className="rounded-xl border border-border bg-card p-5 hover:border-ring transition-colors cursor-pointer"
            >
              <div className="text-xs text-muted-foreground">{d.subject}</div>
              <div className="text-sm font-semibold tracking-tight mt-1">
                {d.name}
              </div>
              <div className="text-xs text-muted-foreground tabular-nums mt-0.5">
                {d.cards} cards · {d.due}
              </div>
              <div className="mt-4">
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">
                    Mastery
                  </span>
                  <span className="text-xs font-medium tabular-nums">
                    {d.mastery}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-accent overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${d.mastery}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
