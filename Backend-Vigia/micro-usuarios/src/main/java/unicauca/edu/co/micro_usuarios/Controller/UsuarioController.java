package unicauca.edu.co.micro_usuarios.Controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import unicauca.edu.co.micro_usuarios.DTOs.Request.UsuarioCreateDTO;
import unicauca.edu.co.micro_usuarios.DTOs.Request.UsuarioUpdateDTO;
import unicauca.edu.co.micro_usuarios.DTOs.Response.PageResponseDTO;
import unicauca.edu.co.micro_usuarios.DTOs.Response.UsuarioResponseDTO;
import unicauca.edu.co.micro_usuarios.Services.UsuarioService.UsuarioService;

import java.util.UUID;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {
    private final UsuarioService usuarioService;

    // Registrar Operador
    @PostMapping("/registrar")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> registrarUsuario(@Valid @RequestBody UsuarioCreateDTO dto, @AuthenticationPrincipal Jwt jwt) {
        String adminAuth0Id = jwt.getSubject();
        UsuarioResponseDTO response = usuarioService.registrarUsuario(dto, adminAuth0Id);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Editar Usuario
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> editarUsuario(@PathVariable UUID id, @RequestBody UsuarioUpdateDTO dto, @AuthenticationPrincipal Jwt jwt) {
        String adminAuth0Id = jwt.getSubject();
        UsuarioResponseDTO response = usuarioService.editarUsuario(id, dto, adminAuth0Id);
        return ResponseEntity.ok(response);
    }

    // Obtener usuario por ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> getUserById(@PathVariable UUID id) {
        UsuarioResponseDTO response = usuarioService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    // Obtener usuario por ID
    @GetMapping("/auth0/{idAuth0}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> getByIdIam(@PathVariable String idAuth0) {
        UsuarioResponseDTO response = usuarioService.getByIdIam(idAuth0);
        return ResponseEntity.ok(response);
    }

    // Eliminar usuario (soft-delete: cambia estado a INACTIVO)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        String adminAuth0Id = jwt.getSubject();
        usuarioService.eliminarUsuario(id, adminAuth0Id);
        return ResponseEntity.noContent().build();
    }

    // Perfil propio — cualquier usuario autenticado puede ver su propio perfil
    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> getMe(@AuthenticationPrincipal Jwt jwt) {
        UsuarioResponseDTO response = usuarioService.getByIdIam(jwt.getSubject());
        return ResponseEntity.ok(response);
    }

    // Cambio de contraseña propio — cualquier usuario autenticado
    @PatchMapping("/me/password")
    public ResponseEntity<Void> cambiarPasswordMe(
            @RequestBody @Valid UsuarioUpdateDTO dto,
            @AuthenticationPrincipal Jwt jwt) {
        usuarioService.cambiarPasswordPropio(jwt.getSubject(), dto.getPassword());
        return ResponseEntity.noContent().build();
    }

    // Validaciones en tiempo real
    @GetMapping("/validate/cedula/{cedula}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Boolean> validateCedula(@PathVariable String cedula) {
        boolean exists = usuarioService.existsByCedula(cedula);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/validate/email/{email}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Boolean> validateEmail(@PathVariable String email) {
        boolean exists = usuarioService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/validate/username/{username}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Boolean> validateUsername(@PathVariable String username) {
        boolean exists = usuarioService.existsByUsername(username);
        return ResponseEntity.ok(exists);
    }

    // Listar usuarios (Se puede aplicar filtros)
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PageResponseDTO<UsuarioResponseDTO>> getUsuarios(
            @RequestParam(required = false) String rol,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Long idMunicipio,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        return ResponseEntity.ok(
                usuarioService.listarUsuarios(rol, estado, idMunicipio, page, size)
        );
    }
}

