"use client";

import { WorkspacePageHeader } from "@/features/dashboard/components/workspace-page";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequestedDialog } from "@/hooks/use-requested-dialog";
import {
  ChevronRight,
  Gift,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useStoredPreference } from "@/hooks/use-stored-preference";
import {
  createTask,
  deleteTask,
  toggleTask,
  updateTask,
} from "@/features/tasks/actions/tasks.actions";
import type { Cluster, Task } from "@/features/tasks/types";

interface TasksPageProps {
  initialTasks: Task[];
  initialClusters: Cluster[];
  autoOpenCreate?: boolean;
}

const PRIORITY_ORDER: Record<Task["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  low: "bg-white/5 text-muted-foreground",
  medium: "bg-[#bda883]/10 text-[#c5b391]",
  high: "bg-[#c58f83]/10 text-[#d5a19a]",
};

const GENERAL_CLUSTER_VALUE = "__general__";
const CLUSTER_SCROLL_THRESHOLD = 6;
const CLUSTER_VIEW_STORAGE_KEY = "nucleus_tasks_cluster_view";
const CLUSTER_COLLAPSED_STORAGE_KEY = "nucleus_tasks_collapsed_clusters";

type ClusterView = "grid" | "list";

type TaskFormValues = {
  title: string;
  priority: Task["priority"];
  cluster_id: string | null;
  importance_points: number;
  reward: string;
  due_date: string | null;
};

function formatDueDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function sortTasks(taskList: Task[]): Task[] {
  return [...taskList].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    if (a.completed && b.completed) {
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    }

    const aDue = a.due_date;
    const bDue = b.due_date;
    if (aDue !== bDue) {
      if (!aDue) return 1;
      if (!bDue) return -1;
      if (aDue < bDue) return -1;
      if (aDue > bDue) return 1;
    }

    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  });
}

type ClusterSegment = {
  cluster: Cluster;
  segmentWidth: number;
  fillPercent: number;
  isFullyDone: boolean;
};

function useProgressData(tasks: Task[], clusters: Cluster[]) {
  return useMemo(() => {
    const totalPoints = tasks.reduce((sum, t) => sum + t.importance_points, 0);
    const completedPoints = tasks
      .filter((t) => t.completed)
      .reduce((sum, t) => sum + t.importance_points, 0);

    const generalTasks = tasks.filter((t) => t.cluster_id === null);
    const generalTotal = generalTasks.reduce(
      (sum, t) => sum + t.importance_points,
      0,
    );
    const generalCompleted = generalTasks
      .filter((t) => t.completed)
      .reduce((sum, t) => sum + t.importance_points, 0);
    const generalSegmentWidth =
      totalPoints > 0 ? (generalTotal / totalPoints) * 100 : 0;
    const generalFillPercent =
      generalTotal > 0 ? (generalCompleted / generalTotal) * 100 : 0;

    const clusterSegments: ClusterSegment[] = clusters.map((cluster) => {
      const clusterTasks = tasks.filter((t) => t.cluster_id === cluster.id);
      const clusterTotal = clusterTasks.reduce(
        (sum, t) => sum + t.importance_points,
        0,
      );
      const clusterCompleted = clusterTasks
        .filter((t) => t.completed)
        .reduce((sum, t) => sum + t.importance_points, 0);
      const segmentWidth =
        totalPoints > 0 ? (clusterTotal / totalPoints) * 100 : 0;
      const fillPercent =
        clusterTotal > 0 ? (clusterCompleted / clusterTotal) * 100 : 0;
      const isFullyDone = clusterTotal > 0 && clusterCompleted === clusterTotal;

      return { cluster, segmentWidth, fillPercent, isFullyDone };
    });

    return {
      totalPoints,
      completedPoints,
      generalSegmentWidth,
      generalFillPercent,
      clusterSegments,
    };
  }, [tasks, clusters]);
}

