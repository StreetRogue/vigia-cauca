interface SparkLineProps {
  color?: string;
  points?: string;
}

export function SparkLine({
  color = 'var(--dash-accent)',
  points = '0,20 10,16 20,18 30,10 40,14 50,6 60,10 70,4 80,8',
}: SparkLineProps) {
  return (
    <svg
      viewBox="0 0 80 24"
      style={{ width: '100%', height: 24 }}
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
