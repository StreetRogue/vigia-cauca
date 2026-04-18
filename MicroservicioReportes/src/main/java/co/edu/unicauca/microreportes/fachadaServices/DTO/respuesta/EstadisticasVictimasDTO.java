package co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta;

import lombok.*;

import java.util.List;
import java.util.Map;

/**
 * DTO consolidado de estadísticas descriptivas de víctimas individuales.
 *
 * Las distribuciones reflejan el desglose demográfico según los filtros aplicados:
 *   - porGenero          → distribución de géneros (excluye filtro de genero para mostrar desglose completo)
 *   - porRangoEdad       → distribución de rangos de edad (respeta todos los filtros)
 *   - porGrupoPoblacional→ distribución de grupos (excluye filtro de grupo para mostrar desglose completo)
 *
 * Todos los valores incluyen frecuencia absoluta, relativa (%) y acumulada.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EstadisticasVictimasDTO {

    private Map<String, String> filtrosAplicados;

    /** Conteo total de víctimas que coinciden con los filtros. */
    private Long totalVictimas;

    /** Distribución por género. */
    private List<DistribucionGeneroDTO> porGenero;

    /** Distribución por rango de edad (rangos de 20 en 20 años). */
    private List<DistribucionRangoEdadDTO> porRangoEdad;

    /** Distribución por grupo poblacional. */
    private List<DistribucionGrupoPoblacionalDTO> porGrupoPoblacional;
}
