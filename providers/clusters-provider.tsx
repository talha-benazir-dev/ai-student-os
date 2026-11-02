"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { getClusters } from "@/features/clusters/actions/clusters.actions";
import type { Cluster } from "@/features/clusters/types";

type ClustersContextValue = {
  clusters: Cluster[];
  addCluster: (cluster: Cluster) => void;
  updateCluster: (cluster: Cluster) => void;
  removeCluster: (id: string) => void;
  refresh: () => Promise<void>;
};

const ClustersContext = createContext<ClustersContextValue | null>(null);

export function ClustersProvider({ children, initialClusters }: { children: ReactNode; initialClusters: Cluster[] }) {
  const [clusters, setClusters] = useState<Cluster[]>(initialClusters);

  const fetchClusters = useCallback(async () => {
    const result = await getClusters();
    if (result.data) setClusters(result.data);
  }, []);

  const addCluster = useCallback((cluster: Cluster) => {
    setClusters((prev) => [...prev, cluster]);
  }, []);

  const updateCluster = useCallback((cluster: Cluster) => {
    setClusters((prev) => prev.map((c) => (c.id === cluster.id ? cluster : c)));
  }, []);

  const removeCluster = useCallback((id: string) => {
    setClusters((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value = useMemo(() => ({ clusters, addCluster, updateCluster, removeCluster, refresh: fetchClusters }), [clusters, addCluster, updateCluster, removeCluster, fetchClusters]);

  return (
    <ClustersContext.Provider value={value}>
      {children}
    </ClustersContext.Provider>
  );
}

export function useClusters() {
  const ctx = useContext(ClustersContext);
  if (!ctx) throw new Error("useClusters must be used within ClustersProvider");
  return ctx;
}
