import type { EstadisticaMunicipioDTO } from '../../../types/estadisticas.types';
import styles from './MunicipiosRanking.module.css';

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
  const data   = municipios ?? [];
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
