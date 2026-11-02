import { cn } from "@/lib/utils";

type QuestionCardProps = {
  question: string;
  options: { label: string; value: string }[];
  onAnswer: (value: string, label: string) => void;
  answered?: string | null;
};

export function QuestionCard({
  question,
  options,
  onAnswer,
  answered = null,
}: QuestionCardProps) {
  const isAnswered = answered != null;

  return (
    <div className="mt-2 max-w-[85%] rounded-2xl border border-[#ffffff10] bg-card p-4">
      <p className="mb-3 text-sm text-white/80">{question}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = option.value === answered;

          return (
            <button
              key={option.value}
              type="button"
              disabled={isAnswered}
              onClick={() => {
                if (!isAnswered) {
                  onAnswer(option.value, option.label);
                }
              }}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm transition-all",
                isAnswered && "pointer-events-none",
                isSelected
                  ? "border-primary bg-primary/10 text-primary-soft"
                  : "border-[#ffffff15] bg-[#ffffff08] text-white/70 hover:bg-[#ffffff12] hover:text-white",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
