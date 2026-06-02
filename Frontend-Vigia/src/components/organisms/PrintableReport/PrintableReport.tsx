import React from 'react';
import type { FiltrosDashboard } from '../../../types/estadisticas.types';
import styles from './PrintableReport.module.css';

interface PrintableReportProps {
  filtros: FiltrosDashboard;
  dashboardData: any;
  tableData: any[];
}

export const PrintableReport = React.forwardRef<HTMLDivElement, PrintableReportProps>(
  ({ filtros, dashboardData, tableData }, ref) => {
    const d = new Date();
    const fechaExpedicion = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

    // Helper para formatear los filtros como texto
    const getFiltrosTexto = () => {
      const parts = [];
      if (filtros.anio) parts.push(`Año: ${filtros.anio}`);
      if (filtros.mes) parts.push(`Mes: ${filtros.mes}`);
      if (filtros.municipio && filtros.municipio !== 'Todos') parts.push(`Municipio: ${filtros.municipio}`);
      if (filtros.categoria) parts.push(`Categoría: ${filtros.categoria.replace(/_/g, ' ')}`);
      if (filtros.actor) parts.push(`Actor: ${filtros.actor.replace(/_/g, ' ')}`);
      return parts.length > 0 ? parts.join(' | ') : 'Todos los municipios — Período histórico completo';
    };

    const resumen = dashboardData?.resumen || {};
    const actores = dashboardData?.incidentesPorActor || [];
    const categorias = dashboardData?.desgloseCategorias || [];
    const municipios = dashboardData?.mapaCalor || [];
    const victimas = dashboardData?.estadisticasVictimas || {};

    // Calculamos máximos para las barras
    const maxActor = Math.max(...actores.map((a: any) => a.totalEventos), 1);
    const maxCat = Math.max(...categorias.map((c: any) => c.totalEventos), 1);
    const maxMun = Math.max(...municipios.map((m: any) => m.totalEventos), 1);

    return (
      <div ref={ref} className={styles.printableRoot}>
        {/* -- ENCABEZADO -- */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1>VIGÍA CAUCA</h1>
            <h2>Informe de Situación de Seguridad</h2>
          </div>
          <div className={styles.metaSection}>
            <p><strong>Gobernación del Cauca</strong></p>
            <p>Fecha de expedición: {fechaExpedicion}</p>
            <p>Clasificación: DOCUMENTO INTERNO</p>
            <p style={{ marginTop: '5px', color: '#3b82f6' }}>{getFiltrosTexto()}</p>
          </div>
        </div>

        {/* -- KPIs -- */}
        <div className={styles.kpiGrid}>
          <div className={`${styles.kpiCard} ${styles.primary}`}>
            <p className={styles.kpiValue}>{resumen.totalEventos || 0}</p>
            <p className={styles.kpiLabel}>Total Eventos</p>
          </div>
          <div className={styles.kpiCard}>
            <p className={styles.kpiValue}>{resumen.totalMuertos || 0}</p>
            <p className={styles.kpiLabel}>Muertos</p>
          </div>
          <div className={styles.kpiCard}>
            <p className={styles.kpiValue}>{resumen.totalHeridos || 0}</p>
            <p className={styles.kpiLabel}>Heridos</p>
          </div>
          <div className={styles.kpiCard}>
            <p className={styles.kpiValue}>{resumen.totalDesplazados || 0}</p>
            <p className={styles.kpiLabel}>Desplazados</p>
          </div>
        </div>

        {/* -- SECCIÓN 1: Actores y Categorías -- */}
        <div className={styles.row}>
          <div className={styles.col}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Distribución por Actor Armado</h3>
              <div className={styles.barChart}>
                {actores.slice(0, 8).map((a: any, i: number) => (
                  <div key={i} className={styles.barRow}>
                    <div className={styles.barLabel}>{a.actor ? a.actor.replace(/_/g, ' ') : 'Desconocido'}</div>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ width: `${(a.totalEventos / maxActor) * 100}%` }}></div>
                    </div>
                    <div className={styles.barValue}>{a.totalEventos}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.col}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Eventos por Categoría</h3>
              <div className={styles.barChart}>
                {categorias.slice(0, 8).map((c: any, i: number) => (
                  <div key={i} className={styles.barRow}>
                    <div className={styles.barLabel}>{c.categoria ? c.categoria.replace(/_/g, ' ') : 'Otra'}</div>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ width: `${(c.totalEventos / maxCat) * 100}%`, background: '#f59e0b' }}></div>
                    </div>
                    <div className={styles.barValue}>{c.totalEventos}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* -- SECCIÓN 2: Municipios y Víctimas -- */}
        <div className={styles.row}>
          <div className={styles.col}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Municipios más Afectados</h3>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Municipio</th>
                    <th className={styles.numeric}>Eventos</th>
                    <th className={styles.numeric}>Víctimas</th>
                  </tr>
                </thead>
                <tbody>
                  {municipios.slice(0, 8).map((m: any, i: number) => (
                    <tr key={i}>
                      <td>{m.municipio}</td>
                      <td className={styles.numeric}>{m.totalEventos}</td>
                      <td className={styles.numeric}>{(m.totalMuertos || 0) + (m.totalHeridos || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className={styles.col}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Estadísticas de Víctimas</h3>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Género</th>
                    <th className={styles.numeric}>Frecuencia</th>
                    <th className={styles.numeric}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {(victimas.porGenero || []).map((g: any, i: number) => (
                    <tr key={i}>
                      <td>{g.genero || 'SIN DATO'}</td>
                      <td className={styles.numeric}>{g.frecuenciaAbsoluta || 0}</td>
                      <td className={styles.numeric}>{(g.frecuenciaRelativa || 0).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: '15px' }}></div>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Grupo Poblacional</th>
                    <th className={styles.numeric}>Frecuencia</th>
                  </tr>
                </thead>
                <tbody>
                  {(victimas.porGrupoPoblacional || []).slice(0, 4).map((g: any, i: number) => (
                    <tr key={i}>
                      <td>{g.grupoPoblacional ? g.grupoPoblacional.replace(/_/g, ' ') : 'SIN DATO'}</td>
                      <td className={styles.numeric}>{g.frecuenciaAbsoluta || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* -- DETALLE DE EVENTOS (Nueva página si es necesario, pero como la altura es grande, puede requerir pageBreak) -- */}
        {tableData && tableData.length > 0 && (
          <div className={styles.section} style={{ marginTop: '30px' }}>
            <h3 className={styles.sectionTitle}>Detalle de Eventos ({Math.min(tableData.length, 50)} registros)</h3>
            <table className={styles.eventsTable}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Municipio</th>
                  <th>Categoría</th>
                  <th>Actores</th>
                  <th style={{ textAlign: 'center' }}>M / H</th>
                </tr>
              </thead>
              <tbody>
                {tableData.slice(0, 50).map((row, i) => (
                  <tr key={i}>
                    <td>{row.fechaHecho}</td>
                    <td>{row.municipio}</td>
                    <td>{row.categoria?.replace(/_/g, ' ')}</td>
                    <td>{row.actoresDisplay}</td>
                    <td style={{ textAlign: 'center' }}>{row.muertosTotales} / {row.heridosTotales}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tableData.length > 50 && (
              <p style={{ fontSize: '8pt', color: '#64748b', marginTop: '10px', fontStyle: 'italic' }}>
                ... y {tableData.length - 50} registros más. Descargue el Excel para el conjunto completo.
              </p>
            )}
          </div>
        )}

        <div className={styles.footer}>
          Vigía Cauca — Gobernación del Cauca | Documento generado automáticamente
        </div>
      </div>
    );
  }
);

PrintableReport.displayName = 'PrintableReport';
