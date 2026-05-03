import { useSearchParams } from 'react-router-dom';
import { EstadisticasTemplate } from '../components/templates/EstadisticasTemplate/EstadisticasTemplate';
import { ComparacionTemplate } from '../components/templates/ComparacionTemplate/ComparacionTemplate';

/**
 * Pantalla de estadísticas con dos modos:
 *  - "analisis"  → bento grid completo (/estadisticas)
 *  - "comparar"  → split screen de dos períodos (/estadisticas?modo=comparar)
 */
export function EstadisticasScreen() {
  const [searchParams] = useSearchParams();
  const modo = searchParams.get('modo') ?? 'analisis';

  if (modo === 'comparar') {
    return <ComparacionTemplate />;
  }

  return <EstadisticasTemplate />;
}
