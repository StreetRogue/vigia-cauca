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

// ── Mock ──────────────────────────────────────────────────────────────────────
const MOCK: EstadisticaActorDTO[] = [
  { actor: 'ELN',                    totalEventos: 312, frecuenciaRelativa: 36.8, frecuenciaAcumulada: 36.8 },
  { actor: 'SEGUNDA_MARQUETALIA',    totalEventos: 198, frecuenciaRelativa: 23.4, frecuenciaAcumulada: 60.2 },
  { actor: 'FUERZA_PUBLICA',         totalEventos: 142, frecuenciaRelativa: 16.8, frecuenciaAcumulada: 77.0 },
  { actor: 'GRUPO_ARMADO_ORGANIZADO',totalEventos:  87, frecuenciaRelativa: 10.3, frecuenciaAcumulada: 87.3 },
  { actor: 'NO_IDENTIFICADO',        totalEventos:  61, frecuenciaRelativa:  7.2, frecuenciaAcumulada: 94.5 },
  { actor: 'COMUNIDAD_CIVIL',        totalEventos:  27, frecuenciaRelativa:  3.2, frecuenciaAcumulada: 97.7 },
  { actor: 'GUARDIA_INDIGENA',       totalEventos:  14, frecuenciaRelativa:  1.7, frecuenciaAcumulada: 99.4 },
  { actor: 'OTRO',                   totalEventos:   5, frecuenciaRelativa:  0.6, frecuenciaAcumulada: 100.0},
];

function fmt(n: number) { return n.toLocaleString('es-CO'); }

interface StatsActorsPanelProps {
  actores?: EstadisticaActorDTO[];
  loading?: boolean;
}

export function StatsActorsPanel({ actores, loading }: StatsActorsPanelProps) {
  const data   = actores?.length ? actores : MOCK;
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
