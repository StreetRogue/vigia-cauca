import { useState, useCallback } from 'react';
import { novedadesService } from '../services/novedades.service';
import type {
  NovedadDTOPeticion,
  NovedadDTORespuesta,
  FiltrosNovedad,
  PaginadoParams,
  PageResponse,
} from '../types/novedad.types';

interface UseNovedadesReturn {
  loading:   boolean;
  error:     string | null;
  /** Crea novedad (sin imágenes). Devuelve la novedad creada o null si falla. */
  crear:     (data: NovedadDTOPeticion) => Promise<NovedadDTORespuesta | null>;
  /** Crea novedad con archivos de evidencia. */
  crearConImagenes: (data: NovedadDTOPeticion, imagenes: File[]) => Promise<NovedadDTORespuesta | null>;
  /** Lista paginada de novedades. */
  listarPaginado: (params: PaginadoParams) => Promise<PageResponse<NovedadDTORespuesta> | null>;
  /** Lista filtrada de novedades. */
  filtrar:   (filtros: FiltrosNovedad) => Promise<NovedadDTORespuesta[] | null>;
  /** Actualiza una novedad. */
  actualizar: (id: string, data: NovedadDTOPeticion) => Promise<NovedadDTORespuesta | null>;
  /** Elimina (soft-delete) una novedad. */
  eliminar:  (id: string, usuarioId: string) => Promise<boolean>;
  /** Carga masiva desde Excel. */
  cargarExcel: (archivo: File, usuarioId: string) => Promise<NovedadDTORespuesta[] | null>;
  clearError: () => void;
}

/**
 * Hook para operaciones CRUD sobre novedades.
 * Equivalente al ReservaFacade de Barba-Negra.
 */
export function useNovedades(): UseNovedadesReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const withLoading = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        return await fn();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error inesperado';
        setError(msg);
        console.error('[useNovedades]', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const crear = useCallback(
    (data: NovedadDTOPeticion) => withLoading(() => novedadesService.crear(data)),
    [withLoading],
  );

  const crearConImagenes = useCallback(
    (data: NovedadDTOPeticion, imagenes: File[]) =>
      withLoading(() => novedadesService.crearConImagenes(data, imagenes)),
    [withLoading],
  );

  const listarPaginado = useCallback(
    (params: PaginadoParams) => withLoading(() => novedadesService.listarPaginado(params)),
    [withLoading],
  );

  const filtrar = useCallback(
    (filtros: FiltrosNovedad) => withLoading(() => novedadesService.filtrar(filtros)),
    [withLoading],
  );

  const actualizar = useCallback(
    (id: string, data: NovedadDTOPeticion) =>
      withLoading(() => novedadesService.actualizar(id, data)),
    [withLoading],
  );

  const eliminar = useCallback(
    async (id: string, usuarioId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await novedadesService.eliminar(id, usuarioId);
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al eliminar';
        setError(msg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const cargarExcel = useCallback(
    (archivo: File, usuarioId: string) =>
      withLoading(() => novedadesService.cargarExcel(archivo, usuarioId)),
    [withLoading],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    crear,
    crearConImagenes,
    listarPaginado,
    filtrar,
    actualizar,
    eliminar,
    cargarExcel,
    clearError,
  };
}
