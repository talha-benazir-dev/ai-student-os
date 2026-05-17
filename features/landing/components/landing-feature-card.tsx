"use client";

import { useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

export function LandingFeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ rx: 0, ry: 0, x: 50, y: 50, hover: false });

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        setT({
          rx: (0.5 - py) * 10,
          ry: (px - 0.5) * 12,
          x: px * 100,
          y: py * 100,
          hover: true,
        });
      }}
      onMouseLeave={() =>
        setT({ rx: 0, ry: 0, x: 50, y: 50, hover: false })
      }
      className="group relative rounded-xl border border-white/[0.06] bg-[#111118]/60 p-5 overflow-hidden transition-[border-color,box-shadow] duration-300 hover:border-[#7c5cfc]/40 hover:shadow-[0_20px_60px_-20px_rgba(124,92,252,0.45)]"
      style={{
        transform: `perspective(900px) rotateX(${t.rx}deg) rotateY(${t.ry}deg) ${t.hover ? "scale(1.03)" : "scale(1)"}`,
        transition: t.hover
          ? "transform 120ms ease-out"
          : "transform 500ms cubic-bezier(.22,1,.36,1)",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(300px circle at ${t.x}% ${t.y}%, rgba(124,92,252,0.22), transparent 60%)`,
        }}
      />
      <div className="relative" style={{ transform: "translateZ(30px)" }}>
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] relative">
          <div className="absolute inset-0 rounded-lg bg-[#7c5cfc]/10 blur-md opacity-60 group-hover:opacity-100 transition" />
          <Icon className="relative h-4 w-4 text-[#9b7cff]" />
        </div>
        <div className="mt-5 text-[15px] font-medium">{title}</div>
        <div className="mt-1.5 text-[13px] leading-relaxed text-white/55">
          {desc}
        </div>
      </div>
    </div>
  );
}
