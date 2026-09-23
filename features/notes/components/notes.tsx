import { AppShell } from "@/features/dashboard/components/app-shell";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { Search, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const notes = [
  {
    title: "Krebs cycle — quick recap",
    preview: "ATP yields, intermediates, regulation points. Citrate to oxaloacetate in eight steps…",
    subject: "Biology",
    updated: "2h ago",
    ai: true,
    active: true,
  },
  {
    title: "Linear algebra — eigenvectors",
    preview: "Geometric intuition: vectors that keep their direction under transformation…",
    subject: "Math",
    updated: "Yesterday",
    ai: true,
    active: false,
  },
  {
    title: "Pacific theater timeline",
    preview: "Midway, Guadalcanal, Iwo Jima — comparing textbook narratives…",
    subject: "History",
    updated: "Monday",
    ai: false,
    active: false,
  },
  {
    title: "Newton's laws — lab notes",
    preview: "Friction coefficients table. Second measurement needs verification…",
    subject: "Physics",
    updated: "Sunday",
    ai: false,
    active: false,
  },
  {
    title: "Organic chem — mechanisms",
    preview: "SN1 vs SN2 vs E2: conditions, stereochemistry, rearrangements…",
    subject: "Chemistry",
    updated: "Last week",
    ai: true,
    active: false,
  },
];

export default function NotesPage() {
  return (
    <AppShell showAI={false}>
      <div className="px-6 lg:px-8 py-6 mx-auto w-full max-w-6xl">
        <PageHeader
          title="Notes"
          description="Five notes updated this week. Two have fresh AI summaries."
          actions={
            <Button size="sm">
              <Plus className="h-4 w-4" /> New note
            </Button>
          }
        />

        <div className="rounded-xl border border-border bg-card overflow-hidden grid md:grid-cols-[300px_1fr] min-h-[560px]">
          {/* List */}
          <div className="border-b md:border-b-0 md:border-r border-border flex flex-col min-w-0">
            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-2">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <input
                  placeholder="Search notes…"
                  className="w-full bg-transparent text-[13px] placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </div>
            <div className="divide-y divide-border overflow-y-auto">
              {notes.map((n) => (
                <button
                  key={n.title}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    n.active ? "bg-accent/60" : "hover:bg-accent/30"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-medium truncate">
                      {n.title}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {n.updated}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {n.preview}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-muted-foreground">
                      {n.subject}
                    </span>
                    {n.ai && (
                      <span className="inline-flex items-center gap-1 text-xs text-success">
                        <Sparkles className="h-3 w-3" /> Summarized
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Reading pane */}
          <div className="p-6 lg:p-8 min-w-0">
            <div className="text-xs text-muted-foreground">
              Biology · Edited 2h ago
            </div>
            <h2 className="text-lg font-semibold tracking-tight mt-1">
              Krebs cycle — quick recap
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground max-w-2xl">
              <p>
                <span className="text-foreground">
                  The cycle turns acetyl-CoA into ATP, NADH, and FADH₂
                </span>{" "}
                across eight steps. Three regulation points matter most:
                citrate synthase, isocitrate dehydrogenase, and
                α-ketoglutarate dehydrogenase.
              </p>
              <p>
                Per glucose, the payoff is roughly 3 NADH, 1 FADH₂, and 1 GTP
                per turn — doubled for the two pyruvates. Oxaloacetate is
                regenerated, so the cycle never consumes its own carrier.
              </p>
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="text-[13px] font-medium text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-success" /> AI summary
                </div>
                <p className="text-[13px] mt-1.5">
                  Remember it as: entry (acetyl-CoA in), two decarboxylations
                  (CO₂ out), redox harvest (NADH/FADH₂), substrate-level
                  phosphorylation (GTP), regeneration. Exam questions focus on
                  where regulation binds.
                </p>
              </div>
              <p>
                Open question: confirm the allosteric inhibitors of isocitrate
                dehydrogenase before Thursday&apos;s review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
