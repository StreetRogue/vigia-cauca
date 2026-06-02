import { CapLabel } from '../../atoms/CapLabel/CapLabel';
import { DonutChart } from '../../atoms/DonutChart/DonutChart';
import styles from './DemographicsPanel.module.css';
import type { EstadisticasVictimasDTO, DistribucionDTO } from '../../../types/estadisticas.types';

const GENDER_COLORS: Record<string, string> = {
  MASCULINO:       'var(--color-primary-500)',
  FEMENINO:        '#127850',
  LGBTI_PLUS:      '#bf5f00',
  'LGBTI+':        '#bf5f00',
  NO_ESPECIFICADO: 'var(--dash-text-2)',
  'NO ESPECIFICADO': 'var(--dash-text-2)',
};

const GENDER_LABEL: Record<string, string> = {
  MASCULINO:       'MASCULINO',
  FEMENINO:        'FEMENINO',
  LGBTI_PLUS:      'LGBTI+',
  'LGBTI+':        'LGBTI+',
  NO_ESPECIFICADO: 'NO ESPEC.',
  'NO ESPECIFICADO': 'NO ESPEC.',
};

const EMPTY: EstadisticasVictimasDTO = {
  filtrosAplicados: {},
  totalVictimas: 0,
  porGenero: [],
  porRangoEdad: [],
  porGrupoPoblacional: [],
};

interface DemographicsPanelProps {
  victimas?: EstadisticasVictimasDTO;
  loading?:  boolean;
}

export function DemographicsPanel({ victimas, loading }: DemographicsPanelProps) {
  const d = victimas ?? EMPTY;

  // Géneros → donut
  const genders = d.porGenero.map((g: any) => {
    const rawEtiqueta = g.etiqueta ?? g.genero ?? '';
    const key = String(rawEtiqueta).toUpperCase().trim();
    return {
      label: GENDER_LABEL[key] ?? rawEtiqueta,
      pct:   g.frecuenciaRelativa,
      color: GENDER_COLORS[key] ?? 'var(--dash-text-2)',
      abs:   g.frecuenciaAbsoluta,
    };
  });

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
            {genders.map(({ label, pct, color }, i) => (
              <div key={label ?? i} className={styles.genderRow}>
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
                <div key={a.etiqueta ?? i} className={styles.ageCol}>
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
