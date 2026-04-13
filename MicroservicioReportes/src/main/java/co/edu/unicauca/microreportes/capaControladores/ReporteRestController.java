package co.edu.unicauca.microreportes.capaControladores;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.Actor;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.CategoriaEvento;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.NivelConfianza;
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
     *
     * El archivo resultante refleja exactamente la información visible
     * según los filtros activos y el rol del usuario.
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
        // 1. Construir el DTO de filtros dinámicos
        FiltroReporteDTO filtro = FiltroReporteDTO.builder()
                .fechaInicio(fechaInicio)
                .fechaFin(fechaFin)
                .municipio(municipio)
                .categoria(categoria)
                .actor1(actor1)
                .nivelConfianza(nivelConfianza)
                .build();

        // 2. Generar el chorro de bytes del Excel en el Service
        byte[] excel = reporteService.generarReporteExcel(filtro, rol);

        // 3. Definir nombre dinámico para el archivo (ej: reporte_vigia_popayan_2025-02-22.xlsx)
        String nombreLugar = (municipio != null && !municipio.isBlank()) ? municipio.toLowerCase() : "cauca";
        String fechaHoy = LocalDate.now().toString();
        String filename = String.format("reporte_vigia_%s_%s.xlsx", nombreLugar, fechaHoy);

        // 4. Retornar la respuesta con los headers de descarga
        return ResponseEntity.ok()
                // Indica al navegador que es un archivo adjunto
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                // Tipo de medio estándar para archivos .xlsx modernos
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                // Tamaño del archivo
                .contentLength(excel.length)
                .body(excel);
    }
}
