package unicauca.edu.co.micro_usuarios.Services.UsuarioService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import unicauca.edu.co.micro_usuarios.Clients.UbicacionesClient;
import unicauca.edu.co.micro_usuarios.DTOs.Request.UsuarioCreateDTO;
import unicauca.edu.co.micro_usuarios.DTOs.Request.UsuarioUpdateDTO;
import unicauca.edu.co.micro_usuarios.DTOs.Response.MunicipioResponseDTO;
import unicauca.edu.co.micro_usuarios.DTOs.Response.PageResponseDTO;
import unicauca.edu.co.micro_usuarios.DTOs.Response.UsuarioResponseDTO;
import unicauca.edu.co.micro_usuarios.Entities.EstadoUsuario;
import unicauca.edu.co.micro_usuarios.Entities.Rol;
import unicauca.edu.co.micro_usuarios.Entities.Usuario;
import unicauca.edu.co.micro_usuarios.Exceptions.EmailAlreadyExistsException;
import unicauca.edu.co.micro_usuarios.Exceptions.InvalidOperationException;
import unicauca.edu.co.micro_usuarios.Exceptions.UsernameAlreadyExistsException;
import unicauca.edu.co.micro_usuarios.Exceptions.UsuarioNotFoundException;
import unicauca.edu.co.micro_usuarios.Mapper.UsuarioMapper;
import unicauca.edu.co.micro_usuarios.Repository.UsuarioRepository;
import unicauca.edu.co.micro_usuarios.Services.Auth0Service.Auth0Service;
import unicauca.edu.co.micro_usuarios.Services.RabbitMQService.UsuarioEventPublisher;
import unicauca.edu.co.micro_usuarios.Specifications.UsuarioSpecification;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {
    private final UsuarioEventPublisher usuarioEventPublisher;
    private final UsuarioRepository usuarioRepository;
    private final Auth0Service auth0Service;
    private final UbicacionesClient ubicacionesClient;

    @Override
    public UsuarioResponseDTO registrarUsuario(UsuarioCreateDTO dto, String adminAuth0Id) {
        // Validaciones
        if (usuarioRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("El email ya está registrado");
        }

        if (usuarioRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new UsernameAlreadyExistsException("El username ya existe");
        }

        MunicipioResponseDTO municipio;

        try {
            municipio = ubicacionesClient.getMunicipio(dto.getIdMunicipio());
        } catch (Exception e) {
            log.error("Error consultando municipio: {}", e);
            throw new InvalidOperationException("Error consultando municipio: " + e.getMessage());
        }

        // Convertir DTO a entidad
        Usuario usuario = UsuarioMapper.toEntity(dto);

        // Crear usuario en Auth0
        String auth0Id = auth0Service.crearUsuario(
                dto.getEmail(),
                dto.getUsername(),
                dto.getRol()
        );

        usuario.setIdAuth0(auth0Id);

        log.info("Usuario creado en Auth0 | idAuth0={}", auth0Id);

        // Auditoría
        usuario.setCreadoPor(adminAuth0Id);

        // Guardar en DB
        Usuario guardado = usuarioRepository.save(usuario);

        // Generar ticket
        try {
            String ticketCambio = auth0Service.generarTicketCambioPassword(auth0Id);
            log.info("Link del ticket de cambio: {}", ticketCambio);
        } catch (Exception e) {
            log.error("Error generando ticket de cambio de password | userId={}", auth0Id, e);
        }

        UsuarioResponseDTO usuarioResponseDTO = UsuarioMapper.toDTO(guardado, municipio);

        // Publicar en la cola la creacion del usuario
        usuarioEventPublisher.publicarCreacion(usuarioResponseDTO);

        return usuarioResponseDTO;
    }

    @Override
    public UsuarioResponseDTO editarUsuario(UUID id, UsuarioUpdateDTO dto, String adminAuth0Id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new UsuarioNotFoundException("Usuario no encontrado"));

        if (usuario.getIdAuth0().equals(adminAuth0Id)
                && EstadoUsuario.INACTIVO.equals(dto.getEstado())) {
            throw new InvalidOperationException("No puedes inactivarte a ti mismo");
        }

        MunicipioResponseDTO municipio;

        if (dto.getIdMunicipio() != null) {
            try {
                municipio = ubicacionesClient.getMunicipio(dto.getIdMunicipio());
            } catch (Exception e) {
                throw new InvalidOperationException("El municipio no existe");
            }
            usuario.setIdMunicipio(dto.getIdMunicipio());
        } else {
            // Si no viene en el DTO, igual lo necesitamos para el response
            municipio = ubicacionesClient.getMunicipio(usuario.getIdMunicipio());
        }

        // Actualizar datos básicos
        if (dto.getNombre() != null) usuario.setNombre(dto.getNombre());
        if (dto.getEmail() != null) usuario.setEmail(dto.getEmail());
        if (dto.getTelefono() != null) usuario.setTelefono(dto.getTelefono());
        if (dto.getUsername() != null) usuario.setUsername(dto.getUsername());
        if (dto.getRol() != null) usuario.setRol(dto.getRol());

        // Actualizar Estado
        if (dto.getEstado() != null) {
            usuario.setEstado(dto.getEstado());

            if (dto.getEstado().equals(EstadoUsuario.INACTIVO)) {
                auth0Service.bloquearUsuario(usuario.getIdAuth0());
            }

            if (dto.getEstado().equals(EstadoUsuario.ACTIVO)) {
                auth0Service.desbloquearUsuario(usuario.getIdAuth0());
            }
        }

        // SOLO si hay datos reales de Auth0
        if (dto.getEmail() != null || dto.getUsername() != null) {
            auth0Service.actualizarUsuario(usuario.getIdAuth0(), dto);
        }

        // Auditoría
        usuario.setEditadoPor(adminAuth0Id);

        Usuario actualizado = usuarioRepository.save(usuario);

        UsuarioResponseDTO usuarioResponseDTO = UsuarioMapper.toDTO(actualizado, municipio);

        // Publicar en la cola la actualizacion del usuario
        usuarioEventPublisher.publicarActualizacion(usuarioResponseDTO);

        return usuarioResponseDTO;
    }

    @Override
    public UsuarioResponseDTO getUserById(UUID id) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new UsuarioNotFoundException("Usuario no encontrado"));

        MunicipioResponseDTO municipio = ubicacionesClient.getMunicipio(usuario.getIdMunicipio());

        return UsuarioMapper.toDTO(usuario, municipio);
    }

    @Override
    public UsuarioResponseDTO getByAuth0Id(String auth0Id) {

        Usuario usuario = usuarioRepository.findByIdAuth0(auth0Id)
                .orElseThrow(() -> new UsuarioNotFoundException("Usuario no encontrado"));

        MunicipioResponseDTO municipio = ubicacionesClient.getMunicipio(usuario.getIdMunicipio());

        return UsuarioMapper.toDTO(usuario, municipio);
    }

    @Override
    public PageResponseDTO<UsuarioResponseDTO> listarUsuarios(
            String rol,
            String estado,
            Long idMunicipio,
            int page,
            int size
    ) {
        if (size > 50) size = 50;

        Rol rolEnum = null;
        if (rol != null) {
            rolEnum = Rol.valueOf(rol.toUpperCase());
        }

        EstadoUsuario estadoEnum = null;
        if (estado != null) {
            estadoEnum = EstadoUsuario.valueOf(estado.toUpperCase());
        }

        Specification<Usuario> spec = Specification
                .where(UsuarioSpecification.conRol(rolEnum))
                .and(UsuarioSpecification.conEstado(estadoEnum))
                .and(UsuarioSpecification.conMunicipio(idMunicipio));

        Pageable pageable = PageRequest.of(page, size);

        Page<Usuario> usuariosPage = usuarioRepository.findAll(spec, pageable);

        // Obtener todos los ids de municipios
        List<Long> municipiosIds = usuariosPage.getContent().stream()
                .map(Usuario::getIdMunicipio)
                .distinct()
                .toList();

        // Traer todos los municipios en una sola consulta
        Map<Long, MunicipioResponseDTO> municipiosMap = ubicacionesClient
                .getMunicipios(municipiosIds)
                .stream()
                .collect(Collectors.toMap(
                        MunicipioResponseDTO::getIdMunicipio,
                        m -> m
                ));

        // Mapear correctamente
        List<UsuarioResponseDTO> content = usuariosPage.getContent()
                .stream()
                .map(usuario -> UsuarioMapper.toDTO(
                        usuario,
                        municipiosMap.get(usuario.getIdMunicipio())
                ))
                .toList();

        return new PageResponseDTO<>(
                content,
                usuariosPage.getNumber(),
                usuariosPage.getSize(),
                usuariosPage.getTotalElements(),
                usuariosPage.getTotalPages()
        );
    }
}
