"use client";

import Link from "next/link";
import { useState } from "react";
import { localDateKey } from "@/features/analytics/lib/date-utils";
import { cn } from "@/lib/utils";

// ── Helpers ──────────────────────────────────────────────────────────────────

function shortDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en", { month: "short", day: "numeric" });
}

// ── Daily Study Time ──────────────────────────────────────────────────────────

export function DailyStudyTimeChart({ data }: { data: { date: string; minutes: number }[] }) {
  const w = 500, h = 160, pad = 28;
  const slice = data.slice(-30);
  const max = Math.max(...slice.map((d) => d.minutes), 1);
  const bw = (w - pad * 2) / slice.length;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[180px]">
      <defs>
        <linearGradient id="dstGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((p) => (
        <line key={p} x1={pad} x2={w - pad}
          y1={pad + p * (h - pad * 2)} y2={pad + p * (h - pad * 2)}
          stroke="var(--border)" strokeOpacity="0.4" />
      ))}
      {slice.map((d, i) => {
        const barH = (d.minutes / max) * (h - pad * 2);
        const x = pad + i * bw + bw * 0.2;
        return (
          <rect key={d.date} x={x} y={h - pad - barH}
            width={bw * 0.6} height={Math.max(barH, 1)}
            rx="3" fill="url(#dstGrad)" />
        );
      })}
      {[0, Math.floor(slice.length / 2), slice.length - 1].map((i) => (
        slice[i] && (
          <text key={i} x={pad + i * bw + bw / 2} y={h - 6}
            fontSize="9" fill="var(--muted-foreground)" textAnchor="middle">
            {shortDate(slice[i].date)}
          </text>
        )
      ))}
    </svg>
  );
}

// ── Task Completion ───────────────────────────────────────────────────────────

