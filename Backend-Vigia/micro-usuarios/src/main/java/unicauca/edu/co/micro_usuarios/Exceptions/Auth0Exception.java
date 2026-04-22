package unicauca.edu.co.micro_usuarios.Exceptions;

public class Auth0Exception extends RuntimeException {
    public Auth0Exception(String message) {
        super(message);
    }
}
