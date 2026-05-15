import type { Metadata } from "next";
import NotesPage from "@/features/notes/components/notes";

export const metadata: Metadata = {
  title: "Notes — Nucleus",
  description: "A calm, AI-assisted writing surface.",
};

export default function Page() {
  return <NotesPage />;
}
