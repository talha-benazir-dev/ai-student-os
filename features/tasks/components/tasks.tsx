"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as DateCalendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Task } from "@/features/tasks/types";
import {
  createTask,
  deleteTask,
  getTasks,
  toggleTask,
  updateTask,
} from "@/features/tasks/actions/tasks.actions";

type FilterTab = "all" | "today" | "overdue" | "completed";

const PRIORITY_ORDER: Record<Task["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const SAVE_ERROR = "Failed to save. Please try again.";

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "overdue", label: "Overdue" },
  { id: "completed", label: "Completed" },
];

function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseISODate(iso: string): Date | undefined {
  if (!iso) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDueDateLabel(iso: string): string {
  if (!iso) return "Due date";
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
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

    const pa = PRIORITY_ORDER[a.priority];
    const pb = PRIORITY_ORDER[b.priority];
    if (pa !== pb) return pa - pb;

    return 0;
  });
}

function matchesFilter(task: Task, tab: FilterTab, today: string): boolean {
  switch (tab) {
    case "today":
      return task.due_date === today;
    case "overdue":
      return task.due_date !== null && task.due_date < today && !task.completed;
    case "completed":
      return task.completed;
    case "all":
    default:
      return true;
  }
}

function formatDueLabel(
  dueDate: string | null,
  completed: boolean,
  today: string,
): { text: string; className: string } | null {
  if (!dueDate) return null;

  if (dueDate === today) {
    return { text: "Today", className: "text-green-400" };
  }

  if (dueDate < today && !completed) {
    return { text: "Overdue", className: "text-red-400" };
  }

  const formatted = new Date(`${dueDate}T12:00:00`).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric" },
  );
  return { text: formatted, className: "text-white/45" };
}

const priorityBadgeClass: Record<Task["priority"], string> = {
  low: "bg-green-500/15 text-green-400",
  medium: "bg-yellow-500/15 text-yellow-400",
  high: "bg-red-500/15 text-red-400",
};

function DueDateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasDate = Boolean(value);
  const selected = parseISODate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Due date"
          className={cn(
            "inline-flex items-center gap-2 h-8 shrink-0 rounded-full pl-2.5 pr-3 text-xs font-medium cursor-pointer",
            "transition-all duration-150 ease-in-out",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cfc]/45",
            hasDate
              ? "bg-[#7c5cfc]/12 text-[#7c5cfc] ring-1 ring-[#7c5cfc]/30 hover:bg-[#7c5cfc]/18"
              : "bg-white/5 text-white/45 ring-1 ring-[#ffffff10] hover:bg-white/[0.07] hover:ring-[#7c5cfc]/25",
          )}
        >
          <CalendarDays
            className={cn(
              "h-3.5 w-3.5 shrink-0 transition-colors duration-150",
              hasDate ? "text-[#7c5cfc]" : "text-white/35",
            )}
            aria-hidden
          />
          <span className="whitespace-nowrap">{formatDueDateLabel(value)}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className={cn(
          "w-auto p-0 overflow-hidden rounded-xl",
          "bg-[#0f0f17] border border-[#ffffff10]",
          "shadow-[0_16px_48px_-12px_rgba(0,0,0,0.65)]",
          "text-white/90",
          "[&_button[data-selected-single=true]]:bg-[#7c5cfc] [&_button[data-selected-single=true]]:text-white",
          "[&_button[data-selected-single=true]]:hover:bg-[#6b4ce8]",
          "[&_button:not([data-selected-single=true])]:text-white/80",
          "[&_button:not([data-selected-single=true])]:hover:bg-[#7c5cfc]/12 [&_button:not([data-selected-single=true])]:hover:text-[#7c5cfc]",
        )}
      >
        <DateCalendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) {
              onChange(toISODate(date));
              setOpen(false);
            }
          }}
          defaultMonth={selected}
          className="bg-transparent [--cell-size:2.25rem]"
          classNames={{
            caption_label: "text-white/90 text-sm font-medium",
            weekday: "text-white/40 text-[0.75rem] font-normal",
            button_previous: cn(
              "text-white/50 hover:text-[#7c5cfc] hover:bg-[#7c5cfc]/10",
              "transition-colors duration-150 ease-in-out",
            ),
            button_next: cn(
              "text-white/50 hover:text-[#7c5cfc] hover:bg-[#7c5cfc]/10",
              "transition-colors duration-150 ease-in-out",
            ),
            today: "bg-[#7c5cfc]/15 text-[#7c5cfc] rounded-md",
            outside: "text-white/20",
            disabled: "text-white/20 opacity-40",
          }}
        />
        <div className="flex items-center justify-between border-t border-[#ffffff10] px-3 py-2">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="text-xs font-medium text-[#7c5cfc]/80 hover:text-[#7c5cfc] transition-colors duration-150 ease-in-out"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              onChange(getTodayISO());
              setOpen(false);
            }}
            className="text-xs font-medium text-[#7c5cfc]/80 hover:text-[#7c5cfc] transition-colors duration-150 ease-in-out"
          >
            Today
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PriorityPills({
  value,
  onChange,
}: {
  value: Task["priority"];
  onChange: (p: Task["priority"]) => void;
}) {
  const options: Task["priority"][] = ["low", "medium", "high"];
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-all duration-150 ease-in-out",
            value === p
              ? "bg-[#7c5cfc]/25 text-[#7c5cfc] ring-1 ring-[#7c5cfc]/40"
              : "bg-white/5 text-white/45 hover:bg-white/10",
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

function TaskInlineForm({
  initialTitle,
  initialSubject,
  initialPriority,
  initialDueDate,
  submitLabel,
  onSubmit,
  onCancel,
  error,
}: {
  initialTitle: string;
  initialSubject: string;
  initialPriority: Task["priority"];
  initialDueDate: string;
  submitLabel: string;
  onSubmit: (values: {
    title: string;
    subject: string;
    priority: Task["priority"];
    dueDate: string;
  }) => void;
  onCancel: () => void;
  error: string | null;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [subject, setSubject] = useState(initialSubject);
  const [priority, setPriority] = useState<Task["priority"]>(initialPriority);
  const [dueDate, setDueDate] = useState(initialDueDate);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (title.trim()) {
        onSubmit({ title: title.trim(), subject, priority, dueDate });
      }
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="space-y-3" onKeyDown={handleKeyDown}>
      <Input
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        className="h-9 bg-transparent border-0 text-white placeholder:text-white/35 focus-visible:ring-[#7c5cfc]/50 pl-3 pr-2"
      />
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject (optional)"
          className="h-8 max-w-[200px] text-sm bg-transparent border-0 text-white/80 placeholder:text-white/30 focus-visible:ring-[#7c5cfc]/50 pl-3 pr-2"
        />
        <PriorityPills value={priority} onChange={setPriority} />
        <DueDateInput value={dueDate} onChange={setDueDate} />
      </div>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => {
            if (title.trim()) {
              onSubmit({ title: title.trim(), subject, priority, dueDate });
            }
          }}
          disabled={!title.trim()}
          className="bg-[#7c5cfc] hover:bg-[#6b4ce8] text-white h-8"
        >
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="h-8 text-white/60 hover:text-white hover:bg-white/5"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: FilterTab }) {
  const config: Record<
    FilterTab,
    { icon: typeof ClipboardList; title: string; message: string }
  > = {
    all: {
      icon: ClipboardList,
      title: "No tasks yet",
      message: "Create your first study mission to get started.",
    },
    today: {
      icon: Calendar,
      title: "Nothing due today",
      message: "You're clear for today — or add a task with today's due date.",
    },
    overdue: {
      icon: AlertCircle,
      title: "All caught up",
      message: "No overdue tasks. Nice work staying on track.",
    },
    completed: {
      icon: CheckCircle2,
      title: "No completed tasks",
      message: "Finished missions will show up here.",
    },
  };

  const { icon: Icon, title, message } = config[tab];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="inline-flex h-12 w-12 rounded-xl bg-[#7c5cfc]/10 border border-[#7c5cfc]/25 items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-[#7c5cfc]" aria-hidden />
      </div>
      <p className="text-base font-medium text-white/85">{title}</p>
      <p className="text-sm text-white/40 mt-1 max-w-xs">{message}</p>
    </div>
  );
}

