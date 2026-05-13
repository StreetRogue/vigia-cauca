import { usuariosClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type {
  UsuarioResponseDTO,
  UsuarioCreateDTO,
  UsuarioUpdateDTO,
  UsuariosPageResponse,
} from '../types/usuario.types';

export interface ListarUsuariosParams {
  rol?:         string;
  estado?:      string;
  idMunicipio?: number;
  page?:        number;
  size?:        number;
}

export const usuariosService = {
  /** Lista usuarios con paginado y filtros opcionales. */
  async listarPaginado(params: ListarUsuariosParams = {}): Promise<UsuariosPageResponse> {
    const { data } = await usuariosClient.get<UsuariosPageResponse>(
      ENDPOINTS.usuarios.base,
      { params },
    );
    return data;
  },

  /** Obtiene un usuario por su UUID interno. */
  async obtenerPorId(id: string): Promise<UsuarioResponseDTO> {
    const { data } = await usuariosClient.get<UsuarioResponseDTO>(
      ENDPOINTS.usuarios.porId(id),
    );
    return data;
  },

  /** Registra un nuevo operador (requiere rol ADMIN). */
  async registrar(payload: UsuarioCreateDTO): Promise<UsuarioResponseDTO> {
    const { data } = await usuariosClient.post<UsuarioResponseDTO>(
      ENDPOINTS.usuarios.registrar,
      payload,
    );
    return data;
  },

  /** Edita un usuario existente (requiere rol ADMIN). */
  async actualizar(id: string, payload: UsuarioUpdateDTO): Promise<UsuarioResponseDTO> {
    const { data } = await usuariosClient.put<UsuarioResponseDTO>(
      ENDPOINTS.usuarios.porId(id),
      payload,
    );
    return data;
  },
};
