import { Metadata } from "next";
import Link from "next/link";
import {
  CommandPaletteProvider,
  DashboardCommandSearch,
  DashboardCreateMenu,
} from "@/features/dashboard/components/create-command-menu";
import { StatCard } from "@/features/dashboard/components/start-card";
import { RecentNotesSection } from "@/features/dashboard/components/recent-notes";
import {
  getDashboardWidgets,
  getDailyStudyTime,
  getTaskCompletionRate,
  getActivityHeatmap,
  getClusterBreakdown,
} from "@/features/analytics/actions/analytics.actions";
import { WIDGET_LABELS, type WidgetId } from "@/features/analytics/types/widgets";
import {
  DailyStudyTimeChart,
  TaskCompletionChart,
  ActivityHeatmap,
  ClusterBreakdownChart,
} from "@/features/analytics/components/charts";
import {
  Clock,
  CheckSquare,
  FileText,
  Sparkles,
  Flame,
  Bell,
  ArrowUpRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStreakData } from "@/features/study-sessions/actions/study-sessions.actions";
import { StudyTimer } from "@/features/study-sessions/components/study-timer";

export const metadata: Metadata = {
  title: "Dashboard — Nucleus",
  description: "Your AI study operating system.",
};

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
  let weeklyStudyMinutes = 0;
  let streakData = { current_streak: 0, longest_streak: 0 };
  let pinnedWidgets: WidgetId[] = ["daily_study_time", "activity_heatmap"];
  let dailyStudy: { date: string; minutes: number }[] = [];
  let taskCompletion: { date: string; completed: number }[] = [];
  let heatmap: { date: string; minutes: number }[] = [];
  let clusterBreakdown: { name: string; minutes: number; color: string }[] = [];

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
          .select("id, title, content, updated_at")
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
      supabase
        .from("study_sessions")
        .select("duration_minutes")
        .eq("user_id", userId)
        .not("duration_minutes", "is", null)
        .gte("started_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .then(({ data }) => {
          weeklyStudyMinutes = (data ?? []).reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0);
        }),
      getStreakData().then(({ data }) => {
        if (data) streakData = data;
      }),
      getDashboardWidgets().then(({ data }) => {
        pinnedWidgets = (data ?? ["daily_study_time", "activity_heatmap"]) as WidgetId[];
      }),
      getDailyStudyTime(30).then(({ data }) => { dailyStudy = data ?? []; }),
      getTaskCompletionRate(30).then(({ data }) => { taskCompletion = data ?? []; }),
      getActivityHeatmap().then(({ data }) => { heatmap = data ?? []; }),
      getClusterBreakdown().then(({ data }) => { clusterBreakdown = data ?? []; }),
    ]);
  }

  const chartMap: Record<WidgetId, React.ReactNode> = {
    daily_study_time: <DailyStudyTimeChart data={dailyStudy} />,
    task_completion_rate: <TaskCompletionChart data={taskCompletion} />,
    activity_heatmap: <ActivityHeatmap data={heatmap} />,
    cluster_breakdown: <ClusterBreakdownChart data={clusterBreakdown} />,
  };

  const studyHours = weeklyStudyMinutes > 0
    ? (weeklyStudyMinutes / 60).toFixed(1)
    : "--";

  const subtitle =
    activeTasks > 0
      ? `You have ${activeTasks} task${activeTasks === 1 ? "" : "s"} pending today. Keep pushing.`
      : "All clear. Nothing pending — add tasks to stay on track.";

  return (
    <CommandPaletteProvider>
    <div className="px-4 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-8 mx-auto w-full max-w-350">
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
          <StudyTimer />
          <DashboardCreateMenu />
        </div>
      </div>

      <DashboardCommandSearch />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
        <StatCard active icon={Clock} label="Study hours" value={studyHours} unit={studyHours !== "--" ? "h" : undefined} />
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
        <StatCard
          icon={Flame}
          label="Streak"
          value={streakData.current_streak.toString()}
          unit="days"
          delta={"best " + streakData.longest_streak}
          deltaTone="neutral"
        />
      </div>

      {/* Analytics — pinned widgets */}
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6 mb-6">
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Productivity analytics</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your 2 pinned charts · <a href="/analytics" className="text-primary/70 hover:text-primary transition">manage in Analytics</a>
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {pinnedWidgets.map((id) => (
            <div key={id} className="rounded-xl border border-border/60 bg-background/40 p-4">
              <p className="text-xs font-medium text-muted-foreground mb-3">{WIDGET_LABELS[id].title}</p>
              {chartMap[id]}
            </div>
          ))}
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
    </CommandPaletteProvider>
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
