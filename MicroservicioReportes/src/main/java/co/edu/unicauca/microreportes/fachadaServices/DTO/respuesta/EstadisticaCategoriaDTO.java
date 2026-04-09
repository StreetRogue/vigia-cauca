package co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.CategoriaEvento;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EstadisticaCategoriaDTO {
    private CategoriaEvento categoria;
    private Long totalEventos;
    private Long totalMuertos;
    private Long totalHeridos;
}
