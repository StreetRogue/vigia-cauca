package co.edu.unicauca.microreportes.fachadaServices.services.impl;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.NovedadSnapshotEntity;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.NivelVisibilidad;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.NovedadSnapshotRepository;
import co.edu.unicauca.microreportes.fachadaServices.DTO.peticion.FiltroReporteDTO;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.NovedadReporteDTO;
import co.edu.unicauca.microreportes.fachadaServices.mapper.SnapshotMapper;
import co.edu.unicauca.microreportes.fachadaServices.mapper.VisibilidadHelper;
import co.edu.unicauca.microreportes.fachadaServices.services.IReporteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Genera reportes descargables aplicando reglas de visibilidad.
 *
 * Reglas:
 * - Visitante: solo novedades PUBLICA
 * - Admin/Operador: PUBLICA + PRIVADA
 * - Las novedades privadas NUNCA aparecen en reportes para visitantes,
 *   aunque sí se usan internamente para estadísticas de admin.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReporteServiceImpl implements IReporteService {

    private final NovedadSnapshotRepository snapshotRepository;
    private final SnapshotMapper snapshotMapper;
    private final VisibilidadHelper visibilidadHelper;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private static final String[] HEADERS = {
            "Fecha", "Municipio", "Localidad", "Categoría", "Actor Principal",
            "Actor Secundario", "Nivel Confianza", "Muertos", "Heridos",
            "Desplazados", "Confinados", "Descripción"
    };

    @Override
    @Transactional(readOnly = true)
    public List<NovedadReporteDTO> previsualizarReporte(FiltroReporteDTO filtro, String rol) {
        List<NovedadSnapshotEntity> datos = obtenerDatosFiltrados(filtro, rol);
        return datos.stream()
                .map(snapshotMapper::toReporteDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generarReporteExcel(FiltroReporteDTO filtro, String rol) {
        List<NovedadSnapshotEntity> datos = obtenerDatosFiltrados(filtro, rol);

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Reporte Novedades");

            // Estilos
            CellStyle headerStyle = crearEstiloHeader(workbook);
            CellStyle dateStyle = crearEstiloFecha(workbook);
            CellStyle wrapStyle = crearEstiloTextoLargo(workbook);

            // Título
            crearFilaTitulo(workbook, sheet, filtro);

            // Headers (fila 2)
            Row headerRow = sheet.createRow(2);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }

            // Datos
            int rowIdx = 3;
            for (NovedadSnapshotEntity snap : datos) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(snap.getFechaHecho().format(DATE_FMT));
                row.getCell(0).setCellStyle(dateStyle);
                row.createCell(1).setCellValue(snap.getMunicipio());
                row.createCell(2).setCellValue(safe(snap.getLocalidadEspecifica()));
                row.createCell(3).setCellValue(snap.getCategoria().name());
                row.createCell(4).setCellValue(snap.getActor1().name());
                row.createCell(5).setCellValue(snap.getActor2() != null ? snap.getActor2().name() : "");
                row.createCell(6).setCellValue(snap.getNivelConfianza().name());
                row.createCell(7).setCellValue(snap.getMuertosTotales());
                row.createCell(8).setCellValue(snap.getHeridosTotales());
                row.createCell(9).setCellValue(snap.getDesplazadosTotales());
                row.createCell(10).setCellValue(snap.getConfinadosTotales());

                Cell descCell = row.createCell(11);
                descCell.setCellValue(safe(snap.getDescripcionHecho()));
                descCell.setCellStyle(wrapStyle);
            }

            // Autosize columnas (excepto descripción)
            for (int i = 0; i < HEADERS.length - 1; i++) {
                sheet.autoSizeColumn(i);
            }
            sheet.setColumnWidth(11, 15000); // Descripción ancho fijo

            // Filtros automáticos
            sheet.setAutoFilter(new CellRangeAddress(2, 2, 0, HEADERS.length - 1));

            // Congelar panel de headers
            sheet.createFreezePane(0, 3);

            workbook.write(baos);
            log.info("Reporte Excel generado: {} registros", datos.size());
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error generando reporte Excel: {}", e.getMessage(), e);
            throw new RuntimeException("Error generando reporte Excel", e);
        }
    }

    // ==========================================
    // PRIVADOS
    // ==========================================

    private List<NovedadSnapshotEntity> obtenerDatosFiltrados(FiltroReporteDTO filtro, String rol) {
        int anio = filtro.getAnio() != null ? filtro.getAnio() : LocalDate.now().getYear();
        List<NivelVisibilidad> visibilidades = visibilidadHelper.visibilidadesPorRol(rol);

        return snapshotRepository.buscarParaReporte(
                anio, filtro.getMunicipio(), filtro.getCategoria(), visibilidades);
    }

    private void crearFilaTitulo(Workbook workbook, Sheet sheet, FiltroReporteDTO filtro) {
        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 14);
        titleStyle.setFont(titleFont);

        Row titleRow = sheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        String titulo = "Reporte de Novedades - Vigía Cauca";
        if (filtro.getMunicipio() != null) titulo += " | " + filtro.getMunicipio();
        if (filtro.getAnio() != null) titulo += " | " + filtro.getAnio();
        titleCell.setCellValue(titulo);
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));
    }

    private CellStyle crearEstiloHeader(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private CellStyle crearEstiloFecha(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private CellStyle crearEstiloTextoLargo(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setWrapText(true);
        style.setVerticalAlignment(VerticalAlignment.TOP);
        return style;
    }

    private String safe(String val) {
        return val != null ? val : "";
    }
}
