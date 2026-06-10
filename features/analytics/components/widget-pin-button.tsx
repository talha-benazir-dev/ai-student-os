"use client";

import { useTransition } from "react";
import { Pin, PinOff } from "lucide-react";
import { toast } from "sonner";
import { setDashboardWidgets } from "@/features/analytics/actions/analytics.actions";
import type { WidgetId } from "@/features/analytics/types/widgets";

export function WidgetPinButton({
  widgetId,
  isPinned,
  pinnedWidgets,
}: {
  widgetId: WidgetId;
  isPinned: boolean;
  pinnedWidgets: WidgetId[];
}) {
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      let next: WidgetId[];

      if (isPinned) {
        // Unpin — but must always have 2, so block if only 2 pinned
        if (pinnedWidgets.length <= 2) {
          toast.error("You need at least 2 pinned charts. Pin another first.");
          return;
        }
        next = pinnedWidgets.filter((w) => w !== widgetId);
      } else {
        if (pinnedWidgets.length >= 2) {
          // Replace the oldest pinned (first in array)
          next = [pinnedWidgets[1], widgetId];
        } else {
          next = [...pinnedWidgets, widgetId];
        }
      }

      const { error } = await setDashboardWidgets(next);
      if (error) toast.error(error);
      else toast.success(isPinned ? "Removed from dashboard" : "Pinned to dashboard");
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      className={`
        flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border transition shrink-0
        ${isPinned
          ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
          : "border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-border/80"
        }
      `}
    >
      {isPinned ? <Pin className="h-3 w-3" /> : <PinOff className="h-3 w-3" />}
      {isPinned ? "Pinned" : "Pin"}
    </button>
  );
}
