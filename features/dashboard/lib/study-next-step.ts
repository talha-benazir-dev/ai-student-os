export type StudyProgress = {
  clusters: number;
  notes: number;
  documents: number;
  tasks: number;
  dueCards: number;
  completedTasks?: number;
};

export function getStudyNextStep(progress: StudyProgress) {
  if (progress.dueCards > 0)
    return {
      title: "Bring a few ideas back to mind",
      description: `${progress.dueCards} flashcard${progress.dueCards === 1 ? " is" : "s are"} ready to revisit. Try remembering the answer before you turn each card over.`,
      action: "Review due cards",
      href: "/flashcards?review=due",
    };
  if (progress.tasks > 0)
    return {
      title: "Choose one thing to work on",
      description:
        "Pick a small task, start a focus session, and give it your attention. Everything else can wait.",
      action: "Choose a task",
      href: "/tasks",
    };
  if (
    progress.notes + progress.documents > 0 &&
    (progress.completedTasks ?? 0) > 0
  )
    return {
      title: "See what stayed with you",
      description:
        "Turn one idea from your study session into a question. Try answering from memory before checking your notes.",
      action: "Make a review card",
      href: "/flashcards?new=card",
    };
  if (progress.notes + progress.documents > 0)
    return {
      title: "Turn your material into a small goal",
      description:
        "Make it specific: explain one idea, work through three questions, or read a few pages. Something you can finish in one sitting.",
      action: "Add a study task",
      href: "/tasks?new=task",
    };
  if (progress.clusters > 0)
    return {
      title: "Start with what you’re learning",
      description:
        "Write a few lines from your latest lesson. A rough first note is enough; you can organize it as you go.",
      action: "Write your first note",
      href: "/notes?new=note",
    };
  return {
    title: "Create your first cluster",
    description:
      "Start with one area you’re studying. It keeps related notes, tasks, and flashcards together. You can add the rest later.",
    action: "Add your first cluster",
    href: "/clusters?new=cluster",
  };
}
