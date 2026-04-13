package co.edu.unicauca.microreportes.mensajeria;

import lombok.*;

import java.util.Map;

/**
 * DTO que mapea el evento publicado por micro-novedades via RabbitMQ.
 *
 * Campos actuales del evento:
 *   tipo, novedadId, usuarioId, municipio, categoria,
 *   fechaHecho, nivelConfianza, nivelVisibilidad, timestamp
 *
 * Campos enriquecidos (requieren cambio en novedades):
 *   muertosTotales, heridosTotales, desplazadosTotales,
 *   confinadosTotales, muertosCiviles, muertosFuerzaPublica,
 *   heridosCiviles, actor1, actor2, localidadEspecifica,
 *   descripcionHecho
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NovedadEventoDTO {
    private String tipo;
    private String novedadId;
    private Boolean oculto;
    private String usuarioId;
    private String municipio;
    private String categoria;
    private String fechaHecho;
    private String nivelConfianza;
    private String nivelVisibilidad;
    private String timestamp;

    // Campos enriquecidos (afectación humana)
    private Integer muertosTotales;
    private Integer muertosCiviles;
    private Integer muertosFuerzaPublica;
    private Integer heridosTotales;
    private Integer heridosCiviles;
    private Integer desplazadosTotales;
    private Integer confinadosTotales;

    // Campos adicionales
    private String actor1;
    private String actor2;
    private String localidadEspecifica;
    private String descripcionHecho;
}
