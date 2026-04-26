import { CapLabel } from '../../atoms/CapLabel/CapLabel';
import styles from './MapPanel.module.css';
import type { EstadisticaMunicipioDTO } from '../../../types/estadisticas.types';

const MODES = ['2D', '3D ISO', 'HEAT'];
const LEGEND = [
  { label: 'Bajo', color: 'var(--color-primary-500)' },
  { label: 'Medio', color: 'var(--dash-amber)' },
  { label: 'Alto', color: 'var(--dash-red)' },
  { label: 'Crítico', color: 'var(--dash-red)' },
];

interface MapPanelProps {
  /** Datos por municipio del backend (pendiente integración SVG) */
  municipios?: EstadisticaMunicipioDTO[];
  loading?:    boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MapPanel({ municipios, loading }: MapPanelProps = {}) {
  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <CapLabel color="var(--color-primary-400)">
          INTELIGENCIA GEOESPACIAL · CAUCA
        </CapLabel>
        <div className={styles.modes}>
          {MODES.map((m, i) => (
            <button
              key={m}
              className={`${styles.modeBtn} ${i === 2 ? styles.modeBtnActive : ''}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Coordinates bar */}
      <div className={styles.coords}>
        <CapLabel size={8} color="var(--color-primary-400)">2.891° N  76.920° W</CapLabel>
        <CapLabel size={8} color="var(--color-primary-400)">0.653° N  77.885° W</CapLabel>
      </div>

      {/* Map placeholder */}
      <div className={styles.mapArea}>
        <div className={styles.placeholder}>
          <svg viewBox="0 0 220 260" className={styles.caucaSvg} fill="none">
            <path
              d="M 95,12 L 118,9 L 142,28 L 158,55 L 165,85 L 162,115 L 155,145 L 142,172 L 124,198 L 100,215 L 78,212 L 56,198 L 38,174 L 30,145 L 34,112 L 40,82 L 52,52 L 70,28 Z"
              fill="rgba(26,63,134,0.20)"
              stroke="var(--color-primary-400)"
              strokeWidth="1.5"
            />
            <path
              d="M70,28 L100,50 L130,44 M100,50 L96,88 L80,108 L90,140 M96,88 L128,82 L152,96 M80,108 L58,118 L40,118 M90,140 L120,134 L148,122 M90,140 L74,162 L78,184 M120,134 L136,164 L122,190"
              stroke="var(--color-primary-500)"
              strokeWidth="0.8"
              strokeDasharray="3,2"
            />
          </svg>
          <div className={styles.placeholderLabel}>
            <CapLabel color="var(--dash-text-2)">Mapa interactivo por municipio</CapLabel>
            <div className={styles.placeholderSub}>Próximamente disponible</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <CapLabel color="var(--dash-text-3)">INTENSIDAD:</CapLabel>
        {LEGEND.map(({ label, color }) => (
          <div key={label} className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: color }} />
            <CapLabel size={8} color="var(--dash-text-2)">{label}</CapLabel>
          </div>
        ))}
      </div>
    </div>
  );
}
