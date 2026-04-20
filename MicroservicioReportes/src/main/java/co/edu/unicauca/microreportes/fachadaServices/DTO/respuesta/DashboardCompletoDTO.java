package co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta;

import lombok.*;

import java.util.List;
import java.util.Map;

/**
 * DTO consolidado para cargar todo el dashboard en un solo request.
 * Reduce round-trips del frontend al backend.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardCompletoDTO {

    /**
     * Mapa con los filtros que generaron este resultado.
     * Vacío cuando el dashboard cargó sin ningún filtro (datos totales).
     */
    private Map<String, String> filtrosAplicados;

    private ResumenKPIDTO resumen;
    private List<SerieTemporalDTO> historicoMensual;
    private List<EstadisticaActorDTO> incidentesPorActor;
    private List<EstadisticaMunicipioDTO> mapaCalor;
    private List<EstadisticaCategoriaDTO> desgloseCategorias;
    private EstadisticasVictimasDTO estadisticasVictimas;
}
