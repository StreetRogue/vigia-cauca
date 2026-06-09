package unicauca.edu.co.micro_usuarios.Mapper;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import unicauca.edu.co.micro_usuarios.DTOs.Request.UsuarioCreateDTO;
import unicauca.edu.co.micro_usuarios.DTOs.Response.MunicipioResponseDTO;
import unicauca.edu.co.micro_usuarios.DTOs.Response.UsuarioResponseDTO;
import unicauca.edu.co.micro_usuarios.Entities.EstadoUsuario;
import unicauca.edu.co.micro_usuarios.Entities.Rol;
import unicauca.edu.co.micro_usuarios.Entities.Usuario;
import unicauca.edu.co.micro_usuarios.Services.RabbitMQService.Models.UsuarioPayload;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class UsuarioMapperTest {

    @Test @DisplayName("HU-4.1: toEntity mapea todos los campos del DTO de creacion")
    void toEntity_mapeaCamposCompletos() {
        UsuarioCreateDTO dto = UsuarioCreateDTO.builder()
                .cedula("1061770001").nombre("Ana Test").telefono("3001112233")
                .email("ana@vigia.gov.co").idMunicipio(19001L).username("ana.test")
                .rol(Rol.OPERADOR).password("Clave#123").build();

        Usuario entity = UsuarioMapper.toEntity(dto);

        assertEquals("1061770001", entity.getCedula());
        assertEquals("Ana Test", entity.getNombre());
        assertEquals("3001112233", entity.getTelefono());
        assertEquals("ana@vigia.gov.co", entity.getEmail());
        assertEquals(19001L, entity.getIdMunicipio());
        assertEquals("ana.test", entity.getUsername());
        assertEquals(Rol.OPERADOR, entity.getRol());
    }

    @Test @DisplayName("HU-4.1: toEntity no copia password (no es campo de entidad)")
    void toEntity_noCopiaCamposDeSeguridad() {
        UsuarioCreateDTO dto = UsuarioCreateDTO.builder()
                .cedula("C1").nombre("X").telefono("3000000000")
                .email("x@x.co").idMunicipio(1L).username("usr")
                .rol(Rol.ADMIN).password("SuperSecreta").build();

        Usuario entity = UsuarioMapper.toEntity(dto);
        assertNull(entity.getIdKeycloak());
        assertNull(entity.getEstado());
        assertNull(entity.getIdUsuario());
    }

    @Test @DisplayName("HU-4.2: toDTO mapea entidad + municipio a response")
    void toDTO_mapeaEntidadYMunicipio() {
        UUID id = UUID.randomUUID();
        LocalDateTime ahora = LocalDateTime.now();
        Usuario u = Usuario.builder()
                .idUsuario(id).idKeycloak("kc-001").cedula("C1").nombre("N1")
                .telefono("3000000000").email("e@e.co").idMunicipio(19001L)
                .username("user1").rol(Rol.ADMIN).estado(EstadoUsuario.ACTIVO)
                .fechaCreacion(ahora).creadoPor("admin").build();
        MunicipioResponseDTO mun = MunicipioResponseDTO.builder()
                .idMunicipio(19001L).nombre("POPAYAN").build();

        UsuarioResponseDTO dto = UsuarioMapper.toDTO(u, mun);

        assertEquals(id, dto.getIdUsuario());
        assertEquals("kc-001", dto.getIdKeycloak());
        assertEquals("POPAYAN", dto.getMunicipio().getNombre());
        assertEquals(Rol.ADMIN, dto.getRol());
        assertEquals(EstadoUsuario.ACTIVO, dto.getEstado());
        assertEquals(ahora, dto.getFechaCreacion());
    }

    @Test @DisplayName("HU-4.2: toDTO acepta fechaActualizacion null sin error")
    void toDTO_fechaActualizacionNull() {
        Usuario u = Usuario.builder()
                .idUsuario(UUID.randomUUID()).cedula("C1").nombre("N").telefono("3000000000")
                .email("e@e.co").idMunicipio(1L).username("u").rol(Rol.OPERADOR)
                .estado(EstadoUsuario.ACTIVO).fechaCreacion(LocalDateTime.now()).creadoPor("a").build();
        MunicipioResponseDTO mun = MunicipioResponseDTO.builder().idMunicipio(1L).nombre("M").build();

        UsuarioResponseDTO dto = UsuarioMapper.toDTO(u, mun);
        assertNull(dto.getFechaActualizacion());
        assertNull(dto.getEditadoPor());
    }

    @Test @DisplayName("HU-4.1: toEvent mapea response DTO a evento RabbitMQ")
    void toEvent_mapeaCamposCompletos() {
        UUID id = UUID.randomUUID();
        LocalDateTime ahora = LocalDateTime.now();
        UsuarioResponseDTO resp = UsuarioResponseDTO.builder()
                .idUsuario(id).idKeycloak("kc-002").cedula("C2").nombre("N2")
                .telefono("3111111111").email("n2@e.co")
                .municipio(MunicipioResponseDTO.builder().idMunicipio(19002L).nombre("PIENDAMO").build())
                .username("usr2").rol(Rol.OPERADOR).estado(EstadoUsuario.ACTIVO)
                .fechaCreacion(ahora).creadoPor("admin").build();

        UsuarioPayload payload = UsuarioMapper.toEvent(resp);

        assertEquals(id, payload.getIdUsuario());
        assertEquals("kc-002", payload.getIdKeycloak());
        assertEquals(19002L, payload.getMunicipioId());
        assertEquals("PIENDAMO", payload.getMunicipioNombre());
        assertEquals("OPERADOR", payload.getRol());
        assertEquals("ACTIVO", payload.getEstado());
    }

    @Test @DisplayName("HU-4.2: toEvent con fechaActualizacion null no falla")
    void toEvent_fechaActualizacionNull() {
        UsuarioResponseDTO resp = UsuarioResponseDTO.builder()
                .idUsuario(UUID.randomUUID()).idKeycloak("kc")
                .cedula("C").nombre("N").telefono("3000000000").email("e@e.co")
                .municipio(MunicipioResponseDTO.builder().idMunicipio(1L).nombre("M").build())
                .username("u").rol(Rol.ADMIN).estado(EstadoUsuario.ACTIVO)
                .fechaCreacion(LocalDateTime.now()).creadoPor("x").build();

        UsuarioPayload p = UsuarioMapper.toEvent(resp);
        assertNull(p.getFechaActualizacion());
    }

    @Test @DisplayName("HU-4.2: toEvent con editadoPor presente lo copia")
    void toEvent_editadoPorPresente() {
        UsuarioResponseDTO resp = UsuarioResponseDTO.builder()
                .idUsuario(UUID.randomUUID()).idKeycloak("kc")
                .cedula("C").nombre("N").telefono("3000000000").email("e@e.co")
                .municipio(MunicipioResponseDTO.builder().idMunicipio(1L).nombre("M").build())
                .username("u").rol(Rol.OPERADOR).estado(EstadoUsuario.INACTIVO)
                .fechaCreacion(LocalDateTime.now())
                .fechaActualizacion(LocalDateTime.now())
                .creadoPor("admin").editadoPor("admin").build();

        UsuarioPayload p = UsuarioMapper.toEvent(resp);
        assertEquals("admin", p.getEditadoPor());
    }

    @Test @DisplayName("HU-1.3: toEntity preserva tipo Rol exacto (OPERADOR/ADMIN)")
    void toEntity_preservaTipoRol() {
        UsuarioCreateDTO admin = UsuarioCreateDTO.builder()
                .cedula("A1").nombre("Admin").telefono("3000000001")
                .email("a@a.co").idMunicipio(1L).username("adm")
                .rol(Rol.ADMIN).password("P").build();
        UsuarioCreateDTO op = UsuarioCreateDTO.builder()
                .cedula("O1").nombre("Op").telefono("3000000002")
                .email("o@o.co").idMunicipio(1L).username("op")
                .rol(Rol.OPERADOR).password("P").build();

        assertEquals(Rol.ADMIN, UsuarioMapper.toEntity(admin).getRol());
        assertEquals(Rol.OPERADOR, UsuarioMapper.toEntity(op).getRol());
    }
}
