export type Cluster = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  due_date: string | null;
  reward: string;
  importance_points: number;
  cluster_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateTaskInput = {
  title: string;
  priority: Task["priority"];
  due_date: string | null;
  reward?: string;
  importance_points?: number;
  cluster_id?: string | null;
};

export type UpdateTaskInput = Partial<CreateTaskInput>;
