import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../../hooks/useDashboard';
import { BentoKpiRow } from '../../organisms/BentoKpiRow/BentoKpiRow';
import { HistoricoPanel } from '../../organisms/HistoricoPanel/HistoricoPanel';
import { MunicipiosRanking } from '../../organisms/MunicipiosRanking/MunicipiosRanking';
import { StatsActorsPanel } from '../../organisms/StatsActorsPanel/StatsActorsPanel';
import { StatsCategoriesPanel } from '../../organisms/StatsCategoriesPanel/StatsCategoriesPanel';
import { StatsDemographicsPanel } from '../../organisms/StatsDemographicsPanel/StatsDemographicsPanel';
import { GrupoPoblacionalPanel } from '../../organisms/GrupoPoblacionalPanel/GrupoPoblacionalPanel';
import type { FiltrosDashboard } from '../../../types/estadisticas.types';
import styles from './EstadisticasTemplate.module.css';

const ANIOS  = [2023, 2024, 2025, 2026];
const MESES  = [
  { v: undefined, l: 'Todos los meses' },
  { v: 1,  l: 'Enero'      }, { v: 2,  l: 'Febrero'    },
  { v: 3,  l: 'Marzo'      }, { v: 4,  l: 'Abril'       },
  { v: 5,  l: 'Mayo'       }, { v: 6,  l: 'Junio'       },
  { v: 7,  l: 'Julio'      }, { v: 8,  l: 'Agosto'      },
  { v: 9,  l: 'Septiembre' }, { v: 10, l: 'Octubre'     },
  { v: 11, l: 'Noviembre'  }, { v: 12, l: 'Diciembre'   },
];

export function EstadisticasTemplate() {
  const navigate = useNavigate();

  const [anio, setAnio] = useState<number>(new Date().getFullYear());
  const [mes,  setMes ] = useState<number | undefined>(undefined);

  const filtros: FiltrosDashboard = { anio, ...(mes ? { mes } : {}) };
  const { data, loading, error, refetch } = useDashboard(filtros);

  const handleAnio = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = Number(e.target.value);
    setAnio(v);
    refetch({ anio: v, ...(mes ? { mes } : {}) });
  }, [mes, refetch]);

  const handleMes = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value ? Number(e.target.value) : undefined;
    setMes(v);
    refetch({ anio, ...(v ? { mes: v } : {}) });
  }, [anio, refetch]);

  return (
    <div className={styles.root}>

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header className={styles.navbar}>
        {/* Izquierda: volver + título */}
        <div className={styles.navLeft}>
          <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
            <svg viewBox="0 0 16 16" width={14} height={14} fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </button>
          <div className={styles.navDivider} />
          <span className={styles.navTitle}>ESTADÍSTICAS</span>
        </div>

        {/* Centro: filtros de período */}
        <div className={styles.navCenter}>
          <select
            className={styles.select}
            value={anio}
            onChange={handleAnio}
            aria-label="Año"
          >
            {ANIOS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select
            className={styles.select}
            value={mes ?? ''}
            onChange={handleMes}
            aria-label="Mes"
          >
            {MESES.map((m) => (
              <option key={m.l} value={m.v ?? ''}>{m.l}</option>
            ))}
          </select>
        </div>

        {/* Derecha: modo comparación */}
        <div className={styles.navRight}>
          <button
            className={styles.compareBtn}
            onClick={() => navigate('/estadisticas?modo=comparar')}
          >
            <svg viewBox="0 0 16 16" width={13} height={13} fill="none">
              <path d="M2 8h5M9 8h5M6 4v8M10 4v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Comparar períodos
          </button>
        </div>
      </header>

      {/* ── Error banner ───────────────────────────────────────────────── */}
      {error && (
        <div className={styles.errorBanner}>
          ⚠ {error} — mostrando datos de ejemplo
        </div>
      )}

      {/* ── Bento grid ─────────────────────────────────────────────────── */}
      <main className={styles.grid}>

        {/* Fila 1: KPI cards — full width */}
        <div className={styles.areaKpi}>
          <BentoKpiRow resumen={data?.resumen} loading={loading} />
        </div>

        {/* Fila 2: Histórico — full width */}
        <div className={styles.areaHistorico}>
          <HistoricoPanel serie={data?.historicoMensual} loading={loading} />
        </div>

        {/* Fila 3: Municipios (7 cols) + Actores (5 cols) */}
        <div className={styles.areaMunicipios}>
          <MunicipiosRanking municipios={data?.mapaCalor} loading={loading} />
        </div>
        <div className={styles.areaActores}>
          <StatsActorsPanel actores={data?.incidentesPorActor} loading={loading} />
        </div>

        {/* Fila 4: Categorías (6) + Demografía (6) */}
        <div className={styles.areaCategorias}>
          <StatsCategoriesPanel categorias={data?.desgloseCategorias} loading={loading} />
        </div>
        <div className={styles.areaDemografia}>
          <StatsDemographicsPanel victimas={data?.estadisticasVictimas} loading={loading} />
        </div>

        {/* Fila 5: Grupo Poblacional — full width */}
        <div className={styles.areaGrupo}>
          <GrupoPoblacionalPanel
            grupos={data?.estadisticasVictimas?.porGrupoPoblacional}
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
}
