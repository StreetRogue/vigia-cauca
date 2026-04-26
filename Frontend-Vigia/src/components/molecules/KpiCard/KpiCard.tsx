import { CapLabel } from '../../atoms/CapLabel/CapLabel';
import { SparkLine } from '../../atoms/SparkLine/SparkLine';
import styles from './KpiCard.module.css';

interface KpiCardProps {
  label: string;
  value: string;
  subtitle: string;
  color: string;
  wide?: boolean;
  showSpark?: boolean;
  sparkPoints?: string;
}

export function KpiCard({
  label,
  value,
  subtitle,
  color,
  wide = false,
  showSpark = false,
  sparkPoints,
}: KpiCardProps) {
  return (
    <div className={`${styles.card} ${wide ? styles.wide : ''}`}>
      <CapLabel color="var(--dash-text-2)">{label}</CapLabel>
      <div className={styles.value} style={{ color, fontSize: wide ? 32 : 26 }}>
        {value}
      </div>
      {showSpark && <SparkLine color={color} points={sparkPoints} />}
      <div className={styles.subtitle}>{subtitle}</div>
    </div>
  );
}
