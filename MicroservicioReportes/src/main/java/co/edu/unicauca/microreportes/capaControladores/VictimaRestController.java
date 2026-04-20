package co.edu.unicauca.microreportes.capaControladores;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.CategoriaEvento;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.Genero;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.GrupoPoblacional;
import co.edu.unicauca.microreportes.fachadaServices.DTO.peticion.FiltroEstadisticaDTO;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.EstadisticasVictimasDTO;
import co.edu.unicauca.microreportes.fachadaServices.services.IVictimaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Estadísticas descriptivas de víctimas individuales.
 *
 * Base URL: /api/v1/reportes/estadisticas/victimas
 *
 * Filtros opcionales de contexto (query params):
 *   anio, mes, municipio, categoria
 *
 * Filtros demográficos (alineados con VictimaEntity de MicroservicioNovedades):
 *   genero        → MASCULINO | FEMENINO | LGBTI_PLUS | NO_ESPECIFICADO
 *   grupoPoblacional → NINO | ADOLESCENTE | ADULTO | ADULTO_MAYOR |
 *                      INDIGENA | AFRODESCENDIENTE | CAMPESINO | DISCAPACIDAD | OTRO
 *
 * Autorización por rol via header X-User-Role:
 *   ADMIN / OPERADOR → datos públicos + privados
 *   VISITANTE (o ausente) → solo datos públicos
 */
@RestController
@RequestMapping("/api/v1/reportes/estadisticas/victimas")
@RequiredArgsConstructor
public class VictimaRestController {

    private final IVictimaService victimaService;

    /**
     * Estadísticas completas de víctimas con filtros opcionales.
     *
     * Responde con:
     * - totalVictimas
     * - porGenero          (absoluta, relativa, acumulada)
     * - porRangoEdad       (absoluta, relativa, acumulada; rangos 0-19, 20-39, 40-59, 60-79, 80+)
     * - porGrupoPoblacional (absoluta, relativa, acumulada)
     * - filtrosAplicados
     */
    @GetMapping
    public ResponseEntity<EstadisticasVictimasDTO> obtenerEstadisticas(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) String municipio,
            @RequestParam(required = false) CategoriaEvento categoria,
            @RequestParam(required = false) Genero genero,
            @RequestParam(required = false) GrupoPoblacional grupoPoblacional,
            @RequestHeader(value = "X-User-Role", defaultValue = "VISITANTE") String rol) {

        FiltroEstadisticaDTO filtro = FiltroEstadisticaDTO.builder()
                .anio(anio).mes(mes).municipio(municipio).categoria(categoria)
                .genero(genero).grupoPoblacional(grupoPoblacional)
                .build();

        return ResponseEntity.ok(victimaService.obtenerEstadisticas(filtro, rol));
    }
}
