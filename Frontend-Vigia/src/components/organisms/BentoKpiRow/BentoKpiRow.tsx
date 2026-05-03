import type { ResumenKPIDTO } from '../../../types/estadisticas.types';
import styles from './BentoKpiRow.module.css';

// ── Mock para desarrollo sin backend ─────────────────────────────────────────
const MOCK: ResumenKPIDTO = {
  anio: 2025,
  municipio: 'Todos los municipios',
  totalEventos: 847,
  totalMuertos: 214,
  totalHeridos: 389,
  totalDesplazados: 2841,
  totalConfinados: 456,
  filtrosAplicados: {},
};

function fmt(n: number) {
  return n.toLocaleString('es-CO');
}

// ── Iconos SVG inline ─────────────────────────────────────────────────────────
function IconEventos() {
  return (
    <svg viewBox="0 0 20 20" width={18} height={18} fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconMuertos() {
  return (
    <svg viewBox="0 0 20 20" width={18} height={18} fill="none">
      <path d="M10 3C7.24 3 5 5.24 5 8c0 1.8.91 3.38 2.29 4.33L7 15h6l-.29-2.67A5 5 0 0 0 15 8c0-2.76-2.24-5-5-5Z"
        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 15v2M12 15v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconHeridos() {
  return (
    <svg viewBox="0 0 20 20" width={18} height={18} fill="none">
      <rect x="8.5" y="3" width="3" height="14" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="3" y="8.5" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function IconDesplazados() {
  return (
    <svg viewBox="0 0 20 20" width={18} height={18} fill="none">
      <circle cx="8" cy="5" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 17v-4l-2-3h10l-2 3v4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M13 9l4-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconConfinados() {
  return (
    <svg viewBox="0 0 20 20" width={18} height={18} fill="none">
      <rect x="4" y="9" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// ── KPI card individual ───────────────────────────────────────────────────────
interface CardProps {
  label: string;
  value: number;
  sublabel: string;
  color: string;
  colorSoft: string;
  icon: React.ReactNode;
  wide?: boolean;
}

function KpiCard({ label, value, sublabel, color, colorSoft, icon, wide }: CardProps) {
  return (
    <div
      className={`${styles.card} ${wide ? styles.wide : ''}`}
      style={{ '--card-color': color, '--card-soft': colorSoft } as React.CSSProperties}
    >
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>{label}</span>
        <span className={styles.cardIcon}>{icon}</span>
      </div>
      <div className={styles.cardValue}>{fmt(value)}</div>
      <div className={styles.cardSub}>{sublabel}</div>
      <div className={styles.cardAccent} />
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
interface BentoKpiRowProps {
  resumen?: ResumenKPIDTO;
  loading?: boolean;
}

export function BentoKpiRow({ resumen, loading }: BentoKpiRowProps) {
  const d = resumen ?? MOCK;

  return (
    <div className={`${styles.row} ${loading ? styles.loading : ''}`}>
      <KpiCard
        label="TOTAL EVENTOS"
        value={d.totalEventos}
        sublabel="incidentes registrados"
        color="var(--metric-eventos)"
        colorSoft="var(--metric-eventos-soft)"
        icon={<IconEventos />}
        wide
      />
      <KpiCard
        label="MUERTOS"
        value={d.totalMuertos}
        sublabel="víctimas fatales"
        color="var(--metric-muertos)"
        colorSoft="var(--metric-muertos-soft)"
        icon={<IconMuertos />}
      />
      <KpiCard
        label="HERIDOS"
        value={d.totalHeridos}
        sublabel="víctimas no fatales"
        color="var(--metric-heridos)"
        colorSoft="var(--metric-heridos-soft)"
        icon={<IconHeridos />}
      />
      <KpiCard
        label="DESPLAZADOS"
        value={d.totalDesplazados}
        sublabel="personas desplazadas"
        color="var(--metric-desplazados)"
        colorSoft="var(--metric-desplazados-soft)"
        icon={<IconDesplazados />}
      />
      <KpiCard
        label="CONFINADOS"
        value={d.totalConfinados}
        sublabel="personas confinadas"
        color="var(--metric-confinados)"
        colorSoft="var(--metric-confinados-soft)"
        icon={<IconConfinados />}
      />
    </div>
  );
}
