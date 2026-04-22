package co.edu.unicauca.micronovedades.capaControladores;

import co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta.AuditoriaNovedadDTORespuesta;
import co.edu.unicauca.micronovedades.fachadaServices.services.IAuditoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/microNovedades/auditorias")
@RequiredArgsConstructor
public class AuditoriaRestController {

    private final IAuditoriaService auditoriaService;

    /**
     * GET /api/v1/microNovedades/auditorias/novedad/{novedadId}
     * Historial de cambios de una novedad específica.
     */
    @GetMapping("/novedad/{novedadId}")
    public ResponseEntity<List<AuditoriaNovedadDTORespuesta>> historialNovedad(
            @PathVariable UUID novedadId
    ) {
        return ResponseEntity.ok(auditoriaService.obtenerHistorialNovedad(novedadId));
    }

    /**
     * GET /api/v1/microNovedades/auditorias/usuario/{usuarioId}
     * Todas las acciones realizadas por un usuario.
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<AuditoriaNovedadDTORespuesta>> historialUsuario(
            @PathVariable UUID usuarioId
    ) {
        return ResponseEntity.ok(auditoriaService.obtenerHistorialPorUsuario(usuarioId));
    }
}
