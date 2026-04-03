package co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EvidenciaDTORespuesta {

    private UUID idEvidencia;
    private String urlArchivo;
}
