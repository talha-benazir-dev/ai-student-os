"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative h-7 w-7">
        <div className="absolute inset-0 rounded-md bg-[#7c5cfc]/30 blur-md" />
        <div className="relative h-7 w-7 rounded-md border border-white/10 bg-gradient-to-br from-[#1a1530] to-[#0f0c1f] grid place-items-center">
          <Sparkles className="h-3.5 w-3.5 text-[#9b7cff]" />
        </div>
      </div>
      <div className="leading-none">
        <div className="text-[15px] font-semibold tracking-tight">Nucleus</div>
        <div className="text-[9px] tracking-[0.18em] text-white/40 mt-0.5">
          STUDY OS
        </div>
      </div>
    </div>
  );
}

export function GhostButton({
  children,
  className = "",
  href,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  const classes = `group relative inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-white/80 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes}>
      {children}
    </button>
  );
}

export function PrimaryButton({
  children,
  className = "",
  href,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className="absolute -inset-px rounded-lg bg-gradient-to-b from-[#9b7cff] to-[#6a48f0] opacity-90 group-hover:opacity-100 transition" />
      <span className="absolute -inset-1 rounded-xl bg-[#7c5cfc]/40 blur-lg opacity-60 group-hover:opacity-90 transition" />
      <span className="relative flex items-center gap-1.5">{children}</span>
    </>
  );

  const classes = `group relative inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" className={classes}>
      {inner}
    </button>
  );
}
