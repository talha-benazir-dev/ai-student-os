import type { StudyStage } from "@/features/onboarding/types";

const SUBJECT_SUGGESTIONS_BY_STAGE: Record<StudyStage, readonly string[]> = {
  high_school: [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "English Literature",
    "Geography",
    "Computer Science",
  ],
  undergraduate: [
    "Mathematics",
    "Computer Science",
    "Physics",
    "Economics",
    "Statistics",
    "Psychology",
    "Engineering",
    "Business",
  ],
  postgraduate: [
    "Research Methods",
    "Thesis",
    "Literature Review",
    "Statistics",
    "Data Analysis",
    "Academic Writing",
    "Methodology",
  ],
  self_learning: [
    "Computer Science",
    "Mathematics",
    "Programming",
    "Design",
    "Business",
    "Languages",
    "Personal Finance",
    "Writing",
  ],
};

const DEFAULT_SUGGESTIONS = SUBJECT_SUGGESTIONS_BY_STAGE.undergraduate;

export function getSubjectSuggestions(
  studyStage: StudyStage | null,
): readonly string[] {
  if (!studyStage) return DEFAULT_SUGGESTIONS;
  return SUBJECT_SUGGESTIONS_BY_STAGE[studyStage];
}

export function getAvailableSubjectSuggestions(
  studyStage: StudyStage | null,
  selectedSubjects: string[],
): string[] {
  const selected = new Set(selectedSubjects.map((s) => s.toLowerCase()));
  return getSubjectSuggestions(studyStage)
    .filter((s) => !selected.has(s.toLowerCase()))
    .slice(0, 8);
}
