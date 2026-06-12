"use client";

import type { RefObject } from "react";
import { Check, X, Sparkles } from "lucide-react";
import { useReveal } from "../hooks/use-reveal";
import Link from "next/link";

export function PricingSection() {
  const { ref, visible } = useReveal(0.1);

  const freeIncludes = [
    "notes/tasks/flashcards",
    "clusters",
    "5 doc uploads/month",
    "SM-2 repetition",
    "study sessions",
    "streaks",
    "analytics",
  ];

  const freeLocked = [
    "AI workspace",
    "autonomous study packs",
    "curriculum mode",
    "AI flashcard generation",
  ];

  const proIncludes = [
    "everything in Free",
    "all AI features",
    "unlimited uploads",
    "document AI summaries",
  ];

  const teamIncludes = [
    "everything in Pro",
    "shared clusters",
    "up to 10 members",
    "team analytics (UI only)",
  ];

  return (
    <section
      id="pricing"
      ref={ref as RefObject<HTMLElement>}
      className="relative mx-auto max-w-7xl px-6 py-24 scroll-mt-24"
    >
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#7c5cfc]/10 blur-[120px] pointer-events-none" />

      <div className={`text-center max-w-3xl mx-auto mb-16 reveal ${visible ? "visible" : ""}`}>
        <div className="text-[11px] tracking-[0.2em] text-[#9b7cff]/80 font-medium uppercase">
          Pricing Plans
        </div>
        <h2 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-[1.05]">
          A plan for every student&apos;s pace.
        </h2>
        <p className="mt-4 text-[15px] text-white/55 max-w-xl mx-auto">
          Start for free, upgrade when you need supercharged learning tools and AI support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
        {/* FREE PLAN */}
        <div
          className={`reveal reveal-delay-1 flex flex-col justify-between rounded-2xl border border-[#ffffff10] bg-[#0f0f17] p-8 transition-all duration-300 hover:border-white/20 ${
            visible ? "visible" : ""
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium text-white/90">Free</h3>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-semibold tracking-tight text-white">$0</span>
              <span className="text-sm text-white/40">/forever</span>
            </div>
            <p className="text-sm text-white/50 mb-8">
              A solid foundation to organize your studies and build long-term recall habits.
            </p>

            <div className="space-y-4 mb-8">
              <div className="text-xs font-semibold tracking-wider text-white/30 uppercase">
                Included Features
              </div>
              <ul className="space-y-3">
                {freeIncludes.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm text-white/80">
                    <Check className="h-4 w-4 text-[#7c5cfc] mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 space-y-3 border-t border-white/[0.06]">
                {freeLocked.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm text-white/25">
                    <X className="h-4 w-4 text-white/25 mt-0.5 shrink-0" />
                    <span className="line-through">{feat}</span>
                  </li>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/signup"
            className="w-full text-center py-2.5 px-4 rounded-xl text-sm font-medium border border-white/10 bg-white/[0.02] text-white hover:bg-white/[0.06] hover:border-white/20 transition duration-200"
          >
            Get Started
          </Link>
        </div>

        {/* PRO PLAN */}
        <div
          className={`reveal reveal-delay-2 flex flex-col justify-between rounded-2xl border-[#7c5cfc] shadow-[0_0_40px_-8px_#7c5cfc66] scale-105 bg-[#0f0f17] p-8 relative transition-all duration-300 z-10 ${
            visible ? "visible" : ""
          }`}
        >
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#7c5cfc] text-white text-[10px] font-semibold tracking-wider uppercase shadow-md flex items-center gap-1">
            <Sparkles className="h-3 w-3 fill-white" />
            Most Popular
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 mt-2">
              <h3 className="text-xl font-semibold text-white">Pro</h3>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold tracking-tight text-white">$8</span>
              <span className="text-sm text-white/40">/mo</span>
            </div>
            <p className="text-sm text-white/60 mb-8">
              Unlock our complete suite of AI-powered features for next-level study efficiency.
            </p>

            <div className="space-y-4 mb-8">
              <div className="text-xs font-semibold tracking-wider text-[#9b7cff] uppercase">
                All Pro Features
              </div>
              <ul className="space-y-3">
                {proIncludes.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm text-white">
                    <Check className="h-4 w-4 text-[#7c5cfc] mt-0.5 shrink-0" />
                    <span className={feat === "everything in Free" ? "font-medium text-white/95" : ""}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Link
            href="/signup?plan=pro"
            className="w-full text-center py-2.5 px-4 rounded-xl text-sm font-semibold bg-[#7c5cfc] text-white hover:bg-[#6a4ce0] transition duration-200 shadow-[0_4px_20px_rgba(124,92,252,0.3)]"
          >
            Upgrade to Pro
          </Link>
        </div>

        {/* TEAM PLAN */}
        <div
          className={`reveal reveal-delay-3 flex flex-col justify-between rounded-2xl border border-[#ffffff10] bg-[#0f0f17] p-8 transition-all duration-300 hover:border-white/20 ${
            visible ? "visible" : ""
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium text-white/90">Team</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[9px] font-semibold tracking-wide uppercase">
                Coming Soon
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-semibold tracking-tight text-white">$20</span>
              <span className="text-sm text-white/40">/mo</span>
            </div>
            <p className="text-sm text-white/50 mb-8">
              Perfect for study groups, classrooms, and teams working on research together.
            </p>

            <div className="space-y-4 mb-8">
              <div className="text-xs font-semibold tracking-wider text-white/30 uppercase">
                Collaborative Tools
              </div>
              <ul className="space-y-3">
                {teamIncludes.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm text-white/80">
                    <Check className="h-4 w-4 text-[#7c5cfc] mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            disabled
            className="w-full text-center py-2.5 px-4 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white/20 cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>
      </div>
    </section>
  );
}
