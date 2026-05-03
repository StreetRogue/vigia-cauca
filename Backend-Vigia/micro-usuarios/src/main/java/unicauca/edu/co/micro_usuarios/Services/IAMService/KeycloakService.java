package unicauca.edu.co.micro_usuarios.Services.IAMService;

import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import unicauca.edu.co.micro_usuarios.DTOs.Request.UsuarioUpdateDTO;
import unicauca.edu.co.micro_usuarios.Entities.Rol;
import unicauca.edu.co.micro_usuarios.Exceptions.IamException;
import unicauca.edu.co.micro_usuarios.Util.KeycloakProvider;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class KeycloakService implements IamService {
    private final KeycloakProvider keycloakProvider;

    public void logoutUsuario(String userId) {
        RealmResource realmResource = keycloakProvider.getRealmResource();

        realmResource.users()
                .get(userId)
                .logout();
    }

    @Override
    public String crearUsuario(String email, String username, Rol rol) {
        try {
            UsersResource userResource = keycloakProvider.getUsersResource();

            UserRepresentation userRepresentation = new UserRepresentation();
            userRepresentation.setEmail(email);
            userRepresentation.setUsername(username);
            userRepresentation.setEnabled(true);

            Response response = userResource.create(userRepresentation);
            int status = response.getStatus();

            if (status == 201) {
                String path = response.getLocation().getPath();
                String userId = path.substring(path.lastIndexOf("/") + 1);

                CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
                credentialRepresentation.setTemporary(true);
                credentialRepresentation.setType(OAuth2Constants.PASSWORD);
                credentialRepresentation.setValue(generarPasswordTemporal());
                userResource.get(userId).resetPassword(credentialRepresentation);

                asignarRol(userId, rol);

                return userId;
            } else if (status == 409) {
                log.error("El usuario ya existe en Keycloak");
                throw new IamException("El usuario ya existe en Keycloak");
            } else {
                log.error("Error creando el usuario en Keycloak");
                throw new IamException("Error creando el usuario en Keycloak");
            }

        } catch (Exception e) {
            log.error("Error creando usuario en Keycloak | email={}", email, e);
            throw new IamException("No se pudo crear el usuario en Keycloak");
        }
    }

    @Override
    public void actualizarUsuario(String userId, UsuarioUpdateDTO dto) {
        try {
            // Actualizar contraseña
            CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
            credentialRepresentation.setTemporary(false);
            credentialRepresentation.setType(OAuth2Constants.PASSWORD);
            credentialRepresentation.setValue(dto.getPassword());

            UserRepresentation userRepresentation = new UserRepresentation();

            if (dto.getEmail() != null) {
                userRepresentation.setEmail(dto.getEmail());
            }

            if (dto.getUsername() != null) {
                userRepresentation.setUsername(dto.getUsername());
            }

            userRepresentation.setCredentials(Collections.singletonList(credentialRepresentation));

            UserResource userResource = keycloakProvider.getUsersResource().get(userId);

            userResource.update(userRepresentation);

        } catch (Exception e) {
            log.error("Error actualizando usuario en Keycloak | userId={}", userId, e);
            throw new RuntimeException("No se pudo actualizar el usuario");
        }
    }

    @Override
    public void bloquearUsuario(String userId) {
        UserRepresentation userRepresentation = new UserRepresentation();
        userRepresentation.setEnabled(false);

        UserResource userResource = keycloakProvider.getUsersResource().get(userId);
        userResource.update(userRepresentation);

        // Cierra la sesión del usuario bloqueado
        logoutUsuario(userId);
    }

    @Override
    public void desbloquearUsuario(String userId) {
        UserRepresentation userRepresentation = new UserRepresentation();
        userRepresentation.setEnabled(true);

        UserResource userResource = keycloakProvider.getUsersResource().get(userId);
        userResource.update(userRepresentation);
    }

    public void asignarRol(String userId, Rol rol) {
        try {
            RealmResource realmResource = keycloakProvider.getRealmResource();
            List<RoleRepresentation> roleRepresentations = realmResource.roles()
                    .list()
                    .stream()
                    .filter(role -> rol.name().equals(role.getName()))
                    .toList();
            realmResource.users().get(userId).roles().realmLevel().add(roleRepresentations);

        } catch (Exception e) {
            log.error("Error asignando rol en Keycloak | userId={}", userId, e);
            throw new RuntimeException("No se pudo asignar el rol");
        }
    }

    private String generarPasswordTemporal() {
        return "Temp1234*";
    }
}
