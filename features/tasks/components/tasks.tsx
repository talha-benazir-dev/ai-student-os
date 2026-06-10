"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, Plus, Trash2 } from "lucide-react";
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
import {
  createTask,
  deleteTask,
  toggleTask,
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
  low: "bg-green-500/15 text-green-400",
  medium: "bg-yellow-500/15 text-yellow-400",
  high: "bg-red-500/15 text-red-400",
};

const GENERAL_CLUSTER_VALUE = "__general__";

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
                  backgroundColor: "#7c5cfc",
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
      <p className="text-xs text-zinc-500">
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

function TaskItem({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const isPending = task.id.startsWith("temp-");

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-[#ffffff10] hover:bg-white/[0.02]">
      <Checkbox
        checked={task.completed}
        disabled={isPending}
        onCheckedChange={() => onToggle(task)}
        className="border-white/20 data-[state=checked]:border-[#7c5cfc] data-[state=checked]:bg-[#7c5cfc]"
      />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span
          className={cn(
            "truncate text-sm text-white/90",
            task.completed && "text-white/40 line-through",
          )}
        >
          {task.title}
        </span>
        <span
          className={cn(
            "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            PRIORITY_STYLES[task.priority],
          )}
        >
          {task.priority}
        </span>
        <span className="shrink-0 text-[10px] text-zinc-500">
          {task.importance_points} pts
        </span>
        {task.due_date ? (
          <span className="shrink-0 text-[10px] text-zinc-500">
            {formatDueDate(task.due_date)}
          </span>
        ) : null}
        {task.reward.trim() ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="shrink-0 text-zinc-500 transition-colors hover:text-[#7c5cfc]"
                aria-label="View reward"
              >
                <Gift className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#0f0f17] text-white border-[#ffffff10]">
              {task.reward}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onDelete(task)}
        disabled={isPending}
        className="shrink-0 rounded p-1 text-zinc-500 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 disabled:pointer-events-none"
        aria-label="Delete task"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
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
  onSubmit: (values: {
    title: string;
    priority: Task["priority"];
    cluster_id: string | null;
    importance_points: number;
    reward: string;
    due_date: string | null;
  }) => void;
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
      <DialogContent className="border-[#ffffff10] bg-[#0f0f17] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">New Task</DialogTitle>
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
              className="border-[#ffffff10] bg-[#0a0a0f] text-white"
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
              <SelectTrigger className="border-[#ffffff10] bg-[#0a0a0f] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#ffffff10] bg-[#0f0f17] text-white">
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white/70">Cluster</Label>
            <Select value={clusterId} onValueChange={setClusterId}>
              <SelectTrigger className="border-[#ffffff10] bg-[#0a0a0f] text-white">
                <SelectValue placeholder="General" />
              </SelectTrigger>
              <SelectContent className="border-[#ffffff10] bg-[#0f0f17] text-white">
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
              className="border-[#ffffff10] bg-[#0a0a0f] text-white"
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
              className="border-[#ffffff10] bg-[#0a0a0f] text-white"
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
              className="border-[#ffffff10] bg-[#0a0a0f] text-white [color-scheme:dark]"
              autoComplete="off"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#7c5cfc] text-white hover:bg-[#7c5cfc]/90"
          >
            Create Task
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
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  const progress = useProgressData(tasks, clusters);

  useEffect(() => {
    if (!autoOpenCreate) return;
    setCreateTaskOpen(true);
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

  const handleCreateTask = useCallback(
    async (values: {
      title: string;
      priority: Task["priority"];
      cluster_id: string | null;
      importance_points: number;
      reward: string;
      due_date: string | null;
    }) => {
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
    [],
  );

  return (
    <TooltipProvider>
      <div className="w-full min-h-full bg-[#0a0a0f]">
        <div className="w-full space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10">
          <ProgressBar {...progress} />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
              Tasks
            </h1>
            <Button
              size="sm"
              onClick={() => setCreateTaskOpen(true)}
              className="bg-[#7c5cfc] text-white hover:bg-[#7c5cfc]/90"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Task
            </Button>
          </div>

          <section className="space-y-3">
            <h2 className="text-sm font-medium text-white/60">General Tasks</h2>
            {generalTasks.length === 0 ? (
              <p className="text-sm text-zinc-500">No general tasks yet.</p>
            ) : (
              <div className="space-y-0.5">
                {generalTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </section>

          {clusters.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-sm font-medium text-white/60">Clusters</h2>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {clusters.map((cluster) => {
                  const clusterTasks = sortTasks(
                    tasks.filter((t) => t.cluster_id === cluster.id),
                  );

                  return (
                    <div
                      key={cluster.id}
                      className="space-y-3 rounded-xl border border-[#ffffff10] bg-[#0f0f17] p-5"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: cluster.color }}
                          />
                          <h3 className="text-sm font-medium text-white">
                            {cluster.name}
                          </h3>
                        </div>
                        <ClusterMiniBar
                          tasks={clusterTasks}
                          color={cluster.color}
                        />
                      </div>
                      {clusterTasks.length === 0 ? (
                        <p className="text-xs text-zinc-500">
                          No tasks in this cluster.
                        </p>
                      ) : (
                        <div className="space-y-0.5">
                          {clusterTasks.map((task) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              onToggle={handleToggle}
                              onDelete={handleDelete}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          <CreateTaskModal
            open={createTaskOpen}
            onOpenChange={setCreateTaskOpen}
            clusters={clusters.filter((c) => !c.id.startsWith("temp-"))}
            onSubmit={handleCreateTask}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
