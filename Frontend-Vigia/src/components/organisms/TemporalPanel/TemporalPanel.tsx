import { CapLabel } from '../../atoms/CapLabel/CapLabel';
import styles from './TemporalPanel.module.css';
import type { SerieTemporalDTO } from '../../../types/estadisticas.types';

// ── Mock fallback ─────────────────────────────────────────────────────────────
const MOCK: SerieTemporalDTO[] = [
  { anio: 2025, mes: 1,  nombreMes: 'ENE', totalEventos: 45,  totalMuertos: 8,  totalHeridos: 12, totalDesplazados: 300, frecuenciaRelativa: 5.1,  frecuenciaAcumulada: 45  },
  { anio: 2025, mes: 2,  nombreMes: 'FEB', totalEventos: 62,  totalMuertos: 11, totalHeridos: 18, totalDesplazados: 400, frecuenciaRelativa: 7.0,  frecuenciaAcumulada: 107 },
  { anio: 2025, mes: 3,  nombreMes: 'MAR', totalEventos: 88,  totalMuertos: 15, totalHeridos: 24, totalDesplazados: 580, frecuenciaRelativa: 9.9,  frecuenciaAcumulada: 195 },
  { anio: 2025, mes: 4,  nombreMes: 'ABR', totalEventos: 71,  totalMuertos: 13, totalHeridos: 20, totalDesplazados: 460, frecuenciaRelativa: 8.0,  frecuenciaAcumulada: 266 },
  { anio: 2025, mes: 5,  nombreMes: 'MAY', totalEventos: 103, totalMuertos: 18, totalHeridos: 32, totalDesplazados: 720, frecuenciaRelativa: 11.6, frecuenciaAcumulada: 369 },
  { anio: 2025, mes: 6,  nombreMes: 'JUN', totalEventos: 95,  totalMuertos: 17, totalHeridos: 29, totalDesplazados: 640, frecuenciaRelativa: 10.7, frecuenciaAcumulada: 464 },
  { anio: 2025, mes: 7,  nombreMes: 'JUL', totalEventos: 78,  totalMuertos: 14, totalHeridos: 22, totalDesplazados: 510, frecuenciaRelativa: 8.8,  frecuenciaAcumulada: 542 },
  { anio: 2025, mes: 8,  nombreMes: 'AGO', totalEventos: 112, totalMuertos: 20, totalHeridos: 36, totalDesplazados: 800, frecuenciaRelativa: 12.6, frecuenciaAcumulada: 654 },
  { anio: 2025, mes: 9,  nombreMes: 'SEP', totalEventos: 67,  totalMuertos: 12, totalHeridos: 18, totalDesplazados: 440, frecuenciaRelativa: 7.5,  frecuenciaAcumulada: 721 },
  { anio: 2025, mes: 10, nombreMes: 'OCT', totalEventos: 89,  totalMuertos: 16, totalHeridos: 27, totalDesplazados: 600, frecuenciaRelativa: 10.0, frecuenciaAcumulada: 810 },
  { anio: 2025, mes: 11, nombreMes: 'NOV', totalEventos: 74,  totalMuertos: 13, totalHeridos: 21, totalDesplazados: 490, frecuenciaRelativa: 8.3,  frecuenciaAcumulada: 884 },
  { anio: 2025, mes: 12, nombreMes: 'DIC', totalEventos: 55,  totalMuertos: 10, totalHeridos: 15, totalDesplazados: 360, frecuenciaRelativa: 6.2,  frecuenciaAcumulada: 939 },
];

interface TemporalPanelProps {
  serie?:   SerieTemporalDTO[];
  loading?: boolean;
}

