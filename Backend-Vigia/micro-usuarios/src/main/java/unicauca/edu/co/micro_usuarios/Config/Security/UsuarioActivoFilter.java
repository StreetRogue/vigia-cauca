package unicauca.edu.co.micro_usuarios.Config.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import unicauca.edu.co.micro_usuarios.Entities.EstadoUsuario;
import unicauca.edu.co.micro_usuarios.Entities.Usuario;
import unicauca.edu.co.micro_usuarios.Repository.UsuarioRepository;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class UsuarioActivoFilter extends OncePerRequestFilter {

    private final UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Verificar que hay autenticación y que es JWT
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {

            String keycloakId = jwtAuth.getToken().getSubject();

            log.debug("Validando estado del usuario | keycloakId={}", keycloakId);

            Usuario usuario = usuarioRepository.findByIdIam(keycloakId).orElse(null);

            // ⚠️ Si no existe en DB, puedes decidir si bloquear o dejar pasar
            if (usuario == null) {
                log.warn("Usuario no encontrado en BD | keycloakId={}", keycloakId);
                filterChain.doFilter(request, response);
                return;
            }

            if (usuario.getEstado() == EstadoUsuario.INACTIVO) {

                log.warn("Acceso bloqueado - usuario inactivo | keycloakId={}", keycloakId);

                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");

                response.getWriter().write("""
                    {
                      "error": "Usuario inactivo"
                    }
                """);

                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}