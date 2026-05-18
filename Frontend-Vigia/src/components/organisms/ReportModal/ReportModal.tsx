import { useState, useEffect } from 'react';
import { CloseButton } from '../../atoms/CloseButton';
import { reportesService } from '../../../services/reportes.service';
import type { FiltrosDashboard } from '../../../types/estadisticas.types';
import './ReportModal.css';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filtros?: FiltrosDashboard;
}

export function ReportModal({ isOpen, onClose, filtros }: ReportModalProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarVistaPrevia();
    } else {
      setData([]);
      setError('');
    }
  }, [isOpen, filtros]);

  async function cargarVistaPrevia() {
    setLoading(true);
    setError('');
    try {
      let result = await reportesService.previsualizar(filtros || {});
      console.log('[ReportModal] Backend previsualizar returned:', result.length, 'records for filtros:', filtros);

      // Aplicar filtros en el frontend para los campos que el endpoint previsualizar ignora
      if (filtros) {
        if (filtros.mes != null) {
          result = result.filter((r: any) => {
            if (!r.fechaHecho) return false;
            const parts = r.fechaHecho.split('-');
            return parts.length >= 2 && parseInt(parts[1], 10) === filtros.mes;
          });
        }

        if (filtros.actor) {
          result = result.filter((r: any) =>
            r.actor1 === filtros.actor || r.actor2 === filtros.actor ||
            (r.actoresDisplay && r.actoresDisplay.includes(filtros.actor))
          );
        }

        if (filtros.nivelConfianza) {
          result = result.filter((r: any) => r.nivelConfianza === filtros.nivelConfianza);
        }
      }

      console.log('[ReportModal] After frontend filtering:', result.length, 'records');
      setData(result || []);
    } catch (err) {
      console.error('Error al cargar vista previa:', err);
      setError('Ocurrió un error al cargar la vista previa.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    setError('');
    setDownloading(true);

    try {
      const baseFiltros = Object.fromEntries(
        Object.entries(filtros || {}).filter(([_, v]) => v !== undefined)
      ) as any;

      const filtrosDescarga: any = { ...baseFiltros };

      if (baseFiltros.anio) {
        if (baseFiltros.mes) {
          const monthStr = String(baseFiltros.mes).padStart(2, '0');
          filtrosDescarga.fechaInicio = `${baseFiltros.anio}-${monthStr}-01`;
          const ultimoDia = new Date(baseFiltros.anio, baseFiltros.mes, 0).getDate();
          filtrosDescarga.fechaFin = `${baseFiltros.anio}-${monthStr}-${String(ultimoDia).padStart(2, '0')}`;
        } else {
          filtrosDescarga.fechaInicio = `${baseFiltros.anio}-01-01`;
          filtrosDescarga.fechaFin = `${baseFiltros.anio}-12-31`;
        }
        delete filtrosDescarga.anio;
        delete filtrosDescarga.mes;
      }

      if (filtrosDescarga.actor) {
        filtrosDescarga.actor1 = filtrosDescarga.actor;
        delete filtrosDescarga.actor;
      }

      const blob = await reportesService.descargar(filtrosDescarga);
      const municipio = filtros?.municipio && filtros.municipio !== 'Todos' ? filtros.municipio : 'cauca';
      reportesService.triggerDownload(blob, `reporte_vigia_${municipio.toLowerCase()}`);
      onClose();
    } catch (err) {
      console.error('Error al generar informe:', err);
      setError('Ocurrió un error al generar el informe. Por favor, intente nuevamente.');
    } finally {
      setDownloading(false);
    }
  }

  async function handleDownloadPDF() {
    setError('');
    setDownloadingPDF(true);
    try {
      const blob = await reportesService.descargarPDF(filtros || {});
      const municipio = filtros?.municipio && filtros.municipio !== 'Todos'
        ? filtros.municipio
        : 'cauca';
      reportesService.triggerDownload(blob, `reporte_vigia_${municipio.toLowerCase()}`, 'pdf');
      onClose();
    } catch (err) {
      console.error('Error al generar PDF:', err);
      setError('Ocurrió un error al generar el PDF. Por favor, intente nuevamente.');
    } finally {
      setDownloadingPDF(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="modal-header">
          <span className="modal-title">GENERAR INFORME DE INTELIGENCIA</span>
          <div className="modal-header-right">
            <span className="modal-code">HU-INF</span>
            <CloseButton onClick={onClose} />
          </div>
        </div>

        {/* ── Body ── */}
        <div className="modal-body">
          <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
            Vista previa de los registros que se incluirán en el informe según los filtros actuales del dashboard.
          </p>

          <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid #eeeeee', borderRadius: '4px' }}>
            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', fontSize: '13px', color: '#666' }}>Cargando vista previa...</div>
            ) : data.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', fontSize: '13px', color: '#666' }}>No hay registros para los filtros seleccionados.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead style={{ background: '#f9f9f9', position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: '12px 10px', textAlign: 'left', borderBottom: '1px solid #eeeeee', color: '#555' }}>Fecha</th>
                    <th style={{ padding: '12px 10px', textAlign: 'left', borderBottom: '1px solid #eeeeee', color: '#555' }}>Municipio</th>
                    <th style={{ padding: '12px 10px', textAlign: 'left', borderBottom: '1px solid #eeeeee', color: '#555' }}>Categoría</th>
                    <th style={{ padding: '12px 10px', textAlign: 'left', borderBottom: '1px solid #eeeeee', color: '#555' }}>Actores</th>
                    <th style={{ padding: '12px 10px', textAlign: 'center', borderBottom: '1px solid #eeeeee', color: '#555' }}>Muertos</th>
                    <th style={{ padding: '12px 10px', textAlign: 'center', borderBottom: '1px solid #eeeeee', color: '#555' }}>Heridos</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f4f4f4', transition: 'background 0.2s' }}>
                      <td style={{ padding: '10px' }}>{row.fechaHecho}</td>
                      <td style={{ padding: '10px' }}>{row.municipio}</td>
                      <td style={{ padding: '10px' }}>{row.categoria?.replace(/_/g, ' ')}</td>
                      <td style={{ padding: '10px' }}>{row.actoresDisplay}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{row.muertosTotales}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{row.heridosTotales}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {error && <p className="field-error" style={{ color: '#d93025', fontSize: '12px', margin: '4px 0 0 0' }}>{error}</p>}
        </div>

        {/* ── Footer ── */}
        <div className="modal-footer">
          <div style={{ fontSize: '12px', color: '#666' }}>
            Total registros a exportar: <strong style={{ color: '#122d5d', fontSize: '14px' }}>{data.length}</strong>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" onClick={onClose} type="button">
              CANCELAR
            </button>
            <button
              className="btn-secondary"
              onClick={handleDownloadPDF}
              disabled={downloadingPDF || downloading || data.length === 0}
              type="button"
              title="Descargar reporte gráfico en PDF"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {downloadingPDF ? 'GENERANDO PDF...' : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  DESCARGAR PDF
                </>
              )}
            </button>
            <button
              className="btn-primary"
              onClick={handleDownload}
              disabled={downloading || downloadingPDF || data.length === 0}
              type="button"
            >
              {downloading ? 'GENERANDO...' : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  DESCARGAR EXCEL
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
