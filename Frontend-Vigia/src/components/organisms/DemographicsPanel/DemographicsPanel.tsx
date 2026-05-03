import { CapLabel } from '../../atoms/CapLabel/CapLabel';
import { DonutChart } from '../../atoms/DonutChart/DonutChart';
import styles from './DemographicsPanel.module.css';
import type { EstadisticasVictimasDTO, DistribucionDTO } from '../../../types/estadisticas.types';

// ── Colores para géneros ──────────────────────────────────────────────────────
const GENDER_COLORS: Record<string, string> = {
  MASCULINO:       'var(--color-primary-500)',
  FEMENINO:        '#127850',
  LGBTI_PLUS:      '#bf5f00',
  NO_ESPECIFICADO: 'var(--dash-text-2)',
};

const GENDER_LABEL: Record<string, string> = {
  MASCULINO:       'MASCULINO',
  FEMENINO:        'FEMENINO',
  LGBTI_PLUS:      'LGBTI+',
  NO_ESPECIFICADO: 'NO ESPEC.',
};

// ── Mock fallback ─────────────────────────────────────────────────────────────
const MOCK: EstadisticasVictimasDTO = {
  filtrosAplicados: {},
  totalVictimas: 1234,
  porGenero: [
    { etiqueta: 'MASCULINO',  frecuenciaAbsoluta: 804, frecuenciaRelativa: 65, frecuenciaAcumulada: 65 },
    { etiqueta: 'FEMENINO',   frecuenciaAbsoluta: 309, frecuenciaRelativa: 25, frecuenciaAcumulada: 90 },
    { etiqueta: 'LGBTI_PLUS', frecuenciaAbsoluta: 121, frecuenciaRelativa: 10, frecuenciaAcumulada: 100 },
  ],
  porRangoEdad: [
    { etiqueta: '0-9',   frecuenciaAbsoluta: 99,  frecuenciaRelativa: 8,  frecuenciaAcumulada: 8 },
    { etiqueta: '10-17', frecuenciaAbsoluta: 222, frecuenciaRelativa: 18, frecuenciaAcumulada: 26 },
    { etiqueta: '18-25', frecuenciaAbsoluta: 370, frecuenciaRelativa: 30, frecuenciaAcumulada: 56 },
    { etiqueta: '26-40', frecuenciaAbsoluta: 296, frecuenciaRelativa: 24, frecuenciaAcumulada: 80 },
    { etiqueta: '41-60', frecuenciaAbsoluta: 185, frecuenciaRelativa: 15, frecuenciaAcumulada: 95 },
    { etiqueta: '61+',   frecuenciaAbsoluta: 62,  frecuenciaRelativa: 5,  frecuenciaAcumulada: 100 },
  ],
  porGrupoPoblacional: [],
};

interface DemographicsPanelProps {
  victimas?: EstadisticasVictimasDTO;
  loading?:  boolean;
}

export function DemographicsPanel({ victimas, loading }: DemographicsPanelProps) {
  const d = victimas ?? MOCK;

  // Géneros → donut
  const genders = d.porGenero.map((g: DistribucionDTO) => ({
    label: GENDER_LABEL[g.etiqueta] ?? g.etiqueta,
    pct:   g.frecuenciaRelativa,
    color: GENDER_COLORS[g.etiqueta] ?? 'var(--dash-text-2)',
    abs:   g.frecuenciaAbsoluta,
  }));

  // Rangos de edad → histograma
  const ages   = d.porRangoEdad;
  const maxAbs = Math.max(...ages.map((a) => a.frecuenciaAbsoluta), 1);

  return (
    <div className={`${styles.panel} ${loading ? styles.loading : ''}`}>
      <CapLabel color="var(--color-primary-400)">DEMOGRAFÍA DE VÍCTIMAS</CapLabel>
      <div className={styles.content}>
        {/* Donut + gender legend */}
        <div className={styles.donutSection}>
          <DonutChart
            data={genders.map(({ pct, color }) => ({ pct, color }))}
            size={58}
          />
          <div className={styles.genderLegend}>
            {genders.map(({ label, pct, color }) => (
              <div key={label} className={styles.genderRow}>
                <div className={styles.genderDot} style={{ background: color }} />
                <CapLabel size={8} color="var(--dash-text-2)">{label}</CapLabel>
                <div className={styles.genderVal} style={{ color }}>{pct.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.verticalDivider} />

        {/* Age histogram */}
        <div className={styles.ageSection}>
          <CapLabel color="var(--dash-text-3)">RANGO DE EDAD</CapLabel>
          <div className={styles.ageChart}>
            {ages.map((a: DistribucionDTO, i: number) => {
              const barH = (a.frecuenciaAbsoluta / maxAbs) * 34;
              const isMax = a.frecuenciaAbsoluta === maxAbs;
              return (
                <div key={a.etiqueta} className={styles.ageCol}>
                  <div
                    className={styles.ageBar}
                    style={{
                      height: `${barH}px`,
                      background: isMax ? 'var(--dash-accent)' : 'var(--color-primary-500)',
                      boxShadow: 'none',
                    }}
                  />
                  <CapLabel size={7} color="var(--dash-text-3)">{a.etiqueta}</CapLabel>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
