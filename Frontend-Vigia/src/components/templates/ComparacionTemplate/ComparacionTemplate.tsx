import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComparacion } from '../../../hooks/useComparacion';
import { StatsActorsPanel } from '../../organisms/StatsActorsPanel/StatsActorsPanel';
import { StatsCategoriesPanel } from '../../organisms/StatsCategoriesPanel/StatsCategoriesPanel';
import type { FiltrosDashboard, ResumenKPIDTO } from '../../../types/estadisticas.types';
import styles from './ComparacionTemplate.module.css';

// ── Mocks para comparación sin backend ───────────────────────────────────────
const MOCK_A: ResumenKPIDTO = {
  anio: 0, municipio: '', filtrosAplicados: {},
  totalEventos: 48, totalMuertos: 14, totalHeridos: 21,
  totalDesplazados: 180, totalConfinados: 35,
};
const MOCK_B: ResumenKPIDTO = {
  anio: 0, municipio: '', filtrosAplicados: {},
  totalEventos: 67, totalMuertos: 9, totalHeridos: 31,
  totalDesplazados: 241, totalConfinados: 28,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const ANIOS = [2023, 2024, 2025, 2026];
const MESES = [
  { v: 1,  l: 'Enero'      }, { v: 2,  l: 'Febrero'    },
  { v: 3,  l: 'Marzo'      }, { v: 4,  l: 'Abril'       },
  { v: 5,  l: 'Mayo'       }, { v: 6,  l: 'Junio'       },
  { v: 7,  l: 'Julio'      }, { v: 8,  l: 'Agosto'      },
  { v: 9,  l: 'Septiembre' }, { v: 10, l: 'Octubre'     },
  { v: 11, l: 'Noviembre'  }, { v: 12, l: 'Diciembre'   },
];

const NOW = new Date();
const YEAR = NOW.getFullYear();
const MONTH = NOW.getMonth() + 1;

function mesNombre(mes: number) {
  return MESES.find((m) => m.v === mes)?.l ?? `Mes ${mes}`;
}

function fmt(n: number | undefined) {
  if (n == null) return '—';
  return n.toLocaleString('es-CO');
}

// ── Delta indicator ───────────────────────────────────────────────────────────
interface DeltaProps { a: number; b: number; invertir?: boolean }

function Delta({ a, b, invertir = false }: DeltaProps) {
  if (a === 0 && b === 0) return <span className={styles.deltaZero}>—</span>;
  const pct = a === 0 ? 100 : Math.round(((b - a) / a) * 100);
  // "invertir" = sube es bueno (ej: ninguno aquí realmente, pero disponible)
  const isUp   = pct > 0;
  const isBad  = invertir ? !isUp : isUp; // sube violencia = malo
  return (
    <span className={isBad ? styles.deltaUp : styles.deltaDown}>
      {isUp ? '↑' : '↓'} {Math.abs(pct)}%
    </span>
  );
}

// ── Selector de período ───────────────────────────────────────────────────────
interface PeriodSelectorProps {
  label: string;
  anio: number;
  mes: number;
  onAnio: (v: number) => void;
  onMes:  (v: number) => void;
  accent: string;
}

function PeriodSelector({ label, anio, mes, onAnio, onMes, accent }: PeriodSelectorProps) {
  return (
    <div className={styles.periodSelector}>
      <span className={styles.periodLabel} style={{ color: accent }}>{label}</span>
      <select
        className={styles.select}
        value={anio}
        onChange={(e) => onAnio(Number(e.target.value))}
        aria-label={`Año ${label}`}
      >
        {ANIOS.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
      <select
        className={styles.select}
        value={mes}
        onChange={(e) => onMes(Number(e.target.value))}
        aria-label={`Mes ${label}`}
      >
        {MESES.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
      </select>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function ComparacionTemplate() {
  const navigate = useNavigate();

  // Período A: mes actual - 1
  const [anioA, setAnioA] = useState(MONTH > 1 ? YEAR : YEAR - 1);
  const [mesA,  setMesA ] = useState(MONTH > 1 ? MONTH - 1 : 12);
  // Período B: mes actual
  const [anioB, setAnioB] = useState(YEAR);
  const [mesB,  setMesB ] = useState(MONTH);

  const filtrosA: FiltrosDashboard = { anio: anioA, mes: mesA };
  const filtrosB: FiltrosDashboard = { anio: anioB, mes: mesB };

  const { dataA, dataB, loading, error, refetch } = useComparacion(filtrosA, filtrosB);

  const handleRefetch = useCallback(() => {
    refetch({ anio: anioA, mes: mesA }, { anio: anioB, mes: mesB });
  }, [refetch, anioA, mesA, anioB, mesB]);

  const rA = dataA?.resumen ?? MOCK_A;
  const rB = dataB?.resumen ?? MOCK_B;

  const kpis = [
    { label: 'Eventos',     a: rA?.totalEventos,    b: rB?.totalEventos,    color: 'var(--metric-eventos)'    },
    { label: 'Muertos',     a: rA?.totalMuertos,    b: rB?.totalMuertos,    color: 'var(--metric-muertos)'    },
    { label: 'Heridos',     a: rA?.totalHeridos,    b: rB?.totalHeridos,    color: 'var(--metric-heridos)'    },
    { label: 'Desplazados', a: rA?.totalDesplazados,b: rB?.totalDesplazados,color: 'var(--metric-desplazados)'},
    { label: 'Confinados',  a: rA?.totalConfinados, b: rB?.totalConfinados, color: 'var(--metric-confinados)' },
  ];

  return (
    <div className={styles.root}>

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header className={styles.navbar}>
        <div className={styles.navLeft}>
          <button className={styles.backBtn} onClick={() => navigate('/estadisticas')}>
            <svg viewBox="0 0 16 16" width={14} height={14} fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Estadísticas
          </button>
          <div className={styles.navDivider} />
          <span className={styles.navTitle}>COMPARACIÓN DE PERÍODOS</span>
        </div>

        <div className={styles.navPeriods}>
          <PeriodSelector
            label="PERÍODO A"
            anio={anioA} mes={mesA}
            onAnio={(v) => setAnioA(v)}
            onMes={(v)  => setMesA(v)}
            accent="var(--metric-desplazados)"
          />
          <span className={styles.vsLabel}>vs</span>
          <PeriodSelector
            label="PERÍODO B"
            anio={anioB} mes={mesB}
            onAnio={(v) => setAnioB(v)}
            onMes={(v)  => setMesB(v)}
            accent="var(--metric-heridos)"
          />
          <button className={styles.applyBtn} onClick={handleRefetch}>
            Comparar
          </button>
        </div>
      </header>

      {error && (
        <div className={styles.errorBanner}>⚠ {error} — mostrando datos de ejemplo</div>
      )}

      {/* ── Contenido principal ─────────────────────────────────────────── */}
      <main className={`${styles.body} ${loading ? styles.loading : ''}`}>

        {/* Encabezados de columnas */}
        <div className={styles.colHeaders}>
          <div className={styles.colA}>
            <span className={styles.colTitle} style={{ color: 'var(--metric-desplazados)' }}>
              {mesNombre(mesA)} {anioA}
            </span>
          </div>
          <div className={styles.colDelta}>Δ cambio</div>
          <div className={styles.colB}>
            <span className={styles.colTitle} style={{ color: 'var(--metric-heridos)' }}>
              {mesNombre(mesB)} {anioB}
            </span>
          </div>
        </div>

        {/* ── KPI rows ── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Resumen de afectación</h3>
          {kpis.map((k) => (
            <div key={k.label} className={styles.kpiRow}>
              <div className={styles.colA}>
                <span className={styles.kpiLabel}>{k.label}</span>
                <span className={styles.kpiValue} style={{ color: k.color }}>
                  {fmt(k.a)}
                </span>
              </div>
              <div className={styles.colDelta}>
                {k.a != null && k.b != null
                  ? <Delta a={k.a} b={k.b} />
                  : <span className={styles.deltaZero}>—</span>
                }
              </div>
              <div className={styles.colB}>
                <span className={styles.kpiLabel}>{k.label}</span>
                <span className={styles.kpiValue} style={{ color: k.color }}>
                  {fmt(k.b)}
                </span>
              </div>
            </div>
          ))}
        </section>

        <div className={styles.sectionDivider} />

        {/* ── Actores ── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Actores armados</h3>
          <div className={styles.splitPanels}>
            <StatsActorsPanel actores={dataA?.incidentesPorActor} loading={loading} />
            <div className={styles.splitDivider} />
            <StatsActorsPanel actores={dataB?.incidentesPorActor} loading={loading} />
          </div>
        </section>

        <div className={styles.sectionDivider} />

        {/* ── Categorías ── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Categorías de eventos</h3>
          <div className={styles.splitPanels}>
            <StatsCategoriesPanel categorias={dataA?.desgloseCategorias} loading={loading} />
            <div className={styles.splitDivider} />
            <StatsCategoriesPanel categorias={dataB?.desgloseCategorias} loading={loading} />
          </div>
        </section>

      </main>
    </div>
  );
}
