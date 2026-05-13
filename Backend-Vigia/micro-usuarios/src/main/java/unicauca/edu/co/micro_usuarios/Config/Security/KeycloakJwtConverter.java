package unicauca.edu.co.micro_usuarios.Config.Security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimNames;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * Convierte un JWT de Keycloak en un token de autenticación de Spring Security.
 *
 * Lee roles de DOS fuentes para cubrir cualquier configuración de Keycloak:
 *   1. resource_access.<clientId>.roles  (roles de cliente)
 *   2. realm_access.roles                (roles de realm)
 *
 * Todos los roles se normalizan a MAYÚSCULAS para que coincidan con las
 * reglas de seguridad declaradas con hasAuthority("ADMIN"), hasAuthority("OPERADOR"), etc.
 */
@Component
public class KeycloakJwtConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    @Value("${jwt.auth.converter.api-client}")
    private String clientId;

    @Value("${jwt.auth.converter.principle-attribute}")
    private String principleAttribute;

    @Override
    @SuppressWarnings("unchecked")
    public AbstractAuthenticationToken convert(Jwt jwt) {

        Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();

        // ── 1. Roles de cliente: resource_access.<clientId>.roles ──────────────
        Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
        if (resourceAccess != null && resourceAccess.containsKey(clientId)) {
            Map<String, Object> client = (Map<String, Object>) resourceAccess.get(clientId);
            List<String> roles = (List<String>) client.get("roles");
            if (roles != null) {
                roles.stream()
                        .map(r -> new SimpleGrantedAuthority(r.toUpperCase()))
                        .forEach(authorities::add);
            }
        }

        // ── 2. Roles de realm: realm_access.roles ───────────────────────────────
        // Fallback: si el usuario tiene el rol asignado a nivel de realm y no de
        // cliente (o como complemento) también los incluimos.
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess != null) {
            List<String> realmRoles = (List<String>) realmAccess.get("roles");
            if (realmRoles != null) {
                realmRoles.stream()
                        .map(r -> new SimpleGrantedAuthority(r.toUpperCase()))
                        // Evitar duplicados si el mismo rol ya vino del cliente
                        .filter(a -> !authorities.contains(a))
                        .forEach(authorities::add);
            }
        }

        return new JwtAuthenticationToken(jwt, authorities, getPrincipalName(jwt));
    }

    private String getPrincipalName(Jwt jwt) {
        String claimName = JwtClaimNames.SUB;
        if (principleAttribute != null) {
            claimName = principleAttribute;
        }
        return jwt.getClaimAsString(claimName);
    }
}
