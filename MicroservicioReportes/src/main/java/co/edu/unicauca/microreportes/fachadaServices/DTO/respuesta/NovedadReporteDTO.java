package co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO para las filas del reporte descargable.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NovedadReporteDTO {
    private UUID novedadId;
    private LocalDate fechaHecho;
    private String municipio;
    private String localidadEspecifica;
    private CategoriaEvento categoria;
    private Actor actor1;
    private Actor actor2;
    /** Representación legible de los actores para mostrar en reportes */
    private String actoresDisplay;
    private NivelConfianza nivelConfianza;
    private Integer muertosTotales;
    private Integer muertosCiviles;
    private Integer muertosFuerzaPublica;
    private Integer heridosTotales;
    private Integer heridosCiviles;
    private Integer desplazadosTotales;
    private Integer confinadosTotales;
    private String descripcionHecho;
}
