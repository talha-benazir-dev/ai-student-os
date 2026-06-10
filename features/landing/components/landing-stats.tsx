"use client";
import type { RefObject } from "react";
import { useReveal } from "../hooks/use-reveal";

export function LandingStats() {
  const { ref, visible } = useReveal(0.2);
  const items = [
    { v: "10k+", l: "Study sessions" },
    { v: "92", l: "Avg focus score" },
    { v: "47m", l: "Avg deep block" },
    { v: "14×", l: "Faster review" },
  ];
  return (
    <section
      ref={ref as RefObject<HTMLElement>}
      className="relative mx-auto max-w-7xl px-6 py-16"
    >
      <div className={`reveal ${visible ? "visible" : ""}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
          {items.map((s, i) => (
            <div key={s.l} className="relative bg-[#0a0a0f] p-8 group">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7c5cfc]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div
                className={`text-4xl font-semibold tracking-tight bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent reveal reveal-delay-${i + 1} ${visible ? "visible" : ""}`}
              >
                {s.v}
              </div>
              <div className="mt-1.5 text-[12px] text-white/40">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
