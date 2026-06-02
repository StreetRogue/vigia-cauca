import { reportesClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { cacheService, TTL } from './cache.service';
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
  if (filtros.usuarioId)               params.usuarioId       = filtros.usuarioId;
  return params;
}

// ── Servicio de estadísticas ──────────────────────────────────────────────────

export const estadisticasService = {
  /**
   * Obtiene el dashboard completo en una sola llamada — cacheado 3 min.
   */
  async getDashboard(filtros?: FiltrosDashboard): Promise<DashboardCompletoDTO> {
    const key = cacheService.buildKey('dashboard', toParams(filtros) as Record<string, unknown>);
    return cacheService.remember(key, TTL.DASHBOARD, async () => {
      const { data } = await reportesClient.get<DashboardCompletoDTO>(
        ENDPOINTS.estadisticas.dashboard,
        { params: toParams(filtros) },
      );
      return data;
    });
  },

  /** Solo KPIs — cacheado 3 min. */
  async getResumen(filtros?: FiltrosDashboard): Promise<ResumenKPIDTO> {
    const key = cacheService.buildKey('resumen', toParams(filtros) as Record<string, unknown>);
    return cacheService.remember(key, TTL.ESTADISTICAS, async () => {
      const { data } = await reportesClient.get<ResumenKPIDTO>(
        ENDPOINTS.estadisticas.resumen,
        { params: toParams(filtros) },
      );
      return data;
    });
  },

  /** Serie temporal — cacheada 3 min. */
  async getSerieTemporal(filtros?: FiltrosDashboard): Promise<SerieTemporalDTO[]> {
    const key = cacheService.buildKey('serieTemporal', toParams(filtros) as Record<string, unknown>);
    return cacheService.remember(key, TTL.ESTADISTICAS, async () => {
      const { data } = await reportesClient.get<SerieTemporalDTO[]>(
        ENDPOINTS.estadisticas.serieTemporal,
        { params: toParams(filtros) },
      );
      return data;
    });
  },

  /** Distribución por actor — cacheada 3 min. */
  async getPorActor(filtros?: FiltrosDashboard): Promise<EstadisticaActorDTO[]> {
    const key = cacheService.buildKey('porActor', toParams(filtros) as Record<string, unknown>);
    return cacheService.remember(key, TTL.ESTADISTICAS, async () => {
      const { data } = await reportesClient.get<EstadisticaActorDTO[]>(
        ENDPOINTS.estadisticas.porActor,
        { params: toParams(filtros) },
      );
      return data;
    });
  },

  /** Mapa de calor por municipio — cacheado 3 min. */
  async getMapaCalor(filtros?: FiltrosDashboard): Promise<EstadisticaMunicipioDTO[]> {
    const key = cacheService.buildKey('mapaCalor', toParams(filtros) as Record<string, unknown>);
    return cacheService.remember(key, TTL.ESTADISTICAS, async () => {
      const { data } = await reportesClient.get<EstadisticaMunicipioDTO[]>(
        ENDPOINTS.estadisticas.mapaCalor,
        { params: toParams(filtros) },
      );
      return data;
    });
  },

  /** Desglose por categoría — cacheado 3 min. */
  async getPorCategoria(filtros?: FiltrosDashboard): Promise<EstadisticaCategoriaDTO[]> {
    const key = cacheService.buildKey('porCategoria', toParams(filtros) as Record<string, unknown>);
    return cacheService.remember(key, TTL.ESTADISTICAS, async () => {
      const { data } = await reportesClient.get<EstadisticaCategoriaDTO[]>(
        ENDPOINTS.estadisticas.porCategoria,
        { params: toParams(filtros) },
      );
      return data;
    });
  },

  /**
   * Invalida todo el caché del dashboard (llamar cuando se crea/edita/elimina una novedad).
   * Como las claves de operador incluyen el usuarioId en el prefijo, el invalidate
   * por prefijo borra tanto las entradas globales como las filtradas por usuario.
   */
  invalidarCache(): void {
    cacheService.invalidate('dashboard');
    cacheService.invalidate('resumen');
    cacheService.invalidate('serieTemporal');
    cacheService.invalidate('porActor');
    cacheService.invalidate('mapaCalor');
    cacheService.invalidate('porCategoria');
  },
};
