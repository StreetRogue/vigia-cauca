package unicauca.edu.co.micro_usuarios.Services.IAMService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import unicauca.edu.co.micro_usuarios.DTOs.Request.UsuarioUpdateDTO;
import unicauca.edu.co.micro_usuarios.Entities.Rol;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class KeycloakService implements IamService {
    @Value("${keycloak.server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.admin-client-id}")
    private String clientId;

    @Value("${keycloak.admin-client-secret}")
    private String clientSecret;

    private final RestTemplate restTemplate;

    private String cachedToken;
    private long tokenExpirationTime;

    private synchronized String getAdminToken() {
        if (cachedToken != null && System.currentTimeMillis() < tokenExpirationTime) {
            return cachedToken;
        }

        String url = serverUrl + "/realms/" + realm + "/protocol/openid-connect/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // Keycloak usa form-urlencoded, no JSON como Auth0
        String body = "grant_type=client_credentials"
                + "&client_id=" + clientId
                + "&client_secret=" + clientSecret;

        HttpEntity<String> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

        cachedToken = (String) response.getBody().get("access_token");
        Integer expiresIn = (Integer) response.getBody().get("expires_in");
        tokenExpirationTime = System.currentTimeMillis() + (expiresIn * 1000L) - 60000;

        return cachedToken;
    }

    @Override
    public String crearUsuario(String email, String username, Rol rol) {
        try {
            String token = getAdminToken();
            String url = serverUrl + "/admin/realms/" + realm + "/users";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of(
                    "username", username,
                    "email", email,
                    "enabled", true,
                    "credentials", List.of(Map.of(
                            "type", "password",
                            "value", password,
                            "temporary", true
                    ))
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            // Keycloak devuelve 201 y el ID en el header Location
            ResponseEntity<Void> response = restTemplate.exchange(
                    url, HttpMethod.POST, request, Void.class
            );

            // Extraer el ID del header Location: .../users/{id}
            String location = response.getHeaders().getFirst("Location");
            String userId = location.substring(location.lastIndexOf("/") + 1);

            asignarRol(userId, rol);

            return userId;

        } catch (Exception e) {
            log.error("Error creando usuario en Keycloak | email={}", email, e);
            throw new RuntimeException("No se pudo crear el usuario en Keycloak");
        }
    }

    public void actualizarUsuario(String userId, UsuarioUpdateDTO dto) {
        try {
            String token = getAdminToken();
            String url = serverUrl + "/admin/realms/" + realm + "/users/" + userId;

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            if (dto.getEmail() != null) body.put("email", dto.getEmail());
            if (dto.getUsername() != null) body.put("username", dto.getUsername());

            restTemplate.exchange(url, HttpMethod.PUT,
                    new HttpEntity<>(body, headers), Void.class);

        } catch (Exception e) {
            log.error("Error actualizando usuario en Keycloak | userId={}", userId, e);
            throw new RuntimeException("No se pudo actualizar el usuario");
        }
    }

    public void bloquearUsuario(String userId) {
        cambiarEstadoUsuario(userId, false);
    }

    public void desbloquearUsuario(String userId) {
        cambiarEstadoUsuario(userId, true);
    }

    private void cambiarEstadoUsuario(String userId, boolean enabled) {
        try {
            String token = getAdminToken();
            String url = serverUrl + "/admin/realms/" + realm + "/users/" + userId;

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of("enabled", enabled);

            restTemplate.exchange(url, HttpMethod.PUT,
                    new HttpEntity<>(body, headers), Void.class);

        } catch (Exception e) {
            log.error("Error cambiando estado usuario en Keycloak | userId={}", userId, e);
            throw new RuntimeException("No se pudo cambiar el estado del usuario");
        }
    }

    public void asignarRol(String userId, Rol rol) {
        try {
            String token = getAdminToken();

            // Primero obtener el objeto del rol con su ID
            String rolNombre = rol.name(); // "ADMIN" o "OPERADOR"
            String urlRol = serverUrl + "/admin/realms/" + realm + "/roles/" + rolNombre;

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);

            ResponseEntity<Map> rolResponse = restTemplate.exchange(
                    urlRol, HttpMethod.GET, new HttpEntity<>(headers), Map.class
            );

            // Asignar el rol al usuario
            String urlAsignar = serverUrl + "/admin/realms/" + realm
                    + "/users/" + userId + "/role-mappings/realm";

            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<List<Map>> requestAsignar = new HttpEntity<>(
                    List.of(rolResponse.getBody()), headers
            );

            restTemplate.exchange(urlAsignar, HttpMethod.POST, requestAsignar, Void.class);

        } catch (Exception e) {
            log.error("Error asignando rol en Keycloak | userId={}", userId, e);
            throw new RuntimeException("No se pudo asignar el rol");
        }
    }
}