function ProgressBar({
  totalPoints,
  completedPoints,
  generalSegmentWidth,
  generalFillPercent,
  clusterSegments,
}: ReturnType<typeof useProgressData>) {
  return (
    <div className="space-y-2">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/5">
        {totalPoints > 0 ? (
          <>
            <div
              style={{ width: `${generalSegmentWidth}%` }}
              className="relative h-full bg-white/5"
            >
              <div
                style={{
                  width: `${generalFillPercent}%`,
                  backgroundColor: "var(--primary)",
                }}
                className="absolute left-0 top-0 h-full transition-all duration-500"
              />
            </div>
            {clusterSegments.map(
              ({ cluster, segmentWidth, fillPercent, isFullyDone }) =>
                segmentWidth > 0 ? (
                  <div
                    key={cluster.id}
                    style={{ width: `${segmentWidth}%` }}
                    className="relative ml-0.5 h-full bg-white/5"
                  >
                    <div
                      style={{
                        width: `${fillPercent}%`,
                        backgroundColor: cluster.color,
                        opacity: isFullyDone ? 1 : 0.3,
                      }}
                      className="absolute left-0 top-0 h-full transition-all duration-500"
                    />
                  </div>
                ) : null,
            )}
          </>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        {totalPoints > 0
          ? `${completedPoints} pts / ${totalPoints} pts completed`
          : "No tasks yet"}
      </p>
    </div>
  );
}

function ClusterMiniBar({ tasks, color }: { tasks: Task[]; color: string }) {
  const clusterTotal = tasks.reduce((sum, t) => sum + t.importance_points, 0);
  const clusterCompleted = tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + t.importance_points, 0);
  const fillPercent =
    clusterTotal > 0 ? (clusterCompleted / clusterTotal) * 100 : 0;
  const isFullyDone = clusterTotal > 0 && clusterCompleted === clusterTotal;

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
      <div
        style={{
          width: `${fillPercent}%`,
          backgroundColor: color,
          opacity: isFullyDone ? 1 : 0.3,
        }}
        className="h-full transition-all duration-500"
      />
    </div>
  );
}

function clusterProgressPercent(tasks: Task[]): number {
  const total = tasks.reduce((sum, t) => sum + t.importance_points, 0);
  const completed = tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + t.importance_points, 0);
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function taskCountLabel(count: number) {
  return `${count} ${count === 1 ? "task" : "tasks"}`;
}

function ClusterViewToggle({
  view,
  onViewChange,
}: {
  view: ClusterView;
  onViewChange: (view: ClusterView) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-[#ffffff10] p-0.5">
      <button
        type="button"
        onClick={() => onViewChange("grid")}
        aria-label="Grid view"
        className={cn(
          "rounded-md p-1.5 transition",
          view === "grid"
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-white/5 hover:text-white",
        )}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onViewChange("list")}
        aria-label="List view"
        className={cn(
          "rounded-md p-1.5 transition",
          view === "list"
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-white/5 hover:text-white",
        )}
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}

function ClusterTaskList({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  scrollable,
}: {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  scrollable?: boolean;
}) {
  if (tasks.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No tasks in this cluster yet.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "space-y-0.5",
        scrollable && "max-h-64 overflow-y-auto pr-1",
      )}
    >
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function ClusterGridCard({
  cluster,
  tasks,
  onToggle,
  onEdit,
  onDelete,
}: {
  cluster: Cluster;
  tasks: Task[];
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-[#ffffff10] bg-card p-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: cluster.color }}
            />
            <h3 className="truncate text-sm font-medium text-white">
              {cluster.name}
            </h3>
          </div>
          <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
            {taskCountLabel(tasks.length)}
          </span>
        </div>
        <ClusterMiniBar tasks={tasks} color={cluster.color} />
      </div>
      <ClusterTaskList
        tasks={tasks}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        scrollable={tasks.length >= CLUSTER_SCROLL_THRESHOLD}
      />
    </div>
  );
}

function ClusterListSection({
  cluster,
  tasks,
  isCollapsed,
  onToggleCollapsed,
  onToggle,
  onEdit,
  onDelete,
}: {
  cluster: Cluster;
  tasks: Task[];
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const progress = clusterProgressPercent(tasks);

  return (
    <div className="border-b border-[#ffffff08] pb-4 last:border-0 last:pb-0">
      <button
        type="button"
        onClick={onToggleCollapsed}
        className="-mx-1 flex w-full items-center gap-2 rounded-lg px-1 py-2 text-left transition-colors hover:bg-white/[0.02]"
        aria-expanded={!isCollapsed}
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            !isCollapsed && "rotate-90",
          )}
        />
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: cluster.color }}
        />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
          {cluster.name}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {taskCountLabel(tasks.length)} · {progress}%
        </span>
      </button>
      {!isCollapsed ? (
        <div className="mt-1 space-y-2 pl-6">
          <ClusterMiniBar tasks={tasks} color={cluster.color} />
          <ClusterTaskList
            tasks={tasks}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ) : null}
    </div>
  );
}

