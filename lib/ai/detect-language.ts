const BENGALI_SCRIPT = /[\u0980-\u09FF]/g;
const LATIN_SCRIPT = /[a-zA-Z]/g;

const LANGUAGE_LABELS: Record<string, string> = {
  bengali: "Bengali (Bangla)",
  english: "English",
};

/**
 * Detects the dominant natural language from extracted document text using script
 * frequency. Optimized for Bengali vs English, the most common case in Nucleus.
 */
export function detectTextLanguage(text: string): string | null {
  const sample = text.replace(/\s+/g, " ").trim().slice(0, 8000);
  if (sample.length < 20) return null;

  const bengaliCount = (sample.match(BENGALI_SCRIPT) ?? []).length;
  const latinCount = (sample.match(LATIN_SCRIPT) ?? []).length;

  if (bengaliCount === 0 && latinCount === 0) return null;

  if (bengaliCount > latinCount * 0.25) {
    return LANGUAGE_LABELS.bengali;
  }

  if (latinCount > 0) {
    return LANGUAGE_LABELS.english;
  }

  return LANGUAGE_LABELS.bengali;
}

export function buildDocumentLanguageRules(
  rawText: string,
  country: string,
): string {
  const detected = detectTextLanguage(rawText);

  const detectedLine = detected
    ? `Detected document language: ${detected}.`
    : "Could not confidently detect document language — infer it from the document content before writing.";

  return `
LANGUAGE AND STYLE RULES (CRITICAL):
- ${detectedLine}
- Write ALL generated content in the SAME language as the uploaded document: note titles, note bodies, flashcard fronts and backs, task titles, and the study plan.
- Match the document's terminology, tone, and formality (e.g. textbook vs lecture notes).
- Do NOT default to the student's country language. Country (${country}) is for curriculum context only — it must NOT determine output language.
- If the document mixes languages, use the dominant language of the educational content.
- Keep formulas, symbols, and proper nouns as they appear in the source.`;
}

export function buildClusterLanguageRules(country: string): string {
  return `
LANGUAGE AND STYLE RULES (CRITICAL):
- Before creating content, call get_notes for each target cluster and check the language of existing notes.
- If the cluster already has notes, write ALL new content in that same language and style.
- If the cluster has no notes, write in English unless the cluster name or subject clearly indicates another language.
- Do NOT default to the student's country language. Country (${country}) is for curriculum context only — it must NOT determine output language.
- Apply the same language consistently across notes, flashcards, tasks, and the study plan.`;
}
