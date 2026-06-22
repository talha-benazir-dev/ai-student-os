"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AnalyticsPeriod } from "@/features/analytics/types/period";
import { PERIOD_LABELS } from "@/features/analytics/types/period";

const PERIODS: AnalyticsPeriod[] = ["today", "week", "month", "all"];

export function PeriodToggle({ period }: { period: AnalyticsPeriod }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSelect(next: AnalyticsPeriod) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "week") {
      params.delete("period");
    } else {
      params.set("period", next);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {PERIODS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => handleSelect(p)}
          className={cn(
            "text-xs px-3 py-1.5 rounded-lg border transition",
            period === p
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:text-foreground hover:border-border/80",
          )}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  );
}
