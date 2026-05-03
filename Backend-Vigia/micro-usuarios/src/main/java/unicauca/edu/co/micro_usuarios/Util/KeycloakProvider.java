package unicauca.edu.co.micro_usuarios.Util;

import org.springframework.beans.factory.annotation.Value;

public class KeycloakProvider {
    @Value("${keycloak.server-url}")
    private static String SERVER_URL;

    @Value("${keycloak.realm-name}")
    private static String REALM_NAME;

    @Value("${keycloak.realm-master}")
    private static String REALM_MASTER;

    @Value("${keycloak.admin-cli}")
    private static String ADMIN_CLI;

    @Value("${keycloak.user-console}")
    private static String USER_CONSOLE;

    @Value("${keycloak.console-passsword}")
    private static String CONSOLE_PASSWORD;

    @Value("${keycloak.client-secret}")
    private static String CLIENT_SECRET;



}
