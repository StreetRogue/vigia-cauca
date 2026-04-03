package co.edu.unicauca.micronovedades.capaControladores.controladorExcepciones;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String mensaje) {
        super(mensaje);
    }
}
