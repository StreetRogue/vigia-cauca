import { useState, useEffect, useCallback } from 'react';
import { estadisticasService } from '../services/estadisticas.service';
import type { DashboardCompletoDTO, FiltrosDashboard } from '../types/estadisticas.types';

interface UseComparacionReturn {
  dataA: DashboardCompletoDTO | null;
  dataB: DashboardCompletoDTO | null;
  loading: boolean;
  error: string | null;
  refetch: (fA?: FiltrosDashboard, fB?: FiltrosDashboard) => void;
}

/**
 * Carga dos periodos en paralelo para la vista de comparación.
 * Usa Promise.all para minimizar el tiempo de espera.
 */
export function useComparacion(
  initialFiltrosA?: FiltrosDashboard,
  initialFiltrosB?: FiltrosDashboard,
): UseComparacionReturn {
  const [dataA, setDataA] = useState<DashboardCompletoDTO | null>(null);
  const [dataB, setDataB] = useState<DashboardCompletoDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const fetchBoth = useCallback(
    async (fA?: FiltrosDashboard, fB?: FiltrosDashboard) => {
      setLoading(true);
      setError(null);
      try {
        const [resA, resB] = await Promise.all([
          estadisticasService.getDashboard(fA),
          estadisticasService.getDashboard(fB),
        ]);
        setDataA(resA);
        setDataB(resB);
      } catch (e) {
        console.error('[Vigia] Error en comparación:', e);
        setError('No se pudieron cargar los datos de comparación');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchBoth(initialFiltrosA, initialFiltrosB);
    // Solo al montar; actualizaciones manuales via refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchBoth]);

  return { dataA, dataB, loading, error, refetch: fetchBoth };
}
