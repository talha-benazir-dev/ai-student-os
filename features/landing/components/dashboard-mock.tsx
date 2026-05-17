"use client";

import { Flame, Sparkles } from "lucide-react";
import { Logo } from "./landing-primitives";
import { Tilt } from "./tilt";

export function DashboardMock() {
  return (
    <div className="relative">
      <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_center,#7c5cfc40,transparent_60%)] blur-2xl" />
      <div className="absolute -top-10 right-10 h-40 w-40 rounded-full bg-[#9b7cff]/30 blur-3xl pulse-glow" />

      <Tilt max={8} scale={1.03}>
        <div className="relative rounded-2xl border border-white/[0.07] bg-[#0c0c14]/80 backdrop-blur-xl shadow-[0_30px_100px_-20px_rgba(124,92,252,0.35)] overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <div className="ml-3 text-[10px] text-white/40">
              nucleus.app / dashboard
            </div>
          </div>

          <div className="grid grid-cols-12">
            <aside className="col-span-3 border-r border-white/[0.06] p-3 space-y-1">
              <div className="px-2 py-2">
                <Logo />
              </div>
              <div className="pt-3 px-2 text-[9px] tracking-[0.18em] text-white/35">
                WORKSPACE
              </div>
              {[
                { label: "Dashboard", active: true },
                { label: "Notes" },
                { label: "Tasks" },
                { label: "Documents" },
                { label: "Flashcards" },
                { label: "AI Workspace", badge: "CORE" },
              ].map((i) => (
                <div
                  key={i.label}
                  className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-[11px] ${
                    i.active
                      ? "bg-[#7c5cfc]/15 text-white border border-[#7c5cfc]/30"
                      : "text-white/60"
                  }`}
                >
                  <span>{i.label}</span>
                  {i.badge && (
                    <span className="rounded px-1 py-px text-[8px] bg-[#7c5cfc]/20 text-[#b9a7ff] border border-[#7c5cfc]/30">
                      {i.badge}
                    </span>
                  )}
                </div>
              ))}
            </aside>

            <div className="col-span-6 p-4 space-y-3">
              <div>
                <div className="text-[15px] font-semibold tracking-tight">
                  Welcome back, Zara
                </div>
                <div className="text-[10px] text-white/45">
                  You&apos;re 12% ahead of last week.
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "STUDY HOURS", value: "24.6h", glow: true },
                  { label: "TASKS", value: "18" },
                  { label: "SESSIONS", value: "127" },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className={`relative rounded-lg border p-2.5 ${
                      s.glow
                        ? "border-[#7c5cfc]/40 bg-[#7c5cfc]/[0.06]"
                        : "border-white/[0.06] bg-white/[0.02]"
                    }`}
                  >
                    {s.glow && (
                      <div className="absolute inset-0 rounded-lg bg-[radial-gradient(circle_at_top,#7c5cfc33,transparent_70%)]" />
                    )}
                    <div className="relative text-[8px] tracking-[0.14em] text-white/40">
                      {s.label}
                    </div>
                    <div className="relative mt-1 text-[16px] font-semibold">
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-white/[0.06] bg-white/[0.015] p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-medium">Productivity</div>
                  <div className="text-[9px] text-white/40">7D · 30D · 90D</div>
                </div>
                <div className="mt-3 h-20 relative">
                  <svg viewBox="0 0 200 70" className="absolute inset-0 h-full w-full">
                    <defs>
                      <linearGradient id="landing-chart-g1" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#7c5cfc" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#7c5cfc" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,55 C20,40 40,45 60,35 C90,20 120,30 150,22 C170,17 185,25 200,18 L200,70 L0,70 Z"
                      fill="url(#landing-chart-g1)"
                    />
                    <path
                      d="M0,55 C20,40 40,45 60,35 C90,20 120,30 150,22 C170,17 185,25 200,18"
                      fill="none"
                      stroke="#9b7cff"
                      strokeWidth="1.2"
                    />
                  </svg>
                </div>
                <div className="mt-2 flex items-end justify-between gap-1 h-12">
                  {[30, 45, 38, 55, 62, 80, 70].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-gradient-to-t from-[#7c5cfc]/30 to-[#9b7cff]/80"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-white/[0.06] bg-white/[0.015] p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-medium">
                    Krebs cycle — quick recap
                  </div>
                  <div className="text-[9px] text-white/40">2h ago</div>
                </div>
                <div className="mt-1 text-[10px] text-white/50">
                  ATP yields, intermediates, regulation points. AI summary
                  attached.
                </div>
                <div className="mt-2 flex gap-1.5">
                  <span className="rounded border border-white/10 px-1.5 py-0.5 text-[9px] text-white/55">
                    Biology
                  </span>
                  <span className="rounded border border-[#7c5cfc]/30 bg-[#7c5cfc]/10 px-1.5 py-0.5 text-[9px] text-[#b9a7ff]">
                    ✦ AI summary
                  </span>
                </div>
              </div>
            </div>

            <aside className="col-span-3 border-l border-white/[0.06] p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-[#9b7cff]" />
                  <span className="text-[11px] font-medium">Nucleus AI</span>
                  <span className="rounded bg-emerald-400/15 px-1 py-px text-[8px] text-emerald-300 border border-emerald-400/20">
                    LIVE
                  </span>
                </div>
              </div>
              <div className="text-[9px] text-white/40">CONTEXT</div>
              <div className="text-[10px] text-white/60 -mt-1">
                Organic Chemistry — Ch.4
              </div>

              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-[10px] text-white/75">
                I&apos;ve parsed your chapter. Want a 3-min summary, key
                reactions, or a 10-card deck?
              </div>
              <div className="ml-auto max-w-[85%] rounded-lg bg-[#7c5cfc]/15 border border-[#7c5cfc]/30 p-2 text-[10px] text-white/85">
                Key reactions with mechanisms.
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-[10px] text-white/75 space-y-1">
                <div>Three core reactions:</div>
                <div className="text-white/55">• SN1 — carbocation</div>
                <div className="text-white/55">• SN2 — inversion</div>
                <div className="text-white/55">• E2 — anti-periplanar</div>
              </div>

              <div className="pt-2 flex flex-wrap gap-1.5">
                {["Summarize", "10 flashcards", "Explain"].map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[9px] text-white/60"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </Tilt>

      <div className="hidden lg:block absolute -left-8 bottom-10 floaty">
        <div className="rounded-xl border border-white/[0.08] bg-[#111118]/90 backdrop-blur p-3 shadow-[0_20px_60px_-20px_rgba(124,92,252,0.5)]">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-[#9b7cff]" />
            <div>
              <div className="text-[11px] font-medium">7-day streak</div>
              <div className="text-[9px] text-white/45">Keep it going</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
