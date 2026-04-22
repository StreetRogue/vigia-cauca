package co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.GeneroVictima;
import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.GrupoPoblacional;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VictimaDTOPeticion {

    @NotBlank(message = "El nombre de la víctima es obligatorio")
    private String nombreVictima;

    @NotNull(message = "El género es obligatorio")
    private GeneroVictima generoVictima;

    private Integer edadVictima;

    private GrupoPoblacional grupoPoblacional;

    private String ocupacionVictima;
}
