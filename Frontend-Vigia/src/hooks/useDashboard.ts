import { useState, useEffect, useCallback } from 'react';
import { estadisticasService } from '../services/estadisticas.service';
import type { DashboardCompletoDTO, FiltrosDashboard } from '../types/estadisticas.types';

interface UseDashboardReturn {
  data:     DashboardCompletoDTO | null;
  loading:  boolean;
  error:    string | null;
  refetch:  (filtros?: FiltrosDashboard) => void;
}

/**
 * Carga el dashboard completo desde el MicroservicioReportes.
 * Equivalente al ClientDashboardFacade de Barba-Negra.
 *
 * @param filtros  Filtros opcionales iniciales (año, mes, municipio, etc.)
 *
 * @example
 * const { data, loading, error, refetch } = useDashboard({ anio: 2025 });
 */
export function useDashboard(filtros?: FiltrosDashboard): UseDashboardReturn {
  const [data, setData]       = useState<DashboardCompletoDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchDashboard = useCallback(async (f?: FiltrosDashboard) => {
    setLoading(true);
    setError(null);
    try {
      const result = await estadisticasService.getDashboard(f);
      setData(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar el dashboard';
      setError(msg);
      console.error('[useDashboard]', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(filtros);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetch = useCallback((f?: FiltrosDashboard) => {
    fetchDashboard(f ?? filtros);
  }, [fetchDashboard, filtros]);

  return { data, loading, error, refetch };
}
