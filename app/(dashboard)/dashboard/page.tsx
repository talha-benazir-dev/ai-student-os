import { WorkspacePageHeader } from "@/features/dashboard/components/workspace-page";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import type { DashboardStudyPeriod } from "@/features/analytics/types/period";
import {
  ArrowUpRight,
  CheckSquare,
  Clock,
  FileText,
  Layers,
} from "lucide-react";
import {
  createClient,
  getUser,
  getWorkspaceProfile,
} from "@/lib/supabase/server";
import { DashboardCreateMenu } from "@/features/dashboard/components/create-command-menu";
import { StatCard } from "@/features/dashboard/components/start-card";
import { RecentNotesSection } from "@/features/dashboard/components/recent-notes";
import { StudyGuide } from "@/features/dashboard/components/study-guide";
import { StudyTimer } from "@/features/study-sessions/components/study-timer";
import { getClusters } from "@/features/clusters/actions/clusters.actions";
import {
  getAnalyticsSummary,
  getDailyStudyTimeForPeriod,
  getTaskCompletionRateForPeriod,
  getActivityHeatmap,
  getClusterBreakdown,
  getTasksByCluster,
} from "@/features/analytics/actions/analytics.actions";
import {
  ALL_WIDGETS,
  WIDGET_LABELS,
  type WidgetId,
} from "@/features/analytics/types/widgets";
import { PERIOD_LABELS } from "@/features/analytics/types/period";
import { parseDashboardStudyPeriod } from "@/features/analytics/lib/date-utils";
import {
  DailyStudyTimeChart,
  TaskCompletionChart,
  ActivityHeatmap,
  ClusterBreakdownDonut,
} from "@/features/analytics/components/charts";
import { TasksByClusterChart } from "@/features/analytics/components/tasks-by-cluster-chart";
import { formatStudyHours } from "@/features/study-sessions/utils/format-study-hours";

export const metadata: Metadata = {
  title: "Home — Nucleus",
  description: "One clear next step for your studies.",
};

