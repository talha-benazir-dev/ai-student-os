"use client";

import { useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getSessionHistory } from "@/features/analytics/actions/analytics.actions";
import type { SessionHistoryRow } from "@/features/analytics/types/index";
import type { AnalyticsPeriod } from "@/features/analytics/types/period";
import { formatStudyHours } from "@/features/study-sessions/utils/format-study-hours";

const PAGE_SIZE = 10;

interface SessionHistoryTableProps {
  period: AnalyticsPeriod;
  initialRows: SessionHistoryRow[];
  initialHasMore: boolean;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SessionHistoryTable({
  period,
  initialRows,
  initialHasMore,
}: SessionHistoryTableProps) {
  const [rows, setRows] = useState(initialRows);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [pending, startTransition] = useTransition();

  function goToPage(nextPage: number) {
    if (nextPage < 0) return;

    startTransition(async () => {
      const result = await getSessionHistory(
        period,
        PAGE_SIZE,
        nextPage * PAGE_SIZE,
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.data) {
        setRows(result.data.rows);
        setHasMore(result.data.hasMore);
        setPage(nextPage);
      }
    });
  }

  if (rows.length === 0 && page === 0) {
    return (
      <div className="py-10 text-center">
        <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-xs text-muted-foreground">
          No study sessions in this period.
        </p>
      </div>
    );
  }

  const canGoNewer = page > 0;
  const canGoOlder = hasMore;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-3 pr-4 text-xs font-medium text-muted-foreground">
                Date
              </th>
              <th className="pb-3 pr-4 text-xs font-medium text-muted-foreground">
                Cluster
              </th>
              <th className="pb-3 pr-4 text-xs font-medium text-muted-foreground">
                Duration
              </th>
              <th className="pb-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">
                Ended
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/40 last:border-0 hover:bg-accent/20 transition-colors"
              >
                <td className="py-2.5 pr-4 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                  {formatDateTime(row.started_at)}
                </td>
                <td className="py-2.5 pr-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: row.cluster_color }}
                    />
                    <span className="text-xs truncate max-w-[140px]">
                      {row.cluster_name}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 pr-4 text-xs text-foreground font-medium tabular-nums whitespace-nowrap">
                  {formatStudyHours(row.duration_minutes)}
                </td>
                <td className="py-2.5 text-xs text-muted-foreground tabular-nums whitespace-nowrap hidden sm:table-cell">
                  {row.ended_at ? formatDateTime(row.ended_at) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(canGoNewer || canGoOlder) && (
        <div className="flex items-center justify-center gap-3 pb-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={!canGoNewer || pending}
            onClick={() => goToPage(page - 1)}
            aria-label="Newer sessions"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-[11px] text-muted-foreground tabular-nums min-w-[72px] text-center">
            {pending ? "Loading..." : `${page * PAGE_SIZE + 1}–${page * PAGE_SIZE + rows.length}`}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={!canGoOlder || pending}
            onClick={() => goToPage(page + 1)}
            aria-label="Older sessions"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
