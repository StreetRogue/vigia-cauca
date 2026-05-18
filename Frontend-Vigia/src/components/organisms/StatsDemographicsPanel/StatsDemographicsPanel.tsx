import type { EstadisticasVictimasDTO, DistribucionDTO } from '../../../types/estadisticas.types';
import styles from './StatsDemographicsPanel.module.css';

// ── Etiquetas ─────────────────────────────────────────────────────────────────
const GENDER_LABEL: Record<string, string> = {
  MASCULINO:       'Masculino',
  FEMENINO:        'Femenino',
  LGBTI_PLUS:      'LGBTI+',
  'LGBTI+':        'LGBTI+',
  NO_ESPECIFICADO: 'No especificado',
  'NO ESPECIFICADO': 'No especificado',
};
const GENDER_COLOR: Record<string, string> = {
  MASCULINO:       'var(--color-primary-500)',
  FEMENINO:        '#127850',
  LGBTI_PLUS:      '#bf5f00',
  'LGBTI+':        '#bf5f00',
  NO_ESPECIFICADO: 'var(--dash-text-2)',
  'NO ESPECIFICADO': 'var(--dash-text-2)',
};


// ── Donut SVG ─────────────────────────────────────────────────────────────────
interface DonutProps { segments: { pct: number; color: string }[] }

function Donut({ segments }: DonutProps) {
  const R = 40;
  const CX = 52;
  const CY = 52;
  const strokeW = 16;
  const circ = 2 * Math.PI * R;

  let cumPct = 0;
  const slices = segments.map((s) => {
    const dash   = (s.pct / 100) * circ;
    const gap    = circ - dash;
    const offset = circ * (1 - cumPct / 100);
    cumPct += s.pct;
    return { ...s, dash, gap, offset };
  });

  return (
    <svg viewBox="0 0 104 104" className={styles.donut}>
      {slices.map((sl, i) => (
        <circle
          key={`${sl.color}-${i}`}
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke={sl.color}
          strokeWidth={strokeW}
          strokeDasharray={`${sl.dash} ${sl.gap}`}
          strokeDashoffset={sl.offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '52px 52px' }}
        />
      ))}
    </svg>
  );
}

// ── Histograma edades ─────────────────────────────────────────────────────────
interface AgeHistoProps { edades: DistribucionDTO[] }

function AgeHisto({ edades }: AgeHistoProps) {
  const max = Math.max(...edades.map((e) => e.frecuenciaAbsoluta), 1);

  return (
    <div className={styles.histo}>
      {edades.map((e: any) => {
        const label = e.etiqueta ?? e.rangoEdad ?? '';
        const h = (e.frecuenciaAbsoluta / max) * 100;
        return (
          <div key={label} className={styles.histoBar}>
            <div className={styles.histoFill} style={{ height: `${h}%` }} />
            <span className={styles.histoLabel}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
interface StatsDemographicsPanelProps {
  victimas?: EstadisticasVictimasDTO;
  loading?: boolean;
}

export function StatsDemographicsPanel({ victimas, loading }: StatsDemographicsPanelProps) {
  // Datos reales del backend; objeto vacío cuando el filtro no arroja víctimas
  const d = victimas ?? {
    filtrosAplicados: {},
    totalVictimas: 0,
    porGenero: [],
    porRangoEdad: [],
    porGrupoPoblacional: [],
  };

  const genderSegments = d.porGenero.map((g: any) => {
    const rawEtiqueta = g.etiqueta ?? g.genero ?? '';
    const key = String(rawEtiqueta).toUpperCase().trim();
    return {
      pct:   g.frecuenciaRelativa,
      color: GENDER_COLOR[key] ?? 'var(--dash-text-2)',
      label: GENDER_LABEL[key] ?? rawEtiqueta,
      abs:   g.frecuenciaAbsoluta,
      rel:   g.frecuenciaRelativa,
    };
  });

  return (
    <div className={`${styles.panel} ${loading ? styles.loading : ''}`}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>VÍCTIMAS</span>
        <span className={styles.panelTotal}>
          {d.totalVictimas.toLocaleString('es-CO')} total
        </span>
      </div>

      {/* ── Género ── */}
      <div className={styles.section}>
        <span className={styles.sectionLabel}>Por género</span>
        <div className={styles.genderRow}>
          <Donut segments={genderSegments} />
          <div className={styles.genderLegend}>
            {genderSegments.map((s) => (
              <div key={s.label} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: s.color }} />
                <span className={styles.legendName}>{s.label}</span>
                <span className={styles.legendPct} style={{ color: s.color }}>
                  {s.rel.toFixed(1)}%
                </span>
                <span className={styles.legendAbs}>
                  {s.abs.toLocaleString('es-CO')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divisor */}
      <div className={styles.divider} />

      {/* ── Rango de edad ── */}
      <div className={styles.section}>
        <span className={styles.sectionLabel}>Por rango de edad</span>
        <AgeHisto edades={d.porRangoEdad} />
        <div className={styles.ageLegend}>
          {d.porRangoEdad.map((e: any) => {
            const label = e.etiqueta ?? e.rangoEdad ?? '';
            return (
            <span key={label} className={styles.agePill}>
              {label}
              <strong style={{ color: 'var(--metric-eventos)' }}>
                {' '}{e.frecuenciaRelativa.toFixed(1)}%
              </strong>
            </span>
          )})}
        </div>
      </div>
    </div>
  );
}
