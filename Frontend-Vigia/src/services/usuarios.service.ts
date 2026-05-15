import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
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
  /** Lista paginada con filtros opcionales */
  list: (filter?: UsuariosFilter) =>
    apiClient
      .get<UsuariosPageResponse>(ENDPOINTS.usuarios.base, { params: filter })
      .then((r) => r.data),

  /** Obtener por UUID */
  getById: (id: string) =>
    apiClient
      .get<UsuarioResponseDTO>(ENDPOINTS.usuarios.porId(id))
      .then((r) => r.data),

  /** Obtener por ID de Keycloak/IAM */
  getByIdIam: (idIam: string) =>
    apiClient
      .get<UsuarioResponseDTO>(ENDPOINTS.usuarios.porAuth0Id(idIam))
      .then((r) => r.data),

  /** Crear nuevo usuario (ADMIN only) */
  create: (payload: UsuarioCreateDTO) =>
    apiClient
      .post<UsuarioResponseDTO>(ENDPOINTS.usuarios.registrar, payload)
      .then((r) => r.data),

  /** Editar usuario completo (ADMIN only) */
  update: (id: string, payload: UsuarioUpdateDTO) =>
    apiClient
      .put<UsuarioResponseDTO>(ENDPOINTS.usuarios.porId(id), payload)
      .then((r) => r.data),

  /** Soft-delete: pasa el usuario a INACTIVO */
  delete: (id: string) =>
    apiClient
      .delete<void>(ENDPOINTS.usuarios.porId(id))
      .then((r) => r.data),

  /** Perfil propio del usuario autenticado */
  getMe: () =>
    apiClient
      .get<UsuarioResponseDTO>(ENDPOINTS.usuarios.me)
      .then((r) => r.data),

  /** Validar si una cédula ya existe (para validación en tiempo real) */
  validateCedula: (cedula: string) =>
    apiClient
      .get<boolean>(`${ENDPOINTS.usuarios.base}/validate/cedula/${cedula}`)
      .then((r) => r.data),

  /** Validar si un email ya existe (para validación en tiempo real) */
  validateEmail: (email: string) =>
    apiClient
      .get<boolean>(`${ENDPOINTS.usuarios.base}/validate/email`, { params: { email } })
      .then((r) => r.data),

  /** Validar si un username ya existe (para validación en tiempo real) */
  validateUsername: (username: string) =>
    apiClient
      .get<boolean>(`${ENDPOINTS.usuarios.base}/validate/username`, { params: { username } })
      .then((r) => r.data),
};
