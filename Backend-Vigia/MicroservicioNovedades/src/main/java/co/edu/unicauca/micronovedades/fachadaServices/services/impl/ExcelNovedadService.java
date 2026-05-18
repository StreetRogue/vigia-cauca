package co.edu.unicauca.micronovedades.fachadaServices.services.impl;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.NovedadEntity;
import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.*;
import co.edu.unicauca.micronovedades.capaAccesoDatos.repositories.NovedadRepository;
import co.edu.unicauca.micronovedades.capaControladores.controladorExcepciones.BadRequestException;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion.AfectacionHumanaDTOPeticion;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion.NovedadDTOPeticion;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta.NovedadDTORespuesta;
import co.edu.unicauca.micronovedades.fachadaServices.services.INovedadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.CellRangeAddressList;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFDataValidation;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.*;

/**
 * Servicio para plantilla Excel descargable y carga masiva de novedades.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelNovedadService {

    private final INovedadService novedadService;
    private final NovedadRepository novedadRepository;

    /** Cabeceras esperadas en el Excel de carga masiva (en orden). */
    static final String[] HEADERS_PLANTILLA = {
            "FECHA_HECHO",        // YYYY-MM-DD
            "HORA_INICIO",        // HH:mm
            "HORA_FIN",           // HH:mm
            "MUNICIPIO",
            "LOCALIDAD",
            "CATEGORIA",          // CategoriaEvento enum
            "ACTORES",            // Actores separados por coma, ej: ELN,FUERZA_PUBLICA
            "INFRAESTRUCTURA_AFECTADA",
            "ACCION_INSTITUCIONAL",
            "DESCRIPCION",
            "NIVEL_CONFIANZA",    // NivelConfianza enum
            "NIVEL_VISIBILIDAD",  // NivelVisibilidad enum
            // Afectación humana (opcional)
            "MUERTOS_TOTALES",
            "MUERTOS_CIVILES",
            "MUERTOS_FUERZA_PUBLICA",
            "HERIDOS_TOTALES",
            "HERIDOS_CIVILES",
            "DESPLAZADOS_TOTALES",
            "CONFINADOS_TOTALES"
    };

    // ==========================================
    // PLANTILLA
    // ==========================================

    public byte[] generarPlantillaExcel() {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Plantilla Novedades");
            int numCols = HEADERS_PLANTILLA.length;

            // Fila 0: título
            crearFilaTitulo(workbook, sheet, numCols);

            // Fila 1: instrucciones
            crearFilaInstrucciones(workbook, sheet, numCols);

            // Fila 2: encabezados
            CellStyle headerStyle = crearEstiloHeader(workbook);
            Row headerRow = sheet.createRow(2);
            headerRow.setHeightInPoints(22);
            for (int i = 0; i < HEADERS_PLANTILLA.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(HEADERS_PLANTILLA[i]);
                cell.setCellStyle(headerStyle);
            }

            // Fila 3: fila de ejemplo
            CellStyle ejemploStyle = crearEstiloEjemplo(workbook);
            Row ejemploRow = sheet.createRow(3);
            ejemploRow.setHeightInPoints(18);
            String[] valores = {
                    "2025-06-15", "08:00", "10:30",
                    "Popayán", "Vereda El Carmen",
                    "ENFRENTAMIENTO",
                    "ELN,FUERZA_PUBLICA",
                    "Puente vial afectado", "Patrullaje inmediato",
                    "Se registró enfrentamiento entre grupos armados y fuerza pública",
                    "CONFIRMADO", "PUBLICA",
                    "2", "1", "1", "3", "2", "0", "0"
            };
            for (int i = 0; i < valores.length; i++) {
                Cell cell = ejemploRow.createCell(i);
                cell.setCellValue(valores[i]);
                cell.setCellStyle(ejemploStyle);
            }

            // Hoja 2: valores permitidos
            crearHojaReferencia(workbook);

            // Agregar validación de datos (dropdowns) a partir de fila 4
            try {
                agregarValidacionDatos((XSSFWorkbook) workbook, (XSSFSheet) sheet);
            } catch (Exception e) {
                log.warn("Error agregando validaciones: " + e.getMessage());
            }

            // Autoajustar columnas
            for (int i = 0; i < numCols; i++) {
                sheet.autoSizeColumn(i);
                // Mínimo ancho razonable
                if (sheet.getColumnWidth(i) < 3000) sheet.setColumnWidth(i, 3000);
            }

            workbook.write(baos);
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generando plantilla Excel", e);
        }
    }

    // ==========================================
    // CARGA MASIVA
    // ==========================================

    public Map<String, Object> cargarDesdeExcel(MultipartFile file, UUID usuarioId) {
        validarArchivoExcel(file);

        List<NovedadDTORespuesta> creadas = new ArrayList<>();
        List<Map<String, Object>> errores = new ArrayList<>();
        Set<String> firmasProcesadas = new HashSet<>();

        try (InputStream is = file.getInputStream();
             XSSFWorkbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) throw new BadRequestException("El archivo Excel no contiene hojas");

            // Buscar fila de encabezados (primera fila con FECHA_HECHO)
            int headerRowIndex = encontrarFilaHeaders(sheet);
            if (headerRowIndex < 0) {
                throw new BadRequestException(
                        "No se encontraron los encabezados esperados. " +
                        "Asegúrate de usar la plantilla oficial. " +
                        "Primer header esperado: FECHA_HECHO");
            }

            Row headerRow = sheet.getRow(headerRowIndex);
            Map<String, Integer> colIndex = mapearColumnas(headerRow);
            validarHeadersObligatorios(colIndex);

            // Paso 1: Parsear y validar todas las filas acumulando las válidas
            int totalFilas = 0;
            List<NovedadDTOPeticion> loteValido = new ArrayList<>();

            for (int r = headerRowIndex + 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null || esFilaVacia(row)) continue;
                totalFilas++;

                try {
                    NovedadDTOPeticion peticion = parsearFila(row, colIndex, usuarioId);
                    String firma = construirFirmaDuplicada(peticion);
                    if (firmasProcesadas.contains(firma) || existeDuplicadaEnBaseDatos(peticion)) {
                        Map<String, Object> error = new LinkedHashMap<>();
                        error.put("fila", r + 1);
                        error.put("error", "Novedad duplicada: ya existe con los mismos FECHA, HORA, MUNICIPIO, LOCALIDAD, CATEGORIA y ACTORES");
                        errores.add(error);
                        log.warn("Fila {} omitida por duplicado: {}", r + 1, firma);
                        continue;
                    }
                    loteValido.add(peticion);
                    firmasProcesadas.add(firma);
                } catch (Exception e) {
                    Map<String, Object> error = new LinkedHashMap<>();
                    error.put("fila", r + 1);
                    error.put("error", e.getMessage());
                    errores.add(error);
                    log.warn("Error en fila {}: {}", r + 1, e.getMessage());
                }
            }

            // Paso 2: Insertar todas las válidas en UNA sola transacción + 1 evento RabbitMQ
            if (!loteValido.isEmpty()) {
                try {
                    List<NovedadDTORespuesta> resultado_lote = novedadService.crearEnLote(loteValido);
                    creadas.addAll(resultado_lote);
                    log.info("[Excel] {} novedades insertadas en batch", resultado_lote.size());
                } catch (Exception e) {
                    log.error("[Excel] Error en batch insert: {}", e.getMessage());
                    // Si falla el batch, registrar error general
                    Map<String, Object> error = new LinkedHashMap<>();
                    error.put("fila", "lote completo");
                    error.put("error", "Error al insertar el lote: " + e.getMessage());
                    errores.add(error);
                }
            }

            Map<String, Object> resultado = new LinkedHashMap<>();
            resultado.put("totalFilasProcesadas", totalFilas);
            resultado.put("novedadesCreadas", creadas.size());
            resultado.put("errores", errores.size());
            resultado.put("detalle", creadas);
            resultado.put("erroresDetalle", errores);
            return resultado;

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error procesando archivo Excel: " + e.getMessage(), e);
        }
    }

    // ==========================================
    // PRIVADOS — parseo de fila
    // ==========================================

    private NovedadDTOPeticion parsearFila(Row row, Map<String, Integer> idx, UUID usuarioId) {
        String fechaStr  = getCellString(row, idx.get("FECHA_HECHO"));
        String horaIniStr = getCellString(row, idx.get("HORA_INICIO"));
        String horaFinStr = getCellString(row, idx.get("HORA_FIN"));
        String municipio  = getCellString(row, idx.get("MUNICIPIO"));
        String localidad  = getCellString(row, idx.get("LOCALIDAD"));
        String catStr     = getCellString(row, idx.get("CATEGORIA"));
        String actoresStr = getCellString(row, idx.get("ACTORES"));
        String infra      = idx.containsKey("INFRAESTRUCTURA_AFECTADA")
                ? getCellString(row, idx.get("INFRAESTRUCTURA_AFECTADA")) : null;
        String accion     = idx.containsKey("ACCION_INSTITUCIONAL")
                ? getCellString(row, idx.get("ACCION_INSTITUCIONAL")) : null;
        String descripcion = getCellString(row, idx.get("DESCRIPCION"));
        String confStr    = getCellString(row, idx.get("NIVEL_CONFIANZA"));
        String visStr     = getCellString(row, idx.get("NIVEL_VISIBILIDAD"));

        // Validaciones de campos obligatorios
        requireNonBlank(fechaStr,   "FECHA_HECHO");
        requireNonBlank(horaIniStr, "HORA_INICIO");
        requireNonBlank(horaFinStr, "HORA_FIN");
        requireNonBlank(municipio,  "MUNICIPIO");
        requireNonBlank(localidad,  "LOCALIDAD");
        requireNonBlank(catStr,     "CATEGORIA");
        requireNonBlank(actoresStr, "ACTORES");
        requireNonBlank(descripcion,"DESCRIPCION");
        requireNonBlank(confStr,    "NIVEL_CONFIANZA");
        requireNonBlank(visStr,     "NIVEL_VISIBILIDAD");

        LocalDate fechaHecho = parseDate(fechaStr);
        LocalTime horaInicio = parseTime(horaIniStr);
        LocalTime horaFin    = parseTime(horaFinStr);
        CategoriaEvento categoria = parseEnum(CategoriaEvento.class, catStr, "CATEGORIA");
        NivelConfianza nivelConfianza = parseEnum(NivelConfianza.class, confStr, "NIVEL_CONFIANZA");
        NivelVisibilidad nivelVisibilidad = parseEnum(NivelVisibilidad.class, visStr, "NIVEL_VISIBILIDAD");

        List<Actor> actores = parsearActores(actoresStr);

        // Afectación humana (opcional)
        AfectacionHumanaDTOPeticion afectacion = null;
        if (idx.containsKey("MUERTOS_TOTALES")) {
            Integer muertosTot   = getCellInt(row, idx.get("MUERTOS_TOTALES"));
            Integer muertosCiv   = idx.containsKey("MUERTOS_CIVILES") ? getCellInt(row, idx.get("MUERTOS_CIVILES")) : 0;
            Integer muertosFP    = idx.containsKey("MUERTOS_FUERZA_PUBLICA") ? getCellInt(row, idx.get("MUERTOS_FUERZA_PUBLICA")) : 0;
            Integer heridosTot   = idx.containsKey("HERIDOS_TOTALES") ? getCellInt(row, idx.get("HERIDOS_TOTALES")) : 0;
            Integer heridosCiv   = idx.containsKey("HERIDOS_CIVILES") ? getCellInt(row, idx.get("HERIDOS_CIVILES")) : 0;
            Integer desplazados  = idx.containsKey("DESPLAZADOS_TOTALES") ? getCellInt(row, idx.get("DESPLAZADOS_TOTALES")) : 0;
            Integer confinados   = idx.containsKey("CONFINADOS_TOTALES") ? getCellInt(row, idx.get("CONFINADOS_TOTALES")) : 0;

            boolean tieneAfectacion = muertosTot != null && muertosTot > 0
                    || (heridosTot != null && heridosTot > 0)
                    || (desplazados != null && desplazados > 0);
            if (tieneAfectacion) {
                afectacion = AfectacionHumanaDTOPeticion.builder()
                        .muertosTotales(muertosTot != null ? muertosTot : 0)
                        .muertosCiviles(muertosCiv != null ? muertosCiv : 0)
                        .muertosFuerzaPublica(muertosFP != null ? muertosFP : 0)
                        .heridosTotales(heridosTot != null ? heridosTot : 0)
                        .heridosCiviles(heridosCiv != null ? heridosCiv : 0)
                        .desplazadosTotales(desplazados != null ? desplazados : 0)
                        .confinadosTotales(confinados != null ? confinados : 0)
                        .build();
            }
        }

        return NovedadDTOPeticion.builder()
                .usuarioId(usuarioId)
                .fechaHecho(fechaHecho)
                .horaInicio(horaInicio)
                .horaFin(horaFin)
                .municipio(municipio.trim())
                .localidadEspecifica(localidad.trim())
                .categoria(categoria)
                .actores(actores)
                .infraestructuraAfectada(blankToNull(infra))
                .accionInstitucional(blankToNull(accion))
                .descripcionHecho(descripcion.trim())
                .nivelConfianza(nivelConfianza)
                .nivelVisibilidad(nivelVisibilidad)
                .afectacionHumana(afectacion)
                .build();
    }

    private List<Actor> parsearActores(String actoresStr) {
        String[] partes = actoresStr.split("[,;]");
        List<Actor> lista = new ArrayList<>();
        for (String parte : partes) {
            String limpio = parte.trim().toUpperCase();
            if (!limpio.isEmpty()) {
                try {
                    lista.add(Actor.valueOf(limpio));
                } catch (IllegalArgumentException e) {
                    throw new BadRequestException("Actor no válido: '" + limpio +
                            "'. Valores permitidos: " + Arrays.toString(Actor.values()));
                }
            }
        }
        if (lista.isEmpty()) throw new BadRequestException("ACTORES no puede estar vacío");
        if (lista.size() > 10) throw new BadRequestException("Se permiten máximo 10 actores por fila");
        return lista;
    }

    private String construirFirmaDuplicada(NovedadDTORespuesta novedad) {
        return construirFirmaDuplicada(
                novedad.getFechaHecho(),
                novedad.getHoraInicio(),
                novedad.getHoraFin(),
                novedad.getMunicipio(),
                novedad.getLocalidadEspecifica(),
                novedad.getCategoria(),
                novedad.getActores()
        );
    }

    private String construirFirmaDuplicada(NovedadDTOPeticion peticion) {
        return construirFirmaDuplicada(
                peticion.getFechaHecho(),
                peticion.getHoraInicio(),
                peticion.getHoraFin(),
                peticion.getMunicipio(),
                peticion.getLocalidadEspecifica(),
                peticion.getCategoria(),
                peticion.getActores()
        );
    }

    private String construirFirmaDuplicada(LocalDate fechaHecho,
                                           LocalTime horaInicio,
                                           LocalTime horaFin,
                                           String municipio,
                                           String localidad,
                                           CategoriaEvento categoria,
                                           Collection<Actor> actores) {
        List<String> actoresNormalizados = actores == null
                ? Collections.emptyList()
                : actores.stream()
                .filter(Objects::nonNull)
                .map(Enum::name)
                .map(String::trim)
                .map(String::toUpperCase)
                .sorted()
                .toList();

        return String.join("|",
                fechaHecho != null ? fechaHecho.toString() : "",
                horaInicio != null ? horaInicio.toString() : "",
                horaFin != null ? horaFin.toString() : "",
                normalizarTexto(municipio),
                normalizarTexto(localidad),
                categoria != null ? categoria.name() : "",
                String.join(",", actoresNormalizados)
        );
    }

    private boolean existeDuplicadaEnBaseDatos(NovedadDTOPeticion peticion) {
        List<NovedadEntity> candidatas = novedadRepository.buscarCandidatasDuplicadas(
                peticion.getFechaHecho(),
                peticion.getHoraInicio(),
                peticion.getHoraFin(),
                peticion.getMunicipio(),
                peticion.getLocalidadEspecifica(),
                peticion.getCategoria(),
                peticion.getActores().size()
        );

        Set<String> actoresNuevos = normalizarActores(peticion.getActores());
        for (NovedadEntity candidata : candidatas) {
            if (actoresNuevos.equals(normalizarActores(candidata.getActores()))) {
                return true;
            }
        }
        return false;
    }

    private Set<String> normalizarActores(Collection<Actor> actores) {
        if (actores == null || actores.isEmpty()) {
            return Collections.emptySet();
        }
        return actores.stream()
                .filter(Objects::nonNull)
                .map(Enum::name)
                .map(String::trim)
                .map(s -> s.toUpperCase(Locale.ROOT))
                .collect(java.util.stream.Collectors.toCollection(TreeSet::new));
    }

    private String normalizarTexto(String valor) {
        return valor == null ? "" : valor.trim().toUpperCase(Locale.ROOT);
    }

    // ==========================================
    // PRIVADOS — validaciones de archivo
    // ==========================================

    private void validarArchivoExcel(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("El archivo es obligatorio");
        }
        String nombre = file.getOriginalFilename();
        if (nombre == null || (!nombre.endsWith(".xlsx") && !nombre.endsWith(".xls"))) {
            throw new BadRequestException("El archivo debe ser un Excel (.xlsx o .xls)");
        }
        // Tamaño máximo: 5MB
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("El archivo no puede superar 5MB");
        }
    }

    private int encontrarFilaHeaders(Sheet sheet) {
        for (int r = 0; r <= Math.min(sheet.getLastRowNum(), 5); r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;
            for (Cell cell : row) {
                if ("FECHA_HECHO".equalsIgnoreCase(getCellStringRaw(cell))) return r;
            }
        }
        return -1;
    }

    private Map<String, Integer> mapearColumnas(Row headerRow) {
        Map<String, Integer> map = new LinkedHashMap<>();
        for (Cell cell : headerRow) {
            String val = getCellStringRaw(cell);
            if (val != null && !val.isBlank()) map.put(val.trim().toUpperCase(), cell.getColumnIndex());
        }
        return map;
    }

    private void validarHeadersObligatorios(Map<String, Integer> colIndex) {
        String[] obligatorios = {"FECHA_HECHO","HORA_INICIO","HORA_FIN","MUNICIPIO","LOCALIDAD",
                "CATEGORIA","ACTORES","DESCRIPCION","NIVEL_CONFIANZA","NIVEL_VISIBILIDAD"};
        List<String> faltantes = new ArrayList<>();
        for (String h : obligatorios) {
            if (!colIndex.containsKey(h)) faltantes.add(h);
        }
        if (!faltantes.isEmpty()) {
            throw new BadRequestException(
                    "El archivo no tiene los encabezados requeridos: " + faltantes +
                    ". Usa la plantilla oficial (/novedades/plantilla-excel).");
        }
    }

    // ==========================================
    // PRIVADOS — helpers de celda
    // ==========================================

    private String getCellString(Row row, Integer colIdx) {
        if (colIdx == null) return "";
        Cell cell = row.getCell(colIdx);
        return getCellStringRaw(cell);
    }

    private String getCellStringRaw(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getLocalDateTimeCellValue().toLocalDate().toString();
                }
                double d = cell.getNumericCellValue();
                yield d == Math.floor(d) ? String.valueOf((long) d) : String.valueOf(d);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCachedFormulaResultType() == CellType.STRING
                    ? cell.getStringCellValue().trim()
                    : String.valueOf(cell.getNumericCellValue());
            default -> "";
        };
    }

    private Integer getCellInt(Row row, Integer colIdx) {
        if (colIdx == null) return 0;
        String val = getCellString(row, colIdx);
        if (val == null || val.isBlank()) return 0;
        try { return (int) Double.parseDouble(val); }
        catch (NumberFormatException e) { return 0; }
    }

    private boolean esFilaVacia(Row row) {
        for (Cell cell : row) {
            String val = getCellStringRaw(cell);
            if (val != null && !val.isBlank()) return false;
        }
        return true;
    }

    private LocalDate parseDate(String s) {
        try { return LocalDate.parse(s.trim()); }
        catch (DateTimeParseException e) {
            throw new BadRequestException("FECHA_HECHO inválida: '" + s + "'. Formato esperado: YYYY-MM-DD");
        }
    }

    private LocalTime parseTime(String s) {
        try {
            // Acepta HH:mm o H:mm
            String padded = s.trim().length() == 4 ? "0" + s.trim() : s.trim();
            return LocalTime.parse(padded);
        } catch (DateTimeParseException e) {
            throw new BadRequestException("Hora inválida: '" + s + "'. Formato esperado: HH:mm");
        }
    }

    private <E extends Enum<E>> E parseEnum(Class<E> cls, String val, String campo) {
        try { return Enum.valueOf(cls, val.trim().toUpperCase()); }
        catch (IllegalArgumentException e) {
            throw new BadRequestException(campo + " inválido: '" + val +
                    "'. Valores permitidos: " + Arrays.toString(cls.getEnumConstants()));
        }
    }

    private void requireNonBlank(String val, String campo) {
        if (val == null || val.isBlank())
            throw new BadRequestException("El campo " + campo + " es obligatorio");
    }

    private String blankToNull(String val) {
        return (val == null || val.isBlank()) ? null : val.trim();
    }

    // ==========================================
    // PRIVADOS — estilos Excel plantilla
    // ==========================================

    private void crearFilaTitulo(Workbook wb, Sheet sheet, int numCols) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        Row row = sheet.createRow(0);
        row.setHeightInPoints(28);
        Cell cell = row.createCell(0);
        cell.setCellValue("VIGÍA CAUCA — Carga Masiva de Novedades");
        cell.setCellStyle(style);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, numCols - 1));
    }

    private void crearFilaInstrucciones(Workbook wb, Sheet sheet, int numCols) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setItalic(true);
        font.setFontHeightInPoints((short) 9);
        font.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);

        Row row = sheet.createRow(1);
        row.setHeightInPoints(14);
        Cell cell = row.createCell(0);
        cell.setCellValue("Instrucciones: Complete los datos a partir de la fila 4. " +
                "Consulte la hoja 'Valores Permitidos' para los campos enumerados. " +
                "Fechas en formato YYYY-MM-DD, horas en HH:mm. Actores separados por coma.");
        cell.setCellStyle(style);
        sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, numCols - 1));
    }

    private CellStyle crearEstiloHeader(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.MEDIUM);
        style.setBorderTop(BorderStyle.MEDIUM);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
        return style;
    }

    private CellStyle crearEstiloEjemplo(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
        font.setItalic(true);
        font.setFontHeightInPoints((short) 9);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private void crearHojaReferencia(XSSFWorkbook wb) {
        Sheet ref = wb.createSheet("Valores Permitidos");

        String[][] datos = {
                {"CATEGORIA", Arrays.stream(CategoriaEvento.values()).map(Enum::name).reduce((a,b)->a+", "+b).orElse("")},
                {"ACTORES (separados por coma)", Arrays.stream(Actor.values()).map(Enum::name).reduce((a,b)->a+", "+b).orElse("")},
                {"NIVEL_CONFIANZA", Arrays.stream(NivelConfianza.values()).map(Enum::name).reduce((a,b)->a+", "+b).orElse("")},
                {"NIVEL_VISIBILIDAD", Arrays.stream(NivelVisibilidad.values()).map(Enum::name).reduce((a,b)->a+", "+b).orElse("")},
                {"FECHA_HECHO", "Formato: YYYY-MM-DD  (ej: 2025-06-15)"},
                {"HORA_INICIO / HORA_FIN", "Formato: HH:mm  (ej: 08:30)"},
        };

        CellStyle headerStyle = wb.createCellStyle();
        Font hf = wb.createFont();
        hf.setBold(true);
        hf.setColor(IndexedColors.WHITE.getIndex());
        hf.setFontHeightInPoints((short) 11);
        headerStyle.setFont(hf);
        headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        Row titulo = ref.createRow(0);
        titulo.setHeightInPoints(22);
        Cell t = titulo.createCell(0); t.setCellValue("CAMPO"); t.setCellStyle(headerStyle);
        Cell t2 = titulo.createCell(1); t2.setCellValue("VALORES PERMITIDOS"); t2.setCellStyle(headerStyle);

        // Crear columnas ocultas (D, E, F, G) con los valores enum para usar en validaciones
        crearColumnasEnumerados(wb, ref);

        for (int i = 0; i < datos.length; i++) {
            Row row = ref.createRow(i + 1);
            row.setHeightInPoints(35);
            Cell fc = row.createCell(0);
            fc.setCellValue(datos[i][0]);
            CellStyle fs = wb.createCellStyle();
            Font f = wb.createFont();
            f.setBold(true);
            fs.setFont(f);
            fs.setAlignment(HorizontalAlignment.LEFT);
            fs.setVerticalAlignment(VerticalAlignment.TOP);
            fs.setBorderBottom(BorderStyle.THIN);
            fs.setBorderLeft(BorderStyle.THIN);
            fs.setBorderRight(BorderStyle.THIN);
            fc.setCellStyle(fs);

            Cell vc = row.createCell(1);
            vc.setCellValue(datos[i][1]);
            CellStyle ws = wb.createCellStyle();
            ws.setWrapText(true);
            ws.setAlignment(HorizontalAlignment.LEFT);
            ws.setVerticalAlignment(VerticalAlignment.TOP);
            ws.setBorderBottom(BorderStyle.THIN);
            ws.setBorderLeft(BorderStyle.THIN);
            ws.setBorderRight(BorderStyle.THIN);
            vc.setCellStyle(ws);
        }
        ref.setColumnWidth(0, 4000);
        ref.setColumnWidth(1, 20000);
    }

    // ==========================================
    // PRIVADOS — validación de datos Excel
    // ==========================================

    private void crearColumnasEnumerados(XSSFWorkbook wb, Sheet ref) {
        try {
            // Obtener valores enum
            String[] categorias = Arrays.stream(CategoriaEvento.values()).map(Enum::name).toArray(String[]::new);
            String[] actores = Arrays.stream(Actor.values()).map(Enum::name).toArray(String[]::new);
            String[] nivelConfZa = Arrays.stream(NivelConfianza.values()).map(Enum::name).toArray(String[]::new);
            String[] nivelVisi = Arrays.stream(NivelVisibilidad.values()).map(Enum::name).toArray(String[]::new);

            // Crear valores en columnas D, E, F, G (ocultas)
            crearColumnaValores(ref, 3, categorias, "CATEGORIA");      // Columna D
            crearColumnaValores(ref, 4, actores, "ACTORES");           // Columna E
            crearColumnaValores(ref, 5, nivelConfZa, "NIVEL_CONFIANZA"); // Columna F
            crearColumnaValores(ref, 6, nivelVisi, "NIVEL_VISIBILIDAD"); // Columna G

            // Ocultar columnas D-G
            ref.setColumnHidden(3, true);
            ref.setColumnHidden(4, true);
            ref.setColumnHidden(5, true);
            ref.setColumnHidden(6, true);

            log.info("Columnas de enumerados creadas y ocultas");
        } catch (Exception e) {
            log.error("Error creando columnas enumerados: " + e.getMessage());
        }
    }

    private void crearColumnaValores(Sheet sheet, int colIndex, String[] valores, String titulo) {
        Row headerRow = sheet.getRow(0);
        if (headerRow == null) headerRow = sheet.createRow(0);
        Cell headerCell = headerRow.createCell(colIndex);
        headerCell.setCellValue(titulo);

        for (int i = 0; i < valores.length; i++) {
            Row row = sheet.getRow(i + 1);
            if (row == null) row = sheet.createRow(i + 1);
            Cell cell = row.createCell(colIndex);
            cell.setCellValue(valores[i]);
        }
    }

    private void agregarValidacionDatos(XSSFWorkbook workbook, XSSFSheet sheet) {
        try {
            log.info("Iniciando agregación de validaciones Excel");

            int firstRow = 3;
            int lastRow = 999;

            String[] categorias = Arrays.stream(CategoriaEvento.values()).map(Enum::name).toArray(String[]::new);
            String[] actores = Arrays.stream(Actor.values()).map(Enum::name).toArray(String[]::new);
            String[] nivelConfZa = Arrays.stream(NivelConfianza.values()).map(Enum::name).toArray(String[]::new);
            String[] nivelVisi = Arrays.stream(NivelVisibilidad.values()).map(Enum::name).toArray(String[]::new);

            crearValidacionLista(workbook, sheet, 5, firstRow, lastRow, categorias);
            crearValidacionLista(workbook, sheet, 6, firstRow, lastRow, actores);
            crearValidacionLista(workbook, sheet, 10, firstRow, lastRow, nivelConfZa);
            crearValidacionLista(workbook, sheet, 11, firstRow, lastRow, nivelVisi);

            log.info("Validaciones agregadas correctamente");

        } catch (Exception e) {
            log.error("Error en agregarValidacionDatos: " + e.getMessage(), e);
        }
    }

    private void crearValidacionLista(XSSFWorkbook workbook, XSSFSheet sheet, int colIndex,
                                     int firstRow, int lastRow, String[] valores) {
        try {
            CellRangeAddressList rangeList = new CellRangeAddressList(firstRow, lastRow, colIndex, colIndex);

            // Usar el DataValidationHelper del sheet
            DataValidationHelper helper = sheet.getDataValidationHelper();
            DataValidationConstraint constraint = helper.createExplicitListConstraint(valores);
            DataValidation validation = helper.createValidation(constraint, rangeList);

            sheet.addValidationData(validation);
            log.debug("Agregada validacion: col=" + colIndex + ", valores=" + valores.length);
        } catch (Exception e) {
            log.error("Error en validacion col " + colIndex + ": " + e.getMessage());
        }
    }
}
