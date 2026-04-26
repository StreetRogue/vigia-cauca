import { KpiCard } from '../../molecules/KpiCard/KpiCard';
import styles from './KpiStrip.module.css';
import type { ResumenKPIDTO } from '../../../types/estadisticas.types';

// ── Mock para cuando aún no llegan datos del back ─────────────────────────────
const MOCK: ResumenKPIDTO = {
  totalEventos:    1247,
  totalMuertos:    342,
  totalHeridos:    891,
  totalDesplazados: 12450,
  totalConfinados: 3210,
  filtrosAplicados: {},
};

function fmt(n: number): string {
  return n.toLocaleString('es-CO');
}

interface KpiStripProps {
  resumen?: ResumenKPIDTO;
  loading?: boolean;
}

export function KpiStrip({ resumen, loading }: KpiStripProps) {
  const d = resumen ?? MOCK;

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
