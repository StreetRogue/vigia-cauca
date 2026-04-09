package co.edu.unicauca.microreportes.fachadaServices.mapper;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.NivelVisibilidad;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Centraliza la lógica de visibilidad según rol.
 *
 * Roles:
 *   - VISITANTE: solo PUBLICA
 *   - OPERADOR / ADMIN: PUBLICA + PRIVADA
 *
 * El rol llega como header X-User-Role desde el API Gateway.
 * Mientras no haya autenticación, se usa "VISITANTE" por defecto.
 */
@Component
public class VisibilidadHelper {

    private static final List<NivelVisibilidad> SOLO_PUBLICA =
            List.of(NivelVisibilidad.PUBLICA);

    private static final List<NivelVisibilidad> TODAS =
            List.of(NivelVisibilidad.PUBLICA, NivelVisibilidad.PRIVADA);

    /**
     * Retorna los niveles de visibilidad permitidos para el rol dado.
     */
    public List<NivelVisibilidad> visibilidadesPorRol(String rol) {
        if (rol == null) return SOLO_PUBLICA;
        return switch (rol.toUpperCase()) {
            case "ADMIN", "ADMINISTRADOR", "OPERADOR" -> TODAS;
            default -> SOLO_PUBLICA;
        };
    }

    /**
     * Determina si el rol tiene acceso a datos privados.
     */
    public boolean tieneAccesoPrivado(String rol) {
        if (rol == null) return false;
        return switch (rol.toUpperCase()) {
            case "ADMIN", "ADMINISTRADOR", "OPERADOR" -> true;
            default -> false;
        };
    }
}
