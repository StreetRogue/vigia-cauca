package unicauca.edu.co.micro_usuarios.Exceptions;

public class CedulaAlreadyExistsException extends RuntimeException {
    public CedulaAlreadyExistsException(String message) {
        super(message);
    }
}
