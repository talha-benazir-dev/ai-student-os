"use client";
import type { RefObject } from "react";
import { ArrowRight } from "lucide-react";
import { PrimaryButton } from "./landing-primitives";
import { useReveal } from "../hooks/use-reveal";

export function LandingCTA() {
  const { ref, visible } = useReveal(0.1);
  return (
    <section
      id="pricing"
      ref={ref as RefObject<HTMLElement>}
      className="relative mx-auto max-w-7xl px-6 py-24 scroll-mt-24"
    >
      <div className={`reveal ${visible ? "visible" : ""}`}>
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0c0c14] px-6 py-24 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#7c5cfc55,transparent_60%)]" />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-[#9b7cff]/30 blur-[140px]" />
          <div className="absolute inset-x-0 bottom-0 h-px shimmer" />
          <div className="relative">
            <h3 className="text-4xl sm:text-6xl font-semibold tracking-[-0.03em] leading-[1.02]">
              Study with memory.
            </h3>
            <p className="mt-5 text-[15px] text-white/55 max-w-md mx-auto">
              Join the students building a calmer, smarter way to learn.
            </p>
            <div className="mt-8 flex justify-center">
              <PrimaryButton href="/signup" className="!px-6 !py-3 text-[14px]">
                Get started — it&apos;s free <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
            </div>
            <div className="mt-4 text-[11px] text-white/35">No credit card required</div>
          </div>
        </div>
      </div>
    </section>
  );
}
