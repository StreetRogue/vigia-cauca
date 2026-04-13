package co.edu.unicauca.microreportes.capaControladores;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.CategoriaEvento;
import co.edu.unicauca.microreportes.fachadaServices.DTO.peticion.FiltroEstadisticaDTO;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.*;
import co.edu.unicauca.microreportes.fachadaServices.services.IEstadisticaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints para el dashboard de estadísticas.
 *
 * El contexto del usuario llega como headers del API Gateway:
 *   X-User-Role: ADMIN | OPERADOR | VISITANTE
 *   X-User-Id: UUID del usuario (cédula)
 *
 * Mientras no haya autenticación, los headers son opcionales
 * y se usa VISITANTE por defecto (solo datos públicos).
 */
@RestController
@RequestMapping("/api/v1/reportes/estadisticas")
@RequiredArgsConstructor
public class EstadisticaRestController {

    private final IEstadisticaService estadisticaService;

    /**
     * GET /api/v1/reportes/estadisticas/dashboard
     * Carga completa del dashboard en un solo request.
     *
     * Response:
     * {
     *   "resumen": { "totalEventos": 1500, "totalMuertos": 444, ... },
     *   "historicoMensual": [ { "mes": 1, "nombreMes": "Ene", "totalEventos": 1234, ... } ],
     *   "incidentesPorActor": [ { "actor": "ELN", "totalEventos": 789 } ],
     *   "mapaCalor": [ { "municipio": "Popayan", "totalEventos": 25, ... } ],
     *   "desgloseCategorias": [ { "categoria": "ENFRENTAMIENTO", "totalEventos": 300, ... } ]
     * }
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardCompletoDTO> dashboard(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) String municipio,
            @RequestParam(required = false) CategoriaEvento categoria,
            @RequestHeader(value = "X-User-Role", defaultValue = "VISITANTE") String rol
    ) {
        FiltroEstadisticaDTO filtro = FiltroEstadisticaDTO.builder()
                .anio(anio).municipio(municipio).categoria(categoria).build();
        return ResponseEntity.ok(estadisticaService.obtenerDashboardCompleto(filtro, rol));
    }

    /**
     * GET /api/v1/reportes/estadisticas/resumen
     * Solo las cards de KPIs (Total Eventos, Muertos, Heridos, Desplazados, Confinados).
     */
    @GetMapping("/resumen")
    public ResponseEntity<ResumenKPIDTO> resumen(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) String municipio,
            @RequestHeader(value = "X-User-Role", defaultValue = "VISITANTE") String rol
    ) {
        FiltroEstadisticaDTO filtro = FiltroEstadisticaDTO.builder()
                .anio(anio).municipio(municipio).build();
        return ResponseEntity.ok(estadisticaService.obtenerResumenKPI(filtro, rol));
    }

    /**
     * GET /api/v1/reportes/estadisticas/serie-temporal
     * Datos para gráfico de barras/línea mensual ("Histórico de Incidentes").
     */
    @GetMapping("/serie-temporal")
    public ResponseEntity<List<SerieTemporalDTO>> serieTemporal(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) String municipio,
            @RequestParam(required = false) CategoriaEvento categoria,
            @RequestHeader(value = "X-User-Role", defaultValue = "VISITANTE") String rol
    ) {
        FiltroEstadisticaDTO filtro = FiltroEstadisticaDTO.builder()
                .anio(anio).municipio(municipio).categoria(categoria).build();
        return ResponseEntity.ok(estadisticaService.obtenerSerieTemporal(filtro, rol));
    }

    /**
     * GET /api/v1/reportes/estadisticas/por-actor
     * Datos para gráfico "Incidentes por Actor".
     */
    @GetMapping("/por-actor")
    public ResponseEntity<List<EstadisticaActorDTO>> porActor(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) String municipio,
            @RequestHeader(value = "X-User-Role", defaultValue = "VISITANTE") String rol
    ) {
        FiltroEstadisticaDTO filtro = FiltroEstadisticaDTO.builder()
                .anio(anio).municipio(municipio).build();
        return ResponseEntity.ok(estadisticaService.obtenerEstadisticasPorActor(filtro, rol));
    }

    /**
     * GET /api/v1/reportes/estadisticas/mapa-calor
     * Datos para el mapa de calor por municipio.
     */
    @GetMapping("/mapa-calor")
    public ResponseEntity<List<EstadisticaMunicipioDTO>> mapaCalor(
            @RequestParam(required = false) Integer anio,
            @RequestHeader(value = "X-User-Role", defaultValue = "VISITANTE") String rol
    ) {
        return ResponseEntity.ok(estadisticaService.obtenerMapaCalor(anio, rol));
    }

    /**
     * GET /api/v1/reportes/estadisticas/por-categoria
     * Desglose por tipo de evento.
     */
    @GetMapping("/por-categoria")
    public ResponseEntity<List<EstadisticaCategoriaDTO>> porCategoria(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) String municipio,
            @RequestHeader(value = "X-User-Role", defaultValue = "VISITANTE") String rol
    ) {
        FiltroEstadisticaDTO filtro = FiltroEstadisticaDTO.builder()
                .anio(anio).municipio(municipio).build();
        return ResponseEntity.ok(estadisticaService.obtenerDesgloseCategorias(filtro, rol));
    }
}
