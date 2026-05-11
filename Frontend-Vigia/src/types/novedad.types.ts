// ── Enums (espejo de los enums del backend) ───────────────────────────────────

export type CategoriaEvento =
  | 'ENFRENTAMIENTO'
  | 'HOSTIGAMIENTO'
  | 'ATENTADO_TERRORISTA'
  | 'ATAQUE_CON_DRON'
  | 'HOMICIDIO'
  | 'SECUESTRO'
  | 'RETEN_ILEGAL'
  | 'RECLUTAMIENTO_ILICITO'
  | 'ACCION_DE_PROTESTA'
  | 'HALLAZGO_DE_MATERIAL'
  | 'OTRO';

export type Actor =
  | 'FUERZA_PUBLICA'
  | 'GRUPO_ARMADO_ORGANIZADO'
  | 'ELN'
  | 'SEGUNDA_MARQUETALIA'
  | 'COMUNIDAD_CIVIL'
  | 'GUARDIA_INDIGENA'
  | 'NO_IDENTIFICADO'
  | 'OTRO';

export type NivelVisibilidad = 'PUBLICA' | 'PRIVADA';
export type NivelConfianza  = 'PRELIMINAR' | 'EN_VERIFICACION' | 'CONFIRMADO';
export type ReclutamientoMenoresFlag = 'SI' | 'NO' | 'NO_APLICA' | 'EN_INVESTIGACION';

export type Genero =
  | 'MASCULINO'
  | 'FEMENINO'
  | 'LGBTI_PLUS'
  | 'NO_ESPECIFICADO';

export type GrupoPoblacional =
  | 'NINO'
  | 'ADOLESCENTE'
  | 'ADULTO'
  | 'ADULTO_MAYOR'
  | 'INDIGENA'
  | 'AFRODESCENDIENTE'
  | 'CAMPESINO'
  | 'DISCAPACIDAD'
  | 'OTRO';

// ── DTOs de petición ─────────────────────────────────────────────────────────

export interface AfectacionHumanaDTO {
  muertosTotales:           number;
  muertosCiviles:           number;
  muertosFuerzaPublica:     number;
  muertosIlegales:          number;
  heridosTotales:           number;
  heridosCiviles:           number;
  heridosFuerzaPublica:     number;
  desplazadosTotales:       number;
  confinadosTotales:        number;
  afectacionCivilesFlag:    boolean;
  reclutamientoMenoresFlag: ReclutamientoMenoresFlag;
}

export interface VictimaDTOPeticion {
  nombreVictima:    string;
  generoVictima:    Genero;
  edadVictima?:     number;
  grupoPoblacional: GrupoPoblacional;
  ocupacionVictima?: string;
}

export interface NovedadDTOPeticion {
  usuarioId:               string;
  fechaHecho:              string;   // ISO date: "2025-04-20"
  horaInicio?:             string;   // "HH:mm"
  horaFin?:                string;
  municipio:               string;
  localidadEspecifica?:    string;
  categoria:               CategoriaEvento;
  actores:                 Actor[];
  nivelConfianza:          NivelConfianza;
  nivelVisibilidad:        NivelVisibilidad;
  descripcionHecho?:       string;
  infraestructuraAfectada?: string;
  accionInstitucional?:    string;
  afectacionHumana?:       AfectacionHumanaDTO;
  victimas?:               VictimaDTOPeticion[];
  urlsEvidencias?:         string[];
}

// ── DTOs de respuesta ────────────────────────────────────────────────────────

export interface VictimaDTORespuesta extends VictimaDTOPeticion {
  victimaId: string;
  novedadId: string;
}

export interface EvidenciaDTORespuesta {
  idEvidencia:   string;
  novedadId:     string;
  nombreArchivo: string;
  tipoMime:      string;
  tamanoBytes:   number;
  urlArchivo:    string;
  fechaSubida:   string;
}

export interface AuditoriaDTORespuesta {
  idAuditoria: string;
  novedadId:   string;
  usuarioId:   string;
  accion:      'CREATE' | 'UPDATE' | 'DELETE';
  cambios:     Record<string, unknown>;
  fechaHora:   string;
}

export interface NovedadDTORespuesta {
  novedadId:              string;
  usuarioId:              string;
  fechaHecho:             string;
  horaInicio?:            string;
  horaFin?:               string;
  municipio:              string;
  localidadEspecifica?:   string;
  categoria:              CategoriaEvento;
  actores:                Actor[];
  nivelConfianza:         NivelConfianza;
  nivelVisibilidad:       NivelVisibilidad;
  descripcionHecho?:      string;
  infraestructuraAfectada?: string;
  accionInstitucional?:   string;
  afectacionHumana?:      AfectacionHumanaDTO;
  victimas?:              VictimaDTORespuesta[];
  evidencias?:            EvidenciaDTORespuesta[];
  fechaReporte?:          string;
  fechaActualizacion?:    string;
}

// ── Filtros de búsqueda ───────────────────────────────────────────────────────

export interface FiltrosNovedad {
  fechaInicio?:      string;
  fechaFin?:         string;
  municipio?:        string;
  categoria?:        CategoriaEvento;
  nivelVisibilidad?: NivelVisibilidad;
}

export interface PaginadoParams {
  page: number;
  size: number;
  sort?: string;
}

export interface PageResponse<T> {
  content:          T[];
  totalElements:    number;
  totalPages:       number;
  number:           number;
  size:             number;
  first:            boolean;
  last:             boolean;
}
