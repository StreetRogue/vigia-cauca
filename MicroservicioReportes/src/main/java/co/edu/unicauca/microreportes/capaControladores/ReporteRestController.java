package co.edu.unicauca.microreportes.capaControladores;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.CategoriaEvento;
import co.edu.unicauca.microreportes.fachadaServices.DTO.peticion.FiltroReporteDTO;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.NovedadReporteDTO;
import co.edu.unicauca.microreportes.fachadaServices.services.IReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Endpoints para generación y descarga de reportes.
 *
 * Flujo del frontend:
 * 1. Previsualizar: GET /previsualizar → muestra tabla de datos
 * 2. Descargar: GET /descargar → genera y devuelve archivo Excel
 */
@RestController
@RequestMapping("/api/v1/reportes/documentos")
@RequiredArgsConstructor
public class ReporteRestController {

    private final IReporteService reporteService;

    /**
     * GET /api/v1/reportes/documentos/previsualizar
     * Previsualización de datos antes de generar el documento.
     */
    @GetMapping("/previsualizar")
    public ResponseEntity<List<NovedadReporteDTO>> previsualizar(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) String municipio,
            @RequestParam(required = false) CategoriaEvento categoria,
            @RequestHeader(value = "X-User-Role", defaultValue = "VISITANTE") String rol
    ) {
        FiltroReporteDTO filtro = FiltroReporteDTO.builder()
                .anio(anio).municipio(municipio).categoria(categoria).build();
        return ResponseEntity.ok(reporteService.previsualizarReporte(filtro, rol));
    }

    /**
     * GET /api/v1/reportes/documentos/descargar
     * Genera y descarga reporte en formato Excel.
     *
     * El archivo resultante refleja exactamente la información visible
     * según los filtros activos y el rol del usuario.
     * NO incluye datos privados para usuarios sin permisos.
     */
    @GetMapping("/descargar")
    public ResponseEntity<byte[]> descargar(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) String municipio,
            @RequestParam(required = false) CategoriaEvento categoria,
            @RequestHeader(value = "X-User-Role", defaultValue = "VISITANTE") String rol
    ) {
        FiltroReporteDTO filtro = FiltroReporteDTO.builder()
                .anio(anio).municipio(municipio).categoria(categoria).build();

        byte[] excel = reporteService.generarReporteExcel(filtro, rol);

        String filename = String.format("reporte_vigia_%s_%d.xlsx",
                municipio != null ? municipio.toLowerCase() : "cauca",
                anio != null ? anio : LocalDate.now().getYear());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(excel.length)
                .body(excel);
    }
}
