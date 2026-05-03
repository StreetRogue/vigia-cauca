package unicauca.edu.co.micro_usuarios.DTOs.Response;

import lombok.Builder;
import lombok.Getter;
import unicauca.edu.co.micro_usuarios.Entities.EstadoUsuario;
import unicauca.edu.co.micro_usuarios.Entities.Rol;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class UsuarioResponseDTO {
    private UUID idUsuario;
    private String idIam;
    private String cedula;
    private String nombre;
    private String telefono;
    private String email;
    private MunicipioResponseDTO municipio;
    private String username;
    private Rol rol;
    private EstadoUsuario estado;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private String creadoPor;
    private String editadoPor;
}
