package co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta;

import lombok.*;

import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResumenKPIDTO {

    /** null cuando no se aplicó filtro de año (consulta de todos los registros). */
    private Integer anio;
    private String municipio;

    private Long totalEventos;
    private Long totalMuertos;
    private Long totalHeridos;
    private Long totalDesplazados;
    private Long totalConfinados;

    /**
     * Mapa con los filtros que generaron este resultado.
     * Vacío cuando no se aplicó ningún filtro.
     */
    private Map<String, String> filtrosAplicados;
}
