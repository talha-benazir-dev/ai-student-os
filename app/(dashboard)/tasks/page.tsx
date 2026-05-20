import type { Metadata } from "next";
import TasksPage from "@/features/tasks/components/tasks";

export const metadata: Metadata = {
  title: "Tasks — Nucleus",
  description: "Your study missions for today.",
};

export default function Page() {
  return <TasksPage />;
}
