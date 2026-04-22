package unicauca.edu.co.micro_usuarios.Services.RabbitMQService.Models;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UsuarioEvent<T> {
    private String eventType;
    private String eventVersion;
    private LocalDateTime eventDate;
    private T data;
}
