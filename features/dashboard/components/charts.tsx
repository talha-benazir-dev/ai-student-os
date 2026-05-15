// Pure SVG charts — no runtime deps, render perfectly in SSR
const days = ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"];
const lineData = [1.2, 1.8, 1.6, 2.4, 3.1, 2.6, 3.4];
const barDeep = [2.1, 1.4, 0.9, 2.6, 3.2, 3.8, 3.4];
const barLight = [0.8, 0.6, 0.4, 1.0, 1.2, 1.5, 1.4];

export function StudyChart() {
  const w = 420;
  const h = 160; // Fixed typo from 16 to 160
  const pad = 24;
  const max = Math.max(...lineData) * 1.1;
  const points = lineData.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (lineData.length - 1);
    const y = h - pad - (v / max) * (h - pad * 2);
    return [x, y] as const;
  });

  // Smooth curve
  const path = points.reduce((acc, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = points[i - 1];
    const cx = (px + x) / 2;
    return `${acc} C ${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
  }, "");

  const area = `${path} L ${points[points.length - 1][0]} ${h - pad} L ${points[0][0]} ${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[180px]">
      <defs>
        <linearGradient id="studyGrad" x1="0" x2="0" y1="0" y2="1">
          <stop
            offset="0%"
            stopColor="var(--primary)"
            stopOpacity="0.3"
          />
          <stop
            offset="100%"
            stopColor="var(--primary)"
            stopOpacity="0"
          />
        </linearGradient>
        <filter id="glowLine">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      {[0.25, 0.5, 0.75].map((p) => (
        <line
          key={p}
          x1={pad}
          x2={w - pad}
          y1={pad + p * (h - pad * 2)}
          y2={pad + p * (h - pad * 2)}
          stroke="var(--border)"
          strokeOpacity="0.4"
        />
      ))}
      <path d={area} fill="url(#studyGrad)" />
      <path
        d={path}
        stroke="var(--primary)"
        strokeWidth="2"
        fill="none"
        filter="url(#glowLine)"
        opacity="0.4"
      />
      <path
        d={path}
        stroke="var(--primary)"
        strokeWidth="1.75"
        fill="none"
        strokeLinecap="round"
      />
      {points.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === points.length - 1 ? 3.5 : 0}
          fill="var(--primary)"
        />
      ))}
      {days.map((d, i) => (
        <text
          key={d}
          x={pad + (i * (w - pad * 2)) / (days.length - 1)}
          y={h - 6}
          fontSize="10"
          fill="var(--muted-foreground)"
          textAnchor="middle"
        >
          {d}
        </text>
      ))}
    </svg>
  );
}

export function FocusBars() {
  const w = 360,
    h = 160,
    pad = 24;
  const max = Math.max(...barDeep) * 1.1;
  const bw = (w - pad * 2) / barDeep.length;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[180px]">
      <defs>
        <linearGradient id="barGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((p) => (
        <line
          key={p}
          x1={pad}
          x2={w - pad}
          y1={pad + p * (h - pad * 2)}
          y2={pad + p * (h - pad * 2)}
          stroke="var(--border)"
          strokeOpacity="0.4"
        />
      ))}
      {barDeep.map((v, i) => {
        const x = pad + i * bw + bw * 0.2;
        const barW = bw * 0.6;
        const lh = (barLight[i] / max) * (h - pad * 2);
        const dh = (v / max) * (h - pad * 2);
        return (
          <g key={i}>
            <rect
              x={x}
              y={h - pad - lh}
              width={barW}
              height={lh}
              rx="3"
              fill="var(--muted)"
              fillOpacity="0.4"
            />
            <rect
              x={x + barW * 0.15}
              y={h - pad - dh}
              width={barW * 0.7}
              height={dh}
              rx="3"
              fill="url(#barGrad)"
            />
          </g>
        );
      })}
      {["T", "W", "T", "F", "S", "S", "M"].map((d, i) => (
        <text
          key={i}
          x={pad + i * bw + bw / 2}
          y={h - 6}
          fontSize="10"
          fill="var(--muted-foreground)"
          textAnchor="middle"
        >
          {d}
        </text>
      ))}
    </svg>
  );
}
