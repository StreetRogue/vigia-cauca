package unicauca.edu.co.micro_usuarios.Exceptions;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ApiError {
    private LocalDateTime timestamp; // Momento del error
    private int status;              // Código HTTP de error
    private String error;            // Tipo de error
    private String message;          // Mensaje
    private String path;             // Endpoint donde ocurrio
}
