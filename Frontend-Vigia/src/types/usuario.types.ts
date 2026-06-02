export type RolUsuario    = 'ADMIN' | 'OPERADOR';
export type EstadoUsuario = 'ACTIVO' | 'INACTIVO';

export interface MunicipioUsuarioDTO {
  idMunicipio: number;
  nombre:      string;
}

export interface UsuarioResponseDTO {
  idUsuario:          string;
  idIam:              string;
  cedula:             string;
  nombre:             string;
  telefono:           string;
  email:              string;
  municipio:          MunicipioUsuarioDTO;
  username:           string;
  rol:                RolUsuario;
  estado:             EstadoUsuario;
  fechaCreacion:      string;
  fechaActualizacion: string;
  creadoPor:          string;
  editadoPor:         string;
}

export interface UsuarioCreateDTO {
  cedula:      string;
  nombre:      string;
  telefono:    string;
  email:       string;
  idMunicipio: number;
  username:    string;
  password:    string;
  rol:         RolUsuario;
}

export interface UsuarioUpdateDTO {
  cedula?:      string;
  nombre?:      string;
  telefono?:    string;
  email?:       string;
  idMunicipio?: number;
  username?:    string;
  rol?:         RolUsuario;
  estado?:      EstadoUsuario;
}

export interface UsuariosPageResponse {
  content:       UsuarioResponseDTO[];
  page:          number;
  size:          number;
  totalElements: number;
  totalPages:    number;
}
