/**
 * dominios.ts
 * ============================================================
 * Dominios y enumeraciones oficiales del modelo de datos
 * VIGÍA CAUCA — Versión 2 — Bitnova
 *
 * Fuente: Documento "DOMINIOS Y ENUMERACIONES DEL MODELO DE DATOS"
 * Última revisión: 2026-04-14
 *
 * USO:
 *   import { CATEGORIAS, ACTORES, MUNICIPIOS_CAUCA } from '../constants/dominios';
 * ============================================================
 */

// ── Geografía: Municipios del Departamento del Cauca ─────────────────────────

/**
 * Lista oficial de los 42 municipios del Cauca (Colombia).
 * Fuente: DANE — División político-administrativa.
 * Popayán aparece primero por ser la capital del departamento.
 */
export const MUNICIPIOS_CAUCA = [
  'Popayán',
  'Almaguer',
  'Argelia',
  'Balboa',
  'Bolívar',
  'Buenos Aires',
  'Cajibío',
  'Caldono',
  'Caloto',
  'Corinto',
  'El Tambo',
  'Florencia',
  'Guachené',
  'Guapi',
  'Inzá',
  'Jambaló',
  'La Sierra',
  'La Vega',
  'López de Micay',
  'Mercaderes',
  'Miranda',
  'Morales',
  'Padilla',
  'Páez',
  'Patía',
  'Piamonte',
  'Piendamó',
  'Puerto Tejada',
  'Puracé',
  'Rosas',
  'San Sebastián',
  'Santa Rosa',
  'Santander de Quilichao',
  'Silvia',
  'Sotará',
  'Sucre',
  'Suárez',
  'Timbío',
  'Timbiquí',
  'Toribío',
  'Totoró',
  'Villa Rica',
] as const;

export type MunicipioCauca = (typeof MUNICIPIOS_CAUCA)[number];

// ── Tabla: NOVEDAD ────────────────────────────────────────────────────────────

export interface OpcionEnum { value: string; label: string; }

/** Atributo: categoria — value = enum backend, label = texto visible */
export const CATEGORIAS: OpcionEnum[] = [
  { value: 'ENFRENTAMIENTO',        label: 'Enfrentamiento' },
  { value: 'HOSTIGAMIENTO',         label: 'Hostigamiento' },
  { value: 'ATENTADO_TERRORISTA',   label: 'Atentado Terrorista' },
  { value: 'ATAQUE_CON_DRON',       label: 'Ataque con Dron' },
  { value: 'HOMICIDIO',             label: 'Homicidio' },
  { value: 'SECUESTRO',             label: 'Secuestro' },
  { value: 'RETEN_ILEGAL',          label: 'Retén Ilegal' },
  { value: 'RECLUTAMIENTO_ILICITO', label: 'Reclutamiento Ilícito' },
  { value: 'ACCION_DE_PROTESTA',    label: 'Acción de Protesta' },
  { value: 'HALLAZGO_DE_MATERIAL',  label: 'Hallazgo de Material' },
  { value: 'OTRO',                  label: 'Otro' },
];

/** Atributo: actor */
export const ACTORES: OpcionEnum[] = [
  { value: 'FUERZA_PUBLICA',          label: 'Fuerza Pública' },
  { value: 'GRUPO_ARMADO_ORGANIZADO', label: 'Grupo Armado Organizado' },
  { value: 'ELN',                     label: 'ELN' },
  { value: 'SEGUNDA_MARQUETALIA',     label: 'Segunda Marquetalia' },
  { value: 'COMUNIDAD_CIVIL',         label: 'Comunidad Civil' },
  { value: 'GUARDIA_INDIGENA',        label: 'Guardia Indígena' },
  { value: 'NO_IDENTIFICADO',         label: 'No Identificado' },
  { value: 'OTRO',                    label: 'Otro' },
];

/** Atributo: nivel_confianza */
export const NIVELES_CONFIANZA: OpcionEnum[] = [
  { value: 'CONFIRMADO',      label: 'Confirmado' },
  { value: 'PRELIMINAR',      label: 'Preliminar' },
  { value: 'EN_VERIFICACION', label: 'En verificación' },
];

/** Atributo: nivel_visibilidad */
export const NIVELES_VISIBILIDAD: OpcionEnum[] = [
  { value: 'PUBLICA',  label: 'Público' },
  { value: 'PRIVADA',  label: 'Privado' },
];

// ── Tabla: VICTIMA ────────────────────────────────────────────────────────────

/** Atributo: genero_victima */
export const GENEROS_VICTIMA: OpcionEnum[] = [
  { value: 'MASCULINO',       label: 'Masculino' },
  { value: 'FEMENINO',        label: 'Femenino' },
  { value: 'LGBTI_PLUS',      label: 'LGBTI+' },
  { value: 'NO_ESPECIFICADO', label: 'No especificado' },
];

/** Atributo: grupo_poblacional */
export const GRUPOS_POBLACIONALES: OpcionEnum[] = [
  { value: 'CAMPESINO',     label: 'Campesino/a' },
  { value: 'INDIGENA',      label: 'Indígena' },
  { value: 'AFRODESCENDIENTE', label: 'Afrocolombiano/a' },
  { value: 'NINO',          label: 'Niño' },
  { value: 'ADOLESCENTE',   label: 'Adolescente' },
  { value: 'ADULTO',        label: 'Adulto' },
  { value: 'ADULTO_MAYOR',  label: 'Adulto Mayor' },
  { value: 'DISCAPACIDAD',  label: 'Discapacidad' },
  { value: 'OTRO',          label: 'Otro' },
];

// ── Tabla: AFECTACION_HUMANA ──────────────────────────────────────────────────

/** Atributo: reclutamiento_menores_flag */
export const RECLUTAMIENTO_FLAGS: OpcionEnum[] = [
  { value: 'SI',               label: 'Sí' },
  { value: 'NO',               label: 'No' },
  { value: 'NO_APLICA',        label: 'No aplica' },
  { value: 'EN_INVESTIGACION', label: 'En investigación' },
];

// ── Tabla: USUARIO ────────────────────────────────────────────────────────────

/** Atributo: rol_usuario */
export const ROLES_USUARIO = [
  'Administrador',
  'Operador',
  'Visitante',
] as const;

export type RolUsuario = (typeof ROLES_USUARIO)[number];

/**
 * NOTA: Según el documento oficial, falta definir si el usuario
 * tiene estado activo o inactivo. Pendiente de confirmación.
 *
 * Propuesta sugerida para cuando se defina:
 *   export const ESTADOS_USUARIO = ['Activo', 'Inactivo'] as const;
 *   export type EstadoUsuario = (typeof ESTADOS_USUARIO)[number];
 */
