import { reportesClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { FiltrosDashboard } from '../types/estadisticas.types';

function formatMunicipio(municipio: string): string {
  if (!municipio || municipio === 'Todos') return municipio;
  const lowers = ['de', 'del', 'la', 'las', 'el', 'los', 'y'];
  return municipio.toLowerCase().split(' ').map((word, index) => {
    if (index !== 0 && lowers.includes(word)) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

function toParams(filtros?: FiltrosDashboard): Record<string, string> {
  if (!filtros) return {};
  const params: Record<string, string> = {};
  if (filtros.anio != null)            params.anio            = String(filtros.anio);
  if (filtros.mes != null)             params.mes             = String(filtros.mes);
  if (filtros.municipio)               params.municipio       = formatMunicipio(filtros.municipio);
  if (filtros.categoria)               params.categoria       = filtros.categoria;
  if (filtros.actor)                   params.actor           = filtros.actor;
  if (filtros.nivelConfianza)          params.nivelConfianza  = filtros.nivelConfianza;
  if (filtros.genero)                  params.genero          = filtros.genero;
  if (filtros.grupoPoblacional)        params.grupoPoblacional = filtros.grupoPoblacional;
  return params;
}

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
      params: toParams(filtros),
    });
    return data;
  },

  /**
   * Genera y descarga el reporte como archivo Excel.
   * Devuelve un Blob; el componente es responsable de disparar la descarga.
   */
  async descargar(filtros: FiltrosReporte): Promise<Blob> {
    const params = { ...filtros };
    if (params.municipio) {
      params.municipio = formatMunicipio(params.municipio);
    }
    const { data } = await reportesClient.get<Blob>(ENDPOINTS.reportes.descargar, {
      params,
      responseType: 'blob',
    });
    return data;
  },

  /**
   * Genera y descarga el reporte como PDF gráfico.
   * Acepta los mismos filtros del dashboard (anio, mes, municipio, categoria, actor…).
   */
  async descargarPDF(filtros: FiltrosDashboard): Promise<Blob> {
    const params = toParams(filtros);
    const { data } = await reportesClient.get<Blob>(ENDPOINTS.reportes.descargarPdf, {
      params,
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
   * @param blob     Blob del archivo
   * @param nombre   Nombre del archivo (sin extensión)
   * @param ext      Extensión del archivo ('xlsx' | 'pdf')
   */
  triggerDownload(blob: Blob, nombre = 'reporte-vigia', ext: 'xlsx' | 'pdf' = 'xlsx'): void {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = `${nombre}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
