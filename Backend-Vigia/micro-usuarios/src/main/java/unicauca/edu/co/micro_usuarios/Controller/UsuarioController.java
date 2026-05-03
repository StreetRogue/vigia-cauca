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
    @PreAuthorize("hasRole('ADMIN')")
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
    public ResponseEntity<UsuarioResponseDTO> getByAuth0Id(@PathVariable String idAuth0) {
        UsuarioResponseDTO response = usuarioService.getByAuth0Id(idAuth0);
        return ResponseEntity.ok(response);
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

