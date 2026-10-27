import Link from "next/link";
import { BookOpen } from "lucide-react";

export function StudyAssistantGate() {
  return (
    <div className="mx-auto flex min-h-[75vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <BookOpen className="mb-6 size-9 text-primary" strokeWidth={1.5} />
      <h1 className="text-2xl font-medium tracking-tight">Study assistant</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Work through a difficult concept, ask questions about your material, or
        build a study pack. AI study support is included with Pro.
      </p>
      <Link
        href="/#pricing"
        className="mt-6 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Explore Pro
      </Link>
      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        Your notes, tasks, and flashcards are ready to use on Free.
      </p>
      <Link
        href="/dashboard"
        className="mt-3 text-xs text-primary hover:underline"
      >
        Keep studying
      </Link>
    </div>
  );
}