export function TemporalPanel({ serie, loading }: TemporalPanelProps) {
  const raw = serie?.length ? serie : MOCK;

  // Ordenar por mes
  const sorted = [...raw].sort((a, b) => a.mes - b.mes);

  const total     = sorted.reduce((s, m) => s + m.totalEventos, 0) || 1;
  const MAX       = Math.max(...sorted.map((m) => m.totalEventos), 1);
  const nowMonth  = new Date().getMonth() + 1;
  const CURRENT_IDX = sorted.findIndex((m) => m.mes === nowMonth);

  // Enriquecer con frecuencias calculadas localmente si el back no las trae
  const enriched = sorted.map((m) => ({
    month:       m.nombreMes,
    value:       m.totalEventos,
    freqRel:     m.frecuenciaRelativa > 0
                   ? m.frecuenciaRelativa.toFixed(1)
                   : ((m.totalEventos / total) * 100).toFixed(1),
    freqAcum:    m.frecuenciaAcumulada,
    freqAcumPct: m.frecuenciaAcumulada > 0
                   ? ((m.frecuenciaAcumulada / (sorted[sorted.length - 1].frecuenciaAcumulada || total)) * 100).toFixed(1)
                   : '0.0',
  }));

  const acumMax = Math.max(...enriched.map((e) => e.freqAcum), 1);

  return (
    <div className={`${styles.panel} ${loading ? styles.loading : ''}`}>
      <div className={styles.header}>
        <CapLabel color="var(--color-primary-400)">ANÁLISIS TEMPORAL · EVENTOS / MES</CapLabel>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={styles.legendBar} style={{ background: 'var(--color-primary-500)' }} />
            <CapLabel size={8}>Eventos / mes</CapLabel>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendLine} style={{ background: 'var(--dash-amber)' }} />
            <CapLabel size={8}>Frec. acumulada</CapLabel>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendBar} style={{ background: 'var(--dash-accent)' }} />
            <CapLabel size={8}>Mes actual</CapLabel>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className={styles.chart}>
        <div className={styles.bars}>
          {enriched.map(({ month, value }, i) => {
            const isCurrent = CURRENT_IDX >= 0 ? i === CURRENT_IDX : i === enriched.length - 1;
            return (
              <div key={month} className={styles.barCol}>
                <div
                  className={styles.bar}
                  style={{
                    height: `${(value / MAX) * 100}%`,
                    background: isCurrent ? 'var(--dash-accent)' : 'var(--color-primary-500)',
                    opacity: isCurrent ? 1 : 0.72,
                    border: isCurrent ? '1px solid var(--dash-accent)' : 'none',
                  }}
                />
                <CapLabel
                  size={8}
                  color={isCurrent ? 'var(--dash-accent)' : undefined}
                >
                  {month}
                </CapLabel>
              </div>
            );
          })}
        </div>

        {/* Cumulative line overlay */}
        <svg className={styles.lineOverlay} viewBox="0 0 1200 100" preserveAspectRatio="none">
          <polyline
            points={enriched.map(({ freqAcum }, i) =>
              `${i * 100 + 50},${100 - (freqAcum / acumMax) * 92}`
            ).join(' ')}
            fill="none"
            stroke="var(--dash-amber)"
            strokeWidth="2"
            strokeDasharray="5,3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {enriched.map(({ freqAcum }, i) => (
            <circle
              key={i}
              cx={i * 100 + 50}
              cy={100 - (freqAcum / acumMax) * 92}
              r="3"
              fill="var(--dash-amber)"
            />
          ))}
        </svg>
      </div>

      {/* Frequency summary row */}
      <div className={styles.freqRow}>
        <div className={styles.freqBlock}>
          <CapLabel color="var(--color-primary-400)">FRECUENCIA RELATIVA POR MES</CapLabel>
          <div className={styles.freqBars}>
            {enriched.map(({ month, freqRel }) => (
              <div key={month} className={styles.freqCol}>
                <div className={styles.freqRelBar}>
                  <div
                    className={styles.freqRelFill}
                    style={{ height: `${parseFloat(freqRel)}%` }}
                  />
                </div>
                <div className={styles.freqRelVal}>{freqRel}%</div>
                <CapLabel size={7}>{month}</CapLabel>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.freqDivider} />

        <div className={styles.freqBlock}>
          <CapLabel color="var(--color-primary-400)">FRECUENCIA ACUMULADA</CapLabel>
          <div className={styles.freqAcumList}>
            {enriched.filter((_, i) => i % 3 === 2).map(({ month, freqAcum, freqAcumPct }) => (
              <div key={month} className={styles.freqAcumRow}>
                <CapLabel size={8}>{month}</CapLabel>
                <div className={styles.freqAcumTrack}>
                  <div
                    className={styles.freqAcumFill}
                    style={{ width: `${freqAcumPct}%` }}
                  />
                </div>
                <div className={styles.freqAcumVal}>{freqAcum}</div>
                <div className={styles.freqAcumPct}>({freqAcumPct}%)</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
