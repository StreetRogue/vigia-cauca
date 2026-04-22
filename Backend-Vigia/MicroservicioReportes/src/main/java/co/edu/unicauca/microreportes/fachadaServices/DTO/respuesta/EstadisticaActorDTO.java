package co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.Actor;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EstadisticaActorDTO {

    private Actor actor;

    /** Frecuencia absoluta: número de eventos protagonizados por este actor. */
    private Long totalEventos;

    /**
     * Frecuencia relativa: % de este actor sobre el total de eventos del período.
     * Ej.: 38.25 → 38.25 %
     */
    private Double frecuenciaRelativa;

    /**
     * Frecuencia acumulada: suma corrida sobre la lista ordenada de mayor a menor.
     * El último actor cierra en el 100 % del total.
     */
    private Long frecuenciaAcumulada;
}
