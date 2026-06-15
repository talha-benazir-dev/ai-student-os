import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  deltaTone?: "positive" | "neutral" | "warning";
  active?: boolean;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  delta,
  deltaTone = "positive",
  active,
}: StatCardProps) {
  const deltaColor =
    deltaTone === "positive"
      ? "text-success bg-success/10 border-success/25"
      : deltaTone === "warning"
        ? "text-orange-400 bg-orange-500/10 border-orange-500/25"
        : "text-muted-foreground bg-accent/50 border-border";

  return (
    <div
      className={cn(
        "relative group rounded-2xl border bg-card p-5 transition-all hover:border-primary/30",
        active ? "border-primary/40 shadow-sm" : "border-border"
      )}
    >
      {active && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-60 bg-[radial-gradient(80%_60%_at_50%_0%,var(--primary)_/_0.15,transparent_70%)]" />
      )}
      <div className="relative flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              "h-7 w-7 shrink-0 rounded-lg flex items-center justify-center",
              active
                ? "bg-primary/20 text-primary"
                : "bg-accent/50 text-muted-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground truncate">
            {label}
          </span>
        </div>
        {delta && (
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded border shrink-0",
              deltaColor
            )}
          >
            {delta}
          </span>
        )}
      </div>
      <div className="relative flex items-baseline gap-1 min-w-0">
        <span className="text-3xl font-semibold tracking-tight">{value}</span>
        {unit && (
          <span className="text-sm text-muted-foreground">{unit}</span>
        )}
      </div>
    </div>
  );
}