export default async function Dashboard() {
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    { data: profile },
  ] = await Promise.all([getUser(), getWorkspaceProfile()]);
  const userId = user?.id ?? "";
  const period = parseDashboardStudyPeriod(profile?.study_hours_period);
  const selected: unknown[] = Array.isArray(profile?.dashboard_widgets)
    ? profile.dashboard_widgets
    : ["daily_study_time", "activity_heatmap"];
  const pinnedWidgets = [
    ...new Set(
      selected.filter((id): id is WidgetId =>
        ALL_WIDGETS.includes(id as WidgetId),
      ),
    ),
  ].slice(0, 2);
  if (!pinnedWidgets.length)
    pinnedWidgets.push("daily_study_time", "activity_heatmap");

  // Start independent work together. Only the two visible charts are fetched.
  const [notes, documents, tasks, dueCards, clusters, summary] =
    await Promise.all([
      supabase
        .from("notes")
        .select("id, title, updated_at", { count: "exact" })
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(4),
      supabase
        .from("documents")
        .select("id, title, file_size, subject, created_at", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("tasks")
        .select("id, title, priority, due_date", { count: "exact" })
        .eq("user_id", userId)
        .eq("completed", false)
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("flashcards")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .lte("next_review", new Date().toISOString().slice(0, 10)),
      getClusters(),
      getAnalyticsSummary(period),
    ]);
  const progress = {
    clusters: clusters.data?.length ?? 0,
    notes: notes.count ?? 0,
    documents: documents.count ?? 0,
    tasks: tasks.count ?? 0,
    dueCards: dueCards.count ?? 0,
    completedTasks: summary.data?.tasksCompletedCount ?? 0,
  };
  const hasMaterial = progress.notes + progress.documents > 0;
  const hasError =
    notes.error ||
    documents.error ||
    tasks.error ||
    dueCards.error ||
    clusters.error;

  // Snapshot this dynamic server request once; serialize it for stable hydration.
  // eslint-disable-next-line react-hooks/purity
  const referenceTime = Date.now();

  return (
    <div className="workspace-page">
      <WorkspacePageHeader
        icon="home"
        title={`Welcome back, ${profile?.name || "there"}`}
        description="A little progress starts with one clear next step."
        actions={<DashboardCreateMenu className="hidden sm:inline-flex" />}
      />
      {hasError && (
        <p
          role="alert"
          className="mb-5 rounded-md border border-destructive/25 p-4 text-sm text-destructive"
        >
          Some of your study material couldn’t load. Refresh the page to try
          again.
        </p>
      )}
      <StudyGuide progress={progress} />
      <div className="mb-8 grid gap-7 lg:grid-cols-[1.35fr_1fr]">
        <section
          aria-labelledby="focus-title"
          className="rounded-lg border border-border bg-card p-5 sm:p-6"
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 id="focus-title" className="text-sm font-medium">
                On your list
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Pick one. You don’t have to do everything today.
              </p>
            </div>
            <Link
              href="/tasks"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              All tasks <span aria-hidden="true">↗</span>
            </Link>
          </div>
          {tasks.data?.length ? (
            <div className="divide-y divide-border">
              {tasks.data.map((task) => (
                <Link
                  href="/tasks"
                  key={task.id}
                  className="flex items-center gap-3 py-3.5 text-sm transition-colors hover:text-primary"
                >
                  <span className="size-4 shrink-0 rounded border border-input" />
                  <span className="min-w-0 flex-1 truncate">{task.title}</span>
                  {task.priority === "high" && (
                    <span className="text-[10px] text-muted-foreground">
                      High priority
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-5">
              <p className="text-sm text-muted-foreground">
                What would you like to understand next?
              </p>
              <Link
                href="/tasks?new=task"
                className="mt-3 inline-flex text-xs text-primary hover:underline"
              >
                Add one small task
              </Link>
            </div>
          )}
        </section>
        <section
          aria-labelledby="session-title"
          className="flex flex-col justify-center rounded-lg border border-border px-5 py-6 sm:px-6"
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Clock className="size-4 text-primary" />
            <h2 id="session-title">Make a little room to focus</h2>
          </div>
          <p className="mb-5 text-xs leading-relaxed text-muted-foreground">
            Choose a cluster and start the timer. Stop when you’re ready; your
            time is saved automatically.
          </p>
          <div className="max-w-full self-start">
            <StudyTimer />
          </div>
        </section>
      </div>
      <section
        aria-label="Your workspace at a glance"
        className="mb-8 grid grid-cols-2 divide-x divide-border overflow-hidden rounded-lg border border-border sm:grid-cols-4"
      >
        <StatCard
          icon={Clock}
          label="Study time"
          value={formatStudyHours(summary.data?.studyMinutes ?? 0)}
          sublabel={PERIOD_LABELS[period]}
        />
        <StatCard
          icon={CheckSquare}
          label="Open tasks"
          value={String(progress.tasks)}
        />
        <StatCard
          icon={FileText}
          label="Your notes"
          value={String(progress.notes)}
        />
        <StatCard
          icon={Layers}
          label="Ready to review"
          value={String(progress.dueCards)}
        />
      </section>
      <div className="mb-8 grid items-start gap-7 lg:grid-cols-2">
        <section className="min-w-0 rounded-lg border border-border bg-card p-5 sm:p-6">
          <RecentNotesSection
            referenceTime={referenceTime}
            notes={(notes.data ?? []).map((note) => ({
              ...note,
              content: null,
            }))}
          />
        </section>
        <section className="min-w-0 rounded-lg border border-border bg-card p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-medium">Your reading</h2>
            <Link
              href="/documents"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Open library <span aria-hidden="true">↗</span>
            </Link>
          </div>
          {documents.data?.length ? (
            <div className="divide-y divide-border">
              {documents.data.map((doc) => (
                <Link
                  key={doc.id}
                  href="/documents"
                  className="flex items-center gap-3 py-3.5 text-sm hover:text-primary"
                >
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{doc.title}</span>
                  <ArrowUpRight className="ml-auto size-3 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-5 text-sm text-muted-foreground">
              <p>Keep a reading or lecture PDF close to your notes.</p>
              <Link
                href="/documents"
                className="mt-3 inline-flex text-xs text-primary hover:underline"
              >
                Add your first document
              </Link>
            </div>
          )}
        </section>
      </div>
      {hasMaterial && (
        <Suspense
          fallback={
            <p role="status" className="py-6 text-xs text-muted-foreground">
              Loading your study patterns…
            </p>
          }
        >
          <StudyPatterns widgets={pinnedWidgets} period={period} />
        </Suspense>
      )}
    </div>
  );
}

async function StudyPatterns({
  widgets: pinnedWidgets,
  period,
}: {
  widgets: WidgetId[];
  period: DashboardStudyPeriod;
}) {
  const charts = await Promise.all(
    pinnedWidgets.map(
      async (id): Promise<{ id: WidgetId; chart: ReactNode }> => {
        switch (id) {
          case "daily_study_time": {
            const { data } = await getDailyStudyTimeForPeriod(period);
            return { id, chart: <DailyStudyTimeChart data={data ?? []} /> };
          }
          case "task_completion_rate": {
            const { data } = await getTaskCompletionRateForPeriod(period);
            return { id, chart: <TaskCompletionChart data={data ?? []} /> };
          }
          case "activity_heatmap": {
            const { data } = await getActivityHeatmap();
            return { id, chart: <ActivityHeatmap data={data ?? []} /> };
          }
          case "cluster_breakdown": {
            const { data } = await getClusterBreakdown(period);
            return { id, chart: <ClusterBreakdownDonut data={data ?? []} /> };
          }
          case "tasks_by_cluster": {
            const { data } = await getTasksByCluster(period);
            return { id, chart: <TasksByClusterChart data={data ?? []} /> };
          }
        }
      },
    ),
  );
  return (
    <section aria-labelledby="study-pattern-title">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 id="study-pattern-title" className="text-sm font-medium">
            Your study patterns
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            A view of your learning over time. Every session counts.
          </p>
        </div>
        <Link
          href="/analytics"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          View analytics <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {charts.map(({ id, chart }) => (
          <div
            key={id}
            className="min-w-0 rounded-lg border border-border bg-card p-5"
          >
            <p className="mb-4 text-xs text-muted-foreground">
              {WIDGET_LABELS[id].title}
            </p>
            {chart}
          </div>
        ))}
      </div>
    </section>
  );
}
