import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
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
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard — Nucleus",
  description: "Your AI study operating system.",
};

function ChartSkeleton() {
  return (
    <div className="w-full h-[180px] rounded-lg bg-muted/30 animate-pulse" />
  );
}

function getRelativeTime(dateString: string): string {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  let profileName = "there";
  let activeTasks = 0;
  let notesCount = 0;
  let recentNotes: any[] = [];

  if (userId) {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", userId)
          .single();
        if (!error && data?.name) profileName = data.name;
      } catch (e) {}
    };

    const fetchTasksCount = async () => {
      try {
        const { count, error } = await supabase
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("completed", false);
        if (!error && count !== null) activeTasks = count;
      } catch (e) {}
    };

    const fetchNotesCount = async () => {
      try {
        const { count, error } = await supabase
          .from("notes")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId);
        if (!error && count !== null) notesCount = count;
      } catch (e) {}
    };

    const fetchRecentNotes = async () => {
      try {
        const { data, error } = await supabase
          .from("notes")
          .select("id, title, content, subject, updated_at")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(4);
        if (!error && data) recentNotes = data;
      } catch (e) {}
    };

    await Promise.all([
      fetchProfile(),
      fetchTasksCount(),
      fetchNotesCount(),
      fetchRecentNotes(),
    ]);
  }

  const subtitle =
    activeTasks > 0
      ? `You have ${activeTasks} task${activeTasks === 1 ? "" : "s"} pending today. Keep pushing.`
      : "All clear. Nothing pending — add tasks to stay on track.";

  return (
    <div className="px-4 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-8 mx-auto w-full max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 sm:mb-7">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">
            Welcome back, {profileName}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {subtitle}
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
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <StatCard active icon={Clock} label="Study hours" value="--" unit="h" />
        <StatCard
          icon={CheckSquare}
          label="Active tasks"
          value={activeTasks.toString()}
        />
        <StatCard icon={FileText} label="Notes" value={notesCount.toString()} />
        <StatCard icon={FileText} label="Documents" value="--" />
        <StatCard icon={Sparkles} label="AI sessions" value="--" />
        <StatCard icon={Flame} label="Streak" value="--" unit="days" />
      </div>

      {/* Analytics */}
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6 mb-6">
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Productivity analytics</h2>
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
          <Suspense fallback={<ChartSkeleton />}>
            <StudyChart />
          </Suspense>
          <Suspense fallback={<ChartSkeleton />}>
            <FocusBars />
          </Suspense>
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
          href="/notes"
        />
        {recentNotes.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {recentNotes.map((note) => (
              <NoteCard
                key={note.id}
                title={note.title || "Untitled"}
                time={getRelativeTime(note.updated_at)}
                body={
                  note.content
                    ? note.content.length > 120
                      ? note.content.substring(0, 120) + "..."
                      : note.content
                    : "No content yet."
                }
                tags={note.subject ? [note.subject] : []}
                ai={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-4 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
            No notes yet. Start writing in the Notes page.
          </div>
        )}
      </section>

      {/* Documents */}
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <SectionHeader
          title="Recent documents"
          subtitle="3 new AI summaries ready"
          action="Open library"
          href="/documents"
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
  href,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  href?: string;
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
        <>
          {href ? (
            <Link
              href={href}
              className="text-xs text-primary-soft hover:text-foreground transition inline-flex items-center gap-1"
            >
              {action} <ArrowUpRight className="h-3 w-3" />
            </Link>
          ) : (
            <button className="text-xs text-primary-soft hover:text-foreground transition inline-flex items-center gap-1">
              {action} <ArrowUpRight className="h-3 w-3" />
            </button>
          )}
        </>
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
