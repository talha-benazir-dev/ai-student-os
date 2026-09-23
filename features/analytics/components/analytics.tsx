import { AppShell } from "@/features/dashboard/components/app-shell";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { StudyChart, FocusBars } from "@/features/dashboard/components/charts";

const subjects = [
  { name: "Chemistry", hours: 8.4, share: 34 },
  { name: "Biology", hours: 6.1, share: 25 },
  { name: "Math", hours: 4.8, share: 20 },
  { name: "History", hours: 3.2, share: 13 },
  { name: "Physics", hours: 2.1, share: 8 },
];

const weeks = [
  { week: "Feb 3 – Feb 9", hours: "18.2", sessions: 21, focus: "84" },
  { week: "Feb 10 – Feb 16", hours: "21.7", sessions: 24, focus: "88" },
  { week: "Feb 17 – Feb 23", hours: "22.0", sessions: 23, focus: "90" },
  { week: "Feb 24 – Mar 2", hours: "24.6", sessions: 26, focus: "92" },
];

export default function AnalyticsPage() {
  return (
    <AppShell showAI={false}>
      <div className="px-6 lg:px-8 py-6 mx-auto w-full max-w-6xl">
        <PageHeader
          title="Analytics"
          description="Four weeks of focus · 24.6 hours last week · trend is up."
        />

        <div className="rounded-xl border border-border bg-border grid md:grid-cols-3 gap-px overflow-hidden mb-6">
          <div className="bg-card px-5 py-4">
            <div className="text-[13px] text-muted-foreground">Total hours</div>
            <div className="text-2xl font-semibold tracking-tight tabular-nums mt-1">
              86.5
            </div>
            <div className="text-xs text-success mt-0.5">+18% vs prior period</div>
          </div>
          <div className="bg-card px-5 py-4">
            <div className="text-[13px] text-muted-foreground">Deep focus share</div>
            <div className="text-2xl font-semibold tracking-tight tabular-nums mt-1">
              68%
            </div>
            <div className="text-xs text-success mt-0.5">+6 pts</div>
          </div>
          <div className="bg-card px-5 py-4">
            <div className="text-[13px] text-muted-foreground">Current streak</div>
            <div className="text-2xl font-semibold tracking-tight tabular-nums mt-1">
              7 days
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Best: 12 days</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <section className="rounded-xl border border-border bg-card">
            <div className="px-5 pt-4 pb-3 border-b border-border">
              <h2 className="text-sm font-semibold tracking-tight">
                Hours per day
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Last 7 days · peak on Sunday
              </p>
            </div>
            <div className="p-5">
              <StudyChart />
            </div>
          </section>
          <section className="rounded-xl border border-border bg-card">
            <div className="px-5 pt-4 pb-3 border-b border-border">
              <h2 className="text-sm font-semibold tracking-tight">
                Focus depth
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Deep vs. light sessions
              </p>
            </div>
            <div className="p-5">
              <FocusBars />
            </div>
          </section>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="rounded-xl border border-border bg-card">
            <div className="px-5 pt-4 pb-3 border-b border-border">
              <h2 className="text-sm font-semibold tracking-tight">
                Time by subject
              </h2>
            </div>
            <div className="px-5 py-4 space-y-3.5">
              {subjects.map((s) => (
                <div key={s.name}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-[13px] font-medium">{s.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {s.hours}h
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-accent overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${s.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card overflow-hidden h-fit">
            <div className="px-5 pt-4 pb-3 border-b border-border">
              <h2 className="text-sm font-semibold tracking-tight">
                Weekly history
              </h2>
            </div>
            <div className="divide-y divide-border">
              {weeks.map((w) => (
                <div
                  key={w.week}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 items-baseline"
                >
                  <span className="text-[13px] truncate">{w.week}</span>
                  <span className="text-[13px] tabular-nums text-right">
                    {w.hours}h
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums text-right w-16">
                    {w.sessions} sessions
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums text-right w-10">
                    {w.focus}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
