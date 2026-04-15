package co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.AccionAuditoria;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuditoriaNovedadDTORespuesta {

    private UUID auditoriaId;
    private UUID novedadId;
    private UUID usuarioId;
    private AccionAuditoria accion;
    private String datosAnteriores;
    private String datosNuevos;
    private String cambios;
    private LocalDateTime fecha;
}
