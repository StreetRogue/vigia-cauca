import type { DistribucionDTO } from '../../../types/estadisticas.types';
import styles from './GrupoPoblacionalPanel.module.css';

// ── Etiquetas legibles ────────────────────────────────────────────────────────
const GRUPO_LABEL: Record<string, string> = {
  NINO:              'Niños',
  ADOLESCENTE:       'Adolescentes',
  ADULTO:            'Adultos',
  ADULTO_MAYOR:      'Adultos mayores',
  INDIGENA:          'Indígenas',
  AFRODESCENDIENTE:  'Afrodescendientes',
  CAMPESINO:         'Campesinos',
  DISCAPACIDAD:      'Discapacidad',
  OTRO:              'Otro',
};

// ── Colores rotativos por posición ────────────────────────────────────────────
const PALETTE = [
  'var(--metric-eventos)',
  'var(--metric-desplazados)',
  'var(--metric-confinados)',
  'var(--dash-green)',
  'var(--metric-heridos)',
  'var(--dash-amber)',
  'var(--metric-muertos)',
  'var(--color-primary-400)',
  'var(--dash-text-2)',
];

// ── Mock ──────────────────────────────────────────────────────────────────────
const MOCK: DistribucionDTO[] = [
  { etiqueta: 'ADULTO',         frecuenciaAbsoluta: 412, frecuenciaRelativa: 38.5, frecuenciaAcumulada: 38.5 },
  { etiqueta: 'ADOLESCENTE',    frecuenciaAbsoluta: 198, frecuenciaRelativa: 18.5, frecuenciaAcumulada: 57.0 },
  { etiqueta: 'NINO',           frecuenciaAbsoluta: 143, frecuenciaRelativa: 13.4, frecuenciaAcumulada: 70.4 },
  { etiqueta: 'INDIGENA',       frecuenciaAbsoluta: 121, frecuenciaRelativa: 11.3, frecuenciaAcumulada: 81.7 },
  { etiqueta: 'ADULTO_MAYOR',   frecuenciaAbsoluta:  87, frecuenciaRelativa:  8.1, frecuenciaAcumulada: 89.8 },
  { etiqueta: 'CAMPESINO',      frecuenciaAbsoluta:  54, frecuenciaRelativa:  5.0, frecuenciaAcumulada: 94.8 },
  { etiqueta: 'AFRODESCENDIENTE',frecuenciaAbsoluta: 31, frecuenciaRelativa:  2.9, frecuenciaAcumulada: 97.7 },
  { etiqueta: 'DISCAPACIDAD',   frecuenciaAbsoluta:  14, frecuenciaRelativa:  1.3, frecuenciaAcumulada: 99.0 },
  { etiqueta: 'OTRO',           frecuenciaAbsoluta:  11, frecuenciaRelativa:  1.0, frecuenciaAcumulada: 100  },
];

function fmt(n: number) { return n.toLocaleString('es-CO'); }

interface GrupoPoblacionalPanelProps {
  grupos?: DistribucionDTO[];
  loading?: boolean;
}

export function GrupoPoblacionalPanel({ grupos, loading }: GrupoPoblacionalPanelProps) {
  const data   = grupos?.length ? grupos : MOCK;
  const sorted = [...data].sort((a, b) => b.frecuenciaAbsoluta - a.frecuenciaAbsoluta);
  const max    = Math.max(...sorted.map((g) => g.frecuenciaAbsoluta), 1);

  return (
    <div className={`${styles.panel} ${loading ? styles.loading : ''}`}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>GRUPO POBLACIONAL</span>
        <span className={styles.panelSub}>distribución de víctimas por grupo</span>
      </div>

      <div className={styles.bars}>
        {sorted.map((g, idx) => {
          const color   = PALETTE[idx % PALETTE.length];
          const barW    = (g.frecuenciaAbsoluta / max) * 100;
          const acumPct = typeof g.frecuenciaAcumulada === 'number'
            ? g.frecuenciaAcumulada.toFixed(1)
            : '—';

          return (
            <div key={g.etiqueta} className={styles.barRow}>
              <span className={styles.barName}>
                {GRUPO_LABEL[g.etiqueta] ?? g.etiqueta}
              </span>

              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${barW}%`, background: color }}
                />
              </div>

              <span className={styles.barAbs} style={{ color }}>
                {fmt(g.frecuenciaAbsoluta)}
              </span>
              <span className={styles.barRel}>
                {g.frecuenciaRelativa.toFixed(1)}%
              </span>
              <span className={styles.barAcum} title="Frecuencia acumulada">
                ∑ {acumPct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
