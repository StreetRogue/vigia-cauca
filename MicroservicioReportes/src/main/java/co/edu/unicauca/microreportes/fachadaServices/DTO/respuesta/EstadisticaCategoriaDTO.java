package co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.CategoriaEvento;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EstadisticaCategoriaDTO {

    private CategoriaEvento categoria;

    /** Frecuencia absoluta: número de eventos de esta categoría en el período. */
    private Long totalEventos;

    private Long totalMuertos;
    private Long totalHeridos;

    /**
     * Frecuencia relativa: % de esta categoría sobre el total de eventos del período.
     * Ej.: 45.00 → 45.00 %
     */
    private Double frecuenciaRelativa;

    /**
     * Frecuencia acumulada: suma corrida sobre la lista ordenada de mayor a menor.
     */
    private Long frecuenciaAcumulada;
}
