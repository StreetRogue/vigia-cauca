package co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.Actor;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EstadisticaActorDTO {
    private Actor actor;
    private Long totalEventos;
}
