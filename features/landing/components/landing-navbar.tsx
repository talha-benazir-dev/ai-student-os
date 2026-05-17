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
  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-x-0 top-0 h-16 bg-[#0a0a0f]/60 backdrop-blur-xl border-b border-white/[0.06]" />
      <nav
        aria-label="Main"
        className="relative mx-auto flex max-w-7xl items-center justify-between px-6 h-16"
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
