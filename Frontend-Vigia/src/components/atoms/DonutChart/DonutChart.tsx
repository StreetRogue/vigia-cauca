interface DonutSlice {
  pct: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  size?: number;
}

export function DonutChart({ data, size = 64 }: DonutChartProps) {
  const r = 22, cx = 32, cy = 32;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  const slices = data.map((d) => {
    const dash = (d.pct / 100) * circ;
    const slice = { ...d, dash, offset };
    offset += dash;
    return slice;
  });

  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="10"
      />
      {slices.map((s, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth="10"
          strokeDasharray={`${s.dash} ${circ - s.dash}`}
          strokeDashoffset={circ / 4 - s.offset}
        />
      ))}
    </svg>
  );
}
