package co.edu.unicauca.micronovedades.capaControladores.controladorExcepciones;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String recurso, Object id) {
        super(String.format("%s no encontrado con ID: %s", recurso, id));
    }
}
