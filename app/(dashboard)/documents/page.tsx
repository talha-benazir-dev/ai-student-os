import { Metadata } from "next";
import { DocumentsPage } from "@/features/documents/components/documents";

export const metadata: Metadata = {
  title: "Documents — Nucleus",
};

export default function Page() {
  return <DocumentsPage />;
}
