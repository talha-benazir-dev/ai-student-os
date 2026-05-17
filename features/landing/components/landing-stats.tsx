export function LandingStats() {
  const items = [
    { v: "10k+", l: "Study sessions" },
    { v: "92", l: "Avg focus score" },
    { v: "47m", l: "Avg deep block" },
    { v: "14×", l: "Faster review" },
  ];

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
        {items.map((s) => (
          <div key={s.l} className="bg-[#0a0a0f] p-6">
            <div className="text-3xl font-semibold tracking-tight">{s.v}</div>
            <div className="mt-1 text-[12px] text-white/45">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
