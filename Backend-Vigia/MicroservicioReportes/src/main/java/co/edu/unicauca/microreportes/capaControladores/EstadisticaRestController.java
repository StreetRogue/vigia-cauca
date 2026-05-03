package co.edu.unicauca.microreportes.capaControladores;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.Actor;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.CategoriaEvento;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.NivelConfianza;
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
 * Contexto del usuario (headers del API Gateway):
 *   X-User-Role : ADMIN | OPERADOR | VISITANTE  (defecto: VISITANTE)
 *   X-User-Id   : UUID del usuario
 *
 * Filtros opcionales comunes a todos los endpoints:
 *   anio          – año del hecho (null → todos los años)
 *   mes           – mes 1-12     (null → todos los meses)
 *   municipio     – nombre exacto (null → todos)
 *   categoria     – valor del enum CategoriaEvento (null → todas)
 *   actor         – valor del enum Actor (null → todos)
 *   nivelConfianza– valor del enum NivelConfianza (null → todos)
 *
 * Los filtros se combinan entre sí: todos son AND.
 * Sin ningún filtro → datos completos del sistema.
 */
@RestController
@RequestMapping("/api/v1/reportes/estadisticas")
@RequiredArgsConstructor
public class EstadisticaRestController {

    private final IEstadisticaService estadisticaService;

    /**
     * GET /dashboard
     * Carga completa del dashboard en un solo request.
     *
     * Ejemplo sin filtros  → todos los datos históricos
     * Ejemplo con filtros  → GET /dashboard?anio=2026&municipio=Popayan&actor=ELN
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardCompletoDTO> dashboard(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) String municipio,
            @RequestParam(required = false) CategoriaEvento categoria,
            @RequestParam(required = false) Actor actor,
            @RequestHeader(value = "X-User-Role", defaultValue = "VISITANTE") String rol
    ) {
        FiltroEstadisticaDTO filtro = FiltroEstadisticaDTO.builder()
                .anio(anio).mes(mes).municipio(municipio)
                .categoria(categoria).actor(actor).build();
        return ResponseEntity.ok(estadisticaService.obtenerDashboardCompleto(filtro, rol));
    }

    /**
     * GET /resumen
     * Cards de KPIs: Total Eventos, Muertos, Heridos, Desplazados, Confinados.
     * Incluye "filtrosAplicados" en la respuesta para que el frontend pueda mostrarlos.
     */
    @GetMapping("/resumen")
    public ResponseEntity<ResumenKPIDTO> resumen(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) String municipio,
            @RequestParam(required = false) CategoriaEvento categoria,
            @RequestParam(required = false) NivelConfianza nivelConfianza,
            @RequestHeader(value = "X-User-Role", defaultValue = "VISITANTE") String rol
    ) {
        FiltroEstadisticaDTO filtro = FiltroEstadisticaDTO.builder()
                .anio(anio).mes(mes).municipio(municipio)
                .categoria(categoria).nivelConfianza(nivelConfianza).build();
        return ResponseEntity.ok(estadisticaService.obtenerResumenKPI(filtro, rol));
    }

    /**
     * GET /serie-temporal
     * Datos para gráfico de línea/barra (histórico mensual).
     * La respuesta incluye frecuenciaRelativa y frecuenciaAcumulada por período.
     * Sin anio → devuelve la serie completa de todos los años disponibles.
     */
    @GetMapping("/serie-temporal")
    public ResponseEntity<List<SerieTemporalDTO>> serieTemporal(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) String municipio,
            @RequestParam(required = false) CategoriaEvento categoria,
            @RequestParam(required = false) Actor actor,
            @RequestHeader(value = "X-User-Role", defaultValue = "VISITANTE") String rol
    ) {
        FiltroEstadisticaDTO filtro = FiltroEstadisticaDTO.builder()
                .anio(anio).mes(mes).municipio(municipio)
                .categoria(categoria).actor(actor).build();
        return ResponseEntity.ok(estadisticaService.obtenerSerieTemporal(filtro, rol));
    }

    /**
     * GET /por-actor
     * Datos para gráfico de barras/torta: incidentes por actor armado.
     */
    @GetMapping("/por-actor")
    public ResponseEntity<List<EstadisticaActorDTO>> porActor(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) String municipio,
            @RequestParam(required = false) CategoriaEvento categoria,
            @RequestHeader(value = "X-User-Role", defaultValue = "VISITANTE") String rol
    ) {
        FiltroEstadisticaDTO filtro = FiltroEstadisticaDTO.builder()
                .anio(anio).mes(mes).municipio(municipio).categoria(categoria).build();
        return ResponseEntity.ok(estadisticaService.obtenerEstadisticasPorActor(filtro, rol));
    }

    /**
     * GET /mapa-calor
     * Datos para el mapa de calor por municipio.
     */
    @GetMapping("/mapa-calor")
    public ResponseEntity<List<EstadisticaMunicipioDTO>> mapaCalor(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) CategoriaEvento categoria,
            @RequestHeader(value = "X-User-Role", defaultValue = "VISITANTE") String rol
    ) {
        FiltroEstadisticaDTO filtro = FiltroEstadisticaDTO.builder()
                .anio(anio).mes(mes).categoria(categoria).build();
        return ResponseEntity.ok(estadisticaService.obtenerMapaCalor(filtro, rol));
    }

    /**
     * GET /por-categoria
     * Desglose por tipo de evento (categoría).
     */
    @GetMapping("/por-categoria")
    public ResponseEntity<List<EstadisticaCategoriaDTO>> porCategoria(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) String municipio,
            @RequestHeader(value = "X-User-Role", defaultValue = "VISITANTE") String rol
    ) {
        FiltroEstadisticaDTO filtro = FiltroEstadisticaDTO.builder()
                .anio(anio).mes(mes).municipio(municipio).build();
        return ResponseEntity.ok(estadisticaService.obtenerDesgloseCategorias(filtro, rol));
    }
}
