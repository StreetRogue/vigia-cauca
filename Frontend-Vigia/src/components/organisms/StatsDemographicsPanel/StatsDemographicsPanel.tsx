import type { EstadisticasVictimasDTO, DistribucionDTO } from '../../../types/estadisticas.types';
import styles from './StatsDemographicsPanel.module.css';

// ── Etiquetas ─────────────────────────────────────────────────────────────────
const GENDER_LABEL: Record<string, string> = {
  MASCULINO:       'Masculino',
  FEMENINO:        'Femenino',
  LGBTI_PLUS:      'LGBTI+',
  NO_ESPECIFICADO: 'No especificado',
};
const GENDER_COLOR: Record<string, string> = {
  MASCULINO:       'var(--metric-desplazados)',
  FEMENINO:        'var(--metric-confinados)',
  LGBTI_PLUS:      'var(--dash-amber)',
  NO_ESPECIFICADO: 'var(--dash-text-2)',
};

// ── Mock ──────────────────────────────────────────────────────────────────────
const MOCK: EstadisticasVictimasDTO = {
  filtrosAplicados: {},
  totalVictimas: 1071,
  porGenero: [
    { etiqueta: 'MASCULINO',       frecuenciaAbsoluta: 712, frecuenciaRelativa: 66.5, frecuenciaAcumulada: 66.5 },
    { etiqueta: 'FEMENINO',        frecuenciaAbsoluta: 298, frecuenciaRelativa: 27.8, frecuenciaAcumulada: 94.3 },
    { etiqueta: 'LGBTI_PLUS',      frecuenciaAbsoluta:  38, frecuenciaRelativa:  3.5, frecuenciaAcumulada: 97.8 },
    { etiqueta: 'NO_ESPECIFICADO', frecuenciaAbsoluta:  23, frecuenciaRelativa:  2.2, frecuenciaAcumulada: 100  },
  ],
  porRangoEdad: [
    { etiqueta: '0-12',   frecuenciaAbsoluta: 143, frecuenciaRelativa: 13.4, frecuenciaAcumulada: 13.4 },
    { etiqueta: '13-17',  frecuenciaAbsoluta: 198, frecuenciaRelativa: 18.5, frecuenciaAcumulada: 31.9 },
    { etiqueta: '18-28',  frecuenciaAbsoluta: 287, frecuenciaRelativa: 26.8, frecuenciaAcumulada: 58.7 },
    { etiqueta: '29-45',  frecuenciaAbsoluta: 241, frecuenciaRelativa: 22.5, frecuenciaAcumulada: 81.2 },
    { etiqueta: '46-60',  frecuenciaAbsoluta: 132, frecuenciaRelativa: 12.3, frecuenciaAcumulada: 93.5 },
    { etiqueta: '60+',    frecuenciaAbsoluta:  70, frecuenciaRelativa:  6.5, frecuenciaAcumulada: 100  },
  ],
  porGrupoPoblacional: [],  // lo maneja GrupoPoblacionalPanel
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
          key={i}
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
      {edades.map((e) => {
        const h = (e.frecuenciaAbsoluta / max) * 100;
        return (
          <div key={e.etiqueta} className={styles.histoBar}>
            <div className={styles.histoFill} style={{ height: `${h}%` }} />
            <span className={styles.histoLabel}>{e.etiqueta}</span>
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
  const d = victimas ?? MOCK;

  const genderSegments = d.porGenero.map((g) => ({
    pct:   g.frecuenciaRelativa,
    color: GENDER_COLOR[g.etiqueta] ?? 'var(--dash-text-2)',
    label: GENDER_LABEL[g.etiqueta] ?? g.etiqueta,
    abs:   g.frecuenciaAbsoluta,
    rel:   g.frecuenciaRelativa,
  }));

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
          {d.porRangoEdad.map((e) => (
            <span key={e.etiqueta} className={styles.agePill}>
              {e.etiqueta}
              <strong style={{ color: 'var(--metric-eventos)' }}>
                {' '}{e.frecuenciaRelativa.toFixed(1)}%
              </strong>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
