import { CapLabel } from '../../atoms/CapLabel/CapLabel';
import { HorizontalBar } from '../../atoms/HorizontalBar/HorizontalBar';
import styles from './ActorsPanel.module.css';
import type { EstadisticaActorDTO } from '../../../types/estadisticas.types';
import type { Actor } from '../../../types/novedad.types';

// ── Mapeo actor → etiqueta y color ───────────────────────────────────────────
const ACTOR_LABEL: Record<Actor, string> = {
  ELN:                   'ELN',
  SEGUNDA_MARQUETALIA:   '2ª MARQUETALIA',
  FUERZA_PUBLICA:        'FF. PÚBLICAS',
  GRUPO_ARMADO_ORGANIZADO: 'GRUPO ARMADO',
  COMUNIDAD_CIVIL:       'COMUNIDAD CIVIL',
  GUARDIA_INDIGENA:      'GUARDIA INDÍGENA',
  NO_IDENTIFICADO:       'NO IDENTIFICADO',
  OTRO:                  'OTRO',
};

const ACTOR_COLOR: Record<Actor, string> = {
  ELN:                   'var(--dash-red)',
  SEGUNDA_MARQUETALIA:   'var(--dash-amber)',
  FUERZA_PUBLICA:        'var(--color-primary-400)',
  GRUPO_ARMADO_ORGANIZADO: 'var(--color-primary-500)',
  COMUNIDAD_CIVIL:       'var(--dash-green)',
  GUARDIA_INDIGENA:      'var(--dash-green)',
  NO_IDENTIFICADO:       'var(--dash-text-2)',
  OTRO:                  'var(--dash-text-2)',
};

// ── Mock fallback ─────────────────────────────────────────────────────────────
const MOCK: EstadisticaActorDTO[] = [
  { actor: 'ELN',                   totalEventos: 85 },
  { actor: 'SEGUNDA_MARQUETALIA',   totalEventos: 68 },
  { actor: 'FUERZA_PUBLICA',        totalEventos: 52 },
  { actor: 'GRUPO_ARMADO_ORGANIZADO', totalEventos: 38 },
  { actor: 'OTRO',                  totalEventos: 24 },
];

interface ActorsPanelProps {
  actores?: EstadisticaActorDTO[];
  loading?: boolean;
}

export function ActorsPanel({ actores, loading }: ActorsPanelProps) {
  const data = actores ?? MOCK;
  const sorted = [...data].sort((a, b) => b.totalEventos - a.totalEventos);
  const max = Math.max(...sorted.map((a) => a.totalEventos), 1);

  return (
    <div className={`${styles.panel} ${loading ? styles.loading : ''}`}>
      <CapLabel color="var(--color-primary-400)">ACTORES ARMADOS</CapLabel>
      <div className={styles.list}>
        {sorted.map(({ actor, totalEventos }) => {
          const name  = ACTOR_LABEL[actor]  ?? actor;
          const color = ACTOR_COLOR[actor]  ?? 'var(--dash-text-2)';
          return (
            <div key={actor} className={styles.row}>
              <div className={styles.name}>{name}</div>
              <HorizontalBar pct={(totalEventos / max) * 100} color={color} height={10} />
              <div className={styles.count} style={{ color }}>{totalEventos}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
