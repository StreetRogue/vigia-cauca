import { reportesClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { FiltrosDashboard, DashboardCompletoDTO, ResumenKPIDTO, SerieTemporalDTO, EstadisticaActorDTO, EstadisticaMunicipioDTO, EstadisticaCategoriaDTO } from '../types/estadisticas.types';

// ── Helper: convierte filtros en query params (omite undefined/null) ───────────
function toParams(filtros?: FiltrosDashboard): Record<string, string> {
  if (!filtros) return {};
  const params: Record<string, string> = {};
  if (filtros.anio != null)            params.anio            = String(filtros.anio);
  if (filtros.mes != null)             params.mes             = String(filtros.mes);
  if (filtros.municipio)               params.municipio       = filtros.municipio;
  if (filtros.categoria)               params.categoria       = filtros.categoria;
  if (filtros.actor)                   params.actor           = filtros.actor;
  if (filtros.nivelConfianza)          params.nivelConfianza  = filtros.nivelConfianza;
  if (filtros.genero)                  params.genero          = filtros.genero;
  if (filtros.grupoPoblacional)        params.grupoPoblacional = filtros.grupoPoblacional;
  return params;
}

// ── Servicio de estadísticas ──────────────────────────────────────────────────

export const estadisticasService = {
  /**
   * Obtiene el dashboard completo en una sola llamada.
   * Usar este endpoint cuando se cargue la página principal del dashboard.
   */
  async getDashboard(filtros?: FiltrosDashboard): Promise<DashboardCompletoDTO> {
    const { data } = await reportesClient.get<DashboardCompletoDTO>(
      ENDPOINTS.estadisticas.dashboard,
      { params: toParams(filtros) },
    );
    return data;
  },

  /** Solo KPIs (5 tarjetas). Útil para recargas parciales. */
  async getResumen(filtros?: FiltrosDashboard): Promise<ResumenKPIDTO> {
    const { data } = await reportesClient.get<ResumenKPIDTO>(
      ENDPOINTS.estadisticas.resumen,
      { params: toParams(filtros) },
    );
    return data;
  },

  /** Serie temporal mes a mes para gráfico de barras/líneas. */
  async getSerieTemporal(filtros?: FiltrosDashboard): Promise<SerieTemporalDTO[]> {
    const { data } = await reportesClient.get<SerieTemporalDTO[]>(
      ENDPOINTS.estadisticas.serieTemporal,
      { params: toParams(filtros) },
    );
    return data;
  },

  /** Distribución de eventos por actor armado. */
  async getPorActor(filtros?: FiltrosDashboard): Promise<EstadisticaActorDTO[]> {
    const { data } = await reportesClient.get<EstadisticaActorDTO[]>(
      ENDPOINTS.estadisticas.porActor,
      { params: toParams(filtros) },
    );
    return data;
  },

  /** Datos de intensidad por municipio para el mapa de calor. */
  async getMapaCalor(filtros?: FiltrosDashboard): Promise<EstadisticaMunicipioDTO[]> {
    const { data } = await reportesClient.get<EstadisticaMunicipioDTO[]>(
      ENDPOINTS.estadisticas.mapaCalor,
      { params: toParams(filtros) },
    );
    return data;
  },

  /** Desglose por categoría de evento. */
  async getPorCategoria(filtros?: FiltrosDashboard): Promise<EstadisticaCategoriaDTO[]> {
    const { data } = await reportesClient.get<EstadisticaCategoriaDTO[]>(
      ENDPOINTS.estadisticas.porCategoria,
      { params: toParams(filtros) },
    );
    return data;
  },
};
