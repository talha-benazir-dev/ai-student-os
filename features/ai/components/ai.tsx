"use client";

import { useState } from "react";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { Sparkles, ArrowUp, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const threads = [
  { title: "SN1 vs SN2 mechanisms", detail: "Chemistry · 12 messages", active: true },
  { title: "Krebs cycle regulation", detail: "Biology · 8 messages", active: false },
  { title: "Eigenvector intuition", detail: "Math · 5 messages", active: false },
  { title: "Cold War essay outline", detail: "History · 15 messages", active: false },
];

type Msg = { role: "ai" | "user"; text: string };

const opening: Msg[] = [
  { role: "ai", text: "I found three competing mechanisms in your chapter. Want the exam-short version or the full arrow-pushing walkthrough?" },
  { role: "user", text: "Exam-short first, then quiz me on stereochemistry." },
  { role: "ai", text: "Short version: SN1 favors stable carbocations and polar protic solvents; SN2 wants a strong nucleophile and an unhindered carbon; E2 needs a strong base and anti-periplanar geometry. Ready when you are — first question: why does a tertiary substrate shut down SN2?" },
];

const followups = [
  "Good attempt — steric bulk blocks backside attack, so the SN2 transition state can't form. Tertiary goes SN1 or E2 instead. Next: which solvent speeds up SN1, and why?",
  "Exactly — polar protic stabilizes the carbocation intermediate. You're two for two. Last one: in E2, why must the leaving group and hydrogen be anti-periplanar?",
  "That's the session. You nailed the pattern: mechanism follows structure. I'll queue three flashcards from this thread for tomorrow's review.",
];

export default function AIWorkspacePage() {
  const [messages, setMessages] = useState<Msg[]>(opening);
  const [draft, setDraft] = useState("");
  const [step, setStep] = useState(0);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setDraft("");
    setTimeout(() => {
      setMessages((m) => [...m, { role: "ai", text: followups[Math.min(step, followups.length - 1)] }]);
      setStep((s) => s + 1);
    }, 600);
  };

  return (
    <AppShell showAI={false}>
      <div className="px-6 lg:px-8 py-6 mx-auto w-full max-w-6xl">
        <PageHeader
          title="AI Workspace"
          description="Grounded in your notes, files, and decks — quiz-first, never answer-first."
        />

        <div className="rounded-xl border border-border bg-card overflow-hidden grid md:grid-cols-[260px_1fr] min-h-[600px]">
          <div className="border-b md:border-b-0 md:border-r border-border p-3">
            <Button size="sm" className="w-full mb-3">
              New conversation
            </Button>
            <div className="space-y-1">
              {threads.map((t) => (
                <button
                  key={t.title}
                  className={cn("w-full text-left rounded-md px-3 py-2 transition-colors", t.active ? "bg-accent" : "hover:bg-accent/50")}
                >
                  <div className="text-[13px] font-medium truncate">{t.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{t.detail}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2 text-[13px]">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Sources:</span>
              <span className="truncate">Organic Chemistry Ch. 4 · Mechanisms note</span>
            </div>

            <div className="flex-1 px-5 py-5 space-y-4 overflow-y-auto">
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="rounded-lg bg-primary text-primary-foreground px-3.5 py-2.5 text-[13px] max-w-[80%]">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex gap-2.5">
                    <div className="h-6 w-6 shrink-0 rounded-md bg-accent flex items-center justify-center mt-0.5">
                      <Sparkles className="h-3 w-3" />
                    </div>
                    <div className="rounded-lg bg-background border border-border px-3.5 py-2.5 text-[13px] leading-relaxed max-w-2xl">
                      {m.text}
                    </div>
                  </div>
                ),
              )}
            </div>

            <div className="px-5 py-3 border-t border-border">
              <div className="relative flex items-center gap-2">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Answer the question, or ask your own…"
                  className="pr-11 text-[13px]"
                />
                <Button
                  size="icon"
                  onClick={send}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  aria-label="Send"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
