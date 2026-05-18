import { KpiCard } from '../../molecules/KpiCard/KpiCard';
import styles from './KpiStrip.module.css';
import type { ResumenKPIDTO } from '../../../types/estadisticas.types';

function fmt(n: number): string {
  return n.toLocaleString('es-CO');
}

interface KpiStripProps {
  resumen?: ResumenKPIDTO;
  loading?: boolean;
}

export function KpiStrip({ resumen, loading }: KpiStripProps) {
  const d = resumen ?? { totalEventos: 0, totalMuertos: 0, totalHeridos: 0, totalDesplazados: 0, totalConfinados: 0, filtrosAplicados: {} };

  return (
    <div className={`${styles.strip} ${loading ? styles.loading : ''}`}>
      <KpiCard
        label="TOTAL EVENTOS"
        value={fmt(d.totalEventos)}
        subtitle="Incidentes registrados"
        color="var(--dash-accent)"
        wide
        showSpark
      />
      <KpiCard
        label="MUERTOS"
        value={fmt(d.totalMuertos)}
        subtitle="Total víctimas fatales"
        color="var(--dash-red)"
      />
      <KpiCard
        label="HERIDOS"
        value={fmt(d.totalHeridos)}
        subtitle="Total heridos"
        color="var(--dash-amber)"
      />
      <KpiCard
        label="DESPLAZADOS"
        value={fmt(d.totalDesplazados)}
        subtitle="Personas desplazadas"
        color="var(--color-primary-400)"
      />
      <KpiCard
        label="CONFINADOS"
        value={fmt(d.totalConfinados)}
        subtitle="Personas confinadas"
        color="var(--color-primary-400)"
      />
    </div>
  );
}
