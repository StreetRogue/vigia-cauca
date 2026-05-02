import type { CategoriaEvento } from '../../../types/novedad.types';
import type { EstadisticaCategoriaDTO } from '../../../types/estadisticas.types';
import styles from './StatsCategoriesPanel.module.css';

// ── Mapas de etiquetas y colores ──────────────────────────────────────────────
const CAT_LABEL: Record<CategoriaEvento, string> = {
  ENFRENTAMIENTO:       'Enfrentamiento',
  HOSTIGAMIENTO:        'Hostigamiento',
  ATENTADO_TERRORISTA:  'Atentado terrorista',
  ATAQUE_CON_DRON:      'Ataque con dron',
  HOMICIDIO:            'Homicidio',
  SECUESTRO:            'Secuestro',
  RETEN_ILEGAL:         'Retén ilegal',
  RECLUTAMIENTO_ILICITO:'Reclutamiento ilícito',
  ACCION_DE_PROTESTA:   'Acción de protesta',
  HALLAZGO_DE_MATERIAL: 'Hallazgo de material',
  OTRO:                 'Otro',
};

const CAT_COLOR: Record<CategoriaEvento, string> = {
  ENFRENTAMIENTO:       'var(--metric-muertos)',
  HOSTIGAMIENTO:        'var(--metric-heridos)',
  ATENTADO_TERRORISTA:  'var(--dash-red)',
  ATAQUE_CON_DRON:      'var(--dash-amber)',
  HOMICIDIO:            '#b04040',
  SECUESTRO:            'var(--metric-confinados)',
  RETEN_ILEGAL:         'var(--metric-desplazados)',
  RECLUTAMIENTO_ILICITO:'var(--color-primary-400)',
  ACCION_DE_PROTESTA:   'var(--dash-green)',
  HALLAZGO_DE_MATERIAL: 'var(--dash-text-2)',
  OTRO:                 'var(--dash-text-3)',
};

// ── Mock ──────────────────────────────────────────────────────────────────────
const MOCK: EstadisticaCategoriaDTO[] = [
  { categoria: 'ENFRENTAMIENTO',        totalEventos: 254, totalMuertos: 89, totalHeridos: 142, frecuenciaRelativa: 30.0, frecuenciaAcumulada: 30.0 },
  { categoria: 'HOSTIGAMIENTO',         totalEventos: 187, totalMuertos: 21, totalHeridos:  78, frecuenciaRelativa: 22.1, frecuenciaAcumulada: 52.1 },
  { categoria: 'HOMICIDIO',             totalEventos: 112, totalMuertos: 112,totalHeridos:   0, frecuenciaRelativa: 13.2, frecuenciaAcumulada: 65.3 },
  { categoria: 'ATENTADO_TERRORISTA',   totalEventos:  89, totalMuertos:  12,totalHeridos:  67, frecuenciaRelativa: 10.5, frecuenciaAcumulada: 75.8 },
  { categoria: 'RETEN_ILEGAL',          totalEventos:  71, totalMuertos:   4,totalHeridos:  18, frecuenciaRelativa:  8.4, frecuenciaAcumulada: 84.2 },
  { categoria: 'SECUESTRO',             totalEventos:  42, totalMuertos:   3,totalHeridos:   0, frecuenciaRelativa:  5.0, frecuenciaAcumulada: 89.2 },
  { categoria: 'RECLUTAMIENTO_ILICITO', totalEventos:  31, totalMuertos:   0,totalHeridos:   0, frecuenciaRelativa:  3.7, frecuenciaAcumulada: 92.9 },
  { categoria: 'HALLAZGO_DE_MATERIAL',  totalEventos:  24, totalMuertos:   1,totalHeridos:   8, frecuenciaRelativa:  2.8, frecuenciaAcumulada: 95.7 },
  { categoria: 'ATAQUE_CON_DRON',       totalEventos:  18, totalMuertos:   2,totalHeridos:  14, frecuenciaRelativa:  2.1, frecuenciaAcumulada: 97.8 },
  { categoria: 'ACCION_DE_PROTESTA',    totalEventos:  12, totalMuertos:   0,totalHeridos:   2, frecuenciaRelativa:  1.4, frecuenciaAcumulada: 99.2 },
  { categoria: 'OTRO',                  totalEventos:   7, totalMuertos:   1,totalHeridos:   2, frecuenciaRelativa:  0.8, frecuenciaAcumulada: 100.0},
];

function fmt(n: number) { return n.toLocaleString('es-CO'); }

interface StatsCategoriesPanelProps {
  categorias?: EstadisticaCategoriaDTO[];
  loading?: boolean;
}

export function StatsCategoriesPanel({ categorias, loading }: StatsCategoriesPanelProps) {
  const data   = categorias?.length ? categorias : MOCK;
  const sorted = [...data].sort((a, b) => b.totalEventos - a.totalEventos);
  const max    = Math.max(...sorted.map((c) => c.totalEventos), 1);

  return (
    <div className={`${styles.panel} ${loading ? styles.loading : ''}`}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>CATEGORÍAS DE EVENTOS</span>
        <span className={styles.panelSub}>incidentes, muertos y heridos por tipo</span>
      </div>

      <div className={styles.list}>
        {sorted.map((item) => {
          const color = CAT_COLOR[item.categoria];
          const barW  = (item.totalEventos / max) * 100;

          return (
            <div key={item.categoria} className={styles.item}>
              <div className={styles.itemTop}>
                <span className={styles.itemName} style={{ color }}>
                  {CAT_LABEL[item.categoria] ?? item.categoria}
                </span>
                <div className={styles.itemNums}>
                  <span className={styles.itemCount} style={{ color }}>
                    {fmt(item.totalEventos)}
                  </span>
                  <span
                    className={styles.itemMuertos}
                    title="Muertos"
                    style={{ color: 'var(--metric-muertos)' }}
                  >
                    †{fmt(item.totalMuertos)}
                  </span>
                  <span
                    className={styles.itemHeridos}
                    title="Heridos"
                    style={{ color: 'var(--metric-heridos)' }}
                  >
                    +{fmt(item.totalHeridos)}
                  </span>
                  <span className={styles.itemRel}>
                    {item.frecuenciaRelativa.toFixed(1)}%
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
