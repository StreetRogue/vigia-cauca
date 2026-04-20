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

/** Atributo: categoria */
export const CATEGORIAS = [
  'Enfrentamiento',
  'Hostigamiento',
  'Atentado Terrorista',
  'Ataque con Dron',
  'Homicidio',
  'Secuestro',
  'Retén Ilegal',
  'Reclutamiento Ilícito',
  'Acción de Protesta',
  'Hallazgo de Material',
  'Otro',
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

/** Atributo: actor */
export const ACTORES = [
  'Fuerza Pública',
  'Grupo Armado Organizado',
  'ELN',
  'Segunda Marquetalia',
  'Civil / Comunidad',
  'No Identificado',
  'Otro',
] as const;

export type Actor = (typeof ACTORES)[number];

/** Atributo: nivel_confianza */
export const NIVELES_CONFIANZA = [
  'Confirmado',
  'Preliminar',
  'En verificación',
  'No confirmado',
] as const;

export type NivelConfianza = (typeof NIVELES_CONFIANZA)[number];

/** Atributo: nivel_visibilidad */
export const NIVELES_VISIBILIDAD = [
  'Público',
  'Privado',
] as const;

export type NivelVisibilidad = (typeof NIVELES_VISIBILIDAD)[number];

// ── Tabla: VICTIMA ────────────────────────────────────────────────────────────

/** Atributo: genero_victima */
export const GENEROS_VICTIMA = [
  'Masculino',
  'Femenino',
  'LGBTI+',
  'No especificado',
] as const;

export type GeneroVictima = (typeof GENEROS_VICTIMA)[number];

/** Atributo: grupo_poblacional */
export const GRUPOS_POBLACIONALES = [
  'Campesino/a',
  'Indígena',
  'Afrocolombiano/a',
  'Niño',
  'Adolescente',
  'Adulto',
  'Adulto Mayor',
  'Discapacidad',
  'Ninguno / No especificado',
] as const;

export type GrupoPoblacional = (typeof GRUPOS_POBLACIONALES)[number];

// ── Tabla: AFECTACION_HUMANA ──────────────────────────────────────────────────

/** Atributo: reclutamiento_menores_flag */
export const RECLUTAMIENTO_FLAGS = [
  'Sí',
  'No',
  'No aplica',
  'En investigación',
] as const;

export type ReclutamientoFlag = (typeof RECLUTAMIENTO_FLAGS)[number];

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
