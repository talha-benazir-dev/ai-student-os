"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo, PrimaryButton } from "./landing-primitives";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "AI Workspace", href: "#ai-workspace" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ${
        scrolled ? "pt-4" : "pt-0"
      }`}
    >
      <nav
        aria-label="Main"
        className={`flex w-full items-center justify-between px-6 h-14 transition-all duration-500 ${
          scrolled
            ? "max-w-3xl rounded-full border border-white/[0.10] bg-[#0c0c14]/85 backdrop-blur-xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)] px-5"
            : "max-w-7xl border-b border-white/[0.06] bg-[#0a0a0f]/60 backdrop-blur-xl"
        }`}
      >
        <Logo />
        <div className="hidden md:flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.02] px-1.5 py-1.5">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-3 py-1.5 text-[13px] text-white/70 hover:text-white rounded-full hover:bg-white/[0.05] transition"
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline text-[13px] text-white/70 hover:text-white px-3 py-2 transition"
          >
            Sign in
          </Link>
          <PrimaryButton href="/signup">
            Get started <ArrowRight className="h-3.5 w-3.5" />
          </PrimaryButton>
        </div>
      </nav>
    </header>
  );
}
