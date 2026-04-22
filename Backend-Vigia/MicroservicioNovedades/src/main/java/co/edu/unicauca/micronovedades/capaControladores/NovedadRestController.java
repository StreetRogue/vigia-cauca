package co.edu.unicauca.micronovedades.capaControladores;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.CategoriaEvento;
import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.NivelVisibilidad;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion.FiltroNovedadDTO;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion.NovedadDTOPeticion;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta.NovedadDTORespuesta;
import co.edu.unicauca.micronovedades.fachadaServices.services.INovedadService;
import co.edu.unicauca.micronovedades.fachadaServices.services.impl.EvidenciaStorageService;
import co.edu.unicauca.micronovedades.fachadaServices.services.impl.ExcelNovedadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/microNovedades/novedades")
@RequiredArgsConstructor
public class NovedadRestController {

    private final INovedadService novedadService;
    private final ExcelNovedadService excelNovedadService;
    private final EvidenciaStorageService evidenciaStorageService;

    /**
     * POST /api/v1/microNovedades/novedades
     * Crea una novedad con víctimas, afectación humana y evidencias opcionales (solo URLs).
     * Content-Type: application/json
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<NovedadDTORespuesta> crear(@Valid @RequestBody NovedadDTOPeticion peticion) {
        NovedadDTORespuesta respuesta = novedadService.crearNovedad(peticion);
        return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
    }

    /**
     * POST /api/v1/microNovedades/novedades
     * Crea una novedad enviando los datos del formulario + imágenes en una sola petición multipart.
     * Content-Type: multipart/form-data
     *
     * Partes:
     *   datos    - JSON de NovedadDTOPeticion (igual al body del endpoint JSON)
     *   imagenes - uno o varios archivos jpg/jpeg/png (opcional, máx 5 MB c/u)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NovedadDTORespuesta> crearConEvidencias(
            @RequestPart("datos") @Valid NovedadDTOPeticion peticion,
            @RequestPart(value = "imagenes", required = false) List<MultipartFile> imagenes
    ) {
        NovedadDTORespuesta respuesta = novedadService.crearNovedad(peticion);

        if (imagenes != null && !imagenes.isEmpty()) {
            for (MultipartFile imagen : imagenes) {
                if (!imagen.isEmpty()) {
                    evidenciaStorageService.guardarEvidencia(respuesta.getNovedadId(), imagen);
                }
            }
            // Recargar para incluir las evidencias en la respuesta
            respuesta = novedadService.obtenerPorId(respuesta.getNovedadId());
        }

        return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
    }

    /**
     * GET /api/v1/microNovedades/novedades/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<NovedadDTORespuesta> obtenerPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(novedadService.obtenerPorId(id));
    }

    /**
     * GET /api/v1/microNovedades/novedades
     */
    @GetMapping
    public ResponseEntity<List<NovedadDTORespuesta>> listarTodas() {
        return ResponseEntity.ok(novedadService.listarTodas());
    }

    /**
     * GET /api/v1/microNovedades/novedades/paginado?page=0&size=20&sort=fechaHecho,desc
     */
    @GetMapping("/paginado")
    public ResponseEntity<Page<NovedadDTORespuesta>> listarPaginado(
            @PageableDefault(size = 20, sort = "fechaHecho") Pageable pageable
    ) {
        return ResponseEntity.ok(novedadService.listarTodasPaginado(pageable));
    }

    /**
     * GET /api/v1/microNovedades/novedades/usuario/{usuarioId}
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<NovedadDTORespuesta>> listarPorUsuario(@PathVariable UUID usuarioId) {
        return ResponseEntity.ok(novedadService.listarPorUsuario(usuarioId));
    }

    /**
     * GET /api/v1/microNovedades/novedades/filtrar
     * Búsqueda avanzada con filtros opcionales.
     * Ejemplo: ?fechaInicio=2025-01-01&fechaFin=2025-12-31&municipio=Popayán&categoria=ENFRENTAMIENTO
     */
    @GetMapping("/filtrar")
    public ResponseEntity<List<NovedadDTORespuesta>> buscarConFiltros(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String municipio,
            @RequestParam(required = false) CategoriaEvento categoria,
            @RequestParam(required = false) NivelVisibilidad nivelVisibilidad
    ) {
        FiltroNovedadDTO filtro = FiltroNovedadDTO.builder()
                .fechaInicio(fechaInicio)
                .fechaFin(fechaFin)
                .municipio(municipio)
                .categoria(categoria)
                .nivelVisibilidad(nivelVisibilidad)
                .build();

        return ResponseEntity.ok(novedadService.buscarConFiltros(filtro));
    }

    /**
     * PUT /api/v1/microNovedades/novedades/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<NovedadDTORespuesta> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody NovedadDTOPeticion peticion
    ) {
        return ResponseEntity.ok(novedadService.actualizarNovedad(id, peticion));
    }

    /**
     * DELETE /api/v1/microNovedades/novedades/{id}?usuarioId={uuid}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable UUID id,
            @RequestParam UUID usuarioId
    ) {
        novedadService.eliminarNovedad(id, usuarioId);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/v1/microNovedades/novedades/plantilla-excel
     * Descarga la plantilla Excel vacía para carga masiva.
     */
    @GetMapping("/plantilla-excel")
    public ResponseEntity<byte[]> descargarPlantilla() {
        byte[] excel = excelNovedadService.generarPlantillaExcel();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("plantilla_novedades.xlsx").build());
        return ResponseEntity.ok().headers(headers).body(excel);
    }

    /**
     * POST /api/v1/microNovedades/novedades/carga-excel
     * Recibe un archivo Excel y crea múltiples novedades.
     * Parámetro requerido: usuarioId (UUID del usuario que realiza la carga)
     */
    @PostMapping(value = "/carga-excel", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> cargarDesdeExcel(
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam UUID usuarioId
    ) {
        Map<String, Object> resultado = excelNovedadService.cargarDesdeExcel(archivo, usuarioId);
        return ResponseEntity.ok(resultado);
    }
}
