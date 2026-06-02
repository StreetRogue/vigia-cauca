import { useCallback, useState } from 'react';
import { DashboardNavbar } from '../../organisms/DashboardNavbar/DashboardNavbar';
import { KpiStrip } from '../../organisms/KpiStrip/KpiStrip';
import { MapPanel } from '../../organisms/MapPanel/MapPanel';
import { ActorsPanel } from '../../organisms/ActorsPanel/ActorsPanel';
import { DemographicsPanel } from '../../organisms/DemographicsPanel/DemographicsPanel';
import { CategoriesPanel } from '../../organisms/CategoriesPanel/CategoriesPanel';
import { TemporalPanel } from '../../organisms/TemporalPanel/TemporalPanel';
import { useDashboard } from '../../../hooks/useDashboard';
import { useSSE } from '../../../hooks/useSSE';
import { useAuth } from '../../../context/AuthContext';
import { ReportModal } from '../../organisms/ReportModal';
import styles from './DashboardTemplate.module.css';
import type { FiltrosDashboard } from '../../../types/estadisticas.types';

interface DashboardTemplateProps {
  filtros?: FiltrosDashboard;
}

export function DashboardTemplate({ filtros }: DashboardTemplateProps) {
  const { user } = useAuth();
  const [currentFiltros, setCurrentFiltros] = useState<FiltrosDashboard>(
    filtros || { anio: new Date().getFullYear() }
  );
  const [selectedMunicipio, setSelectedMunicipio] = useState<string | null>(null);
  const { data, loading, error, refetch } = useDashboard(currentFiltros);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Todos pueden generar reportes; el backend filtra PUBLICA/PRIVADA según el rol
  const canGenerateReports = true;

  // Refrescar el dashboard cuando llegue un evento SSE del servidor
  const handleSSE = useCallback(() => {
    refetch(currentFiltros);
  }, [refetch, currentFiltros]);

  useSSE({ onMessage: handleSSE });

  const handleFilterChange = (f: FiltrosDashboard) => {
    setCurrentFiltros(f);
    setSelectedMunicipio(null);
    refetch(f);
  };

  const handleMunicipioSelect = (municipio: string | null) => {
    setSelectedMunicipio(municipio);
    const nuevosFiltros = { ...currentFiltros, municipio: municipio || undefined };
    setCurrentFiltros(nuevosFiltros);
    refetch(nuevosFiltros);
  };

  return (
    <div className={styles.root}>
      <DashboardNavbar
        onFilterChange={handleFilterChange}
        currentFiltros={currentFiltros}
      />
      <KpiStrip resumen={data?.resumen} loading={loading} />

      {/* Error banner */}
      {error && (
        <div className={styles.errorBanner}>
          ⚠ {error} — mostrando datos de ejemplo
        </div>
      )}

      {/* Main body */}
      <div className={styles.body}>
        <MapPanel
          municipios={data?.mapaCalor}
          loading={loading}
          selectedMunicipio={selectedMunicipio}
          onMunicipioSelect={handleMunicipioSelect}
        />
        <div className={styles.analyticsStack}>
          <ActorsPanel    actores={data?.incidentesPorActor}   loading={loading} />
          <DemographicsPanel victimas={data?.estadisticasVictimas} loading={loading} />
          <CategoriesPanel categorias={data?.desgloseCategorias} loading={loading} />
        </div>
      </div>

      {/* Timeline */}
      <div className={styles.timeline}>
        <TemporalPanel serie={data?.historicoMensual} loading={loading} />
      </div>

      {/* Report button - solo para admin y operador */}
      {canGenerateReports && (
        <button className={styles.reportBtn} onClick={() => setIsReportModalOpen(true)}>
          <svg viewBox="0 0 16 16" width={14} height={14} fill="none">
            <rect x="2" y="1" width="12" height="14" rx="1.5" stroke="var(--dash-accent)" strokeWidth="1.2" />
            <path d="M5 5h6M5 8h6M5 11h3" stroke="var(--dash-accent)" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="12.5" cy="11.5" r="3" fill="var(--dash-panel)" stroke="var(--dash-accent)" strokeWidth="1" />
            <path d="M11.5 11.5h2M12.5 10.5v2" stroke="var(--dash-accent)" strokeWidth="1" strokeLinecap="round" />
          </svg>
          <span className={styles.reportBtnText}>Generar Informe de Inteligencia</span>
        </button>
      )}

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        filtros={currentFiltros}
      />
    </div>
  );
}
