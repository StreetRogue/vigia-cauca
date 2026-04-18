package co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SerieTemporalDTO {

    private Integer anio;
    private Integer mes;
    private String nombreMes;

    /** Frecuencia absoluta: número de eventos en el período. */
    private Long totalEventos;

    private Long totalMuertos;
    private Long totalHeridos;
    private Long totalDesplazados;

    /**
     * Frecuencia relativa: porcentaje de este período sobre el total del rango consultado.
     * Ej.: 25.50 → 25.50 %
     */
    private Double frecuenciaRelativa;

    /**
     * Frecuencia acumulada: suma de eventos desde el inicio de la serie hasta este punto.
     */
    private Long frecuenciaAcumulada;
}
