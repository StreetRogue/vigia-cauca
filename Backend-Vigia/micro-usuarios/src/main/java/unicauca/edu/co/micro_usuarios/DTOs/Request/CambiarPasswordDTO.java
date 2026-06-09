package unicauca.edu.co.micro_usuarios.DTOs.Request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CambiarPasswordDTO {
    @NotBlank(message = "La contraseña no puede estar vacía")
    private String password;
}
