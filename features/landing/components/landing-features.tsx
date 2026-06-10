"use client";
import type { RefObject } from "react";
import { BrainCircuit, ListChecks, NotebookPen, Sparkles } from "lucide-react";
import { LandingFeatureCard } from "./landing-feature-card";
import { useReveal } from "../hooks/use-reveal";

const items = [
  { icon: NotebookPen, title: "Smart Notes", desc: "Capture lectures, readings, and ideas. Nucleus structures them automatically." },
  { icon: ListChecks, title: "Tasks & Focus", desc: "Deep-focus blocks, smart scheduling, and a calm view of what matters today." },
  { icon: BrainCircuit, title: "AI Workspace", desc: "An assistant that lives next to your material. Ask, summarize, generate — instantly." },
  { icon: Sparkles, title: "Study Memory", desc: "Long-term recall built on spaced repetition and the things you actually struggle with." },
];

export function LandingFeatures() {
  const { ref, visible } = useReveal();
  return (
    <section
      id="features"
      ref={ref as RefObject<HTMLElement>}
      className="relative mx-auto max-w-7xl px-6 py-20 scroll-mt-24"
    >
      <div className={`max-w-2xl reveal ${visible ? "visible" : ""}`}>
        <div className="text-[11px] tracking-[0.2em] text-[#9b7cff]/80">FEATURES</div>
        <h2 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-[1.05]">
          The AI workspace built for students.
        </h2>
        <p className="mt-4 text-[15px] text-white/55 max-w-xl">
          Every surface is designed to keep you in flow — from your first note to your final exam.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(({ icon, title, desc }, i) => (
          <div
            key={title}
            className={`reveal reveal-delay-${i + 1} ${visible ? "visible" : ""}`}
          >
            <LandingFeatureCard icon={icon} title={title} desc={desc} />
          </div>
        ))}
      </div>
    </section>
  );
}
