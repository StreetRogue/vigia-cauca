import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import type {
  UsuarioResponseDTO,
  UsuarioCreatePayload,
  UsuarioUpdatePayload,
  PageResponseDTO,
  UsuariosFilter,
} from '../types/usuarios.types';

export const usuariosService = {
  /** Lista paginada con filtros opcionales */
  list: (filter?: UsuariosFilter) =>
    apiClient
      .get<PageResponseDTO<UsuarioResponseDTO>>(ENDPOINTS.usuarios.base, { params: filter })
      .then((r) => r.data),

  /** Obtener por UUID */
  getById: (id: string) =>
    apiClient
      .get<UsuarioResponseDTO>(ENDPOINTS.usuarios.porId(id))
      .then((r) => r.data),

  /** Crear nuevo usuario (ADMIN only) */
  create: (payload: UsuarioCreatePayload) =>
    apiClient
      .post<UsuarioResponseDTO>(ENDPOINTS.usuarios.registrar, payload)
      .then((r) => r.data),

  /** Editar usuario completo (ADMIN only) */
  update: (id: string, payload: UsuarioUpdatePayload) =>
    apiClient
      .put<UsuarioResponseDTO>(ENDPOINTS.usuarios.porId(id), payload)
      .then((r) => r.data),

  /** Cambiar solo el estado ACTIVO / INACTIVO */
  toggleEstado: (id: string, estado: 'ACTIVO' | 'INACTIVO') =>
    apiClient
      .put<UsuarioResponseDTO>(ENDPOINTS.usuarios.porId(id), { estado })
      .then((r) => r.data),

  /** Soft-delete: pasa el usuario a INACTIVO en IAM + DB */
  delete: (id: string) =>
    apiClient
      .delete<void>(ENDPOINTS.usuarios.porId(id))
      .then((r) => r.data),

  /** Perfil propio del usuario autenticado */
  getMe: () =>
    apiClient
      .get<UsuarioResponseDTO>(ENDPOINTS.usuarios.me)
      .then((r) => r.data),

  /** Cambiar contraseña propia */
  changePassword: (password: string) =>
    apiClient
      .patch<void>(ENDPOINTS.usuarios.mePassword, { password })
      .then((r) => r.data),
};
