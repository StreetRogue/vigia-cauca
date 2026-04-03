package co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta;

import lombok.*;

import java.util.List;

/**
 * DTO consolidado para cargar todo el dashboard en un solo request.
 * Reduce round-trips del frontend al backend.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardCompletoDTO {
    private ResumenKPIDTO resumen;
    private List<SerieTemporalDTO> historicoMensual;
    private List<EstadisticaActorDTO> incidentesPorActor;
    private List<EstadisticaMunicipioDTO> mapaCalor;
    private List<EstadisticaCategoriaDTO> desgloseCategorias;
}
