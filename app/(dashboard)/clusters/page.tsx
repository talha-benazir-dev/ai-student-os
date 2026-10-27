import { getClusters } from "@/features/clusters/actions/clusters.actions";
import { ClustersClient } from "@/features/clusters/components/clusters";
import { getClusterStudyMinutesMap } from "@/features/study-sessions/actions/study-sessions.actions";

export default async function ClustersPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const params = await searchParams;
  const [{ data: clusters }, { data: studyMinutesByCluster }] = await Promise.all([
    getClusters(),
    getClusterStudyMinutesMap(),
  ]);
  return (
    <ClustersClient
      initialClusters={clusters ?? []}
      studyMinutesByCluster={studyMinutesByCluster ?? {}}
      autoOpenCreate={params.new === "subject"}
    />
  );
}
