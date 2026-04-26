import { novedadesClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type {
  NovedadDTOPeticion,
  NovedadDTORespuesta,
  FiltrosNovedad,
  PaginadoParams,
  PageResponse,
  VictimaDTOPeticion,
  VictimaDTORespuesta,
  AuditoriaDTORespuesta,
} from '../types/novedad.types';

export const novedadesService = {
  // ── CRUD principal ──────────────────────────────────────────────────────────

  /** Crea una novedad (solo JSON, sin imágenes). */
  async crear(data: NovedadDTOPeticion): Promise<NovedadDTORespuesta> {
    const { data: res } = await novedadesClient.post<NovedadDTORespuesta>(
      ENDPOINTS.novedades.base,
      data,
    );
    return res;
  },

  /**
   * Crea una novedad junto con imágenes de evidencia (multipart/form-data).
   * @param datos  Objeto JSON de la novedad
   * @param imagenes  Archivos de imagen
   */
  async crearConImagenes(
    datos: NovedadDTOPeticion,
    imagenes: File[],
  ): Promise<NovedadDTORespuesta> {
    const formData = new FormData();
    formData.append('datos', new Blob([JSON.stringify(datos)], { type: 'application/json' }));
    imagenes.forEach((img) => formData.append('imagenes', img));

    const { data: res } = await novedadesClient.post<NovedadDTORespuesta>(
      ENDPOINTS.novedades.base,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res;
  },

  /** Obtiene una novedad por su UUID. */
  async obtenerPorId(id: string): Promise<NovedadDTORespuesta> {
    const { data } = await novedadesClient.get<NovedadDTORespuesta>(
      ENDPOINTS.novedades.porId(id),
    );
    return data;
  },

  /** Lista todas las novedades (sin paginado). */
  async listar(): Promise<NovedadDTORespuesta[]> {
    const { data } = await novedadesClient.get<NovedadDTORespuesta[]>(
      ENDPOINTS.novedades.base,
    );
    return data;
  },

  /** Lista novedades con paginado. */
  async listarPaginado(params: PaginadoParams): Promise<PageResponse<NovedadDTORespuesta>> {
    const { data } = await novedadesClient.get<PageResponse<NovedadDTORespuesta>>(
      ENDPOINTS.novedades.paginado,
      { params },
    );
    return data;
  },

  /** Filtra novedades por criterios opcionales. */
  async filtrar(filtros: FiltrosNovedad): Promise<NovedadDTORespuesta[]> {
    const params: Record<string, string> = {};
    if (filtros.fechaInicio)      params.fechaInicio      = filtros.fechaInicio;
    if (filtros.fechaFin)         params.fechaFin         = filtros.fechaFin;
    if (filtros.municipio)        params.municipio        = filtros.municipio;
    if (filtros.categoria)        params.categoria        = filtros.categoria;
    if (filtros.nivelVisibilidad) params.nivelVisibilidad = filtros.nivelVisibilidad;

    const { data } = await novedadesClient.get<NovedadDTORespuesta[]>(
      ENDPOINTS.novedades.filtrar,
      { params },
    );
    return data;
  },

  /** Lista novedades creadas por un usuario específico. */
  async listarPorUsuario(usuarioId: string): Promise<NovedadDTORespuesta[]> {
    const { data } = await novedadesClient.get<NovedadDTORespuesta[]>(
      ENDPOINTS.novedades.porUsuario(usuarioId),
    );
    return data;
  },

  /** Actualiza una novedad existente. */
  async actualizar(id: string, data: NovedadDTOPeticion): Promise<NovedadDTORespuesta> {
    const { data: res } = await novedadesClient.put<NovedadDTORespuesta>(
      ENDPOINTS.novedades.porId(id),
      data,
    );
    return res;
  },

  /** Soft-delete de una novedad. */
  async eliminar(id: string, usuarioId: string): Promise<void> {
    await novedadesClient.delete(ENDPOINTS.novedades.porId(id), {
      params: { usuarioId },
    });
  },

  // ── Excel ───────────────────────────────────────────────────────────────────

  /** Descarga la plantilla Excel vacía para carga masiva. */
  async descargarPlantilla(): Promise<Blob> {
    const { data } = await novedadesClient.get<Blob>(
      ENDPOINTS.novedades.plantillaExcel,
      { responseType: 'blob' },
    );
    return data;
  },

  /** Carga novedades masivamente desde un archivo Excel. */
  async cargarExcel(archivo: File, usuarioId: string): Promise<NovedadDTORespuesta[]> {
    const formData = new FormData();
    formData.append('archivo', archivo);

    const { data } = await novedadesClient.post<NovedadDTORespuesta[]>(
      ENDPOINTS.novedades.cargaExcel,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: { usuarioId },
      },
    );
    return data;
  },

  // ── Víctimas ────────────────────────────────────────────────────────────────

  async agregarVictima(novedadId: string, victima: VictimaDTOPeticion): Promise<VictimaDTORespuesta> {
    const { data } = await novedadesClient.post<VictimaDTORespuesta>(
      ENDPOINTS.novedades.victimas(novedadId),
      victima,
    );
    return data;
  },

  async listarVictimas(novedadId: string): Promise<VictimaDTORespuesta[]> {
    const { data } = await novedadesClient.get<VictimaDTORespuesta[]>(
      ENDPOINTS.novedades.victimas(novedadId),
    );
    return data;
  },

  async eliminarVictima(novedadId: string, victimaId: string): Promise<void> {
    await novedadesClient.delete(ENDPOINTS.novedades.victimaPorId(novedadId, victimaId));
  },

  // ── Auditoría ───────────────────────────────────────────────────────────────

  async obtenerAuditoria(novedadId: string): Promise<AuditoriaDTORespuesta[]> {
    const { data } = await novedadesClient.get<AuditoriaDTORespuesta[]>(
      ENDPOINTS.novedades.auditorias(novedadId),
    );
    return data;
  },
};
