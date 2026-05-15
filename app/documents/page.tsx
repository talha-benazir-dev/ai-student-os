import type { Metadata } from "next";
import DocumentsPage from "@/features/documents/components/documents";

export const metadata: Metadata = {
  title: "Documents — Nucleus",
  description: "Your AI-powered library.",
};

export default function Page() {
  return <DocumentsPage />;
}
