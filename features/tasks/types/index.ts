export type Task = {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  due_date: string | null;
  subject: string;
  updated_at: string;
  created_at: string;
};
