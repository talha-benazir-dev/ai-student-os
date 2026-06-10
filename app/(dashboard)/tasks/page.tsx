import type { Metadata } from "next";
import { getClusters } from "@/features/clusters/actions/clusters.actions";
import { getTasks } from "@/features/tasks/actions/tasks.actions";
import TasksPage from "@/features/tasks/components/tasks";

export const metadata: Metadata = {
  title: "Tasks — Nucleus",
  description: "Your study missions for today.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const { new: newParam } = await searchParams;
  const [tasksResult, clustersResult] = await Promise.all([
    getTasks(),
    getClusters(),
  ]);

  return (
    <TasksPage
      initialTasks={tasksResult.data ?? []}
      initialClusters={clustersResult.data ?? []}
      autoOpenCreate={newParam === "task"}
    />
  );
}
