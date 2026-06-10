"use client";

// ── Helpers ──────────────────────────────────────────────────────────────────

function shortDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
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
    d.setDate(d.getDate() - (COLS * ROWS - 1 - i));
    const dateStr = d.toISOString().split("T")[0];
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

export function ClusterBreakdownChart({ data }: { data: { name: string; minutes: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.minutes, 0) || 1;
  const w = 200, cx = 80, cy = 80, r = 60, inner = 36;

  // Build donut segments
  let angle = -Math.PI / 2;
  const segments = data.slice(0, 6).map((d) => {
    const sweep = (d.minutes / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(angle + sweep);
    const y2 = cy + r * Math.sin(angle + sweep);
    const xi1 = cx + inner * Math.cos(angle);
    const yi1 = cy + inner * Math.sin(angle);
    const xi2 = cx + inner * Math.cos(angle + sweep);
    const yi2 = cy + inner * Math.sin(angle + sweep);
    const large = sweep > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${inner} ${inner} 0 ${large} 0 ${xi1} ${yi1} Z`;
    angle += sweep;
    return { path, color: d.color, name: d.name, minutes: d.minutes };
  });

  const totalHours = (total / 60).toFixed(1);

  return (
    <div className="flex items-center gap-4">
      <svg viewBox={`0 0 ${w} 160`} className="w-[160px] shrink-0">
        {data.length === 0 ? (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={r - inner} />
        ) : (
          segments.map((s, i) => (
            <path key={i} d={s.path} fill={s.color} fillOpacity="0.85" />
          ))
        )}
        <text x={cx} y={cy - 4} fontSize="14" fontWeight="600"
          fill="var(--foreground)" textAnchor="middle">{totalHours}h</text>
        <text x={cx} y={cy + 12} fontSize="8"
          fill="var(--muted-foreground)" textAnchor="middle">total</text>
      </svg>
      <div className="flex flex-col gap-1.5 min-w-0">
        {data.length === 0 ? (
          <p className="text-xs text-muted-foreground">No cluster sessions yet.</p>
        ) : (
          data.slice(0, 6).map((d) => (
            <div key={d.name} className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
              <span className="text-xs truncate text-muted-foreground">{d.name}</span>
              <span className="text-xs text-foreground ml-auto pl-2 shrink-0">
                {(d.minutes / 60).toFixed(1)}h
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
