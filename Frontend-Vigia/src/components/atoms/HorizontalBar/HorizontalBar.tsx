interface HorizontalBarProps {
  pct: number;
  color?: string;
  height?: number;
}

export function HorizontalBar({
  pct,
  color = 'var(--color-primary-500)',
  height = 5,
}: HorizontalBarProps) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.06)',
        borderRadius: 2,
        height,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${Math.min(pct, 100)}%`,
          background: color,
          borderRadius: 2,
        }}
      />
    </div>
  );
}
