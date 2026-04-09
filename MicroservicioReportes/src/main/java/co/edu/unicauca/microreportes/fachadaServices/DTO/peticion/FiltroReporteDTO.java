package co.edu.unicauca.microreportes.fachadaServices.DTO.peticion;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.CategoriaEvento;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FiltroReporteDTO {
    private Integer anio;
    private String municipio;
    private CategoriaEvento categoria;
    private String formato; // EXCEL, PDF (futuro)
}
