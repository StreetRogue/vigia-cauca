package unicauca.edu.co.micro_usuarios.DTOs.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import unicauca.edu.co.micro_usuarios.Entities.EstadoUsuario;
import unicauca.edu.co.micro_usuarios.Entities.Rol;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioUpdateDTO {
    private String cedula;
    private String nombre;

    @Pattern(
            regexp = "3\\d{9}",
            message = "El teléfono debe ser un número celular válido (10 dígitos y empezar por 3)"
    )
    private String telefono;

    @Email(message = "El email no es válido")
    private String email;

    private Long idMunicipio;
    private String username;
    private Rol rol;
    private EstadoUsuario estado;
    private String password;
}
