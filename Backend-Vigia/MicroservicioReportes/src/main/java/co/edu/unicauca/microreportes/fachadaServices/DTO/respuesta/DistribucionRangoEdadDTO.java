package co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.RangoEdad;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DistribucionRangoEdadDTO {
    private RangoEdad rangoEdad;
    /** Etiqueta legible: "0 - 19", "20 - 39", etc. */
    private String etiqueta;
    private Long frecuenciaAbsoluta;
    private Double frecuenciaRelativa;
    private Long frecuenciaAcumulada;
}
