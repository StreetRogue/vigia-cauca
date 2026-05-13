package unicauca.edu.co.APIGateway.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import unicauca.edu.co.APIGateway.DTOs.LoginRequest;
import unicauca.edu.co.APIGateway.DTOs.LogoutRequest;

import java.util.Map;

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

    public Mono<Map> login(LoginRequest request) {
        return webClient.post()
                .uri(tokenUrl)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData("grant_type", "password")
                        .with("client_id", clientId)
                        .with("client_secret", clientSecret)
                        .with("username", request.getUsername())
                        .with("password", request.getPassword()))
                .retrieve()
                .onStatus(
                        status -> status.value() == 401,
                        response -> Mono.error(new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED, "Credenciales inválidas"))
                )
                .onStatus(
                        status -> status.isError() && status.value() != 401,
                        response -> response.bodyToMono(String.class)
                                .flatMap(body -> Mono.error(new ResponseStatusException(
                                        HttpStatus.valueOf(response.statusCode().value()),
                                        body)))
                )
                .bodyToMono(Map.class)
                .onErrorMap(WebClientRequestException.class, e ->
                        new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                                "El servicio de autenticación no está disponible, intenta en unos segundos"));
    }

    public Mono<String> resolveUsernameFromEmail(String email) {
        return webClient.get()
                .uri("http://micro-usuarios:8081/usuarios/by-email/" + email)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> (String) response.get("username"))
                .onErrorResume(e -> Mono.just(email)); // Si falla, devuelve el email original
    }

    public Mono<String> logout(LogoutRequest request) {

        if (request.getRefreshToken() == null || request.getRefreshToken().isBlank()) {
            return Mono.error(new IllegalArgumentException("Refresh token es requerido"));
        }

        return webClient.post()
                .uri(logoutUrl)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData("client_id", clientId)
                        .with("client_secret", clientSecret)
                        .with("refresh_token", request.getRefreshToken()))
                .retrieve()
                .onStatus(status -> status.isError(), response ->
                        response.bodyToMono(String.class)
                                .flatMap(errorBody -> Mono.error(
                                        new RuntimeException("Error en logout: " + errorBody)
                                ))
                )
                .bodyToMono(Void.class)
                .thenReturn("Logout exitoso");
    }
}
