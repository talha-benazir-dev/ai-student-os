import type { Metadata } from "next";
import { getClusters } from "@/features/tasks/actions/clusters.actions";
import { getTasks } from "@/features/tasks/actions/tasks.actions";
import TasksPage from "@/features/tasks/components/tasks";

export const metadata: Metadata = {
  title: "Tasks — Nucleus",
  description: "Your study missions for today.",
};

export default async function Page() {
  const [tasksResult, clustersResult] = await Promise.all([
    getTasks(),
    getClusters(),
  ]);

  return (
    <TasksPage
      initialTasks={tasksResult.data ?? []}
      initialClusters={clustersResult.data ?? []}
    />
  );
}
