package co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.GrupoPoblacional;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DistribucionGrupoPoblacionalDTO {
    private GrupoPoblacional grupoPoblacional;
    private Long frecuenciaAbsoluta;
    private Double frecuenciaRelativa;
    private Long frecuenciaAcumulada;
}