function ClusterSections({
  clusters,
  tasks,
  view,
  collapsedIds,
  onToggleCollapsed,
  onToggle,
  onEdit,
  onDelete,
}: {
  clusters: Cluster[];
  view: ClusterView;
  tasks: Task[];
  collapsedIds: Set<string>;
  onToggleCollapsed: (clusterId: string) => void;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  if (view === "grid") {
    return (
      <div className="columns-1 gap-4 xl:columns-2">
        {clusters.map((cluster) => {
          const clusterTasks = sortTasks(
            tasks.filter((t) => t.cluster_id === cluster.id),
          );

          return (
            <div key={cluster.id} className="mb-4 break-inside-avoid">
              <ClusterGridCard
                cluster={cluster}
                tasks={clusterTasks}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {clusters.map((cluster) => {
        const clusterTasks = sortTasks(
          tasks.filter((t) => t.cluster_id === cluster.id),
        );

        return (
          <ClusterListSection
            key={cluster.id}
            cluster={cluster}
            tasks={clusterTasks}
            isCollapsed={collapsedIds.has(cluster.id)}
            onToggleCollapsed={() => onToggleCollapsed(cluster.id)}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
}

function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const isPending = task.id.startsWith("temp-");

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-[#ffffff10] hover:bg-white/[0.02]">
      <Checkbox
        aria-label={`Mark ${task.title} as ${task.completed ? "incomplete" : "complete"}`}
        checked={task.completed}
        disabled={isPending}
        onCheckedChange={() => onToggle(task)}
        className="border-white/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
      />
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className={cn(
            "min-w-0 basis-full truncate text-sm text-white/90 sm:basis-auto",
            task.completed && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </span>
        <span
          className={cn(
            "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium capitalize",
            PRIORITY_STYLES[task.priority],
          )}
        >
          {task.priority}
        </span>
        <span className="shrink-0 text-[10px] text-muted-foreground">
          {task.importance_points} pts
        </span>
        {task.due_date ? (
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {formatDueDate(task.due_date)}
          </span>
        ) : null}
        {task.reward.trim() ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
                aria-label="View reward"
              >
                <Gift className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-card text-white border-[#ffffff10]">
              {task.reward}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          type="button"
          onClick={() => onEdit(task)}
          disabled={isPending}
          className="rounded p-1 text-muted-foreground hover:bg-primary/10 hover:text-primary disabled:pointer-events-none"
          aria-label="Edit task"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          disabled={isPending}
          className="rounded p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 disabled:pointer-events-none"
          aria-label="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function CreateTaskModal({
  open,
  onOpenChange,
  clusters,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clusters: Cluster[];
  onSubmit: (values: TaskFormValues) => void;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [clusterId, setClusterId] = useState(GENERAL_CLUSTER_VALUE);
  const [importancePoints, setImportancePoints] = useState("10");
  const [reward, setReward] = useState("");
  const [dueDate, setDueDate] = useState("");

  const resetForm = () => {
    setTitle("");
    setPriority("medium");
    setClusterId(GENERAL_CLUSTER_VALUE);
    setImportancePoints("10");
    setReward("");
    setDueDate("");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const points = Math.min(100, Math.max(1, Number(importancePoints) || 10));

    onSubmit({
      title: trimmed,
      priority,
      cluster_id: clusterId === GENERAL_CLUSTER_VALUE ? null : clusterId,
      importance_points: points,
      reward: reward.trim(),
      due_date: dueDate === "" ? null : dueDate,
    });
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-[#ffffff10] bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">New task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="task-title" className="text-white/70">
              Title
            </Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to do?"
              className="border-[#ffffff10] bg-background text-white"
              required
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/70">Priority</Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as Task["priority"])}
            >
              <SelectTrigger className="border-[#ffffff10] bg-background text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#ffffff10] bg-card text-white">
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white/70">Cluster</Label>
            <Select value={clusterId} onValueChange={setClusterId}>
              <SelectTrigger className="border-[#ffffff10] bg-background text-white">
                <SelectValue placeholder="General" />
              </SelectTrigger>
              <SelectContent className="border-[#ffffff10] bg-card text-white">
                <SelectItem value={GENERAL_CLUSTER_VALUE}>General</SelectItem>
                {clusters.map((cluster) => (
                  <SelectItem key={cluster.id} value={cluster.id}>
                    {cluster.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-points" className="text-white/70">
              Impact on progress bar (1–100)
            </Label>
            <Input
              id="task-points"
              type="number"
              min={1}
              max={100}
              value={importancePoints}
              onChange={(e) => setImportancePoints(e.target.value)}
              className="border-[#ffffff10] bg-background text-white"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-reward" className="text-white/70">
              Reward
            </Label>
            <Input
              id="task-reward"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="What will you give yourself after finishing this?"
              className="border-[#ffffff10] bg-background text-white"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-due-date" className="text-white/70">
              Due date
            </Label>
            <Input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border-[#ffffff10] bg-background text-white [color-scheme:dark]"
              autoComplete="off"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Create Task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditTaskModal({
  task,
  open,
  onOpenChange,
  clusters,
  onSubmit,
}: {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clusters: Cluster[];
  onSubmit: (taskId: string, values: TaskFormValues) => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [priority, setPriority] = useState<Task["priority"]>(
    task?.priority ?? "medium",
  );
  const [clusterId, setClusterId] = useState(
    task?.cluster_id ?? GENERAL_CLUSTER_VALUE,
  );
  const [importancePoints, setImportancePoints] = useState(
    String(task?.importance_points ?? 10),
  );
  const [reward, setReward] = useState(task?.reward ?? "");
  const [dueDate, setDueDate] = useState(task?.due_date ?? "");

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    const trimmed = title.trim();
    if (!trimmed) return;

    const points = Math.min(100, Math.max(1, Number(importancePoints) || 10));

    onSubmit(task.id, {
      title: trimmed,
      priority,
      cluster_id: clusterId === GENERAL_CLUSTER_VALUE ? null : clusterId,
      importance_points: points,
      reward: reward.trim(),
      due_date: dueDate === "" ? null : dueDate,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-[#ffffff10] bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-task-title" className="text-white/70">
              Title
            </Label>
            <Input
              id="edit-task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to do?"
              className="border-[#ffffff10] bg-background text-white"
              required
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/70">Priority</Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as Task["priority"])}
            >
              <SelectTrigger className="border-[#ffffff10] bg-background text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#ffffff10] bg-card text-white">
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white/70">Cluster</Label>
            <Select value={clusterId} onValueChange={setClusterId}>
              <SelectTrigger className="border-[#ffffff10] bg-background text-white">
                <SelectValue placeholder="General" />
              </SelectTrigger>
              <SelectContent className="border-[#ffffff10] bg-card text-white">
                <SelectItem value={GENERAL_CLUSTER_VALUE}>General</SelectItem>
                {clusters.map((cluster) => (
                  <SelectItem key={cluster.id} value={cluster.id}>
                    {cluster.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-task-points" className="text-white/70">
              Impact on progress bar (1–100)
            </Label>
            <Input
              id="edit-task-points"
              type="number"
              min={1}
              max={100}
              value={importancePoints}
              onChange={(e) => setImportancePoints(e.target.value)}
              className="border-[#ffffff10] bg-background text-white"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-task-reward" className="text-white/70">
              Reward
            </Label>
            <Input
              id="edit-task-reward"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="What will you give yourself after finishing this?"
              className="border-[#ffffff10] bg-background text-white"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-task-due-date" className="text-white/70">
              Due date
            </Label>
            <Input
              id="edit-task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border-[#ffffff10] bg-background text-white [color-scheme:dark]"
              autoComplete="off"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function TasksPage({
  initialTasks,
  initialClusters,
  autoOpenCreate = false,
}: TasksPageProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [clusters] = useState<Cluster[]>(initialClusters);
  const [createTaskOpen, setCreateTaskOpen] =
    useRequestedDialog(autoOpenCreate);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [storedView, setStoredView] = useStoredPreference(
    CLUSTER_VIEW_STORAGE_KEY,
    "list",
  );
  const clusterView: ClusterView = storedView === "grid" ? "grid" : "list";
  const [storedCollapsed, setStoredCollapsed] = useStoredPreference(
    CLUSTER_COLLAPSED_STORAGE_KEY,
    "[]",
  );
  const collapsedClusterIds = useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(storedCollapsed);
      return new Set<string>(
        Array.isArray(parsed)
          ? parsed.filter((id): id is string => typeof id === "string")
          : [],
      );
    } catch {
      return new Set<string>();
    }
  }, [storedCollapsed]);
  const progress = useProgressData(tasks, clusters);
  const handleClusterViewChange = useCallback(
    (view: ClusterView) => setStoredView(view),
    [setStoredView],
  );
  const handleToggleClusterCollapsed = useCallback(
    (clusterId: string) => {
      const next = new Set(collapsedClusterIds);
      if (next.has(clusterId)) next.delete(clusterId);
      else next.add(clusterId);
      setStoredCollapsed(JSON.stringify([...next]));
    },
    [collapsedClusterIds, setStoredCollapsed],
  );

  useEffect(() => {
    if (!autoOpenCreate) return;
    router.replace("/tasks", { scroll: false });
  }, [autoOpenCreate, router]);

  const generalTasks = useMemo(
    () => sortTasks(tasks.filter((t) => t.cluster_id === null)),
    [tasks],
  );

  const handleToggle = useCallback(async (task: Task) => {
    if (task.id.startsWith("temp-")) return;

    const previous = task;
    const nextCompleted = !task.completed;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              completed: nextCompleted,
              updated_at: new Date().toISOString(),
            }
          : t,
      ),
    );

    const { data, error } = await toggleTask(task.id, nextCompleted);

    if (error || !data) {
      setTasks((prev) =>
        prev.map((t) => (t.id === previous.id ? previous : t)),
      );
      toast.error(error ?? "Failed to update task");
      return;
    }

    setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
  }, []);

  const handleDelete = useCallback(
    async (task: Task) => {
      if (task.id.startsWith("temp-")) return;

      const previous = tasks;
      setTasks((prev) => prev.filter((t) => t.id !== task.id));

      const { error } = await deleteTask(task.id);

      if (error) {
        setTasks(previous);
        toast.error(error ?? "Failed to delete task");
      }
    },
    [tasks],
  );

  const handleEditStart = useCallback((task: Task) => {
    if (task.id.startsWith("temp-")) return;
    setEditingTask(task);
  }, []);

  const handleEditTask = useCallback(
    async (taskId: string, values: TaskFormValues) => {
      const previous = tasks.find((t) => t.id === taskId);
      if (!previous) return;

      const optimistic: Task = {
        ...previous,
        title: values.title,
        priority: values.priority,
        cluster_id: values.cluster_id,
        importance_points: values.importance_points,
        reward: values.reward,
        due_date: values.due_date,
        updated_at: new Date().toISOString(),
      };

      setTasks((prev) => prev.map((t) => (t.id === taskId ? optimistic : t)));
      setEditingTask(null);
      toast.success("Task updated");

      const { data, error } = await updateTask(taskId, {
        title: values.title,
        priority: values.priority,
        due_date: values.due_date,
        reward: values.reward,
        importance_points: values.importance_points,
        cluster_id: values.cluster_id,
      });

      if (error || !data) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? previous : t)));
        toast.error(error ?? "Failed to update task");
        return;
      }

      setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
    },
    [tasks],
  );

  const handleCreateTask = useCallback(
    async (values: TaskFormValues) => {
      const tempId = `temp-${crypto.randomUUID()}`;
      const now = new Date().toISOString();

      const optimistic: Task = {
        id: tempId,
        user_id: "",
        title: values.title,
        completed: false,
        priority: values.priority,
        due_date: values.due_date,
        reward: values.reward,
        importance_points: values.importance_points,
        cluster_id: values.cluster_id,
        created_at: now,
        updated_at: now,
      };

      setTasks((prev) => [optimistic, ...prev]);
      setCreateTaskOpen(false);
      toast.success("Task created");

      const { data, error } = await createTask({
        title: values.title,
        priority: values.priority,
        due_date: values.due_date,
        reward: values.reward,
        importance_points: values.importance_points,
        cluster_id: values.cluster_id,
      });

      if (error || !data) {
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
        toast.error(error ?? "Failed to create task");
        return;
      }

      setTasks((prev) => prev.map((t) => (t.id === tempId ? data : t)));
    },
    [setCreateTaskOpen],
  );

  return (
    <TooltipProvider>
      <div className="w-full min-h-full bg-background">
        <div className="workspace-page space-y-7">
          <WorkspacePageHeader
            icon="tasks"
            title="Tasks"
            description="Give your next step a clear finish. Work through one small thing at a time."
            actions={
              <Button size="sm" onClick={() => setCreateTaskOpen(true)}>
                <Plus className="size-3.5" />
                New task
              </Button>
            }
          />
          <div className="workspace-summary">
            <span>
              <strong>{tasks.filter((t) => !t.completed).length}</strong>to do
            </span>
            <span>
              <strong>{tasks.filter((t) => t.completed).length}</strong>
              completed
            </span>
            <span>Grouped by cluster</span>
          </div>

          {tasks.length > 0 && <ProgressBar {...progress} />}
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Unsorted tasks
            </h2>
            {generalTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing here yet. Add a small task with the New task button
                above.
              </p>
            ) : (
              <div className="space-y-0.5">
                {generalTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onEdit={handleEditStart}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </section>

          {clusters.length > 0 ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Clusters
                </h2>
                <ClusterViewToggle
                  view={clusterView}
                  onViewChange={handleClusterViewChange}
                />
              </div>
              <ClusterSections
                clusters={clusters}
                tasks={tasks}
                view={clusterView}
                collapsedIds={collapsedClusterIds}
                onToggleCollapsed={handleToggleClusterCollapsed}
                onToggle={handleToggle}
                onEdit={handleEditStart}
                onDelete={handleDelete}
              />
            </section>
          ) : null}

          <CreateTaskModal
            open={createTaskOpen}
            onOpenChange={setCreateTaskOpen}
            clusters={clusters.filter((c) => !c.id.startsWith("temp-"))}
            onSubmit={handleCreateTask}
          />

          <EditTaskModal
            key={editingTask?.id ?? "closed"}
            task={editingTask}
            open={editingTask !== null}
            onOpenChange={(open) => {
              if (!open) setEditingTask(null);
            }}
            clusters={clusters.filter((c) => !c.id.startsWith("temp-"))}
            onSubmit={handleEditTask}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
