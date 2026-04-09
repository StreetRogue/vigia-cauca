package co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SerieTemporalDTO {
    private Integer mes;
    private String nombreMes;
    private Long totalEventos;
    private Long totalMuertos;
    private Long totalHeridos;
}
