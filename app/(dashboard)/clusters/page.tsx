import { getClusters } from "@/features/clusters/actions/clusters.actions";
import { ClustersClient } from "@/features/clusters/components/clusters";

export default async function ClustersPage() {
  const { data: clusters } = await getClusters();
  return <ClustersClient initialClusters={clusters ?? []} />;
}
