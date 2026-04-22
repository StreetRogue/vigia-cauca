package co.edu.unicauca.microreportes.fachadaServices.services.impl;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.NovedadSnapshotEntity;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.NivelVisibilidad;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.NovedadSnapshotRepository;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.specs.NovedadSnapshotSpecification;
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
import org.springframework.data.domain.Sort;
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
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReporteServiceImpl implements IReporteService {

    private final NovedadSnapshotRepository snapshotRepository;
    private final SnapshotMapper snapshotMapper;
    private final VisibilidadHelper visibilidadHelper;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // Columnas del reporte — sin usuarioId, sin nivelVisibilidad (datos internos)
    private static final String[] HEADERS = {
            "ID NOVEDAD", "FECHA HECHO", "MUNICIPIO", "LOCALIDAD",
            "CATEGORÍA", "ACTOR(ES)", "NIVEL CONFIANZA",
            "MUERTOS TOTALES", "MUERTOS CIVILES", "MUERTOS F. PÚBLICA",
            "HERIDOS TOTALES", "HERIDOS CIVILES", "DESPLAZADOS", "CONFINADOS",
            "DESCRIPCIÓN"
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
        List<NivelVisibilidad> visibilidades = visibilidadHelper.visibilidadesPorRol(rol);

        List<NovedadSnapshotEntity> datos = snapshotRepository.findAll(
                NovedadSnapshotSpecification.filtrar(filtro, visibilidades),
                Sort.by(Sort.Direction.DESC, "fechaHecho")
        );

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Detalle Completo");
            int numCols = HEADERS.length;

            // Fila 0: título principal
            crearFilaTitulo(workbook, sheet, filtro, numCols);

            // Fila 1: fecha de generación
            crearFilaSubtitulo(workbook, sheet, numCols);

            // Fila 2: encabezados con estilo
            CellStyle headerStyle = crearEstiloHeader(workbook);
            Row headerRow = sheet.createRow(2);
            headerRow.setHeightInPoints(22);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }

            // Estilos para filas de datos
            CellStyle styleNormal    = crearEstiloFila(workbook, false);
            CellStyle styleAlternado = crearEstiloFila(workbook, true);
            CellStyle styleFecha     = crearEstiloFecha(workbook);
            CellStyle styleTextoLargo = crearEstiloTextoLargo(workbook);

            // Filas de datos
            int rowIdx = 3;
            for (NovedadSnapshotEntity n : datos) {
                Row row = sheet.createRow(rowIdx);
                CellStyle rowStyle = (rowIdx % 2 == 0) ? styleAlternado : styleNormal;
                row.setHeightInPoints(18);

                // Construir display de actores combinado
                String actoresDisplay = "";
                if (n.getActor1() != null) actoresDisplay = n.getActor1().name();
                if (n.getActor2() != null) actoresDisplay += "\n" + n.getActor2().name();

                crearCelda(row, 0,  n.getNovedadId() != null ? n.getNovedadId().toString() : "", rowStyle);
                crearCelda(row, 1,  n.getFechaHecho() != null ? n.getFechaHecho().format(DATE_FMT) : "", styleFecha);
                crearCelda(row, 2,  safe(n.getMunicipio()), rowStyle);
                crearCelda(row, 3,  safe(n.getLocalidadEspecifica()), rowStyle);
                crearCelda(row, 4,  n.getCategoria() != null ? n.getCategoria().name() : "", rowStyle);
                crearCelda(row, 5,  actoresDisplay, crearEstiloActores(workbook, rowStyle));
                crearCelda(row, 6,  n.getNivelConfianza() != null ? n.getNivelConfianza().name() : "", rowStyle);
                crearCeldaNum(row, 7,  n.getMuertosTotales(), rowStyle);
                crearCeldaNum(row, 8,  n.getMuertosCiviles(), rowStyle);
                crearCeldaNum(row, 9,  n.getMuertosFuerzaPublica(), rowStyle);
                crearCeldaNum(row, 10, n.getHeridosTotales(), rowStyle);
                crearCeldaNum(row, 11, n.getHeridosCiviles(), rowStyle);
                crearCeldaNum(row, 12, n.getDesplazadosTotales(), rowStyle);
                crearCeldaNum(row, 13, n.getConfinadosTotales(), rowStyle);
                crearCelda(row, 14, safe(n.getDescripcionHecho()), styleTextoLargo);

                rowIdx++;
            }

            // Autoajustar columnas cortas; ancho fijo para actores y descripción
            for (int i = 0; i < numCols - 1; i++) {
                sheet.autoSizeColumn(i);
                if (sheet.getColumnWidth(i) < 2500) sheet.setColumnWidth(i, 2500);
            }
            sheet.setColumnWidth(5, 5000);  // columna Actores
            sheet.setColumnWidth(numCols - 1, 14000); // columna Descripción

            workbook.write(baos);
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Fallo al crear Excel", e);
        }
    }

    // ==========================================
    // PRIVADOS — estructura del Excel
    // ==========================================

    private void crearFilaTitulo(Workbook workbook, Sheet sheet, FiltroReporteDTO filtro, int numCols) {
        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 14);
        titleFont.setColor(IndexedColors.DARK_BLUE.getIndex());
        titleStyle.setFont(titleFont);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);
        titleStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        Row titleRow = sheet.createRow(0);
        titleRow.setHeightInPoints(26);
        Cell titleCell = titleRow.createCell(0);

        String titulo = "Reporte de Novedades - Vigía Cauca";
        if (filtro.getMunicipio() != null) titulo += " | " + filtro.getMunicipio();
        if (filtro.getAnio() != null)      titulo += " | " + filtro.getAnio();
        titleCell.setCellValue(titulo);
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, numCols - 1));
    }

    private void crearFilaSubtitulo(Workbook workbook, Sheet sheet, int numCols) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setItalic(true);
        font.setFontHeightInPoints((short) 10);
        font.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);

        Row row = sheet.createRow(1);
        row.setHeightInPoints(16);
        Cell cell = row.createCell(0);
        cell.setCellValue("Generado el: " + LocalDate.now().format(DATE_FMT));
        cell.setCellStyle(style);
        sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, numCols - 1));
    }

    private CellStyle crearEstiloHeader(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.MEDIUM);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle crearEstiloFila(Workbook workbook, boolean alternado) {
        CellStyle style = workbook.createCellStyle();
        if (alternado) {
            style.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        }
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle crearEstiloFecha(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle crearEstiloTextoLargo(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setWrapText(true);
        style.setVerticalAlignment(VerticalAlignment.TOP);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle crearEstiloActores(Workbook workbook, CellStyle base) {
        CellStyle style = workbook.createCellStyle();
        style.cloneStyleFrom(base);
        style.setWrapText(true);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    // ==========================================
    // PRIVADOS — helpers de celda
    // ==========================================

    private void crearCelda(Row row, int col, String valor, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(valor);
        cell.setCellStyle(style);
    }

    private void crearCeldaNum(Row row, int col, Integer valor, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(valor != null ? valor : 0);
        cell.setCellStyle(style);
    }

    private List<NovedadSnapshotEntity> obtenerDatosFiltrados(FiltroReporteDTO filtro, String rol) {
        List<NivelVisibilidad> visibilidades = visibilidadHelper.visibilidadesPorRol(rol);
        return snapshotRepository.findAll(
                NovedadSnapshotSpecification.filtrar(filtro, visibilidades),
                Sort.by(Sort.Direction.DESC, "fechaHecho")
        );
    }

    private String safe(String val) {
        return val != null ? val : "";
    }
}
