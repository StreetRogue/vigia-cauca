/**
 * Rutas de la API agrupadas por microservicio.
 * Mantenidas como constantes para evitar strings dispersos en el código.
 */
export const ENDPOINTS = {
  novedades: {
    base:             '/api/v1/microNovedades/novedades',
    porId:            (id: string) => `/api/v1/microNovedades/novedades/${id}`,
    paginado:         '/api/v1/microNovedades/novedades/paginado',
    filtrar:          '/api/v1/microNovedades/novedades/filtrar',
    porUsuario:       (uid: string) => `/api/v1/microNovedades/novedades/usuario/${uid}`,
    plantillaExcel:   '/api/v1/microNovedades/novedades/plantilla-excel',
    cargaExcel:       '/api/v1/microNovedades/novedades/carga-excel',
    victimas:         (nid: string) => `/api/v1/microNovedades/novedades/${nid}/victimas`,
    victimaPorId:     (nid: string, vid: string) => `/api/v1/microNovedades/novedades/${nid}/victimas/${vid}`,
    evidencias:       (nid: string) => `/api/v1/microNovedades/novedades/${nid}/evidencias`,
    evidenciaPorId:   (nid: string, eid: string) => `/api/v1/microNovedades/novedades/${nid}/evidencias/${eid}`,
    auditorias:       (nid: string) => `/api/v1/microNovedades/auditorias/novedad/${nid}`,
    auditoriasPorUsuario: (uid: string) => `/api/v1/microNovedades/auditorias/usuario/${uid}`,
  },

  estadisticas: {
    dashboard:        '/api/v1/reportes/estadisticas/dashboard',
    resumen:          '/api/v1/reportes/estadisticas/resumen',
    serieTemporal:    '/api/v1/reportes/estadisticas/serie-temporal',
    porActor:         '/api/v1/reportes/estadisticas/por-actor',
    mapaCalor:        '/api/v1/reportes/estadisticas/mapa-calor',
    porCategoria:     '/api/v1/reportes/estadisticas/por-categoria',
  },

  reportes: {
    previsualizar:    '/api/v1/reportes/documentos/previsualizar',
    descargar:        '/api/v1/reportes/documentos/descargar',
    sseStream:        '/api/v1/reportes/sse/stream',
    sseStatus:        '/api/v1/reportes/sse/status',
  },

  ubicaciones: {
    municipios:       '/api/v1/microUbicaciones/municipios',
    municipioPorId:   (id: string) => `/api/v1/microUbicaciones/municipios/${id}`,
  },
} as const;
