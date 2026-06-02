import { ubicacionesClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { cacheService, TTL } from './cache.service';
import type { MunicipioDTORespuesta } from '../types/ubicaciones.types';

export const ubicacionesService = {
  /** Lista todos los municipios — cacheado 24h (datos estáticos) */
  async getMunicipios(): Promise<MunicipioDTORespuesta[]> {
    return cacheService.remember('municipios', TTL.MUNICIPIOS, async () => {
      const { data } = await ubicacionesClient.get<MunicipioDTORespuesta[]>(
        ENDPOINTS.ubicaciones.municipios,
      );
      return data;
    });
  },

  async getMunicipioPorId(id: string): Promise<MunicipioDTORespuesta> {
    return cacheService.remember(`municipio:${id}`, TTL.MUNICIPIOS, async () => {
      const { data } = await ubicacionesClient.get<MunicipioDTORespuesta>(
        ENDPOINTS.ubicaciones.municipioPorId(id),
      );
      return data;
    });
  },
};
