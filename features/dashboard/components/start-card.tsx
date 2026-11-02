import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  sublabel?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  sublabel,
}: StatCardProps) {
  return (
    <div className="min-w-0 px-4 py-5 sm:px-5">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />
        <span className="truncate text-[11px]">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-medium tracking-tight tabular-nums">
          {value}
        </span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      {sublabel && (
        <p className="mt-1 text-[10px] text-muted-foreground">{sublabel}</p>
      )}
    </div>
  );
}
