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
}: StatCardProps) {
  const deltaColor =
    deltaTone === "positive"
      ? "text-success"
      : deltaTone === "warning"
        ? "text-orange-400"
        : "text-muted-foreground";

  return (
    <div className="px-5 py-4 min-w-0 bg-card">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-[13px] text-muted-foreground truncate">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-[13px] text-muted-foreground">{unit}</span>
        )}
        {delta && (
          <span className={cn("ml-auto text-xs tabular-nums", deltaColor)}>
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}
