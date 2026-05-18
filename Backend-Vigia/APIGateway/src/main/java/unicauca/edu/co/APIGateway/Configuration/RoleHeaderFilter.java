package unicauca.edu.co.APIGateway.Configuration;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class RoleHeaderFilter implements GlobalFilter, Ordered {

    private static final String ROLE_HEADER = "X-User-Role";
    private static final String[] PRIORITY_ROLES = {"ADMIN", "OPERADOR", "VISITANTE"};

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> ctx.getAuthentication())
                .filter(auth -> auth instanceof JwtAuthenticationToken && auth.isAuthenticated())
                .map(auth -> {
                    String role = auth.getAuthorities().stream()
                            .map(GrantedAuthority::getAuthority)
                            .filter(a -> {
                                for (String r : PRIORITY_ROLES) if (r.equals(a)) return true;
                                return false;
                            })
                            .findFirst()
                            .orElse("VISITANTE");

                    return exchange.mutate()
                            .request(r -> r.headers(h -> h.set(ROLE_HEADER, role)))
                            .build();
                })
                .defaultIfEmpty(exchange.mutate()
                        .request(r -> r.headers(h -> h.set(ROLE_HEADER, "VISITANTE")))
                        .build())
                .flatMap(chain::filter);
    }

    @Override
    public int getOrder() {
        return -100;
    }
}
