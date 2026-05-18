package co.edu.unicauca.microreportes.capaControladores;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.Actor;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.CategoriaEvento;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.NivelConfianza;
import co.edu.unicauca.microreportes.fachadaServices.DTO.peticion.FiltroEstadisticaDTO;
import co.edu.unicauca.microreportes.fachadaServices.DTO.peticion.FiltroReporteDTO;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.NovedadReporteDTO;
import co.edu.unicauca.microreportes.fachadaServices.services.IReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
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
 * 3. Descargar PDF: GET /descargar-pdf → genera reporte gráfico PDF
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
     * Genera y descarga reporte en formato Excel con filtros dinámicos.
     */
    @GetMapping("/descargar")
    public ResponseEntity<byte[]> descargar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String municipio,
            @RequestParam(required = false) CategoriaEvento categoria,
            @RequestParam(required = false) Actor actor1,
            @RequestParam(required = false) NivelConfianza nivelConfianza,
            @RequestHeader(value = "X-User-Role", defaultValue = "VISITANTE") String rol
    ) {
        FiltroReporteDTO filtro = FiltroReporteDTO.builder()
                .fechaInicio(fechaInicio)
                .fechaFin(fechaFin)
                .municipio(municipio)
                .categoria(categoria)
                .actor1(actor1)
                .nivelConfianza(nivelConfianza)
                .build();

        byte[] excel = reporteService.generarReporteExcel(filtro, rol);

        String nombreLugar = (municipio != null && !municipio.isBlank()) ? municipio.toLowerCase() : "cauca";
        String fechaHoy = LocalDate.now().toString();
        String filename = String.format("reporte_vigia_%s_%s.xlsx", nombreLugar, fechaHoy);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(excel.length)
                .body(excel);
    }

    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/reportes/documentos/descargar-pdf
     * Genera y descarga un reporte PDF gráfico idéntico al dashboard.
     * Acepta los mismos filtros que el endpoint del dashboard.
     */
    @GetMapping("/descargar-pdf")
    public ResponseEntity<byte[]> descargarPdf(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) String municipio,
            @RequestParam(required = false) CategoriaEvento categoria,
            @RequestParam(required = false) Actor actor,
            @RequestParam(required = false) NivelConfianza nivelConfianza,
            @RequestHeader(value = "X-User-Role", defaultValue = "VISITANTE") String rol
    ) {
        FiltroEstadisticaDTO filtro = FiltroEstadisticaDTO.builder()
                .anio(anio)
                .mes(mes)
                .municipio(municipio)
                .categoria(categoria)
                .actor(actor)
                .nivelConfianza(nivelConfianza)
                .build();

        byte[] pdf = reporteService.generarReportePDF(filtro, rol);

        String nombreLugar = (municipio != null && !municipio.isBlank()) ? municipio.toLowerCase() : "cauca";
        String fechaHoy = LocalDate.now().toString();
        String filename = String.format("reporte_vigia_%s_%s.pdf", nombreLugar, fechaHoy);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }
}
