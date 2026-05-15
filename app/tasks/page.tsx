import type { Metadata } from "next";
import TasksPage from "@/features/tasks/components/tasks";

export const metadata: Metadata = {
  title: "Tasks — Nucleus",
  description: "Focused work, queued and timed.",
};

export default function Page() {
  return <TasksPage />;
}
