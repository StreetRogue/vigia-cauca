export type RolUsuario    = 'ADMIN' | 'OPERADOR';
export type EstadoUsuario = 'ACTIVO' | 'INACTIVO';

export interface MunicipioDTO {
  idMunicipio: number;
  nombre:      string;
}

export interface UsuarioResponseDTO {
  idUsuario:          string;          // UUID
  idIam:              string | null;
  cedula:             string;
  nombre:             string;
  telefono:           string;
  email:              string;
  municipio:          MunicipioDTO | null;
  username:           string;
  rol:                RolUsuario;
  estado:             EstadoUsuario;
  fechaCreacion:      string;
  fechaActualizacion: string | null;
  creadoPor:          string | null;
  editadoPor:         string | null;
}

export interface PageResponseDTO<T> {
  content:       T[];
  page:          number;
  size:          number;
  totalElements: number;
  totalPages:    number;
}

export interface UsuarioCreatePayload {
  cedula:      string;
  nombre:      string;
  telefono:    string;
  email:       string;
  idMunicipio: number;
  username:    string;
  rol:         RolUsuario;
}

export interface UsuarioUpdatePayload {
  cedula?:      string;
  nombre?:      string;
  telefono?:    string;
  email?:       string;
  idMunicipio?: number;
  username?:    string;
  rol?:         RolUsuario;
  estado?:      EstadoUsuario;
}

export interface UsuariosFilter {
  rol?:         string;
  estado?:      string;
  idMunicipio?: number;
  page?:        number;
  size?:        number;
}
