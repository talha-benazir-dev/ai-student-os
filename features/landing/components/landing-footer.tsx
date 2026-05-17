import { Logo } from "./landing-primitives";

export function LandingFooter() {
  return (
    <footer id="about" className="relative border-t border-white/[0.06] scroll-mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <Logo />
          <div className="mt-3 text-[12px] text-white/40">The AI Study OS.</div>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-[12px] text-white/45">
          {["Features", "Pricing", "Changelog", "Docs", "Privacy", "Terms"].map(
            (l) => (
              <a
                key={l}
                href={
                  l === "Features"
                    ? "#features"
                    : l === "Pricing"
                      ? "#pricing"
                      : "#"
                }
                className="hover:text-white/80 transition"
              >
                {l}
              </a>
            )
          )}
        </div>
        <div className="text-[11px] text-white/30">
          © {new Date().getFullYear()} Nucleus Labs
        </div>
      </div>
    </footer>
  );
}
