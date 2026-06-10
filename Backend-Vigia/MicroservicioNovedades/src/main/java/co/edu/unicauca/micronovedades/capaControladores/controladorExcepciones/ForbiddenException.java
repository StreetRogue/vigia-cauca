package co.edu.unicauca.micronovedades.capaControladores.controladorExcepciones;

/**
 * Se lanza cuando un usuario intenta una acción sobre un recurso que no le
 * pertenece (p. ej. un OPERADOR archivando una novedad creada por otro).
 * El {@link GlobalExceptionHandler} la mapea a HTTP 403 (Forbidden).
 */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String mensaje) {
        super(mensaje);
    }
}
