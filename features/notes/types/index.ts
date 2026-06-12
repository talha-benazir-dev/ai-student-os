import type { Cluster } from "@/features/clusters/types";

export type { Cluster };

export type NoteType = "text" | "readme" | "canvas" | "chart" | "diagram";

export type Note = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  cluster_id: string | null;
  type: NoteType;
  created_at: string;
  updated_at: string;
};

export type NoteInsert = {
  user_id: string;
  title?: string;
  content?: string;
  cluster_id?: string | null;
  type?: NoteType;
};

export type NoteUpdate = {
  title?: string;
  content?: string;
  cluster_id?: string | null;
  updated_at?: string;
};
