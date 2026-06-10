import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClusters } from "@/features/clusters/actions/clusters.actions";
import { ClusterView } from "@/features/clusters/components/cluster-view";

export default async function ClusterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const [
    { data: clustersData },
    { data: notes },
    { data: tasks },
    { data: flashcards },
    { data: documents },
  ] = await Promise.all([
    getClusters(),
    supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .eq("cluster_id", id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("cluster_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", user.id)
      .eq("cluster_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .eq("cluster_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const cluster = clustersData?.find((c) => c.id === id);
  if (!cluster) notFound();

  return (
    <ClusterView
      cluster={cluster}
      initialNotes={notes ?? []}
      initialTasks={tasks ?? []}
      initialFlashcards={flashcards ?? []}
      initialDocuments={documents ?? []}
    />
  );
}
