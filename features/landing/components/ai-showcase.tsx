"use client";

import { ArrowUpRight, Check, Search, Sparkles } from "lucide-react";
import { Tilt } from "./tilt";

function Bubble({
  role,
  children,
}: {
  role: "ai" | "user";
  children: React.ReactNode;
}) {
  if (role === "user") {
    return (
      <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-[#7c5cfc]/15 border border-[#7c5cfc]/30 px-3.5 py-2.5 text-[13px] text-white/90">
        {children}
      </div>
    );
  }
  return (
    <div className="max-w-[90%] rounded-2xl rounded-tl-md border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-[13px] text-white/80">
      {children}
    </div>
  );
}

export function AIShowcase() {
  return (
    <section
      id="ai-workspace"
      className="relative mx-auto max-w-7xl px-6 py-28 scroll-mt-24"
    >
      <div className="grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <div className="text-[11px] tracking-[0.2em] text-[#9b7cff]/80">
            AI WORKSPACE
          </div>
          <h2 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-[1.05]">
            AI that understands your actual study material.
          </h2>
          <p className="mt-4 text-[15px] text-white/55 max-w-lg">
            Drop in a PDF, a lecture, or a chapter. Nucleus reads it, remembers
            it, and helps you study it — with sources you can trust.
          </p>

          <div className="mt-8 space-y-4">
            {[
              {
                t: "Grounded in your library",
                d: "Answers cite your own notes and documents.",
              },
              {
                t: "Generates real study artifacts",
                d: "Flashcards, outlines, and recap quizzes — instantly.",
              },
              {
                t: "Remembers across sessions",
                d: "Long-term context that grows as you learn.",
              },
            ].map((f) => (
              <div key={f.t} className="flex gap-3">
                <div className="mt-0.5 h-5 w-5 rounded-md border border-[#7c5cfc]/30 bg-[#7c5cfc]/10 grid place-items-center">
                  <Check className="h-3 w-3 text-[#9b7cff]" />
                </div>
                <div>
                  <div className="text-[14px] font-medium">{f.t}</div>
                  <div className="text-[13px] text-white/50">{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_center,#7c5cfc30,transparent_60%)] blur-2xl" />
          <Tilt max={6} scale={1.015} rest="perspective(1400px) rotateY(0deg) rotateX(0deg)">
            <div className="relative rounded-2xl border border-white/[0.07] bg-[#0c0c14]/80 backdrop-blur p-5 shadow-[0_30px_100px_-20px_rgba(124,92,252,0.4)]">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-md bg-[#7c5cfc]/40 blur-md" />
                    <div className="relative h-6 w-6 rounded-md border border-white/10 bg-[#0f0c1f] grid place-items-center">
                      <Sparkles className="h-3 w-3 text-[#9b7cff]" />
                    </div>
                  </div>
                  <div className="text-[13px] font-medium">Nucleus AI</div>
                  <span className="flex items-center gap-1 rounded bg-emerald-400/15 px-1.5 py-0.5 text-[9px] text-emerald-300 border border-emerald-400/20">
                    <span className="h-1 w-1 rounded-full bg-emerald-300" /> LIVE
                  </span>
                </div>
                <div className="text-[10px] text-white/40">
                  Organic Chem · Ch.4
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <Bubble role="ai">
                  I&apos;ve parsed{" "}
                  <span className="text-[#b9a7ff]">Chapter 4</span>. Want a
                  3-minute summary, key reactions, or a 10-card deck?
                </Bubble>
                <Bubble role="user">
                  Give me the key reactions with mechanisms.
                </Bubble>
                <Bubble role="ai">
                  <div className="font-medium text-white/90">
                    Three core reactions in Ch. 4:
                  </div>
                  <ul className="mt-1.5 space-y-1 text-white/70">
                    <li>
                      • <span className="text-white">SN1</span> — carbocation,
                      racemization
                    </li>
                    <li>
                      • <span className="text-white">SN2</span> — backside
                      attack, inversion
                    </li>
                    <li>
                      • <span className="text-white">E2</span> — anti-periplanar
                      geometry
                    </li>
                  </ul>
                </Bubble>
                <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-[#9b7cff] opacity-70 animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#9b7cff]" />
                  </span>
                  generating follow-up suggestions
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {[
                  "Summarize chapter",
                  "Generate 10 flashcards",
                  "Quiz me",
                  "Explain simply",
                ].map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[11px] text-white/65 hover:text-white hover:border-[#7c5cfc]/40 transition cursor-default"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2">
                <Search className="h-3.5 w-3.5 text-white/40" />
                <div className="text-[12px] text-white/40 flex-1">
                  Ask anything about your studies…
                </div>
                <div className="h-7 w-7 rounded-md bg-[#7c5cfc] grid place-items-center">
                  <ArrowUpRight className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
            </div>
          </Tilt>
        </div>
      </div>
    </section>
  );
}
