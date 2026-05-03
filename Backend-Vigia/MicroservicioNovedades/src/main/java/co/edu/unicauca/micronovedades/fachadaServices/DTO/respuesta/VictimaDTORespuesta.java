package co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.GeneroVictima;
import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.GrupoPoblacional;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VictimaDTORespuesta {

    private UUID victimaId;
    private String nombreVictima;
    private GeneroVictima generoVictima;
    private Integer edadVictima;
    private GrupoPoblacional grupoPoblacional;
    private String ocupacionVictima;
}
