import type { Metadata } from "next";
import NotesPage from "@/features/notes/components/notes";

export const metadata: Metadata = {
  title: "Notes — Nucleus",
  description: "Capture ideas in a calm, focused writing workspace.",
};

export default function Page() {
  return <NotesPage />;
}
