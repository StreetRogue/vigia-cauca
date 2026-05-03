package unicauca.edu.co.micro_usuarios.Services.RabbitMQService.Models;

import lombok.Data;
import java.io.Serializable;
import java.util.UUID;

@Data
public class UsuarioPayload implements Serializable {

    private UUID idUsuario;
    private String idIam;
    private String cedula;
    private String nombre;
    private String telefono;
    private String email;
    private Long municipioId;
    private String municipioNombre;
    private String username;
    private String rol;
    private String estado;
    private String fechaCreacion;
    private String fechaActualizacion;
    private String creadoPor;
    private String editadoPor;
}