import type { Cluster } from "@/features/clusters/types";

export type { Cluster };

export type Flashcard = {
  id: string;
  user_id: string;
  front: string;
  back: string;
  cluster_id: string | null;
  difficulty: "easy" | "medium" | "hard";
  next_review: string;
  interval_days: number;
  repetitions: number;
  created_at: string;
};

export type FlashcardUpdate = {
  front?: string;
  back?: string;
  cluster_id?: string | null;
  difficulty?: "easy" | "medium" | "hard";
  next_review?: string;
  interval_days?: number;
  repetitions?: number;
};
