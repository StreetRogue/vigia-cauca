package unicauca.edu.co.micro_usuarios.Mapper;

import unicauca.edu.co.micro_usuarios.DTOs.Request.UsuarioCreateDTO;
import unicauca.edu.co.micro_usuarios.DTOs.Response.MunicipioResponseDTO;
import unicauca.edu.co.micro_usuarios.DTOs.Response.UsuarioResponseDTO;
import unicauca.edu.co.micro_usuarios.Entities.Usuario;
import unicauca.edu.co.micro_usuarios.Services.RabbitMQService.Models.UsuarioPayload;

public class UsuarioMapper {

    public static Usuario toEntity(UsuarioCreateDTO dto) {
        return Usuario.builder()
                .cedula(dto.getCedula())
                .nombre(dto.getNombre())
                .telefono(dto.getTelefono())
                .email(dto.getEmail())
                .idMunicipio(dto.getIdMunicipio())
                .username(dto.getUsername())
                .rol(dto.getRol())
                .build();
    }

    public static UsuarioResponseDTO toDTO(Usuario usuario, MunicipioResponseDTO municipio) {
        return UsuarioResponseDTO.builder()
                .idUsuario(usuario.getIdUsuario())
                .idIam(usuario.getIdIam())
                .cedula(usuario.getCedula())
                .nombre(usuario.getNombre())
                .telefono(usuario.getTelefono())
                .email(usuario.getEmail())
                .municipio(municipio)
                .username(usuario.getUsername())
                .rol(usuario.getRol())
                .estado(usuario.getEstado())
                .fechaCreacion(usuario.getFechaCreacion())
                .fechaActualizacion(usuario.getFechaActualizacion())
                .creadoPor(usuario.getCreadoPor())
                .editadoPor(usuario.getEditadoPor())
                .build();
    }

    public static UsuarioPayload toEvent(UsuarioResponseDTO usuario) {
        UsuarioPayload event = new UsuarioPayload();

        event.setIdUsuario(usuario.getIdUsuario());
        event.setIdIam(usuario.getIdIam());
        event.setCedula(usuario.getCedula());
        event.setNombre(usuario.getNombre());
        event.setTelefono(usuario.getTelefono());
        event.setEmail(usuario.getEmail());

        event.setMunicipioId(usuario.getMunicipio().getIdMunicipio());
        event.setMunicipioNombre(usuario.getMunicipio().getNombre());

        event.setUsername(usuario.getUsername());

        event.setRol(usuario.getRol().name());
        event.setEstado(usuario.getEstado().name());

        event.setFechaCreacion(usuario.getFechaCreacion().toString());
        if (usuario.getFechaActualizacion() != null) {
            event.setFechaActualizacion(usuario.getFechaActualizacion().toString());
        } else {
            event.setFechaActualizacion(null);
        }

        event.setCreadoPor(usuario.getCreadoPor());
        if (usuario.getEditadoPor() != null) {
            event.setFechaActualizacion(usuario.getEditadoPor());
        } else {
            event.setFechaActualizacion(null);
        }
        event.setEditadoPor(usuario.getEditadoPor());

        return event;
    }
}
