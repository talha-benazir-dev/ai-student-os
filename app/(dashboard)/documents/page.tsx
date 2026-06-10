import { Metadata } from "next";
import { getDocuments } from "@/features/documents/actions/documents.actions";
import { getClusters } from "@/features/clusters/actions/clusters.actions";
import { DocumentsPage } from "@/features/documents/components/documents";

export const metadata: Metadata = {
  title: "Documents — Nucleus",
};

export default async function Page() {
  const [documents, clusters] = await Promise.all([
    getDocuments(),
    getClusters(),
  ]);
  return (
    <DocumentsPage
      initialDocuments={documents.data ?? []}
      initialClusters={clusters.data ?? []}
    />
  );
}
