package unicauca.edu.co.micro_ubicaciones.DTOs.Response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MunicipioResponseDTO {
    private Long idMunicipio;
    private String nombre;
}
