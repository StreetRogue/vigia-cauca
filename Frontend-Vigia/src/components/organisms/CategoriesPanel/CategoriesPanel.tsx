import { CapLabel } from '../../atoms/CapLabel/CapLabel';
import styles from './CategoriesPanel.module.css';
import type { EstadisticaCategoriaDTO } from '../../../types/estadisticas.types';
import type { CategoriaEvento } from '../../../types/novedad.types';

// ── Mapeo categoría → etiqueta y color ───────────────────────────────────────
const CAT_LABEL: Record<CategoriaEvento, string> = {
  ENFRENTAMIENTO:         'ENFRENTAMIENTO',
  HOSTIGAMIENTO:          'HOSTIGAMIENTO',
  ATENTADO_TERRORISTA:    'ATENTADO',
  ATAQUE_CON_DRON:        'ATAQUE DRON',
  HOMICIDIO:              'HOMICIDIO',
  SECUESTRO:              'SECUESTRO',
  RETEN_ILEGAL:           'RETÉN ILEGAL',
  RECLUTAMIENTO_ILICITO:  'RECLUTAMIENTO',
  ACCION_DE_PROTESTA:     'PROTESTA',
  HALLAZGO_DE_MATERIAL:   'HALLAZGO',
  OTRO:                   'OTRO',
};

const CAT_COLOR: Record<CategoriaEvento, string> = {
  ENFRENTAMIENTO:         'var(--dash-red)',
  HOSTIGAMIENTO:          'var(--dash-amber)',
  ATENTADO_TERRORISTA:    'var(--dash-red)',
  ATAQUE_CON_DRON:        'var(--dash-red)',
  HOMICIDIO:              'var(--dash-red)',
  SECUESTRO:              'var(--dash-amber)',
  RETEN_ILEGAL:           'var(--color-primary-400)',
  RECLUTAMIENTO_ILICITO:  'var(--dash-amber)',
  ACCION_DE_PROTESTA:     'var(--color-primary-400)',
  HALLAZGO_DE_MATERIAL:   'var(--color-primary-500)',
  OTRO:                   'var(--dash-text-2)',
};

// ── Mock fallback ─────────────────────────────────────────────────────────────
const MOCK: EstadisticaCategoriaDTO[] = [
  { categoria: 'ATAQUE_CON_DRON',       totalEventos: 23,  totalMuertos: 5 },
  { categoria: 'HOSTIGAMIENTO',         totalEventos: 187, totalMuertos: 12 },
  { categoria: 'HOMICIDIO',             totalEventos: 98,  totalMuertos: 98 },
  { categoria: 'ENFRENTAMIENTO',        totalEventos: 45,  totalMuertos: 22 },
  { categoria: 'RECLUTAMIENTO_ILICITO', totalEventos: 32,  totalMuertos: 0 },
  { categoria: 'OTRO',                  totalEventos: 89,  totalMuertos: 4 },
];

interface CategoriesPanelProps {
  categorias?: EstadisticaCategoriaDTO[];
  loading?:    boolean;
}

export function CategoriesPanel({ categorias, loading }: CategoriesPanelProps) {
  const data = categorias ?? MOCK;
  const sorted = [...data].sort((a, b) => b.totalEventos - a.totalEventos);

  return (
    <div className={`${styles.panel} ${loading ? styles.loading : ''}`}>
      <CapLabel color="var(--color-primary-400)">CATEGORÍAS DE EVENTO</CapLabel>
      <div className={styles.grid}>
        {sorted.map(({ categoria, totalEventos }) => {
          const name  = CAT_LABEL[categoria]  ?? categoria;
          const color = CAT_COLOR[categoria]  ?? 'var(--dash-text-2)';
          return (
            <div key={categoria} className={styles.cell} style={{ borderColor: `${color}30`, background: `${color}08` }}>
              <CapLabel size={8} color="var(--dash-text-3)">{name}</CapLabel>
              <div className={styles.cellValue} style={{ color }}>{totalEventos}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
