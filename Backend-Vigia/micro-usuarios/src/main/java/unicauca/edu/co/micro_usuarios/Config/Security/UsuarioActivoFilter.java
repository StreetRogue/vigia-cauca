package unicauca.edu.co.micro_usuarios.Config.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import unicauca.edu.co.micro_usuarios.Entities.EstadoUsuario;
import unicauca.edu.co.micro_usuarios.Entities.Usuario;
import unicauca.edu.co.micro_usuarios.Repository.UsuarioRepository;

import java.io.IOException;

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

        // Verificar que hay usuario autenticado
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {

            String auth0Id = jwt.getSubject();

            Usuario usuario = usuarioRepository.findByIdAuth0(auth0Id).orElse(null);

            if (usuario != null && usuario.getEstado() == EstadoUsuario.INACTIVO) {

                // Bloquear acceso
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