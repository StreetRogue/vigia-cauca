package unicauca.edu.co.micro_usuarios.Services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import unicauca.edu.co.micro_usuarios.Clients.UbicacionesClient;
import unicauca.edu.co.micro_usuarios.DTOs.Request.UsuarioCreateDTO;
import unicauca.edu.co.micro_usuarios.DTOs.Request.UsuarioUpdateDTO;
import unicauca.edu.co.micro_usuarios.DTOs.Response.MunicipioResponseDTO;
import unicauca.edu.co.micro_usuarios.DTOs.Response.PageResponseDTO;
import unicauca.edu.co.micro_usuarios.DTOs.Response.UsuarioResponseDTO;
import unicauca.edu.co.micro_usuarios.Entities.EstadoUsuario;
import unicauca.edu.co.micro_usuarios.Entities.Rol;
import unicauca.edu.co.micro_usuarios.Entities.Usuario;
import unicauca.edu.co.micro_usuarios.Exceptions.CedulaAlreadyExistsException;
import unicauca.edu.co.micro_usuarios.Exceptions.EmailAlreadyExistsException;
import unicauca.edu.co.micro_usuarios.Exceptions.InvalidOperationException;
import unicauca.edu.co.micro_usuarios.Exceptions.UsernameAlreadyExistsException;
import unicauca.edu.co.micro_usuarios.Exceptions.UsuarioNotFoundException;
import unicauca.edu.co.micro_usuarios.Repository.UsuarioRepository;
import unicauca.edu.co.micro_usuarios.Services.IAMService.IamService;
import unicauca.edu.co.micro_usuarios.Services.RabbitMQService.UsuarioEventPublisher;
import unicauca.edu.co.micro_usuarios.Services.UsuarioService.UsuarioServiceImpl;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias reales (JUnit 5 + Mockito) de la logica de negocio de usuarios.
 * Cubre HE-01 (HU-1.3/1.4/1.5/1.6/1.8) y HE-04 (HU-4.1/4.2/4.3).
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class UsuarioServiceImplTest {

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private IamService iamService;
    @Mock private UbicacionesClient ubicacionesClient;
    @Mock private UsuarioEventPublisher usuarioEventPublisher;
    @InjectMocks private UsuarioServiceImpl service;

    private UsuarioCreateDTO createDTO;
    private Usuario usuario;
    private MunicipioResponseDTO municipio;
    private final String ADMIN_IAM = "kc-admin-001";

    @BeforeEach
    void setUp() {
        createDTO = UsuarioCreateDTO.builder()
                .cedula("1061771234").nombre("Operador Prueba").telefono("3001112233")
                .email("op.prueba@vigia.gov.co").idMunicipio(19001L).username("op.prueba")
                .rol(Rol.OPERADOR).password("Secreta#2026").build();

        municipio = MunicipioResponseDTO.builder().idMunicipio(19001L).nombre("POPAYAN").build();

        usuario = Usuario.builder()
                .idUsuario(UUID.randomUUID()).idKeycloak("kc-op-100").cedula("1061771234")
                .nombre("Operador Prueba").telefono("3001112233").email("op.prueba@vigia.gov.co")
                .idMunicipio(19001L).username("op.prueba").rol(Rol.OPERADOR)
                .estado(EstadoUsuario.ACTIVO).creadoPor(ADMIN_IAM).build();
    }

    // ---------- HU-1.3 / HU-4.1 : Crear usuario ----------
    @Test @DisplayName("HE01-HU1.3-CA1 / HE04-HU4.1: registro exitoso de operador")
    void registrarUsuario_exitoso() {
        when(usuarioRepository.findByCedula(anyString())).thenReturn(Optional.empty());
        when(usuarioRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(usuarioRepository.findByUsername(anyString())).thenReturn(Optional.empty());
        when(ubicacionesClient.getMunicipio(19001L)).thenReturn(municipio);
        when(iamService.crearUsuario(anyString(), anyString(), any(Rol.class), anyString())).thenReturn("kc-op-100");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

        UsuarioResponseDTO res = service.registrarUsuario(createDTO, ADMIN_IAM);

        assertNotNull(res);
        assertEquals("op.prueba@vigia.gov.co", res.getEmail());
        assertEquals(Rol.OPERADOR, res.getRol());
        assertEquals("POPAYAN", res.getMunicipio().getNombre());
        verify(usuarioRepository).save(any(Usuario.class));
        verify(usuarioEventPublisher).publicarCreacion(any(UsuarioResponseDTO.class));
        verify(iamService).crearUsuario(eq("op.prueba@vigia.gov.co"), eq("op.prueba"), eq(Rol.OPERADOR), anyString());
    }

    @Test @DisplayName("HE01-HU1.3-CA2 (cedula): cedula duplicada lanza excepcion")
    void registrarUsuario_cedulaDuplicada() {
        when(usuarioRepository.findByCedula("1061771234")).thenReturn(Optional.of(usuario));
        assertThrows(CedulaAlreadyExistsException.class, () -> service.registrarUsuario(createDTO, ADMIN_IAM));
        verify(usuarioRepository, never()).save(any());
        verify(iamService, never()).crearUsuario(any(), any(), any(), any());
    }

    @Test @DisplayName("HE01-HU1.3-CA2: email duplicado lanza excepcion")
    void registrarUsuario_emailDuplicado() {
        when(usuarioRepository.findByCedula(anyString())).thenReturn(Optional.empty());
        when(usuarioRepository.findByEmail("op.prueba@vigia.gov.co")).thenReturn(Optional.of(usuario));
        assertThrows(EmailAlreadyExistsException.class, () -> service.registrarUsuario(createDTO, ADMIN_IAM));
        verify(iamService, never()).crearUsuario(any(), any(), any(), any());
    }

    @Test @DisplayName("HE01-HU1.3-CA2 (username): username duplicado lanza excepcion")
    void registrarUsuario_usernameDuplicado() {
        when(usuarioRepository.findByCedula(anyString())).thenReturn(Optional.empty());
        when(usuarioRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(usuarioRepository.findByUsername("op.prueba")).thenReturn(Optional.of(usuario));
        assertThrows(UsernameAlreadyExistsException.class, () -> service.registrarUsuario(createDTO, ADMIN_IAM));
    }

    @Test @DisplayName("HE04-HU4.1: municipio inexistente -> InvalidOperationException")
    void registrarUsuario_municipioInvalido() {
        when(usuarioRepository.findByCedula(anyString())).thenReturn(Optional.empty());
        when(usuarioRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(usuarioRepository.findByUsername(anyString())).thenReturn(Optional.empty());
        when(ubicacionesClient.getMunicipio(anyLong())).thenThrow(new RuntimeException("404 municipio"));
        assertThrows(InvalidOperationException.class, () -> service.registrarUsuario(createDTO, ADMIN_IAM));
        verify(iamService, never()).crearUsuario(any(), any(), any(), any());
    }

    // ---------- HU-1.4 / HU-4.2 : Editar usuario ----------
    @Test @DisplayName("HE01-HU1.4-CA1 / HE04-HU4.2: edicion exitosa")
    void editarUsuario_exitoso() {
        UUID id = usuario.getIdUsuario();
        UsuarioUpdateDTO upd = UsuarioUpdateDTO.builder().nombre("Nombre Editado").telefono("3009998877").build();
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        when(ubicacionesClient.getMunicipio(anyLong())).thenReturn(municipio);
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

        UsuarioResponseDTO res = service.editarUsuario(id, upd, ADMIN_IAM);

        assertNotNull(res);
        verify(usuarioRepository).save(any(Usuario.class));
        verify(usuarioEventPublisher).publicarActualizacion(any(UsuarioResponseDTO.class));
    }

    @Test @DisplayName("HE01-HU1.4: editar usuario inexistente -> UsuarioNotFoundException")
    void editarUsuario_noEncontrado() {
        UUID id = UUID.randomUUID();
        when(usuarioRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(UsuarioNotFoundException.class,
                () -> service.editarUsuario(id, UsuarioUpdateDTO.builder().nombre("x").build(), ADMIN_IAM));
    }

    @Test @DisplayName("HE04-HU4.3: el admin no puede inactivarse a si mismo")
    void editarUsuario_autoInactivacion_prohibida() {
        usuario.setIdKeycloak(ADMIN_IAM);
        UUID id = usuario.getIdUsuario();
        UsuarioUpdateDTO upd = UsuarioUpdateDTO.builder().estado(EstadoUsuario.INACTIVO).build();
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        assertThrows(InvalidOperationException.class, () -> service.editarUsuario(id, upd, ADMIN_IAM));
    }

    @Test @DisplayName("HE04-HU4.3 / HU-1.8: cambiar a INACTIVO bloquea en el IAM")
    void editarUsuario_inactivar_bloqueaIam() {
        UUID id = usuario.getIdUsuario();
        UsuarioUpdateDTO upd = UsuarioUpdateDTO.builder().estado(EstadoUsuario.INACTIVO).build();
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        when(ubicacionesClient.getMunicipio(anyLong())).thenReturn(municipio);
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

        service.editarUsuario(id, upd, ADMIN_IAM);
        verify(iamService).bloquearUsuario(usuario.getIdKeycloak());
    }

    // ---------- HU-1.5 : Perfil propio ----------
    @Test @DisplayName("HE01-HU1.5: obtener perfil propio por id IAM")
    void getByIdIam_exitoso() {
        when(usuarioRepository.findByIdKeycloak("kc-op-100")).thenReturn(Optional.of(usuario));
        when(ubicacionesClient.getMunicipio(19001L)).thenReturn(municipio);
        UsuarioResponseDTO res = service.getByIdIam("kc-op-100");
        assertEquals("op.prueba", res.getUsername());
    }

    @Test @DisplayName("HE01-HU1.5: perfil propio inexistente -> 404 (raiz de DEF-C1-01)")
    void getByIdIam_noEncontrado() {
        when(usuarioRepository.findByIdKeycloak(anyString())).thenReturn(Optional.empty());
        assertThrows(UsuarioNotFoundException.class, () -> service.getByIdIam("kc-desconocido"));
    }

    @Test @DisplayName("getUserById inexistente -> UsuarioNotFoundException")
    void getUserById_noEncontrado() {
        UUID id = UUID.randomUUID();
        when(usuarioRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(UsuarioNotFoundException.class, () -> service.getUserById(id));
    }

    // ---------- HU-1.6 : Cambiar contrasena propia ----------
    @Test @DisplayName("HE01-HU1.6-CA1: cambio de contrasena propia delega en el IAM")
    void cambiarPasswordPropio_exitoso() {
        when(usuarioRepository.findByIdKeycloak("kc-op-100")).thenReturn(Optional.of(usuario));
        service.cambiarPasswordPropio("kc-op-100", "NuevaClave#2026");
        verify(iamService).actualizarUsuario(eq("kc-op-100"), any(UsuarioUpdateDTO.class));
    }

    @Test @DisplayName("HE01-HU1.6: cambiar contrasena de usuario inexistente -> 404")
    void cambiarPasswordPropio_noEncontrado() {
        when(usuarioRepository.findByIdKeycloak(anyString())).thenReturn(Optional.empty());
        assertThrows(UsuarioNotFoundException.class,
                () -> service.cambiarPasswordPropio("kc-x", "x"));
        verify(iamService, never()).actualizarUsuario(any(), any());
    }

    // ---------- HU-1.8 / HU-4.3 : Desactivar (soft-delete) ----------
    @Test @DisplayName("HE01-HU1.8 / HE04-HU4.3: soft-delete cambia a INACTIVO y bloquea IAM")
    void eliminarUsuario_softDelete() {
        UUID id = usuario.getIdUsuario();
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        when(ubicacionesClient.getMunicipio(anyLong())).thenReturn(municipio);
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

        service.eliminarUsuario(id, ADMIN_IAM);

        assertEquals(EstadoUsuario.INACTIVO, usuario.getEstado());
        verify(iamService).bloquearUsuario("kc-op-100");
        verify(usuarioEventPublisher).publicarActualizacion(any(UsuarioResponseDTO.class));
    }

    @Test @DisplayName("HE04-HU4.3: el admin no puede eliminarse a si mismo")
    void eliminarUsuario_autoEliminacion_prohibida() {
        usuario.setIdKeycloak(ADMIN_IAM);
        UUID id = usuario.getIdUsuario();
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        assertThrows(InvalidOperationException.class, () -> service.eliminarUsuario(id, ADMIN_IAM));
        verify(usuarioRepository, never()).save(any());
    }

    @Test @DisplayName("HE01-HU1.8: eliminar usuario inexistente -> 404")
    void eliminarUsuario_noEncontrado() {
        UUID id = UUID.randomUUID();
        when(usuarioRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(UsuarioNotFoundException.class, () -> service.eliminarUsuario(id, ADMIN_IAM));
    }

    // ---------- HU-4.2 : Listar / filtrar ----------
    @Test @DisplayName("HE04-HU4.2: listar usuarios con filtros devuelve pagina mapeada")
    void listarUsuarios_conFiltros() {
        Page<Usuario> page = new PageImpl<>(List.of(usuario));
        when(usuarioRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);
        when(ubicacionesClient.getMunicipios(anyList())).thenReturn(List.of(municipio));

        PageResponseDTO<UsuarioResponseDTO> res = service.listarUsuarios("OPERADOR", "ACTIVO", 19001L, 0, 10);

        assertEquals(1, res.getContent().size());
        assertEquals("op.prueba", res.getContent().get(0).getUsername());
    }

    @Test @DisplayName("HE04-HU4.2: el tamano de pagina se limita a 50")
    void listarUsuarios_limitaSize() {
        Page<Usuario> page = new PageImpl<>(List.of(usuario));
        when(usuarioRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);
        when(ubicacionesClient.getMunicipios(anyList())).thenReturn(List.of(municipio));
        PageResponseDTO<UsuarioResponseDTO> res = service.listarUsuarios(null, null, null, 0, 999);
        assertNotNull(res);
        assertEquals(1, res.getContent().size());
    }

    // ---------- HU-1.3 : Validaciones en tiempo real ----------
    @Test @DisplayName("HE01-HU1.3: existsByCedula refleja la BD")
    void existsByCedula() {
        when(usuarioRepository.findByCedula("1061771234")).thenReturn(Optional.of(usuario));
        when(usuarioRepository.findByCedula("0000")).thenReturn(Optional.empty());
        assertTrue(service.existsByCedula("1061771234"));
        assertFalse(service.existsByCedula("0000"));
    }

    @Test @DisplayName("HE01-HU1.3: existsByEmail / existsByUsername reflejan la BD")
    void existsByEmailUsername() {
        when(usuarioRepository.findByEmail("op.prueba@vigia.gov.co")).thenReturn(Optional.of(usuario));
        when(usuarioRepository.findByUsername("op.prueba")).thenReturn(Optional.of(usuario));
        assertTrue(service.existsByEmail("op.prueba@vigia.gov.co"));
        assertTrue(service.existsByUsername("op.prueba"));
    }
}