export function TaskCompletionChart({ data }: { data: { date: string; completed: number }[] }) {
  const w = 500, h = 160, pad = 28;
  const slice = data.slice(-30);
  const max = Math.max(...slice.map((d) => d.completed), 1);
  const points = slice.map((d, i) => {
    const x = pad + (i * (w - pad * 2)) / (slice.length - 1 || 1);
    const y = h - pad - (d.completed / max) * (h - pad * 2);
    return [x, y] as const;
  });

  const path = points.reduce((acc, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = points[i - 1];
    const cx = (px + x) / 2;
    return `${acc} C ${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
  }, "");

  const area = points.length > 1
    ? `${path} L ${points[points.length - 1][0]} ${h - pad} L ${points[0][0]} ${h - pad} Z`
    : "";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[180px]">
      <defs>
        <linearGradient id="tcGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((p) => (
        <line key={p} x1={pad} x2={w - pad}
          y1={pad + p * (h - pad * 2)} y2={pad + p * (h - pad * 2)}
          stroke="var(--border)" strokeOpacity="0.4" />
      ))}
      {area && <path d={area} fill="url(#tcGrad)" />}
      {points.length > 1 && (
        <path d={path} stroke="var(--primary)" strokeWidth="1.75"
          fill="none" strokeLinecap="round" />
      )}
      {[0, Math.floor(slice.length / 2), slice.length - 1].map((i) => (
        slice[i] && (
          <text key={i} x={pad + (i * (w - pad * 2)) / (slice.length - 1 || 1)} y={h - 6}
            fontSize="9" fill="var(--muted-foreground)" textAnchor="middle">
            {shortDate(slice[i].date)}
          </text>
        )
      ))}
    </svg>
  );
}

// ── Activity Heatmap ──────────────────────────────────────────────────────────

export function ActivityHeatmap({ data }: { data: { date: string; minutes: number }[] }) {
  const COLS = 13; // weeks
  const ROWS = 7;  // days
  const cell = 14, gap = 3;
  const w = COLS * (cell + gap) + 40;
  const h = ROWS * (cell + gap) + 20;
  const max = Math.max(...data.map((d) => d.minutes), 1);

  const dateMap = Object.fromEntries(data.map((d) => [d.date, d.minutes]));

  const cells: { col: number; row: number; date: string; minutes: number }[] = [];
  for (let i = 0; i < COLS * ROWS; i++) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (COLS * ROWS - 1 - i));
    const dateStr = localDateKey(d);
    cells.push({ col: Math.floor(i / ROWS), row: i % ROWS, date: dateStr, minutes: dateMap[dateStr] ?? 0 });
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 140 }}>
      {["S", "M", "T", "W", "T", "F", "S"].map((label, i) => (
        <text key={i} x={0} y={(i + 1) * (cell + gap) - gap}
          fontSize="8" fill="var(--muted-foreground)">
          {i % 2 === 1 ? label : ""}
        </text>
      ))}
      {cells.map(({ col, row, date, minutes }) => {
        const intensity = minutes > 0 ? 0.15 + (minutes / max) * 0.85 : 0;
        const x = 20 + col * (cell + gap);
        const y = row * (cell + gap);
        return (
          <rect key={date} x={x} y={y} width={cell} height={cell} rx="2"
            fill={minutes > 0 ? "var(--primary)" : "var(--border)"}
            fillOpacity={minutes > 0 ? intensity : 0.3} />
        );
      })}
    </svg>
  );
}

// ── Cluster Breakdown ─────────────────────────────────────────────────────────

const MINI_LEGEND_COUNT = 3;

type ClusterBreakdownItem = { name: string; minutes: number; color: string };

function sortClustersByTime(data: ClusterBreakdownItem[]) {
  return [...data].sort((a, b) => b.minutes - a.minutes);
}

function formatHours(minutes: number) {
  return `${(minutes / 60).toFixed(1)}h`;
}

function formatPercent(minutes: number, total: number) {
  if (total <= 0) return "0%";
  return `${Math.round((minutes / total) * 100)}%`;
}

function truncateLabel(name: string, maxLength = 12) {
  const trimmed = name.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1)}…`;
}

function describeDonutSegment(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const sweep = endAngle - startAngle;
  if (sweep <= 0) return "";

  const large = sweep > Math.PI ? 1 : 0;
  const x1 = cx + outerR * Math.cos(startAngle);
  const y1 = cy + outerR * Math.sin(startAngle);
  const x2 = cx + outerR * Math.cos(endAngle);
  const y2 = cy + outerR * Math.sin(endAngle);
  const xi1 = cx + innerR * Math.cos(startAngle);
  const yi1 = cy + innerR * Math.sin(startAngle);
  const xi2 = cx + innerR * Math.cos(endAngle);
  const yi2 = cy + innerR * Math.sin(endAngle);

  return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${innerR} ${innerR} 0 ${large} 0 ${xi1} ${yi1} Z`;
}

function buildDonutSegments(items: ClusterBreakdownItem[]) {
  const total = items.reduce((sum, item) => sum + item.minutes, 0) || 1;
  const cx = 90;
  const cy = 90;
  const r = 64;
  const inner = 38;
  const fullCircle = 2 * Math.PI;

  let angle = -Math.PI / 2;
  return items
    .map((item, index) => {
      const isLast = index === items.length - 1;
      const sweep = isLast
        ? fullCircle - (angle + Math.PI / 2)
        : (item.minutes / total) * fullCircle;
      const startAngle = angle;
      const endAngle = angle + sweep;
      angle = endAngle;

      return {
        path: describeDonutSegment(cx, cy, r, inner, startAngle, endAngle),
        color: item.color,
        name: item.name,
        minutes: item.minutes,
      };
    })
    .filter((segment) => segment.path);
}

export function ClusterBreakdownDonut({ data }: { data: ClusterBreakdownItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const items = sortClustersByTime(data);
  const totalMinutes = items.reduce((sum, item) => sum + item.minutes, 0);
  const segments = buildDonutSegments(items);
  const topItems = items.slice(0, MINI_LEGEND_COUNT);
  const remainingCount = Math.max(0, items.length - MINI_LEGEND_COUNT);
  const cx = 90;
  const cy = 90;
  const r = 64;
  const inner = 38;
  const active = activeIndex !== null ? segments[activeIndex] : null;

  const handleSegmentClick = (index: number) => {
    setActiveIndex((current) => (current === index ? null : index));
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-4 min-h-[180px]">
        <svg viewBox="0 0 180 180" className="w-[140px]">
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth={r - inner}
          />
        </svg>
        <p className="text-xs text-muted-foreground mt-2">No cluster sessions yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 py-1 min-h-[180px] justify-center">
      <div
        className="flex items-center gap-3 sm:gap-4"
        onMouseLeave={() => setActiveIndex(null)}
      >
        <svg viewBox="0 0 180 180" className="w-[130px] sm:w-[150px] shrink-0">
          {segments.map((segment, index) => {
            const isActive = activeIndex === index;
            const isDimmed = activeIndex !== null && !isActive;
            const tooltip = `${segment.name} — ${formatHours(segment.minutes)} (${formatPercent(segment.minutes, totalMinutes)})`;

            return (
              <path
                key={`${segment.name}-${index}`}
                d={segment.path}
                fill={segment.color}
                fillOpacity={isDimmed ? 0.35 : 0.85}
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => handleSegmentClick(index)}
              >
                <title>{tooltip}</title>
              </path>
            );
          })}
          <g className="pointer-events-none">
            {active ? (
              <>
                <text
                  x={cx}
                  y={cy - 6}
                  fontSize="11"
                  fontWeight="600"
                  fill="var(--foreground)"
                  textAnchor="middle"
                >
                  {truncateLabel(active.name)}
                </text>
                <text
                  x={cx}
                  y={cy + 10}
                  fontSize="10"
                  fill="var(--muted-foreground)"
                  textAnchor="middle"
                >
                  {formatHours(active.minutes)} · {formatPercent(active.minutes, totalMinutes)}
                </text>
              </>
            ) : (
              <>
                <text
                  x={cx}
                  y={cy - 4}
                  fontSize="14"
                  fontWeight="600"
                  fill="var(--foreground)"
                  textAnchor="middle"
                >
                  {formatHours(totalMinutes)}
                </text>
                <text
                  x={cx}
                  y={cy + 12}
                  fontSize="8"
                  fill="var(--muted-foreground)"
                  textAnchor="middle"
                >
                  total
                </text>
              </>
            )}
          </g>
        </svg>

        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          {topItems.map((item, index) => {
            const isActive = activeIndex === index;
            const isDimmed = activeIndex !== null && !isActive;

            return (
              <button
                key={item.name}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => handleSegmentClick(index)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors w-full",
                  isActive ? "bg-accent/50" : "hover:bg-accent/30",
                  isDimmed && "opacity-50",
                )}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: item.color }}
                />
                <span className="text-xs truncate text-muted-foreground flex-1 min-w-0">
                  {item.name}
                </span>
                <span className="text-xs text-foreground shrink-0 tabular-nums">
                  {formatHours(item.minutes)}
                </span>
              </button>
            );
          })}
          {remainingCount > 0 ? (
            <Link
              href="/analytics"
              className="text-xs text-primary/70 hover:text-primary transition px-2 py-1"
            >
              +{remainingCount} more → Analytics
            </Link>
          ) : null}
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Hover or tap a slice for details
      </p>
    </div>
  );
}

export function ClusterBreakdownBars({ data }: { data: ClusterBreakdownItem[] }) {
  const items = sortClustersByTime(data);
  const totalMinutes = items.reduce((sum, item) => sum + item.minutes, 0);
  const maxMinutes = Math.max(...items.map((item) => item.minutes), 1);

  if (data.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-6 text-center">
        No cluster sessions yet.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        items.length > 8 && "max-h-[280px] overflow-y-auto pr-1",
      )}
    >
      {items.map((item) => {
        const widthPct = (item.minutes / maxMinutes) * 100;
        return (
          <div
            key={item.name}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-accent/30 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0 max-w-[140px]">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: item.color }}
              />
              <span className="text-xs truncate text-muted-foreground">{item.name}</span>
            </div>
            <div className="h-2 rounded-full bg-border/40 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: item.color,
                  opacity: 0.85,
                }}
              />
            </div>
            <span className="text-xs text-foreground shrink-0 tabular-nums">
              {formatHours(item.minutes)} ({formatPercent(item.minutes, totalMinutes)})
            </span>
          </div>
        );
      })}
    </div>
  );
}
