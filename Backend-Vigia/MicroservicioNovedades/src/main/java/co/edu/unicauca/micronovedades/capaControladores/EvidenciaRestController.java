package co.edu.unicauca.micronovedades.capaControladores;

import co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta.EvidenciaDTORespuesta;
import co.edu.unicauca.micronovedades.fachadaServices.services.impl.EvidenciaStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/microNovedades/novedades")
@RequiredArgsConstructor
public class EvidenciaRestController {

    private final EvidenciaStorageService evidenciaStorageService;

    /**
     * POST /api/v1/microNovedades/novedades/{novedadId}/evidencias
     *
     * Sube un archivo de imagen (jpg/jpeg/png, máx 5 MB) y lo asocia a la novedad indicada.
     * El archivo se guarda en el filesystem configurado; en BD se persiste solo la referencia.
     *
     * Parámetros multipart:
     *   archivo: MultipartFile con la imagen
     */
    @PostMapping(value = "/{novedadId}/evidencias", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<EvidenciaDTORespuesta> subirEvidencia(
            @PathVariable UUID novedadId,
            @RequestParam("archivo") MultipartFile archivo
    ) {
        EvidenciaDTORespuesta respuesta = evidenciaStorageService.guardarEvidencia(novedadId, archivo);
        return ResponseEntity.status(201).body(respuesta);
    }

    /**
     * GET /api/v1/microNovedades/novedades/evidencias/{id}
     *
     * Descarga/visualiza la imagen almacenada en filesystem para la evidencia indicada.
     * Retorna el archivo con el Content-Type correcto (image/jpeg o image/png).
     *
     * Solo aplica para evidencias subidas por archivo; las URL externas (legacy)
     * no tienen archivo local y retornarán 400.
     */
    @GetMapping("/evidencias/{id}")
    public ResponseEntity<byte[]> descargarEvidencia(@PathVariable UUID id) {
        byte[] bytes = evidenciaStorageService.leerEvidencia(id);
        String contentType = evidenciaStorageService.obtenerContentType(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(bytes);
    }
}
