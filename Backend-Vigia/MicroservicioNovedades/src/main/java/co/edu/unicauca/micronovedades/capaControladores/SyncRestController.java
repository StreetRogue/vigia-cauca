package co.edu.unicauca.micronovedades.capaControladores;

import co.edu.unicauca.micronovedades.capaAccesoDatos.repositories.NovedadRepository;
import co.edu.unicauca.micronovedades.fachadaServices.services.INovedadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/microNovedades/public/sync")
@RequiredArgsConstructor
public class SyncRestController {

    private final NovedadRepository novedadRepository;
    private final INovedadService novedadService;

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> count() {
        long total = novedadRepository.countByOcultoFalse();
        return ResponseEntity.ok(Map.of("count", total));
    }

    @PostMapping("/resync")
    public ResponseEntity<Map<String, Object>> resync() {
        int count = novedadService.resyncEventos();
        return ResponseEntity.ok(Map.of("eventosPublicados", count));
    }
}
