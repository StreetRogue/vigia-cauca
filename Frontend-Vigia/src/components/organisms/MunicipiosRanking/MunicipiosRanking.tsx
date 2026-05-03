import type { EstadisticaMunicipioDTO } from '../../../types/estadisticas.types';
import styles from './MunicipiosRanking.module.css';

// ── Mock ──────────────────────────────────────────────────────────────────────
const MOCK: EstadisticaMunicipioDTO[] = [
  { municipio: 'Popayán',               totalEventos: 127, totalMuertos: 34, totalHeridos: 56, totalDesplazados: 210, frecuenciaRelativa: 15.0, frecuenciaAcumulada: 15.0 },
  { municipio: 'Santander de Quilichao',totalEventos: 98,  totalMuertos: 12, totalHeridos: 23, totalDesplazados: 150, frecuenciaRelativa: 11.6, frecuenciaAcumulada: 26.6 },
  { municipio: 'El Tambo',              totalEventos: 85,  totalMuertos: 21, totalHeridos: 38, totalDesplazados: 340, frecuenciaRelativa: 10.0, frecuenciaAcumulada: 36.6 },
  { municipio: 'Toribío',               totalEventos: 74,  totalMuertos: 18, totalHeridos: 31, totalDesplazados: 290, frecuenciaRelativa: 8.7,  frecuenciaAcumulada: 45.3 },
  { municipio: 'Argelia',               totalEventos: 68,  totalMuertos: 15, totalHeridos: 27, totalDesplazados: 210, frecuenciaRelativa: 8.0,  frecuenciaAcumulada: 53.3 },
  { municipio: 'Balboa',                totalEventos: 61,  totalMuertos: 11, totalHeridos: 22, totalDesplazados: 180, frecuenciaRelativa: 7.2,  frecuenciaAcumulada: 60.5 },
  { municipio: 'Mercaderes',            totalEventos: 54,  totalMuertos: 9,  totalHeridos: 18, totalDesplazados: 145, frecuenciaRelativa: 6.4,  frecuenciaAcumulada: 66.9 },
  { municipio: 'Miranda',               totalEventos: 47,  totalMuertos: 8,  totalHeridos: 14, totalDesplazados: 120, frecuenciaRelativa: 5.5,  frecuenciaAcumulada: 72.4 },
  { municipio: 'Corinto',               totalEventos: 41,  totalMuertos: 6,  totalHeridos: 12, totalDesplazados: 95,  frecuenciaRelativa: 4.8,  frecuenciaAcumulada: 77.2 },
  { municipio: 'Caloto',                totalEventos: 36,  totalMuertos: 5,  totalHeridos: 10, totalDesplazados: 78,  frecuenciaRelativa: 4.2,  frecuenciaAcumulada: 81.4 },
];

function fmt(n: number) { return n.toLocaleString('es-CO'); }

// Colores por rango de frecuencia relativa
function freqColor(pct: number) {
  if (pct >= 12) return 'var(--metric-muertos)';
  if (pct >= 8)  return 'var(--metric-heridos)';
  if (pct >= 5)  return 'var(--metric-eventos)';
  return 'var(--dash-text-2)';
}

interface MunicipiosRankingProps {
  municipios?: EstadisticaMunicipioDTO[];
  loading?: boolean;
}

export function MunicipiosRanking({ municipios, loading }: MunicipiosRankingProps) {
  const data   = municipios?.length ? municipios : MOCK;
  const sorted = [...data].sort((a, b) => b.totalEventos - a.totalEventos).slice(0, 10);
  const maxEv  = Math.max(...sorted.map((m) => m.totalEventos), 1);

  return (
    <div className={`${styles.panel} ${loading ? styles.loading : ''}`}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>MUNICIPIOS — RANKING</span>
        <span className={styles.panelSub}>top {sorted.length} por eventos</span>
      </div>

      <div className={styles.tableWrap}>
        {/* Encabezado */}
        <div className={`${styles.row} ${styles.head}`}>
          <span className={styles.colMunicipio}>Municipio</span>
          <span className={styles.colNum}>Eventos</span>
          <span className={styles.colNum}>Muertos</span>
          <span className={styles.colNum}>Heridos</span>
          <span className={styles.colNum}>Desp.</span>
          <span className={styles.colFreq}>Freq. rel.</span>
        </div>

        {/* Filas */}
        {sorted.map((m, idx) => {
          const barW = (m.totalEventos / maxEv) * 100;
          const color = freqColor(m.frecuenciaRelativa);
          return (
            <div key={m.municipio} className={styles.row}>
              {/* Barra de fondo proporcional a eventos */}
              <div
                className={styles.rowBar}
                style={{ width: `${barW}%`, background: `${color}14` }}
              />
              <span className={styles.colIdx}>{idx + 1}</span>
              <span className={styles.colMunicipio} title={m.municipio}>
                {m.municipio}
              </span>
              <span className={styles.colNum} style={{ color: 'var(--metric-eventos)' }}>
                {fmt(m.totalEventos)}
              </span>
              <span className={styles.colNum} style={{ color: 'var(--metric-muertos)' }}>
                {fmt(m.totalMuertos)}
              </span>
              <span className={styles.colNum} style={{ color: 'var(--metric-heridos)' }}>
                {fmt(m.totalHeridos)}
              </span>
              <span className={styles.colNum} style={{ color: 'var(--metric-desplazados)' }}>
                {fmt(m.totalDesplazados)}
              </span>
              <span className={styles.colFreq} style={{ color }}>
                {m.frecuenciaRelativa.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
