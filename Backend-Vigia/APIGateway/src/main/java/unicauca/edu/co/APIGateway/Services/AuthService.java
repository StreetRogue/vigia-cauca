package unicauca.edu.co.APIGateway.Services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import unicauca.edu.co.APIGateway.DTOs.LoginRequest;
import unicauca.edu.co.APIGateway.DTOs.LogoutRequest;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    @Value("${keycloak.token-url}")
    private String tokenUrl;

    @Value("${keycloak.logout-url}")
    private String logoutUrl;

    @Value("${keycloak.client-id}")
    private String clientId;

    @Value("${keycloak.client-secret}")
    private String clientSecret;

    private final WebClient webClient;

    @SuppressWarnings("rawtypes")
    public Mono<Map> login(LoginRequest request) {
        log.debug("[AuthService] Login attempt for user: {}", request.getUsername());

        return webClient.post()
                .uri(tokenUrl)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData("grant_type", "password")
                        .with("client_id",     clientId)
                        .with("client_secret", clientSecret)
                        .with("username",      request.getUsername())
                        .with("password",      request.getPassword()))
                .retrieve()
                // Propaga 4xx de Keycloak (credenciales inválidas, usuario deshabilitado, etc.)
                .onStatus(status -> status.is4xxClientError(), response ->
                        response.bodyToMono(String.class)
                                .doOnNext(body -> log.warn("[AuthService] Keycloak 4xx: {}", body))
                                .flatMap(body -> Mono.error(
                                        new ResponseStatusException(response.statusCode(), body)
                                ))
                )
                // Propaga 5xx de Keycloak
                .onStatus(status -> status.is5xxServerError(), response ->
                        response.bodyToMono(String.class)
                                .doOnNext(body -> log.error("[AuthService] Keycloak 5xx: {}", body))
                                .flatMap(body -> Mono.error(
                                        new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                                                "Keycloak no disponible")
                                ))
                )
                .bodyToMono(Map.class)
                .doOnSuccess(t -> log.debug("[AuthService] Login OK for user: {}", request.getUsername()))
                .onErrorMap(WebClientResponseException.class, ex ->
                        new ResponseStatusException(ex.getStatusCode(), ex.getMessage())
                );
    }

    public Mono<String> logout(LogoutRequest request) {
        if (request.getRefreshToken() == null || request.getRefreshToken().isBlank()) {
            return Mono.error(new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Refresh token es requerido"));
        }

        return webClient.post()
                .uri(logoutUrl)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData("client_id",     clientId)
                        .with("client_secret",  clientSecret)
                        .with("refresh_token",  request.getRefreshToken()))
                .retrieve()
                .onStatus(status -> status.isError(), response ->
                        response.bodyToMono(String.class)
                                .flatMap(body -> Mono.error(
                                        new ResponseStatusException(response.statusCode(),
                                                "Error en logout: " + body)
                                ))
                )
                .bodyToMono(Void.class)
                .thenReturn("Logout exitoso");
    }
}
