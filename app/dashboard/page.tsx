import { Metadata } from "next";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { CommandShortcut } from "@/features/dashboard/components/command-shortcut";
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

export const metadata: Metadata = {
  title: "Dashboard — Nucleus",
  description: "Your AI study operating system.",
};

export default function Dashboard() {
  return (
    <AppShell>
      <div className="px-4 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-8 mx-auto w-full max-w-[1400px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 sm:mb-7">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">
              Welcome back, Zara
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {
                "You're 12% ahead of last week. Two deep-focus blocks scheduled today."
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-lg border border-border bg-card hover:bg-accent transition flex items-center justify-center text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
            </button>
            <button className="h-9 px-3 rounded-lg bg-gradient-violet text-white text-sm font-medium flex items-center gap-1.5 shadow-[0_0_20px_-4px_oklch(0.66_0.21_295/0.6)] hover:scale-[1.02] transition">
              <Plus className="h-4 w-4" /> New
            </button>
          </div>
        </div>

        {/* Search / command */}
        <div className="relative mb-6 sm:mb-7 group">
          <div className="relative rounded-xl border border-border bg-card hover:border-primary/30 focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_oklch(0.66_0.21_295/0.12)] transition">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search or ask Nucleus AI…"
              className="w-full bg-transparent pl-10 sm:pl-11 pr-16 sm:pr-32 py-3 sm:py-3.5 text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden lg:inline">
                Try
              </span>
              <span className="text-xs px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary-soft hidden lg:inline">
                {"summarize biology ch.3"}
              </span>
              <CommandShortcut />
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
          <StatCard
            active
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
            label="Streak"
            value="7"
            unit="days"
            delta="🔥"
            deltaTone="warning"
          />
        </div>

        {/* Analytics */}
        <section className="rounded-2xl border border-border bg-card p-4 sm:p-6 mb-6">
          <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
            <div className="min-w-0">
              <h2 className="text-base font-semibold">
                Productivity analytics
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Weekly study hours · deep vs. light focus
              </p>
            </div>
            <div className="inline-flex rounded-lg border border-border bg-background p-0.5 text-xs">
              <button className="px-2.5 py-1 rounded-md bg-primary/15 text-primary-soft border border-primary/25">
                7D
              </button>
              <button className="px-2.5 py-1 rounded-md text-muted-foreground hover:text-foreground">
                30D
              </button>
              <button className="px-2.5 py-1 rounded-md text-muted-foreground hover:text-foreground">
                90D
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            <StudyChart />
            <FocusBars />
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-5 pt-5 border-t border-border">
            <Metric label="Focus score" value="92" sub="Excellent" />
            <Metric label="Avg session" value="47m" sub="+6m vs last wk" />
            <Metric label="Topics mastered" value="14" sub="+3 this week" />
          </div>
        </section>

        {/* Recent notes */}
        <section className="rounded-2xl border border-border bg-card p-4 sm:p-6 mb-6">
          <SectionHeader
            title="Recent notes"
            subtitle="Picked up where you left off"
            action="View all"
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <NoteCard
              title="Krebs cycle — quick recap"
              time="2h ago"
              body="ATP yields, intermediates, regulation points. AI summary attached."
              tags={["Biology", "Ch.7"]}
              ai
            />
            <NoteCard
              title="Linear algebra — eigenvectors"
              time="Yesterday"
              body="Geometric intuition + worked examples from problem set 4."
              tags={["Math", "Lec 12"]}
              ai
            />
            <NoteCard
              title="WWII — Pacific theater"
              time="Mon"
              body="Timeline of major battles. Compared two textbook narratives."
              tags={["History"]}
            />
            <NoteCard
              title="Newton's laws — lab notes"
              time="Sun"
              body="Friction coefficients table; need to double-check μ₂."
              tags={["Physics", "Lab"]}
            />
          </div>
        </section>

        {/* Documents */}
        <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <SectionHeader
            title="Recent documents"
            subtitle="3 new AI summaries ready"
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
              title="Calculus II — Series & Sequences.pdf"
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
    <div>
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: string;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && (
        <button className="text-xs text-primary-soft hover:text-foreground transition inline-flex items-center gap-1">
          {action} <ArrowUpRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function NoteCard({
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
    <div className="rounded-xl border border-border bg-background/50 p-4 hover:border-primary/30 hover:bg-background transition cursor-pointer group">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="text-sm font-medium leading-tight">{title}</h3>
        <span className="text-[11px] text-muted-foreground shrink-0">
          {time}
        </span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{body}</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        {tags.map((t) => (
          <span
            key={t}
            className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-white/5 text-muted-foreground"
          >
            {t}
          </span>
        ))}
        {ai && (
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-success/10 border border-success/25 text-success inline-flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5" /> AI summary
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
    <div className="flex items-center gap-3 py-3 group">
      <div className="h-9 w-9 shrink-0 rounded-lg border border-border bg-background/60 flex items-center justify-center text-muted-foreground">
        <FileText className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{title}</div>
        <div className="text-xs text-muted-foreground">{meta}</div>
      </div>
      <span className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-white/5 text-muted-foreground hidden sm:inline">
        {tag}
      </span>
      {ai && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 border border-success/25 text-success inline-flex items-center gap-1">
          <Sparkles className="h-2.5 w-2.5" /> AI summary
        </span>
      )}
    </div>
  );
}
