type Pt = { x: number; y: number };

function smoothPath(pts: Pt[]): string {
  if (pts.length === 0) return "";
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const mx = (a.x + b.x) / 2;
    d += ` C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`;
  }
  return d;
}

export function Sparkline({
  values,
  gid,
  width = 110,
  height = 40,
}: {
  values: number[];
  gid: string;
  width?: number;
  height?: number;
}) {
  if (values.length < 2 || values.every((v) => v === 0)) return null;
  const max = Math.max(...values, 1);
  const pad = 3;
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * width,
    y: pad + (1 - v / max) * (height - pad * 2),
  }));
  const line = smoothPath(pts);
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fa88a" stopOpacity="0.35" />
          <stop offset="1" stopColor="#5fa88a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke="#6fbf9a" strokeWidth="1.6" />
    </svg>
  );
}

function niceStep(max: number): number {
  const raw = Math.max(max, 4) / 4;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
  return Math.max(1, step);
}

export function PerformanceChart({
  values,
  labels,
  tooltipSuffix,
}: {
  values: number[];
  labels: string[];
  tooltipSuffix: string;
}) {
  const W = 640;
  const H = 250;
  const left = 46;
  const right = 14;
  const top = 18;
  const bottom = 34;
  const pw = W - left - right;
  const ph = H - top - bottom;

  const maxVal = Math.max(...values, 0);
  const step = niceStep(maxVal);
  const yMax = step * 4;

  const xs = (i: number) =>
    left + (values.length === 1 ? pw / 2 : (i / (values.length - 1)) * pw);
  const ys = (v: number) => top + (1 - v / yMax) * ph;

  const pts = values.map((v, i) => ({ x: xs(i), y: ys(v) }));
  const line = smoothPath(pts);
  const area = `${line} L${pts[pts.length - 1].x},${top + ph} L${pts[0].x},${top + ph} Z`;

  const peakIndex = values.reduce(
    (best, v, i) => (v > values[best] ? i : best),
    0
  );
  const peak = pts[peakIndex];
  const showTip = maxVal > 0;
  const tipW = 118;
  const tipX = Math.min(Math.max(peak.x - tipW / 2, left), W - right - tipW);
  const tipY = peak.y - 42 < 2 ? peak.y + 12 : peak.y - 42;

  const n = values.length;
  const labelIdx = Array.from(
    new Set([0, Math.floor(n / 4), Math.floor(n / 2), Math.floor((3 * n) / 4), n - 1])
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Gráfico de novos contatos no período"
    >
      <defs>
        <linearGradient id="perf-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fa88a" stopOpacity="0.3" />
          <stop offset="1" stopColor="#5fa88a" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 1, 2, 3, 4].map((k) => {
        const y = ys(k * step);
        return (
          <g key={k}>
            <line
              x1={left}
              x2={W - right}
              y1={y}
              y2={y}
              stroke="#1d3a2e"
              strokeOpacity="0.7"
            />
            <text
              x={left - 10}
              y={y + 4}
              textAnchor="end"
              fontSize="11"
              fill="#9d9b90"
            >
              {k * step}
            </text>
          </g>
        );
      })}

      <path d={area} fill="url(#perf-area)" />
      <path d={line} fill="none" stroke="#d3b97d" strokeWidth="2" />

      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3"
          fill="#d3b97d"
          stroke="#0b1913"
          strokeWidth="1.5"
        />
      ))}

      {showTip && (
        <g>
          <rect
            x={tipX}
            y={tipY}
            width={tipW}
            height="28"
            rx="6"
            fill="#0b1913"
            stroke="#c8a96a"
            strokeOpacity="0.5"
          />
          <text
            x={tipX + tipW / 2}
            y={tipY + 18}
            textAnchor="middle"
            fontSize="12"
            fill="#f1ecdd"
          >
            {values[peakIndex]} {tooltipSuffix}
          </text>
        </g>
      )}

      {labelIdx.map((i) => (
        <text
          key={i}
          x={xs(i)}
          y={H - 10}
          textAnchor="middle"
          fontSize="11"
          fill="#9d9b90"
        >
          {labels[i]}
        </text>
      ))}
    </svg>
  );
}

export function Donut({
  segments,
  centerValue,
  caption,
}: {
  segments: { value: number; color: string }[];
  centerValue: string;
  caption: string;
}) {
  const size = 136;
  const stroke = 15;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((acc, s) => acc + s.value, 0);
  let offset = 0;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-36 w-36"
      role="img"
      aria-label={caption}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#1a2b22"
        strokeWidth={stroke}
      />
      {total > 0 &&
        segments
          .filter((s) => s.value > 0)
          .map((s, i) => {
            const len = (s.value / total) * c;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            );
            offset += len;
            return el;
          })}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        fontSize="24"
        fill="#f1ecdd"
        fontFamily="var(--font-newsreader), Georgia, serif"
      >
        {centerValue}
      </text>
      <text
        x="50%"
        y="62%"
        textAnchor="middle"
        fontSize="9"
        fill="#9d9b90"
      >
        {caption}
      </text>
    </svg>
  );
}
