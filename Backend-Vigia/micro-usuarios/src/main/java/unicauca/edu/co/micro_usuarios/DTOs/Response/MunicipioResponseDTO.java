package unicauca.edu.co.micro_usuarios.DTOs.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MunicipioResponseDTO {
    private Long idMunicipio;
    private String nombre;
}
