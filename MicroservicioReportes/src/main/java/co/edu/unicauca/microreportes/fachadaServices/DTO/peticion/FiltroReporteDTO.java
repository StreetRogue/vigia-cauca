package co.edu.unicauca.microreportes.fachadaServices.DTO.peticion;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.Actor;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.CategoriaEvento;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.NivelConfianza;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.NivelVisibilidad;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FiltroReporteDTO {
    private Integer anio;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String municipio;
    private CategoriaEvento categoria;
    private Actor actor1;
    private NivelConfianza nivelConfianza;
}