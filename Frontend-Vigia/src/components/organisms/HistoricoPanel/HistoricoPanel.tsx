import type { SerieTemporalDTO } from '../../../types/estadisticas.types';
import styles from './HistoricoPanel.module.css';

// ── Mini-chart SVG ────────────────────────────────────────────────────────────
interface MiniChartProps {
  data: number[];
  labels: string[];
  color: string;
  label: string;
  maxTotal: number;
}

const W = 360;
const H = 90;
const PAD = { top: 8, right: 12, bottom: 28, left: 8 };
const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;

function MiniChart({ data, labels, color, label, maxTotal }: MiniChartProps) {
  const max = Math.max(...data, 1);
  const n   = data.length;

  // Coordenadas para la polyline
  const cx = (i: number) => PAD.left + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const cy = (v: number) => PAD.top + (1 - v / max) * plotH;

  const points = data.map((v, i) => `${cx(i)},${cy(v)}`).join(' ');

  // Área rellena (cierra en la base)
  const areaPoints = [
    `${cx(0)},${PAD.top + plotH}`,
    ...data.map((v, i) => `${cx(i)},${cy(v)}`),
    `${cx(n - 1)},${PAD.top + plotH}`,
  ].join(' ');

  return (
    <div className={styles.miniCard}>
      <div className={styles.miniHeader}>
        <span className={styles.miniLabel} style={{ color }}>{label}</span>
        <span className={styles.miniMax}>{maxTotal.toLocaleString('es-CO')}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className={styles.miniSvg} preserveAspectRatio="none">
        {/* Área rellena */}
        <polygon points={areaPoints} fill={color} opacity="0.08" />

        {/* Línea principal */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Puntos */}
        {data.map((v, i) => (
          <circle
            key={i}
            cx={cx(i)}
            cy={cy(v)}
            r={3}
            fill={color}
            opacity={0.8}
          />
        ))}

        {/* Etiquetas X — solo primera, mitad, última */}
        {[0, Math.floor(n / 2), n - 1].map((i) => (
          <text
            key={i}
            x={cx(i)}
            y={H - 6}
            textAnchor="middle"
            fontSize={9}
            fill="var(--dash-text-2)"
            fontFamily="inherit"
          >
            {labels[i]}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
interface HistoricoPanelProps {
  serie?: SerieTemporalDTO[];
  loading?: boolean;
}

export function HistoricoPanel({ serie, loading }: HistoricoPanelProps) {
  const raw    = serie ?? [];
  const sorted = [...raw].sort((a, b) =>
    a.anio !== b.anio ? a.anio - b.anio : a.mes - b.mes,
  );

  const labels        = sorted.map((m) => m.nombreMes.slice(0, 3).toUpperCase());
  const eventos       = sorted.map((m) => m.totalEventos);
  const muertos       = sorted.map((m) => m.totalMuertos);
  const heridos       = sorted.map((m) => m.totalHeridos);
  const desplazados   = sorted.map((m) => m.totalDesplazados);

  const totEventos    = eventos.reduce((s, v) => s + v, 0);
  const totMuertos    = muertos.reduce((s, v) => s + v, 0);
  const totHeridos    = heridos.reduce((s, v) => s + v, 0);
  const totDesplazados = desplazados.reduce((s, v) => s + v, 0);

  return (
    <div className={`${styles.panel} ${loading ? styles.loading : ''}`}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>HISTÓRICO MENSUAL</span>
        <span className={styles.panelSub}>tendencia por tipo de afectación · año {sorted[0]?.anio ?? '—'}</span>
      </div>

      <div className={styles.grid}>
        <MiniChart data={eventos}     labels={labels} color="var(--metric-eventos)"     label="EVENTOS"     maxTotal={totEventos}     />
        <MiniChart data={muertos}     labels={labels} color="var(--metric-muertos)"     label="MUERTOS"     maxTotal={totMuertos}     />
        <MiniChart data={heridos}     labels={labels} color="var(--metric-heridos)"     label="HERIDOS"     maxTotal={totHeridos}     />
        <MiniChart data={desplazados} labels={labels} color="var(--metric-desplazados)" label="DESPLAZADOS" maxTotal={totDesplazados} />
      </div>
    </div>
  );
}
