import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { cacheService, TTL } from './cache.service';
import type {
  UsuarioResponseDTO,
  UsuarioCreateDTO,
  UsuarioUpdateDTO,
  UsuariosPageResponse,
} from '../types/usuario.types';

export interface UsuariosFilter {
  rol?:         string;
  estado?:      string;
  idMunicipio?: number;
  page?:        number;
  size?:        number;
}

export const usuariosService = {
  /** Lista paginada — cacheada 5 min */
  list: (filter?: UsuariosFilter) => {
    const key = cacheService.buildKey('usuarios:list', filter as Record<string, unknown>);
    return cacheService.remember(key, TTL.USUARIOS, () =>
      apiClient.get<UsuariosPageResponse>(ENDPOINTS.usuarios.base, { params: filter }).then(r => r.data)
    );
  },

  /** Obtener por UUID — cacheado 5 min */
  getById: (id: string) =>
    cacheService.remember(`usuario:${id}`, TTL.USUARIOS, () =>
      apiClient.get<UsuarioResponseDTO>(ENDPOINTS.usuarios.porId(id)).then(r => r.data)
    ),

  /** Obtener por ID de Keycloak/IAM — cacheado 5 min */
  getByIdIam: (idIam: string) =>
    cacheService.remember(`usuario:iam:${idIam}`, TTL.USUARIOS, () =>
      apiClient.get<UsuarioResponseDTO>(ENDPOINTS.usuarios.porAuth0Id(idIam)).then(r => r.data)
    ),

  /** Crear usuario — invalida lista */
  create: (payload: UsuarioCreateDTO) =>
    apiClient.post<UsuarioResponseDTO>(ENDPOINTS.usuarios.registrar, payload)
      .then(r => { cacheService.invalidate('usuarios:list'); return r.data; }),

  /** Editar usuario — invalida ese usuario y la lista */
  update: (id: string, payload: UsuarioUpdateDTO) =>
    apiClient.put<UsuarioResponseDTO>(ENDPOINTS.usuarios.porId(id), payload)
      .then(r => {
        cacheService.invalidate(`usuario:${id}`);
        cacheService.invalidate('usuarios:list');
        return r.data;
      }),

  /** Soft-delete — invalida ese usuario y la lista */
  delete: (id: string) =>
    apiClient.delete<void>(ENDPOINTS.usuarios.porId(id))
      .then(r => {
        cacheService.invalidate(`usuario:${id}`);
        cacheService.invalidate('usuarios:list');
        return r.data;
      }),

  /** Perfil propio — cacheado 5 min */
  getMe: () =>
    cacheService.remember('usuario:me', TTL.USUARIOS, () =>
      apiClient.get<UsuarioResponseDTO>(ENDPOINTS.usuarios.me).then(r => r.data)
    ),

  // Validaciones en tiempo real — NO se cachean (necesitan datos frescos)
  validateCedula: (cedula: string) =>
    apiClient.get<boolean>(`${ENDPOINTS.usuarios.base}/validate/cedula/${cedula}`).then(r => r.data),

  validateEmail: (email: string) =>
    apiClient.get<boolean>(`${ENDPOINTS.usuarios.base}/validate/email`, { params: { email } }).then(r => r.data),

  validateUsername: (username: string) =>
    apiClient.get<boolean>(`${ENDPOINTS.usuarios.base}/validate/username`, { params: { username } }).then(r => r.data),
};
