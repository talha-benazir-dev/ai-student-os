export type FlashcardInput = {
  front: string;
  back: string;
  difficulty: string;
};

const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard"]);
export const MAX_FLASHCARDS_PER_SET = 30;

export function normalizeFlashcardSetInput(
  raw: unknown,
): { cards: FlashcardInput[]; truncated: boolean } | { error: string } {
  let value = raw;

  if (value === undefined || value === null) {
    return {
      error:
        "cards is required and must be an array of { front, back, difficulty } objects",
    };
  }

  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return { error: "cards must be a JSON array, not an unparsable string" };
    }
  }

  if (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "cards" in value
  ) {
    value = (value as { cards: unknown }).cards;
  }

  if (!Array.isArray(value)) {
    if (typeof value === "object" && value !== null) {
      value = Object.values(value as Record<string, unknown>);
    } else {
      return {
        error:
          "cards must be an array of { front, back, difficulty } objects",
      };
    }
  }

  const cardList = value as unknown[];
  const cards: FlashcardInput[] = [];

  for (const item of cardList) {
    if (typeof item !== "object" || item === null) continue;

    const card = item as Record<string, unknown>;
    const front = String(card.front ?? "").trim();
    const back = String(card.back ?? "").trim();
    if (!front || !back) continue;

    const difficultyRaw = String(card.difficulty ?? "medium").toLowerCase();
    const difficulty = VALID_DIFFICULTIES.has(difficultyRaw)
      ? difficultyRaw
      : "medium";

    cards.push({ front, back, difficulty });
  }

  if (cards.length === 0) {
    return {
      error:
        "cards array is empty or has no valid entries with front and back",
    };
  }

  const truncated = cards.length > MAX_FLASHCARDS_PER_SET;
  return {
    cards: truncated ? cards.slice(0, MAX_FLASHCARDS_PER_SET) : cards,
    truncated,
  };
}
