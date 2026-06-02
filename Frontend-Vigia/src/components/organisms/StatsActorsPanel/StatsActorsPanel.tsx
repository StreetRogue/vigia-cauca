import type { Actor } from '../../../types/novedad.types';
import type { EstadisticaActorDTO } from '../../../types/estadisticas.types';
import styles from './StatsActorsPanel.module.css';

// ── Mapas de etiquetas y colores ──────────────────────────────────────────────
const ACTOR_LABEL: Record<Actor, string> = {
  ELN:                    'ELN',
  SEGUNDA_MARQUETALIA:    '2ª Marquetalia',
  FUERZA_PUBLICA:         'FF. Públicas',
  GRUPO_ARMADO_ORGANIZADO:'Grupo Armado',
  COMUNIDAD_CIVIL:        'Comunidad Civil',
  GUARDIA_INDIGENA:       'Guardia Indígena',
  NO_IDENTIFICADO:        'No identificado',
  OTRO:                   'Otro',
};

const ACTOR_COLOR: Record<Actor, string> = {
  ELN:                    'var(--metric-muertos)',
  SEGUNDA_MARQUETALIA:    'var(--dash-amber)',
  FUERZA_PUBLICA:         'var(--metric-desplazados)',
  GRUPO_ARMADO_ORGANIZADO:'var(--metric-heridos)',
  COMUNIDAD_CIVIL:        'var(--dash-green)',
  GUARDIA_INDIGENA:       'var(--color-primary-400)',
  NO_IDENTIFICADO:        'var(--dash-text-2)',
  OTRO:                   'var(--dash-text-3)',
};

function fmt(n: number) { return n.toLocaleString('es-CO'); }

interface StatsActorsPanelProps {
  actores?: EstadisticaActorDTO[];
  loading?: boolean;
}

export function StatsActorsPanel({ actores, loading }: StatsActorsPanelProps) {
  const data   = actores ?? [];
  const sorted = [...data].sort((a, b) => b.totalEventos - a.totalEventos);
  const max    = Math.max(...sorted.map((a) => a.totalEventos), 1);

  return (
    <div className={`${styles.panel} ${loading ? styles.loading : ''}`}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>ACTORES ARMADOS</span>
        <span className={styles.panelSub}>incidentes por actor</span>
      </div>

      <div className={styles.list}>
        {sorted.map((item) => {
          const color = ACTOR_COLOR[item.actor];
          const barW  = (item.totalEventos / max) * 100;

          return (
            <div key={item.actor} className={styles.item}>
              <div className={styles.itemTop}>
                <span className={styles.itemName} style={{ color }}>
                  {ACTOR_LABEL[item.actor] ?? item.actor}
                </span>
                <div className={styles.itemNums}>
                  <span className={styles.itemCount} style={{ color }}>
                    {fmt(item.totalEventos)}
                  </span>
                  <span className={styles.itemRel}>
                    {item.frecuenciaRelativa.toFixed(1)}%
                  </span>
                  <span className={styles.itemAcum} title="Freq. acumulada">
                    ∑{item.frecuenciaAcumulada.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${barW}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
