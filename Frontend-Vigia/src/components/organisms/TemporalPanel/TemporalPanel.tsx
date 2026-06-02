import { CapLabel } from '../../atoms/CapLabel/CapLabel';
import styles from './TemporalPanel.module.css';
import type { SerieTemporalDTO } from '../../../types/estadisticas.types';


interface TemporalPanelProps {
  serie?:   SerieTemporalDTO[];
  loading?: boolean;
}

export function TemporalPanel({ serie, loading }: TemporalPanelProps) {
  const raw = serie ?? [];

  // Ordenar por año y luego por mes (soporta series multi-año)
  const sorted = [...raw].sort((a, b) =>
    a.anio !== b.anio ? a.anio - b.anio : a.mes - b.mes,
  );

  const MAX         = Math.max(...sorted.map((m) => m.totalEventos), 1);
  const nowMonth    = new Date().getMonth() + 1;
  const CURRENT_IDX = sorted.findIndex((m) => m.mes === nowMonth);

  return (
    <div className={`${styles.panel} ${loading ? styles.loading : ''}`}>
      <div className={styles.header}>
        <CapLabel color="var(--color-primary-400)">TENDENCIA MENSUAL · EVENTOS</CapLabel>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={styles.legendBar} style={{ background: 'var(--color-primary-500)' }} />
            <CapLabel size={8}>Eventos / mes</CapLabel>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendBar} style={{ background: 'var(--dash-accent)' }} />
            <CapLabel size={8}>Mes actual</CapLabel>
          </div>
        </div>
      </div>

      {/* Bar chart limpio — solo eventos por mes */}
      <div className={styles.chart}>
        <div className={styles.bars}>
          {sorted.map(({ anio, mes, nombreMes, totalEventos }, i) => {
            const isCurrent = CURRENT_IDX >= 0 ? i === CURRENT_IDX : i === sorted.length - 1;
            return (
              <div key={`${anio}-${mes}`} className={styles.barCol}>
                <div className={styles.barValue}>
                  {isCurrent && <span>{totalEventos}</span>}
                </div>
                <div
                  className={styles.bar}
                  style={{
                    height: `${(totalEventos / MAX) * 100}%`,
                    background: isCurrent ? 'var(--dash-accent)' : 'var(--color-primary-500)',
                    opacity: isCurrent ? 1 : 0.72,
                    border: isCurrent ? '1px solid var(--dash-accent)' : 'none',
                  }}
                />
                <CapLabel
                  size={8}
                  color={isCurrent ? 'var(--dash-accent)' : undefined}
                >
                  {nombreMes.slice(0, 3)}
                </CapLabel>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
