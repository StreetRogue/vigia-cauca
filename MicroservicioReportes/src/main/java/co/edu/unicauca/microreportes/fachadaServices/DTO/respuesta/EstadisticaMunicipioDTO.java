package co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EstadisticaMunicipioDTO {
    private String municipio;
    private Long totalEventos;
    private Long totalMuertos;
    private Long totalHeridos;
    private Long totalDesplazados;
}
