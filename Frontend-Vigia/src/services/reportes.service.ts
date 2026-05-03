import { reportesClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { FiltrosDashboard } from '../types/estadisticas.types';

export interface FiltrosReporte {
  fechaInicio:    string;   // YYYY-MM-DD
  fechaFin:       string;
  municipio?:     string;
  categoria?:     string;
  actor1?:        string;
  nivelConfianza?: string;
}

export const reportesService = {
  /** Vista previa de los datos que incluirá el reporte (responde JSON). */
  async previsualizar(filtros: FiltrosDashboard) {
    const { data } = await reportesClient.get(ENDPOINTS.reportes.previsualizar, {
      params: filtros,
    });
    return data;
  },

  /**
   * Genera y descarga el reporte como archivo Excel.
   * Devuelve un Blob; el componente es responsable de disparar la descarga.
   */
  async descargar(filtros: FiltrosReporte): Promise<Blob> {
    const { data } = await reportesClient.get<Blob>(ENDPOINTS.reportes.descargar, {
      params: filtros,
      responseType: 'blob',
    });
    return data;
  },

  /** Número de clientes SSE conectados actualmente. */
  async getEstadoSSE(): Promise<number> {
    const { data } = await reportesClient.get<number>(ENDPOINTS.reportes.sseStatus);
    return data;
  },

  /**
   * Helper: dispara descarga de un Blob en el navegador.
   * @param blob  Blob del archivo Excel
   * @param nombre  Nombre del archivo (sin extensión)
   */
  triggerDownload(blob: Blob, nombre = 'reporte-vigia'): void {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = `${nombre}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
