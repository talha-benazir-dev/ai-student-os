import { Metadata } from "next";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { StatCard } from "@/features/dashboard/components/start-card";
import { StudyChart, FocusBars } from "@/features/dashboard/components/charts";
import {
  Search,
  Clock,
  CheckSquare,
  FileText,
  Sparkles,
  Flame,
  Bell,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dashboard — Nucleus",
  description: "Your AI study operating system.",
};

export default function Dashboard() {
  return (
    <AppShell>
      <div className="px-6 lg:px-8 py-6 mx-auto w-full max-w-6xl">
        <PageHeader
          meta="Tuesday, March 4"
          title="Good evening, Zara"
          description="You're 12% ahead of last week. Two deep-focus blocks are scheduled today."
          actions={
            <>
              <Button variant="outline" size="icon" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4" /> New
              </Button>
            </>
          }
        />

        {/* Command bar */}
        <div className="relative mb-6">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5 focus-within:border-ring transition-colors">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              placeholder="Search notes, files, or ask Nucleus AI…"
              className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            <kbd className="font-mono text-[11px] text-muted-foreground border border-border rounded px-1.5 py-0.5 shrink-0">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Stats — single strip with dividers, not five cards */}
        <div className="rounded-xl border border-border bg-border mb-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-px overflow-hidden">
          <StatCard
            icon={Clock}
            label="Study hours"
            value="24.6"
            unit="h"
            delta="+12%"
          />
          <StatCard
            icon={CheckSquare}
            label="Active tasks"
            value="18"
            delta="+3"
            deltaTone="neutral"
          />
          <StatCard
            icon={FileText}
            label="Documents"
            value="42"
            delta="+5"
            deltaTone="neutral"
          />
          <StatCard
            icon={Sparkles}
            label="AI sessions"
            value="127"
            delta="+24"
            deltaTone="neutral"
          />
          <StatCard
            icon={Flame}
            label="Day streak"
            value="7"
            delta="Best: 12"
            deltaTone="neutral"
          />
        </div>

        {/* Analytics */}
        <section className="rounded-xl border border-border bg-card mb-6">
          <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">
                Productivity
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Weekly study hours and focus depth
              </p>
            </div>
            <div className="inline-flex rounded-md border border-border p-0.5 text-xs">
              <button className="px-2.5 py-1 rounded bg-accent text-foreground font-medium">
                7D
              </button>
              <button className="px-2.5 py-1 rounded text-muted-foreground hover:text-foreground">
                30D
              </button>
              <button className="px-2.5 py-1 rounded text-muted-foreground hover:text-foreground">
                90D
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="p-5">
              <div className="text-[13px] text-muted-foreground mb-3">
                Hours per day
              </div>
              <StudyChart />
            </div>
            <div className="p-5">
              <div className="text-[13px] text-muted-foreground mb-3">
                Deep vs. light focus
              </div>
              <FocusBars />
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
            <Metric label="Focus score" value="92" sub="Excellent" />
            <Metric label="Avg. session" value="47m" sub="+6m vs last week" />
            <Metric label="Topics mastered" value="14" sub="+3 this week" />
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent notes */}
          <section className="rounded-xl border border-border bg-card">
            <SectionHead
              title="Recent notes"
              description="Continued from last session"
              action="View all"
            />
            <div className="divide-y divide-border">
              <NoteRow
                title="Krebs cycle — quick recap"
                time="2h ago"
                body="ATP yields, intermediates, regulation points."
                tags={["Biology"]}
                ai
              />
              <NoteRow
                title="Linear algebra — eigenvectors"
                time="Yesterday"
                body="Geometric intuition and problem set 4 examples."
                tags={["Math"]}
                ai
              />
              <NoteRow
                title="Pacific theater timeline"
                time="Monday"
                body="Major battles compared across two textbooks."
                tags={["History"]}
              />
              <NoteRow
                title="Newton's laws — lab notes"
                time="Sunday"
                body="Friction coefficients; verify second measurement."
                tags={["Physics"]}
              />
            </div>
          </section>

          {/* Documents */}
          <section className="rounded-xl border border-border bg-card h-fit">
            <SectionHead
              title="Documents"
              description="3 summaries ready for review"
              action="Open library"
            />
            <div className="divide-y divide-border">
              <DocRow
                title="Organic Chemistry — Chapter 4.pdf"
                meta="2.4 MB · 38 pages"
                tag="Chemistry"
                ai
              />
              <DocRow
                title="World History — Cold War.pdf"
                meta="1.1 MB · 22 pages"
                tag="History"
                ai
              />
              <DocRow
                title="Calculus II — Series and Sequences.pdf"
                meta="3.8 MB · 64 pages"
                tag="Math"
              />
              <DocRow
                title="Cell Biology — Mitosis notes.pdf"
                meta="880 KB · 14 pages"
                tag="Biology"
                ai
              />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function Metric({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="px-5 py-4">
      <div className="text-[13px] text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold tracking-tight tabular-nums mt-1">
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}

function SectionHead({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-border">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {action && (
        <button className="text-xs text-muted-foreground hover:text-foreground transition inline-flex items-center gap-1 shrink-0">
          {action} <ArrowUpRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function NoteRow({
  title,
  time,
  body,
  tags,
  ai,
}: {
  title: string;
  time: string;
  body: string;
  tags: string[];
  ai?: boolean;
}) {
  return (
    <div className="px-5 py-3.5 hover:bg-accent/30 transition-colors cursor-pointer">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[13px] font-medium truncate">{title}</h3>
        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
          {time}
        </span>
      </div>
      <p className="text-[13px] text-muted-foreground truncate mt-0.5">
        {body}
      </p>
      <div className="flex items-center gap-2 mt-1.5">
        {tags.map((t) => (
          <span key={t} className="text-xs text-muted-foreground">
            {t}
          </span>
        ))}
        {ai && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-success">
            <Sparkles className="h-3 w-3" /> Summarized
          </span>
        )}
      </div>
    </div>
  );
}

function DocRow({
  title,
  meta,
  tag,
  ai,
}: {
  title: string;
  meta: string;
  tag: string;
  ai?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-accent/30 transition-colors cursor-pointer">
      <div className="h-8 w-8 shrink-0 rounded-md bg-accent flex items-center justify-center text-muted-foreground">
        <FileText className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium truncate">{title}</div>
        <div className="text-xs text-muted-foreground tabular-nums">
          {meta} · {tag}
        </div>
      </div>
      {ai && (
        <span className="text-xs text-success inline-flex items-center gap-1 shrink-0">
          <Sparkles className="h-3 w-3" /> Ready
        </span>
      )}
    </div>
  );
}