function TaskRow({
  task,
  today,
  isEditing,
  editError,
  onToggle,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: {
  task: Task;
  today: string;
  isEditing: boolean;
  editError: string | null;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onCancelEdit: () => void;
  onSaveEdit: (
    task: Task,
    values: {
      title: string;
      subject: string;
      priority: Task["priority"];
      dueDate: string;
    },
  ) => void;
  onDelete: (task: Task) => void;
}) {
  const dueLabel = formatDueLabel(task.due_date, task.completed, today);

  if (isEditing) {
    return (
      <li
        className={cn(
          "rounded-xl border border-[#ffffff10] bg-[#0f0f17] p-4 transition-all duration-150 ease-in-out",
          task.completed && "opacity-50",
        )}
      >
        <TaskInlineForm
          initialTitle={task.title}
          initialSubject={task.subject}
          initialPriority={task.priority}
          initialDueDate={task.due_date ?? ""}
          submitLabel="Save"
          error={editError}
          onCancel={onCancelEdit}
          onSubmit={(values) => onSaveEdit(task, values)}
        />
      </li>
    );
  }

  return (
    <li
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-[#ffffff10] bg-[#0f0f17] px-4 py-3 transition-all duration-150 ease-in-out hover:bg-[#111118]",
        task.completed && "opacity-50",
      )}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task)}
        className="border-white/25 data-[state=checked]:bg-[#7c5cfc] data-[state=checked]:border-[#7c5cfc]"
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
      />

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium text-white/90 break-words",
            task.completed && "line-through text-white/40",
          )}
        >
          {task.title.trim() || "Untitled"}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {task.subject.trim() ? (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#7c5cfc]/10 text-[#7c5cfc]/80">
              {task.subject}
            </span>
          ) : null}
          <span
            className={cn(
              "text-[11px] px-2 py-0.5 rounded-full capitalize",
              priorityBadgeClass[task.priority],
            )}
          >
            {task.priority}
          </span>
          {dueLabel ? (
            <span className={cn("text-[11px]", dueLabel.className)}>
              {dueLabel.text}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onEdit(task)}
          className="h-8 w-8 text-white/35 hover:text-[#7c5cfc] hover:bg-[#7c5cfc]/10"
          aria-label="Edit task"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onDelete(task)}
          className="h-8 w-8 text-white/35 hover:text-red-400 hover:bg-red-400/10"
          aria-label="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </li>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const today = useMemo(() => getTodayISO(), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      const { data, error } = await getTasks();
      if (cancelled) return;

      if (error) {
        setLoadError(error);
        setTasks([]);
      } else {
        setTasks(data ?? []);
      }
      setIsLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    return {
      all: tasks.length,
      today: tasks.filter((t) => t.due_date === today).length,
      overdue: tasks.filter(
        (t) => t.due_date !== null && t.due_date < today && !t.completed,
      ).length,
      completed: tasks.filter((t) => t.completed).length,
    };
  }, [tasks, today]);

  const visibleTasks = useMemo(() => {
    const filtered = tasks.filter((t) => matchesFilter(t, activeTab, today));
    return sortTasks(filtered);
  }, [tasks, activeTab, today]);

  const handleToggle = useCallback(async (task: Task) => {
    if (task.id.startsWith("temp-")) return;

    const previous = task;
    const nextCompleted = !task.completed;

    setRowError(null);
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
      setRowError(SAVE_ERROR);
      return;
    }

    setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
  }, []);

  const handleCreate = useCallback(
    async (values: {
      title: string;
      subject: string;
      priority: Task["priority"];
      dueDate: string;
    }) => {
      const tempId = `temp-${crypto.randomUUID()}`;
      const now = new Date().toISOString();
      const dueDate = values.dueDate || null;

      const optimistic: Task = {
        id: tempId,
        user_id: "",
        title: values.title,
        completed: false,
        priority: values.priority,
        due_date: dueDate,
        subject: values.subject,
        created_at: now,
        updated_at: now,
      };

      setCreateError(null);
      setShowCreateForm(false);
      setTasks((prev) => [...prev, optimistic]);

      const { data, error } = await createTask(
        values.title,
        values.priority,
        dueDate,
        values.subject,
      );

      if (error || !data) {
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
        setCreateError(SAVE_ERROR);
        setShowCreateForm(true);
        return;
      }

      setTasks((prev) => prev.map((t) => (t.id === tempId ? data : t)));
    },
    [],
  );

  const handleSaveEdit = useCallback(
    async (
      task: Task,
      values: {
        title: string;
        subject: string;
        priority: Task["priority"];
        dueDate: string;
      },
    ) => {
      if (task.id.startsWith("temp-")) return;

      const previous = task;
      const dueDate = values.dueDate || null;
      const optimistic: Task = {
        ...task,
        title: values.title,
        subject: values.subject,
        priority: values.priority,
        due_date: dueDate,
        updated_at: new Date().toISOString(),
      };

      setEditError(null);
      setEditingId(null);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? optimistic : t)));

      const { data, error } = await updateTask(
        task.id,
        values.title,
        values.priority,
        dueDate,
        values.subject,
      );

      if (error || !data) {
        setTasks((prev) =>
          prev.map((t) => (t.id === previous.id ? previous : t)),
        );
        setEditingId(task.id);
        setEditError(SAVE_ERROR);
        return;
      }

      setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
    },
    [],
  );

  const handleDelete = useCallback(async (task: Task) => {
    if (task.id.startsWith("temp-")) {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      return;
    }

    const previous = task;
    setRowError(null);
    setEditingId((id) => (id === task.id ? null : id));
    setTasks((prev) => prev.filter((t) => t.id !== task.id));

    const { error } = await deleteTask(task.id);

    if (error) {
      setTasks((prev) => [...prev, previous]);
      setRowError(SAVE_ERROR);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100dvh-3.5rem)] lg:min-h-[100dvh] bg-[#0a0a0f]">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col flex-1">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-white/95">
              Tasks
            </h1>
            <p className="text-sm text-white/40 mt-1">
              Your study missions for today.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              setCreateError(null);
              setShowCreateForm(true);
            }}
            className="shrink-0 bg-[#7c5cfc] hover:bg-[#6b4ce8] text-white shadow-[0_0_20px_-6px_rgba(124,92,252,0.6)] transition-all duration-150 ease-in-out"
          >
            <Plus className="h-4 w-4" aria-hidden />
            New Task
          </Button>
        </div>

        <div
          className="flex gap-1 border-b border-[#ffffff10] mb-6 overflow-x-auto"
          role="tablist"
          aria-label="Filter tasks"
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-150 ease-in-out",
                  isActive
                    ? "text-white/95"
                    : "text-white/40 hover:text-white/65",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "text-[11px] px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center",
                    isActive
                      ? "bg-[#7c5cfc]/20 text-[#7c5cfc]"
                      : "bg-white/5 text-white/35",
                  )}
                >
                  {counts[tab.id]}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#7c5cfc] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {loadError && (
          <div
            className="mb-4 px-4 py-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg"
            role="alert"
          >
            {loadError}
          </div>
        )}

        {rowError && (
          <div
            className="mb-4 px-4 py-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg"
            role="alert"
          >
            {rowError}
          </div>
        )}

        <ul className="space-y-2 flex-1">
          {showCreateForm && (
            <li className="rounded-xl border border-[#ffffff10] bg-[#0f0f17] p-4 mb-2 transition-all duration-150 ease-in-out">
              <TaskInlineForm
                initialTitle=""
                initialSubject=""
                initialPriority="medium"
                initialDueDate=""
                submitLabel="Add Task"
                error={createError}
                onCancel={() => {
                  setShowCreateForm(false);
                  setCreateError(null);
                }}
                onSubmit={(values) => void handleCreate(values)}
              />
            </li>
          )}

          {isLoading ? (
            <li className="py-12 text-center text-sm text-white/35">
              Loading tasks…
            </li>
          ) : visibleTasks.length === 0 && !showCreateForm ? (
            <li>
              <EmptyState tab={activeTab} />
            </li>
          ) : (
            visibleTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                today={today}
                isEditing={editingId === task.id}
                editError={editingId === task.id ? editError : null}
                onToggle={(t) => void handleToggle(t)}
                onEdit={(t) => {
                  setEditError(null);
                  setEditingId(t.id);
                }}
                onCancelEdit={() => {
                  setEditingId(null);
                  setEditError(null);
                }}
                onSaveEdit={(t, values) => void handleSaveEdit(t, values)}
                onDelete={(t) => void handleDelete(t)}
              />
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
