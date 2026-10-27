import type { Metadata } from "next";
import { getClusters } from "@/features/clusters/actions/clusters.actions";
import { getNotes } from "@/features/notes/actions/notes.actions";
import NotesPage from "@/features/notes/components/notes";

export const metadata: Metadata = {
  title: "Notes — Nucleus",
  description: "Capture ideas in a calm, focused writing workspace.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ new?: string; note?: string }>;
}) {
  const { new: newParam, note } = await searchParams;
  const [notesResult, clustersResult] = await Promise.all([
    getNotes(),
    getClusters(),
  ]);

  return (
    <NotesPage
      initialNotes={notesResult.data ?? []}
      initialClusters={clustersResult.data ?? []}
      initialNoteId={note}
      autoOpenCreate={newParam === "note"}
    />
  );
}
