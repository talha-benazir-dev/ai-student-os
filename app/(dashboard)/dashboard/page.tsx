import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CommandShortcut } from "@/features/dashboard/components/command-shortcut";
import { StatCard } from "@/features/dashboard/components/start-card";
import { StudyChart, FocusBars } from "@/features/dashboard/components/charts";
import { RecentNotesSection } from "@/features/dashboard/components/recent-notes";
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

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  let profileName = "there";
  let activeTasks = 0;
  let notesCount = 0;
  let documentsCount = 0;
  let recentNotes: any[] = [];
  let recentDocuments: any[] = [];

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

    const fetchDocumentsCount = async () => {
      try {
        const { count, error } = await supabase
          .from("documents")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId);
        if (!error && count !== null) documentsCount = count;
      } catch (e) {}
    };

    const fetchRecentDocuments = async () => {
      try {
        const { data, error } = await supabase
          .from("documents")
          .select("id, title, file_size, subject, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(4);
        if (!error && data) recentDocuments = data;
      } catch (e) {}
    };

    await Promise.all([
      fetchProfile(),
      fetchTasksCount(),
      fetchNotesCount(),
      fetchRecentNotes(),
      fetchDocumentsCount(),
      fetchRecentDocuments(),
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
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
        <StatCard active icon={Clock} label="Study hours" value="--" unit="h" />
        <StatCard
          icon={CheckSquare}
          label="Active tasks"
          value={activeTasks.toString()}
        />
        <StatCard icon={FileText} label="Notes" value={notesCount.toString()} />
        <StatCard
          icon={FileText}
          label="Documents"
          value={documentsCount.toString()}
        />
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
          <div className="col-span-3 flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 inline-block" />
            Detailed analytics coming in a future update
          </div>
        </div>
      </section>

      {/* Recent notes */}
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6 mb-6">
        <RecentNotesSection notes={recentNotes} />
      </section>

      {/* Documents */}
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <SectionHeader
          title="Recent documents"
          subtitle="Your uploaded PDFs"
          action="Open library"
          href="/documents"
        />
        {recentDocuments.length > 0 ? (
          <div className="divide-y divide-border">
            {recentDocuments.map((doc) => (
              <DocRow
                key={doc.id}
                title={doc.title}
                meta={
                  doc.file_size ? formatBytes(doc.file_size) : "Unknown size"
                }
                tag={doc.subject || ""}
                ai={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-4 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
            No documents yet. Upload your first PDF in the Documents page.
          </div>
        )}
      </section>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (!+bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function SectionHeader({
  title,
  subtitle,
  action,
  href,
  extra,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  href?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {extra}
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
