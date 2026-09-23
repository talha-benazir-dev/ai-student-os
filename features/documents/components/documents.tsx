import { AppShell } from "@/features/dashboard/components/app-shell";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { FileText, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const files = [
  { name: "Organic Chemistry — Chapter 4.pdf", subject: "Chemistry", size: "2.4 MB", pages: 38, status: "Summarized" as const },
  { name: "World History — Cold War.pdf", subject: "History", size: "1.1 MB", pages: 22, status: "Summarized" as const },
  { name: "Calculus II — Series and Sequences.pdf", subject: "Math", size: "3.8 MB", pages: 64, status: "Processing" as const },
  { name: "Cell Biology — Mitosis notes.pdf", subject: "Biology", size: "880 KB", pages: 14, status: "Summarized" as const },
  { name: "Physics — Rotational Dynamics.pdf", subject: "Physics", size: "1.9 MB", pages: 29, status: "Queued" as const },
];

export default function DocumentsPage() {
  return (
    <AppShell showAI={false}>
      <div className="px-6 lg:px-8 py-6 mx-auto w-full max-w-6xl">
        <PageHeader
          title="Documents"
          description="42 files · 3 summaries ready · 1 processing."
          actions={
            <Button size="sm">
              <Upload className="h-4 w-4" /> Upload PDF
            </Button>
          }
        />

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1fr_110px_90px_70px_130px] gap-3 px-5 py-2.5 border-b border-border text-xs text-muted-foreground">
            <span>Name</span>
            <span>Subject</span>
            <span className="text-right">Size</span>
            <span className="text-right">Pages</span>
            <span className="text-right">AI summary</span>
          </div>
          <div className="divide-y divide-border">
            {files.map((f) => (
              <div
                key={f.name}
                className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_110px_90px_70px_130px] gap-3 items-center px-5 py-3 hover:bg-accent/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 shrink-0 rounded-md bg-accent flex items-center justify-center text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[13px] font-medium truncate">
                    {f.name}
                  </span>
                </div>
                <span className="hidden sm:block text-[13px] text-muted-foreground truncate">
                  {f.subject}
                </span>
                <span className="hidden sm:block text-[13px] text-muted-foreground text-right tabular-nums">
                  {f.size}
                </span>
                <span className="hidden sm:block text-[13px] text-muted-foreground text-right tabular-nums">
                  {f.pages}
                </span>
                <span className="text-right">
                  {f.status === "Summarized" ? (
                    <span className="inline-flex items-center gap-1 text-xs text-success">
                      <Sparkles className="h-3 w-3" /> Ready
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {f.status}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-border px-5 py-6 text-center">
          <p className="text-[13px] text-muted-foreground">
            Drag a PDF anywhere to upload — summaries, flashcards, and quizzes
            generate automatically.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
