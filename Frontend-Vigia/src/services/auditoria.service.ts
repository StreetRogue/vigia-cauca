import { novedadesClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { AuditoriaDTORespuesta } from '../types/novedad.types';

export const auditoriaService = {
  /** Obtiene la actividad reciente global (últimas N auditorías) */
  async obtenerActividadReciente(limite: number = 20): Promise<AuditoriaDTORespuesta[]> {
    const { data } = await novedadesClient.get<AuditoriaDTORespuesta[]>(
      `/api/v1/microNovedades/auditorias/reciente?limite=${limite}`
    );
    return data;
  },

  /** Obtiene el historial de cambios de una novedad */
  async obtenerHistorialNovedad(novedadId: string): Promise<AuditoriaDTORespuesta[]> {
    const { data } = await novedadesClient.get<AuditoriaDTORespuesta[]>(
      `/api/v1/microNovedades/auditorias/novedad/${novedadId}`
    );
    return data;
  },

  /** Obtiene todas las acciones realizadas por un usuario */
  async obtenerHistorialPorUsuario(usuarioId: string): Promise<AuditoriaDTORespuesta[]> {
    const { data } = await novedadesClient.get<AuditoriaDTORespuesta[]>(
      `/api/v1/microNovedades/auditorias/usuario/${usuarioId}`
    );
    return data;
  },
};
