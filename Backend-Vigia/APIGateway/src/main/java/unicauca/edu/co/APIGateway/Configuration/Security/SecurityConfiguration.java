package unicauca.edu.co.APIGateway.Configuration.Security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Configuration
@EnableWebFluxSecurity
@EnableMethodSecurity
public class SecurityConfiguration {

    @Value("${spring.security.oauth2.resourceserver.jwt.audience}")
    private String audience;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuer;

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
    private String jwkSetUri;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:5173");
        configuration.addAllowedOrigin("http://localhost:3000");
        configuration.addAllowedOrigin("http://127.0.0.1:5173");
        configuration.addAllowedOrigin("http://127.0.0.1:3000");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityWebFilterChain filterChain(ServerHttpSecurity http) {
        http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .authorizeExchange(auth -> auth
                        // Públicos
                        .pathMatchers("/api/public/**").permitAll()
                        .pathMatchers("/api/auth/**").permitAll()
                        .pathMatchers("/api/*/reportes/sse/**").permitAll()
                        // Dashboard, estadísticas, reportes y ubicaciones son públicos
                        // El backend filtra PUBLICA/PRIVADA según X-User-Role
                        .pathMatchers("/api/*/reportes/estadisticas/**").permitAll()
                        .pathMatchers("/api/*/reportes/documentos/**").permitAll()
                        .pathMatchers("/api/*/microUbicaciones/**").permitAll()

                        // Operador
                        .pathMatchers("/api/operador/**").hasAuthority("OPERADOR")

                        // Admin
                        .pathMatchers("/api/admin/**").hasAuthority("ADMIN")

                        // Todo lo demas
                        .anyExchange().authenticated()
                )

                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                        )
                );

        return http.build();
    }

    @Bean
    public ReactiveJwtAuthenticationConverterAdapter jwtAuthenticationConverter() {
        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(jwt -> {
            // Leer roles de realm_access.roles (Keycloak)
            Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
            List<String> realmRoles = realmAccess != null
                    ? (List<String>) realmAccess.getOrDefault("roles", List.of())
                    : List.of();

            // Leer roles de resource_access.api-gateway.roles (Keycloak client roles)
            Map<String, Object> resourceAccess = jwt.getClaimAsMap("resource_access");
            List<String> clientRoles = List.of();
            if (resourceAccess != null && resourceAccess.containsKey("api-gateway")) {
                Map<String, Object> clientAccess = (Map<String, Object>) resourceAccess.get("api-gateway");
                clientRoles = (List<String>) clientAccess.getOrDefault("roles", List.of());
            }

            return Stream.concat(realmRoles.stream(), clientRoles.stream())
                    .map(String::toUpperCase)
                    .map(SimpleGrantedAuthority::new)
                    .map(a -> (org.springframework.security.core.GrantedAuthority) a)
                    .toList();
        });

        return new ReactiveJwtAuthenticationConverterAdapter(jwtConverter);
    }

    @Bean
    JwtDecoder jwtDecoder() {
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();

        OAuth2TokenValidator<Jwt> audienceValidator = new AudienceValidator(audience);
        OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuer);

        OAuth2TokenValidator<Jwt> validator =
                new DelegatingOAuth2TokenValidator<>(withIssuer, audienceValidator);

        jwtDecoder.setJwtValidator(validator);

        return jwtDecoder;
    }
}