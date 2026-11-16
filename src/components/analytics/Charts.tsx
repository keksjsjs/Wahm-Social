/** Dependency-free SVG charts (server-renderable). */

export function BarChart({ values, labels, height = 140, highlight }: { values: number[]; labels: string[]; height?: number; highlight?: number | null }) {
  const max = Math.max(1, ...values);
  const w = 100 / values.length;
  return (
    <div>
      <svg viewBox={`0 0 100 ${height / 2}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        {values.map((v, i) => {
          const h = (v / max) * (height / 2 - 4);
          return (
            <rect
              key={i}
              x={i * w + w * 0.15}
              y={height / 2 - h}
              width={w * 0.7}
              height={Math.max(h, 0.6)}
              rx={0.8}
              fill={i === highlight ? "#e9c76b" : "rgba(212,169,68,.35)"}
            >
              <title>{`${labels[i]}: ${v}`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-slate-500" dir="ltr">
        {labels.map((l, i) => (
          <span key={i} className="flex-1 text-center">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

export function LineChart({ points, height = 160 }: { points: { x: number; y: number }[]; height?: number }) {
  if (points.length < 2) return <div className="grid h-32 place-items-center text-sm text-slate-500">—</div>;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const [minX, maxX] = [Math.min(...xs), Math.max(...xs)];
  const maxY = Math.max(1, ...ys);
  const W = 300;
  const H = 100;
  const pt = (p: { x: number; y: number }) => `${((p.x - minX) / Math.max(1, maxX - minX)) * W},${H - (p.y / maxY) * (H - 8) - 4}`;
  const line = points.map(pt).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height, direction: "ltr" }}>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d4a944" stopOpacity=".35" />
          <stop offset="1" stopColor="#d4a944" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${line} ${W},${H}`} fill="url(#lg)" />
      <polyline points={line} fill="none" stroke="#e9c76b" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      {points.map((p, i) => {
        const [x, y] = pt(p).split(",");
        return <circle key={i} cx={x} cy={y} r="2.5" fill="#f3dc9b" />;
      })}
    </svg>
  );
}

export function Gauge({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(100, value));
  const r = 42;
  const c = Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 60" className="w-40">
        <path d="M8 54 A42 42 0 0 1 92 54" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="10" strokeLinecap="round" />
        <path d="M8 54 A42 42 0 0 1 92 54" fill="none" stroke="#d4a944" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(v / 100) * c} ${c}`} />
        <text x="50" y="50" textAnchor="middle" fontSize="18" fontWeight="800" fill="#fff">
          {v}
        </text>
      </svg>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
