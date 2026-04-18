package co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.Genero;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DistribucionGeneroDTO {
    private Genero genero;
    private Long frecuenciaAbsoluta;
    private Double frecuenciaRelativa;
    private Long frecuenciaAcumulada;
}
