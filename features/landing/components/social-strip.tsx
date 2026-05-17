export function SocialStrip() {
  const items = ["Stanford", "MIT", "Oxford", "ETH Zürich", "NUS", "Berkeley"];
  return (
    <section className="relative mx-auto max-w-7xl px-6 pb-20">
      <div className="text-center text-[11px] tracking-[0.2em] text-white/35">
        TRUSTED BY STUDENTS AT
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {items.map((i) => (
          <div
            key={i}
            className="text-[13px] text-white/40 hover:text-white/70 transition"
          >
            {i}
          </div>
        ))}
      </div>
    </section>
  );
}
