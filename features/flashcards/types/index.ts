export type Flashcard = {
  id: string;
  user_id: string;
  front: string;
  back: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  next_review: string;
  interval_days: number;
  repetitions: number;
  created_at: string;
};
