"use client";
import { ArrowRight, Check } from "lucide-react";
import { GhostButton, PrimaryButton } from "./landing-primitives";
import { DashboardMock } from "./dashboard-mock";

export function LandingHero() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-24 pb-20 lg:pt-32 lg:pb-28">
      <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        <div className="lg:col-span-6 space-y-0">
          <div className="hero-fade hero-fade-delay-1 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-[11px] text-white/70">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#9b7cff] opacity-75 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#9b7cff]" />
            </span>
            Nucleus -- Study OS for thinkers
          </div>

          <h1 className="hero-fade hero-fade-delay-2 mt-6 text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.03em] leading-[1.02]">
            Your knowledge,
            <br />
            <span className="bg-gradient-to-r from-white via-white to-[#b9a7ff] bg-clip-text text-transparent">
              finally organized.
            </span>
          </h1>

          <p className="hero-fade hero-fade-delay-3 mt-6 max-w-lg text-[15px] leading-relaxed text-white/60">
            Nucleus is the AI study workspace for focused students. Notes,
            tasks, documents, and a memory that actually understands what
            you&apos;re learning.
          </p>

          <div className="hero-fade hero-fade-delay-4 mt-8 flex flex-wrap items-center gap-3">
            <PrimaryButton href="/signup" className="!px-5 !py-2.5 text-[14px]">
              Open Nucleus
              <ArrowRight className="h-4 w-4" />
            </PrimaryButton>
            <GhostButton href="#features" className="!px-5 !py-2.5 text-[14px]">
              See it in action
            </GhostButton>
          </div>

          <div className="hero-fade hero-fade-delay-5 mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12px] text-white/45">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[#9b7cff]" /> 10k+ study
              sessions
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[#9b7cff]" /> Built for focused
              students
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[#9b7cff]" /> AI-powered memory
            </span>
          </div>
        </div>

        <div className="hidden lg:block lg:col-span-6 relative hero-fade hero-fade-delay-3">
          <DashboardMock />
        </div>
      </div>
    </section>
  );
}
