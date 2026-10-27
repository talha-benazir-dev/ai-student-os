import Link from "next/link";
import {
  ArrowRight,
  Check,
  Circle,
  FileText,
  Layers,
  NotebookPen,
  Timer,
} from "lucide-react";
import { getStudyNextStep, type StudyProgress } from "../lib/study-next-step";

export function StudyGuide({ progress }: { progress: StudyProgress }) {
  const next = getStudyNextStep(progress);
  const gettingStarted = progress.notes + progress.documents === 0;
  const steps = [
    {
      title: "Choose a subject",
      detail: "A home for related ideas",
      done: progress.subjects > 0,
      href: "/clusters?new=subject",
      icon: NotebookPen,
    },
    {
      title: "Add something to learn",
      detail: "A note or a reading",
      done: progress.notes + progress.documents > 0,
      href: "/notes?new=note",
      icon: FileText,
    },
    {
      title: "Make a small plan",
      detail: "One clear study task",
      done: progress.tasks > 0,
      href: "/tasks?new=task",
      icon: Timer,
    },
  ];
  return (
    <section
      aria-labelledby="study-guide-title"
      className="mb-8 overflow-hidden rounded-lg border border-primary/20 bg-primary/[.035]"
    >
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs text-primary">
            <NotebookPen className="size-3.5" />
            {gettingStarted ? "Let’s make this space yours" : "Your next step"}
          </p>
          <h2
            id="study-guide-title"
            className="text-xl font-medium tracking-tight sm:text-2xl"
          >
            {next.title}
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            {next.description}
          </p>
          <Link
            href={next.href}
            className="mt-5 inline-flex min-h-10 items-center gap-5 rounded-md bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {next.action}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div
          className={
            gettingStarted
              ? "flex flex-col justify-center gap-1"
              : "hidden flex-col justify-center gap-1 sm:flex"
          }
          aria-label={gettingStarted ? "Workspace setup" : "Your study loop"}
        >
          {gettingStarted ? (
            steps.map(({ title, detail, done, href, icon: Icon }) => (
              <Link
                key={title}
                href={href}
                className="group flex items-center gap-3 rounded-md px-3 py-3 transition-colors hover:bg-primary/5"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background/40 text-muted-foreground">
                  {done ? (
                    <Check className="size-4 text-primary" />
                  ) : (
                    <Icon className="size-4" />
                  )}
                </span>
                <div className="flex-1">
                  <p className="text-xs text-foreground">
                    {title}
                    {done && (
                      <span className="ml-2 text-[10px] text-primary">
                        Done
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {detail}
                  </p>
                </div>
                {!done && (
                  <Circle className="size-3 text-muted-foreground/50" />
                )}
              </Link>
            ))
          ) : (
            <>
              <p className="mb-2 px-3 text-xs text-muted-foreground">
                A simple rhythm to come back to
              </p>
              {[
                {
                  title: "Capture an idea",
                  detail: "Write it in your own words",
                  href: "/notes",
                  icon: FileText,
                },
                {
                  title: "Work on one thing",
                  detail: "Choose a task and start a session",
                  href: "/tasks",
                  icon: Timer,
                },
                {
                  title: "See what you remember",
                  detail: "Review a few flashcards",
                  href: "/flashcards",
                  icon: Layers,
                },
              ].map(({ title, detail, href, icon: Icon }) => (
                <Link
                  key={title}
                  href={href}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-primary/5"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs">{title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {detail}
                    </p>
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
