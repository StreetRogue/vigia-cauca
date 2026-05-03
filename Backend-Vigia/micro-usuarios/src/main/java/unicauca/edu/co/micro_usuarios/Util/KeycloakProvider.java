package unicauca.edu.co.micro_usuarios.Util;

import lombok.RequiredArgsConstructor;
import org.jboss.resteasy.client.jaxrs.internal.ResteasyClientBuilderImpl;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class KeycloakProvider {

    @Value("${keycloak.server-url}")
    private String serverUrl;

    @Value("${keycloak.realm-name}")
    private String realmName;

    @Value("${keycloak.realm-master}")
    private String realmMaster;

    @Value("${keycloak.admin-cli}")
    private String adminCli;

    @Value("${keycloak.user-console}")
    private String userConsole;

    @Value("${keycloak.console-password}")
    private String consolePassword;

    @Value("${keycloak.client-secret}")
    private String clientSecret;

    public RealmResource getRealmResource() {
        Keycloak keycloak = KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm(realmMaster)
                .clientId(adminCli)
                .username(userConsole)
                .password(consolePassword)
                .clientSecret(clientSecret)
                .resteasyClient(new ResteasyClientBuilderImpl()
                        .connectionPoolSize(20)
                        .build()
                )
                .grantType("password")
                .build();

        return keycloak.realm(realmName);
    }

    public UsersResource getUsersResource() {
        RealmResource realmResource = getRealmResource();
        return realmResource.users();
    }
}