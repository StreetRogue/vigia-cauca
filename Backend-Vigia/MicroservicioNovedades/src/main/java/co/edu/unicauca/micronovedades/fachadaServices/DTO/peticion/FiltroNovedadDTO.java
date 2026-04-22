package co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.CategoriaEvento;
import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.NivelVisibilidad;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FiltroNovedadDTO {

    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String municipio;
    private CategoriaEvento categoria;
    private NivelVisibilidad nivelVisibilidad;
}
