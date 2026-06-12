"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  BookOpen,
  GraduationCap,
  Loader2,
  Sparkles,
} from "lucide-react";
import { completeOnboarding } from "@/features/onboarding/actions/onboarding.actions";
import type { StudyStage } from "@/features/onboarding/types";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Computer Science",
  "Economics",
  "Literature",
] as const;

const STAGE_OPTIONS: {
  value: StudyStage;
  label: string;
  icon: typeof GraduationCap;
}[] = [
  { value: "high_school", label: "High School", icon: GraduationCap },
  { value: "undergraduate", label: "Undergraduate", icon: BookOpen },
  { value: "postgraduate", label: "Postgraduate", icon: Award },
  { value: "self_learning", label: "Self-Learning", icon: Sparkles },
];

const INPUT_CLASS =
  "w-full rounded-xl border border-[#ffffff15] bg-transparent px-4 py-3 text-lg text-white placeholder:text-white/35 outline-none transition-colors duration-200 focus:border-[#7c5cfc]";

const PRIMARY_BUTTON_CLASS =
  "ml-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#7c5cfc] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#8a6dfd] disabled:cursor-not-allowed disabled:opacity-50";

function normalizeSubject(raw: string): string {
  const trimmed = raw.trim().replace(/,+$/, "").trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

type OnboardingFlowProps = {
  prefillName: string;
};

export function OnboardingFlow({ prefillName }: OnboardingFlowProps) {
  const router = useRouter();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const countryInputRef = useRef<HTMLInputElement>(null);
  const subjectInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [name, setName] = useState(prefillName);
  const [country, setCountry] = useState("");
  const [studyStage, setStudyStage] = useState<StudyStage | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  const goToStep = useCallback((next: number) => {
    setIsExiting(true);
    window.setTimeout(() => {
      setStep(next);
      setIsExiting(false);
    }, 200);
  }, []);

  useEffect(() => {
    if (step === 1) {
      nameInputRef.current?.focus();
    } else if (step === 2) {
      countryInputRef.current?.focus();
    } else if (step === 4) {
      subjectInputRef.current?.focus();
    }
  }, [step]);

  const nameValid = name.trim().length >= 2;
  const countryValid = country.trim().length >= 2;
  const subjectsValid = subjects.length >= 1;

  const handleStageSelect = (stage: StudyStage) => {
    setStudyStage(stage);
    window.setTimeout(() => goToStep(4), 300);
  };

  const addSubject = (raw: string) => {
    const normalized = normalizeSubject(raw);
    if (!normalized) return;
    if (subjects.length >= 6) return;
    const exists = subjects.some(
      (s) => s.toLowerCase() === normalized.toLowerCase(),
    );
    if (exists) return;
    setSubjects((prev) => [...prev, normalized].slice(0, 6));
    setSubjectInput("");
  };

  const removeSubject = (subject: string) => {
    setSubjects((prev) => prev.filter((s) => s !== subject));
  };

  const handleSubjectKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSubject(subjectInput);
    }
  };

  const handleSubmit = async () => {
    if (!nameValid || !countryValid || !studyStage || !subjectsValid) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const { error } = await completeOnboarding({
      name: name.trim(),
      country: country.trim(),
      study_stage: studyStage,
      subjects,
    });

    if (error) {
      setSubmitError("Something went wrong. Please try again.");
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
  };

  const availableSuggestions = SUGGESTIONS.filter(
    (s) => !subjects.some((sub) => sub.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f] text-white">
      <header className="flex flex-col gap-6 px-6 pt-8 sm:px-10">
        <h1 className="text-xl font-bold tracking-tight text-white">
          Nucleus
        </h1>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((segment) => (
            <div
              key={segment}
              className="h-1 flex-1 overflow-hidden rounded-full bg-[#ffffff10]"
            >
              <div
                className={cn(
                  "h-full rounded-full bg-[#7c5cfc] transition-all duration-300 ease-out",
                  segment <= step ? "w-full" : "w-0",
                )}
              />
            </div>
          ))}
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-10">
        <div
          className={cn(
            "w-full max-w-lg rounded-2xl border border-[#ffffff10] bg-[#0f0f17] p-8 transition-all duration-200 ease-out",
            isExiting
              ? "translate-y-1 opacity-0"
              : "translate-y-0 opacity-100",
          )}
        >
          <p className="mb-2 text-xs text-white/45">Step {step} of 4</p>

          {step === 1 && (
            <div className="space-y-6">
              <StepHeader
                heading="What should we call you?"
                subtext="This is how Nucleus will greet you."
              />
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && nameValid) goToStep(2);
                }}
                placeholder="Your name"
                autoComplete="name"
                className={INPUT_CLASS}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <StepHeader
                heading="Where are you from?"
                subtext="This helps Nucleus align with your curriculum."
              />
              <input
                ref={countryInputRef}
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && countryValid) goToStep(3);
                }}
                placeholder="Your country"
                autoComplete="off"
                className={INPUT_CLASS}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <StepHeader
                heading="Where are you in your journey?"
                subtext="This helps Nucleus personalize your experience."
              />
              <div className="grid grid-cols-2 gap-3">
                {STAGE_OPTIONS.map(({ value, label, icon: Icon }) => {
                  const isSelected = studyStage === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleStageSelect(value)}
                      className={cn(
                        "flex flex-col items-center gap-3 rounded-xl border px-4 py-5 text-center transition-all duration-200",
                        isSelected
                          ? "border-[#7c5cfc] bg-[#7c5cfc1a]"
                          : "border-[#ffffff15] bg-transparent hover:border-[#ffffff25]",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-6 w-6",
                          isSelected ? "text-[#7c5cfc]" : "text-white/60",
                        )}
                        aria-hidden
                      />
                      <span className="text-sm font-medium text-white">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <StepHeader
                heading="What are you studying?"
                subtext="Add up to 6 subjects. Press Enter or comma to add."
              />
              <div
                className={cn(
                  "flex min-h-[44px] flex-wrap gap-2 rounded-xl border border-[#ffffff15] p-3",
                  subjects.length === 0 && "border-dashed",
                )}
              >
                {subjects.map((subject) => (
                  <span
                    key={subject}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#7c5cfc40] bg-[#7c5cfc1a] px-3 py-1 text-sm text-white"
                  >
                    {subject}
                    <button
                      type="button"
                      onClick={() => removeSubject(subject)}
                      className="text-white/45 transition-colors hover:text-white/80"
                      aria-label={`Remove ${subject}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                ref={subjectInputRef}
                type="text"
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                onKeyDown={handleSubjectKeyDown}
                onBlur={() => {
                  if (subjectInput.trim()) addSubject(subjectInput);
                }}
                disabled={subjects.length >= 6}
                placeholder={
                  subjects.length >= 6
                    ? "Maximum 6 subjects"
                    : "Type a subject…"
                }
                className={cn(
                  INPUT_CLASS,
                  subjects.length >= 6 && "cursor-not-allowed opacity-50",
                )}
              />
              {availableSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {availableSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => addSubject(suggestion)}
                      className="rounded-full border border-[#ffffff15] px-3 py-1 text-xs text-white/60 transition-colors hover:border-[#7c5cfc40] hover:text-white"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between gap-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => goToStep(step - 1)}
                  disabled={isSubmitting}
                  className="rounded-lg px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  Back
                </button>
              ) : (
                <span />
              )}

              {step === 1 && (
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  disabled={!nameValid}
                  className={PRIMARY_BUTTON_CLASS}
                >
                  Next
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  disabled={!countryValid}
                  className={PRIMARY_BUTTON_CLASS}
                >
                  Next
                </button>
              )}

              {step === 4 && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!subjectsValid || isSubmitting}
                  className={PRIMARY_BUTTON_CLASS}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      <span className="sr-only">Loading</span>
                    </>
                  ) : (
                    "Let's go"
                  )}
                </button>
              )}
            </div>

            {submitError && (
              <p className="text-center text-sm text-red-400/90">
                {submitError}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StepHeader({
  heading,
  subtext,
}: {
  heading: string;
  subtext: string;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-white">
        {heading}
      </h2>
      <p className="mt-2 text-sm text-white/50">{subtext}</p>
    </div>
  );
}
