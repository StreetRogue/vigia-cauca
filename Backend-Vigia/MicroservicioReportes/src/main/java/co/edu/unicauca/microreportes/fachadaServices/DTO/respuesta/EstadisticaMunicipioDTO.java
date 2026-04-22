package co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EstadisticaMunicipioDTO {

    private String municipio;

    /** Frecuencia absoluta: número de eventos registrados en este municipio. */
    private Long totalEventos;

    private Long totalMuertos;
    private Long totalHeridos;
    private Long totalDesplazados;

    /**
     * Frecuencia relativa: % de este municipio sobre el total de eventos del período.
     * Ej.: 22.80 → 22.80 %
     */
    private Double frecuenciaRelativa;

    /**
     * Frecuencia acumulada: suma corrida sobre la lista ordenada de mayor a menor.
     */
    private Long frecuenciaAcumulada;
}
