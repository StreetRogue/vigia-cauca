package co.edu.unicauca.micronovedades.capaControladores;

import co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion.VictimaDTOPeticion;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta.VictimaDTORespuesta;
import co.edu.unicauca.micronovedades.fachadaServices.services.IVictimaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/microNovedades/novedades/{novedadId}/victimas")
@RequiredArgsConstructor
public class VictimaRestController {

    private final IVictimaService victimaService;

    /**
     * POST /api/v1/microNovedades/novedades/{novedadId}/victimas
     * Agrega una víctima a una novedad existente.
     */
    @PostMapping
    public ResponseEntity<VictimaDTORespuesta> agregar(
            @PathVariable UUID novedadId,
            @Valid @RequestBody VictimaDTOPeticion peticion
    ) {
        VictimaDTORespuesta respuesta = victimaService.agregarVictima(novedadId, peticion);
        return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
    }

    /**
     * GET /api/v1/microNovedades/novedades/{novedadId}/victimas
     */
    @GetMapping
    public ResponseEntity<List<VictimaDTORespuesta>> listar(@PathVariable UUID novedadId) {
        return ResponseEntity.ok(victimaService.listarPorNovedad(novedadId));
    }

    /**
     * DELETE /api/v1/microNovedades/novedades/{novedadId}/victimas/{victimaId}
     */
    @DeleteMapping("/{victimaId}")
    public ResponseEntity<Void> eliminar(
            @PathVariable UUID novedadId,
            @PathVariable UUID victimaId
    ) {
        victimaService.eliminarVictima(novedadId, victimaId);
        return ResponseEntity.noContent().build();
    }
}
