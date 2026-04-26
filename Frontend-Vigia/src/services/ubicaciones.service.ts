import { ubicacionesClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { MunicipioDTORespuesta } from '../types/ubicaciones.types';

export const ubicacionesService = {
  /** Lista todos los municipios del departamento del Cauca. */
  async getMunicipios(): Promise<MunicipioDTORespuesta[]> {
    const { data } = await ubicacionesClient.get<MunicipioDTORespuesta[]>(
      ENDPOINTS.ubicaciones.municipios,
    );
    return data;
  },

  async getMunicipioPorId(id: string): Promise<MunicipioDTORespuesta> {
    const { data } = await ubicacionesClient.get<MunicipioDTORespuesta>(
      ENDPOINTS.ubicaciones.municipioPorId(id),
    );
    return data;
  },
};
