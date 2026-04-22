package co.edu.unicauca.microreportes.mensajeria;

import lombok.*;

/**
 * Datos demográficos de una víctima individual dentro de un evento RabbitMQ.
 *
 * Espeja exactamente los campos de VictimaEntity en MicroservicioNovedades:
 *   nombreVictima, generoVictima, edadVictima, grupoPoblacional, ocupacionVictima
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VictimaEventoDTO {

    private String nombreVictima;

    /** MASCULINO | FEMENINO | LGBTI_PLUS | NO_ESPECIFICADO */
    private String generoVictima;

    private Integer edadVictima;

    /** NINO | ADOLESCENTE | ADULTO | ADULTO_MAYOR | INDIGENA |
     *  AFRODESCENDIENTE | CAMPESINO | DISCAPACIDAD | OTRO */
    private String grupoPoblacional;

    private String ocupacionVictima;
}
