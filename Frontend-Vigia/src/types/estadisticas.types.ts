import type { Actor, CategoriaEvento, Genero, GrupoPoblacional, NivelConfianza } from './novedad.types';

// ── Filtros del dashboard ─────────────────────────────────────────────────────

export interface FiltrosDashboard {
  anio?:            number;
  mes?:             number;    // 1–12
  municipio?:       string;
  categoria?:       CategoriaEvento;
  actor?:           Actor;
  nivelConfianza?:  NivelConfianza;
  genero?:          Genero;
  grupoPoblacional?: GrupoPoblacional;
}

// ── KPIs ─────────────────────────────────────────────────────────────────────

export interface ResumenKPIDTO {
  anio?:              number;
  municipio?:         string;
  totalEventos:       number;
  totalMuertos:       number;
  totalHeridos:       number;
  totalDesplazados:   number;
  totalConfinados:    number;
  filtrosAplicados:   Record<string, string>;
}

// ── Serie temporal ────────────────────────────────────────────────────────────

export interface SerieTemporalDTO {
  anio:                number;
  mes:                 number;
  nombreMes:           string;
  totalEventos:        number;
  totalMuertos:        number;
  totalHeridos:        number;
  totalDesplazados:    number;
  frecuenciaRelativa:  number;   // porcentaje
  frecuenciaAcumulada: number;
}

// ── Municipios ────────────────────────────────────────────────────────────────

export interface EstadisticaMunicipioDTO {
  municipio:           string;
  totalEventos:        number;
  totalMuertos:        number;
  totalHeridos:        number;
  totalDesplazados:    number;
  frecuenciaRelativa:  number;
  frecuenciaAcumulada: number;
}

// ── Actores ───────────────────────────────────────────────────────────────────

export interface EstadisticaActorDTO {
  actor:        Actor;
  totalEventos: number;
}

// ── Categorías ────────────────────────────────────────────────────────────────

export interface EstadisticaCategoriaDTO {
  categoria:    CategoriaEvento;
  totalEventos: number;
  totalMuertos: number;
}

// ── Demografía de víctimas ────────────────────────────────────────────────────

export interface DistribucionDTO {
  etiqueta:            string;
  frecuenciaAbsoluta:  number;
  frecuenciaRelativa:  number;
  frecuenciaAcumulada: number;
}

export interface EstadisticasVictimasDTO {
  filtrosAplicados:      Record<string, string>;
  totalVictimas:         number;
  porGenero:             DistribucionDTO[];
  porRangoEdad:          DistribucionDTO[];
  porGrupoPoblacional:   DistribucionDTO[];
}

// ── Dashboard completo ────────────────────────────────────────────────────────

export interface DashboardCompletoDTO {
  filtrosAplicados:      Record<string, string>;
  resumen:               ResumenKPIDTO;
  historicoMensual:      SerieTemporalDTO[];
  incidentesPorActor:    EstadisticaActorDTO[];
  mapaCalor:             EstadisticaMunicipioDTO[];
  desgloseCategorias:    EstadisticaCategoriaDTO[];
  estadisticasVictimas:  EstadisticasVictimasDTO;
}
