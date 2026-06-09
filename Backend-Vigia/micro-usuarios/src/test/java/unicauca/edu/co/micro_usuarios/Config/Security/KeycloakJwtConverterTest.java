package unicauca.edu.co.micro_usuarios.Config.Security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

class KeycloakJwtConverterTest {

    private KeycloakJwtConverter converter;

    @BeforeEach
    void setUp() throws Exception {
        converter = new KeycloakJwtConverter();
        var clientField = KeycloakJwtConverter.class.getDeclaredField("clientId");
        clientField.setAccessible(true);
        clientField.set(converter, "vigia-app");
        var principleField = KeycloakJwtConverter.class.getDeclaredField("principleAttribute");
        principleField.setAccessible(true);
        principleField.set(converter, "preferred_username");
    }

    private Jwt buildJwt(Map<String, Object> claims) {
        Jwt.Builder b = Jwt.withTokenValue("tok")
                .header("alg", "RS256")
                .claim("sub", "kc-user-001")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(300));
        claims.forEach(b::claim);
        return b.build();
    }

    @Test @DisplayName("HU-1.1: extrae roles de client (resource_access)")
    void convert_rolesDeCliente() {
        Jwt jwt = buildJwt(Map.of(
            "resource_access", Map.of("vigia-app", Map.of("roles", List.of("admin"))),
            "preferred_username", "admin.test"
        ));
        AbstractAuthenticationToken token = converter.convert(jwt);
        Collection<String> roles = token.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).collect(Collectors.toSet());
        assertTrue(roles.contains("ADMIN"));
    }

    @Test @DisplayName("HU-1.1: extrae roles de realm (realm_access)")
    void convert_rolesDeRealm() {
        Jwt jwt = buildJwt(Map.of(
            "realm_access", Map.of("roles", List.of("operador")),
            "preferred_username", "op.test"
        ));
        AbstractAuthenticationToken token = converter.convert(jwt);
        Collection<String> roles = token.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).collect(Collectors.toSet());
        assertTrue(roles.contains("OPERADOR"));
    }

    @Test @DisplayName("HU-1.1: combina roles de client y realm sin duplicados")
    void convert_combinaRolesSinDuplicados() {
        Jwt jwt = buildJwt(Map.of(
            "resource_access", Map.of("vigia-app", Map.of("roles", List.of("admin"))),
            "realm_access", Map.of("roles", List.of("admin", "operador")),
            "preferred_username", "mixed"
        ));
        AbstractAuthenticationToken token = converter.convert(jwt);
        Collection<String> roles = token.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).collect(Collectors.toList());
        assertTrue(roles.contains("ADMIN"));
        assertTrue(roles.contains("OPERADOR"));
        assertEquals(2, roles.size());
    }

    @Test @DisplayName("HU-1.7: sin roles asigna authorities vacia (visitante)")
    void convert_sinRoles() {
        Jwt jwt = buildJwt(Map.of("preferred_username", "visitor"));
        AbstractAuthenticationToken token = converter.convert(jwt);
        assertTrue(token.getAuthorities().isEmpty());
    }

    @Test @DisplayName("HU-1.1: usa preferred_username como principal name")
    void convert_principalName() {
        Jwt jwt = buildJwt(Map.of(
            "preferred_username", "admin.popayan",
            "realm_access", Map.of("roles", List.of("admin"))
        ));
        AbstractAuthenticationToken token = converter.convert(jwt);
        assertEquals("admin.popayan", token.getName());
    }

    @Test @DisplayName("HU-1.1: roles se normalizan a MAYUSCULAS")
    void convert_rolesUpperCase() {
        Jwt jwt = buildJwt(Map.of(
            "resource_access", Map.of("vigia-app", Map.of("roles", List.of("Admin", "OPERADOR"))),
            "preferred_username", "test"
        ));
        AbstractAuthenticationToken token = converter.convert(jwt);
        Collection<String> roles = token.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).collect(Collectors.toSet());
        assertTrue(roles.stream().allMatch(r -> r.equals(r.toUpperCase())));
    }
}
