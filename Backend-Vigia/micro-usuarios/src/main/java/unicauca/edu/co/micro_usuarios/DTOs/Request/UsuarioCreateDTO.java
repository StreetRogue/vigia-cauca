package unicauca.edu.co.micro_usuarios.DTOs.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import unicauca.edu.co.micro_usuarios.Entities.Rol;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioCreateDTO {

    @NotBlank(message = "La cédula es obligatoria")
    private String cedula;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(
            regexp = "3\\d{9}",
            message = "El teléfono debe ser un número celular válido (10 dígitos y empezar por 3)"
    )
    private String telefono;

    @Email(message = "El email no es válido")
    @NotBlank(message = "El email es obligatorio")
    private String email;

    @NotNull(message = "El municipio es obligatorio")
    private Long idMunicipio;

    @NotBlank(message = "El username es obligatorio")
    private String username;

    @NotNull(message = "El rol es obligatorio")
    private Rol rol;
}
