package unicauca.edu.co.micro_usuarios.Services.Auth0Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import unicauca.edu.co.micro_usuarios.DTOs.Request.UsuarioUpdateDTO;
import unicauca.edu.co.micro_usuarios.Entities.Rol;
import unicauca.edu.co.micro_usuarios.Exceptions.Auth0Exception;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class Auth0Service {

    @Value("${auth0.issuer-uri}")
    private String uri;

    @Value("${auth0.client-id}")
    private String clientId;

    @Value("${auth0.client-secret}")
    private String clientSecret;

    @Value("${auth0.api-audience}")
    private String audience;

    @Value("${auth0.roles.admin}")
    private String adminRoleId;

    @Value("${auth0.roles.operador}")
    private String operadorRoleId;

    private final RestTemplate restTemplate;

    private String cachedToken;
    private long tokenExpirationTime;

    //  Obtener token de management API
    private  synchronized  String getManagementToken() {
        // Verifica si hay un token valido que no este vencido y lo devuelve
        if (cachedToken != null && System.currentTimeMillis() < tokenExpirationTime) {
            return cachedToken;
        }

        // Sino, pide el token a Auth0
        String url =  uri + "oauth/token";

        Map<String, String> body = Map.of(
                "client_id", clientId,
                "client_secret", clientSecret,
                "audience", audience,
                "grant_type", "client_credentials"
        );

        ResponseEntity<Map> response = restTemplate.postForEntity(url, body, Map.class);

        // Guardar el token respuesta
        cachedToken = (String) response.getBody().get("access_token");

        // Guardar el tiempo en que expira el token
        Integer expiresIn = (Integer) response.getBody().get("expires_in");
        tokenExpirationTime = System.currentTimeMillis() + (expiresIn * 1000L) - 60000;

        return cachedToken;
    }

    // 2. Crear usuario en Auth0
    public String crearUsuario(String email, String username, Rol rol) {

        try {
            String token = getManagementToken();
            String url = uri + "api/v2/users";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of(
                    "email", email,
                    "username", username,
                    "connection", "Username-Password-Authentication",
                    "password", generarPasswordTemporal(),
                    "email_verified", false
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            String userId = (String) response.getBody().get("user_id");

            asignarRol(userId, rol);

            return userId;

        } catch (Exception e) {
            log.error("Error creando usuario en Auth0 | email={}", email, e);
            throw new Auth0Exception("No se pudo crear el usuario en el sistema de autenticación");
        }
    }

    public void actualizarUsuario(String userId, UsuarioUpdateDTO dto) {
        try {
            String token = getManagementToken();
            String url = uri + "api/v2/users/" + userId;

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();

            if (dto.getEmail() != null) {
                body.put("email", dto.getEmail());
            }

            if (dto.getUsername() != null) {
                body.put("username", dto.getUsername());
            }

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            restTemplate.exchange(url, HttpMethod.PATCH, request, Map.class);

        } catch (Exception e) {
            log.error("Error actualizando usuario en Auth0 | userId={}", userId, e);
            throw new Auth0Exception("No se pudo actualizar el usuario en el sistema de autenticación");
        }
    }

    public void bloquearUsuario(String userId) {
        try {
            String token = getManagementToken();
            String url = uri + "api/v2/users/" + userId;

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of("blocked", true);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            restTemplate.exchange(url, HttpMethod.PATCH, request, Map.class);

        } catch (Exception e) {
            log.error("Error bloqueando usuario en Auth0 | userId={}", userId, e);
            throw new Auth0Exception("No se pudo bloquear el usuario");
        }
    }

    public void desbloquearUsuario(String userId) {
        try {
            String token = getManagementToken();
            String url = uri + "api/v2/users/" + userId;

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of("blocked", false);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            restTemplate.exchange(url, HttpMethod.PATCH, request, Map.class);

        } catch (Exception e) {
            log.error("Error desbloqueando usuario en Auth0 | userId={}", userId, e);
            throw new Auth0Exception("No se pudo desbloquear el usuario");
        }
    }

    public void asignarRol(String userId, Rol rol) {

        String token = getManagementToken();

        String url = uri + "api/v2/users/" + userId + "/roles";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String roleId = obtenerRoleId(rol);

        Map<String, Object> body = Map.of(
                "roles", List.of(roleId)
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        restTemplate.exchange(url, HttpMethod.POST, request, Void.class);
    }

    private String obtenerRoleId(Rol rol) {
        return switch (rol) {
            case ADMIN -> adminRoleId;
            case OPERADOR -> operadorRoleId;
        };
    }

    public String generarTicketCambioPassword(String userId) {
        try {
            String token = getManagementToken();
            String url = uri + "api/v2/tickets/password-change";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of(
                    "user_id", userId,
                    "result_url", "http://localhost:3000/login"
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            return (String) response.getBody().get("ticket");

        } catch (Exception e) {
            log.error("Error generando ticket de cambio de password | userId={}", userId, e);
            throw new Auth0Exception("No se pudo generar el enlace de cambio de contraseña");
        }
    }

    // Password temporal
    private String generarPasswordTemporal() {
        return "Temp1234*";
    }
}