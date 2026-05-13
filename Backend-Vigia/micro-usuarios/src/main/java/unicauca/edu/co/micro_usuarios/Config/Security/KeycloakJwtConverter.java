package unicauca.edu.co.micro_usuarios.Config.Security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimNames;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Component
public class KeycloakJwtConverter implements Converter<Jwt, AbstractAuthenticationToken> {
    @Value("${jwt.auth.converter.api-client}")
    private String clientId;

    @Value("${jwt.auth.converter.principle-attribute}")
    private String principleAttribute;

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        // Realm roles (ADMIN, OPERADOR como realm roles)
        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        List<String> realmRoles = realmAccess != null
                ? (List<String>) realmAccess.getOrDefault("roles", List.of())
                : List.of();

        // Client roles (resource_access.api-gateway.roles)
        Map<String, Object> resourceAccess = jwt.getClaimAsMap("resource_access");
        List<String> clientRoles = List.of();
        if (resourceAccess != null && resourceAccess.containsKey(clientId)) {
            Map<String, Object> client = (Map<String, Object>) resourceAccess.get(clientId);
            clientRoles = (List<String>) client.getOrDefault("roles", List.of());
        }

        List<GrantedAuthority> authorities = Stream.concat(realmRoles.stream(), clientRoles.stream())
                .map(String::toUpperCase)
                .map(SimpleGrantedAuthority::new)
                .map(GrantedAuthority.class::cast)
                .toList();

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
