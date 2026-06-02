package co.edu.unicauca.microreportes.fachadaServices.util;

import co.edu.unicauca.microreportes.fachadaServices.DTO.peticion.FiltroEstadisticaDTO;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.*;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.*;
import org.jfree.chart.JFreeChart;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Construye el PDF de reporte gráfico de Vigía Cauca usando OpenPDF.
 */
public final class PdfReporteBuilder {

    // ── Colores Vigía Cauca (java.awt.Color) ─────────────────────────────────
    private static final Color C_PRIMARIO    = new Color(0x12, 0x2D, 0x5D);
    private static final Color C_ACENTO      = new Color(0x3B, 0x82, 0xF6);
    private static final Color C_ROJO        = new Color(0xEF, 0x44, 0x44);
    private static final Color C_NARANJA     = new Color(0xF5, 0x9E, 0x0B);
    private static final Color C_VERDE       = new Color(0x10, 0xB9, 0x81);
    private static final Color C_MORADO      = new Color(0x8B, 0x5C, 0xF6);
    private static final Color C_GRIS_BORDE  = new Color(0xE5, 0xE7, 0xEB);
    private static final Color C_TEXTO_CLARO = new Color(0x6B, 0x72, 0x80);
    private static final Color C_HDR_BG      = new Color(0x09, 0x1E, 0x42);
    private static final Color C_SUB         = new Color(0xBF, 0xDB, 0xFF);
    private static final Color C_META        = new Color(0x93, 0xC5, 0xFD);
    private static final Color C_KPI_LBL     = new Color(0xBD, 0xD5, 0xF5);
    private static final Color C_CELDA_TXT   = new Color(0x1F, 0x29, 0x37);
    private static final Color C_PIE         = new Color(0x9C, 0xA3, 0xAF);

    private static final Color[] COLORES_KPI = {
            C_PRIMARIO, C_ROJO, C_NARANJA, C_VERDE, C_MORADO
    };

    // ── Tipografía ────────────────────────────────────────────────────────────
    private static final Font F_TITULO    = new Font(Font.HELVETICA, 20, Font.BOLD,   Color.WHITE);
    private static final Font F_SUBTITULO = new Font(Font.HELVETICA, 10, Font.NORMAL, C_SUB);
    private static final Font F_META      = new Font(Font.HELVETICA,  9, Font.NORMAL, C_META);
    private static final Font F_SECCION   = new Font(Font.HELVETICA, 12, Font.BOLD,   C_PRIMARIO);
    private static final Font F_KPI_VAL   = new Font(Font.HELVETICA, 22, Font.BOLD,   Color.WHITE);
    private static final Font F_KPI_LBL   = new Font(Font.HELVETICA,  8, Font.NORMAL, C_KPI_LBL);
    private static final Font F_TBL_HDR   = new Font(Font.HELVETICA,  9, Font.BOLD,   Color.WHITE);
    private static final Font F_TBL_CEL   = new Font(Font.HELVETICA,  8, Font.NORMAL, C_CELDA_TXT);
    private static final Font F_PIE_PG    = new Font(Font.HELVETICA,  7, Font.NORMAL, C_PIE);

    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private PdfReporteBuilder() {}

    // ─────────────────────────────────────────────────────────────────────────
    // PUNTO DE ENTRADA
    // ─────────────────────────────────────────────────────────────────────────

    public static byte[] construir(
            DashboardCompletoDTO dashboard,
            List<NovedadReporteDTO> detalles,
            FiltroEstadisticaDTO filtro
    ) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            Document doc = new Document(PageSize.A4, 36, 36, 36, 60);
            PdfWriter writer = PdfWriter.getInstance(doc, baos);
            writer.setPageEvent(new PiePaginaEvent());
            doc.open();

            // 1. Encabezado
            doc.add(encabezado(filtro));
            doc.add(Chunk.NEWLINE);

            // 2. KPIs
            if (dashboard.getResumen() != null) {
                doc.add(seccion("INDICADORES PRINCIPALES"));
                doc.add(Chunk.NEWLINE);
                doc.add(kpis(dashboard.getResumen()));
                doc.add(Chunk.NEWLINE);
            }

            // 3. Histórico mensual
            if (noVacio(dashboard.getHistoricoMensual())) {
                doc.add(seccion("HISTÓRICO MENSUAL DE EVENTOS"));
                doc.add(Chunk.NEWLINE);
                doc.add(img(VigiaChartFactory.crearBarraHistorico(dashboard.getHistoricoMensual()), 500, 200));
                doc.add(Chunk.NEWLINE);
            }

            // 4. Actores + Categorías
            boolean hayActores = noVacio(dashboard.getIncidentesPorActor());
            boolean hayCat     = noVacio(dashboard.getDesgloseCategorias());
            if (hayActores || hayCat) {
                doc.add(seccion("DISTRIBUCIÓN POR ACTOR Y CATEGORÍA"));
                doc.add(Chunk.NEWLINE);
                PdfPTable dosCol = new PdfPTable(hayActores && hayCat ? 2 : 1);
                dosCol.setWidthPercentage(100);
                if (hayActores)
                    dosCol.addCell(celdaImg(img(VigiaChartFactory.crearTortaActores(dashboard.getIncidentesPorActor()), 240, 200)));
                if (hayCat)
                    dosCol.addCell(celdaImg(img(VigiaChartFactory.crearTortaCategorias(dashboard.getDesgloseCategorias()), 240, 200)));
                doc.add(dosCol);
                doc.add(Chunk.NEWLINE);
                if (hayActores) { doc.add(tablaActores(dashboard.getIncidentesPorActor())); doc.add(Chunk.NEWLINE); }
                if (hayCat)     { doc.add(tablaCategoria(dashboard.getDesgloseCategorias())); doc.add(Chunk.NEWLINE); }
            }

            // 5. Municipios
            boolean municipioFiltrado = filtro != null && filtro.getMunicipio() != null && !filtro.getMunicipio().equalsIgnoreCase("Todos") && !filtro.getMunicipio().isBlank();
            if (!municipioFiltrado && noVacio(dashboard.getMapaCalor())) {
                doc.add(seccion("INTENSIDAD POR MUNICIPIO"));
                doc.add(Chunk.NEWLINE);
                doc.add(img(VigiaChartFactory.crearBarraMunicipios(dashboard.getMapaCalor()), 500, 220));
                doc.add(Chunk.NEWLINE);
                doc.add(tablaMunicipios(dashboard.getMapaCalor()));
                doc.add(Chunk.NEWLINE);
            }

            // 6. Víctimas
            if (dashboard.getEstadisticasVictimas() != null) {
                doc.add(seccion("ESTADÍSTICAS DE VÍCTIMAS"));
                doc.add(Chunk.NEWLINE);
                doc.add(tablaVictimas(dashboard.getEstadisticasVictimas()));
                doc.add(Chunk.NEWLINE);
            }

            // 7. Detalle de eventos
            if (detalles != null && !detalles.isEmpty()) {
                doc.newPage();
                doc.add(seccion("DETALLE DE EVENTOS (" + Math.min(detalles.size(), 50) + " registros)"));
                doc.add(Chunk.NEWLINE);
                doc.add(tablaDetalle(detalles));
            }

            doc.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error al construir el PDF de reporte", e);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ENCABEZADO
    // ─────────────────────────────────────────────────────────────────────────

    private static PdfPTable encabezado(FiltroEstadisticaDTO f) throws DocumentException {
        PdfPTable t = new PdfPTable(1);
        t.setWidthPercentage(100);

        PdfPCell c = new PdfPCell();
        c.setBackgroundColor(C_HDR_BG);
        c.setBorder(Rectangle.NO_BORDER);
        c.setPadding(20);

        Paragraph titulo = new Paragraph("VIGÍA CAUCA  —  Gobernación del Cauca", F_TITULO);
        titulo.setAlignment(Element.ALIGN_LEFT);
        c.addElement(titulo);

        Paragraph sub = new Paragraph(subtitulo(f), F_SUBTITULO);
        sub.setSpacingBefore(4);
        c.addElement(sub);

        c.addElement(new Paragraph(" ", new Font(Font.HELVETICA, 3)));
        c.addElement(new Paragraph("Fecha de expedición: " + LocalDateTime.now().format(DT_FMT), F_META));
        c.addElement(new Paragraph("Clasificación: DOCUMENTO INTERNO", F_META));

        String filtrosTxt = filtrosTxt(f);
        if (!filtrosTxt.isBlank())
            c.addElement(new Paragraph("Filtros aplicados: " + filtrosTxt, F_META));
        else
            c.addElement(new Paragraph("Cobertura: Todos los municipios — Período histórico completo", F_META));

        t.addCell(c);
        return t;
    }

    private static String subtitulo(FiltroEstadisticaDTO f) {
        if (f == null) return "Informe de Situación de Seguridad — Datos Consolidados";
        StringBuilder sb = new StringBuilder("Informe de Situación de Seguridad");
        if (f.getMunicipio() != null) sb.append(" — ").append(f.getMunicipio());
        if (f.getAnio()      != null) sb.append(" — Año ").append(f.getAnio());
        if (f.getMes()       != null) sb.append(", Mes ").append(f.getMes());
        return sb.toString();
    }

    private static String filtrosTxt(FiltroEstadisticaDTO f) {
        if (f == null) return "";
        List<String> p = new ArrayList<>();
        if (f.getAnio()           != null) p.add("Año: "        + f.getAnio());
        if (f.getMes()            != null) p.add("Mes: "        + f.getMes());
        if (f.getMunicipio()      != null) p.add("Municipio: "  + f.getMunicipio());
        if (f.getCategoria()      != null) p.add("Categoría: "  + f.getCategoria().name());
        if (f.getActor()          != null) p.add("Actor: "      + f.getActor().name());
        if (f.getNivelConfianza() != null) p.add("Confianza: "  + f.getNivelConfianza().name());
        return String.join(" | ", p);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // KPIs
    // ─────────────────────────────────────────────────────────────────────────

    private static PdfPTable kpis(ResumenKPIDTO k) throws DocumentException {
        String[] labels = {"TOTAL EVENTOS", "MUERTOS", "HERIDOS", "DESPLAZADOS", "CONFINADOS"};
        long[] vals = {
                k.getTotalEventos()    != null ? k.getTotalEventos()    : 0L,
                k.getTotalMuertos()    != null ? k.getTotalMuertos()    : 0L,
                k.getTotalHeridos()    != null ? k.getTotalHeridos()    : 0L,
                k.getTotalDesplazados()!= null ? k.getTotalDesplazados(): 0L,
                k.getTotalConfinados() != null ? k.getTotalConfinados() : 0L
        };
        PdfPTable t = new PdfPTable(5);
        t.setWidthPercentage(100);
        for (int i = 0; i < labels.length; i++) {
            PdfPCell c = new PdfPCell();
            c.setBackgroundColor(COLORES_KPI[i]);
            c.setBorder(Rectangle.NO_BORDER);
            c.setPaddingTop(14); c.setPaddingBottom(14);
            c.setPaddingLeft(6); c.setPaddingRight(6);
            c.setHorizontalAlignment(Element.ALIGN_CENTER);
            Paragraph v = new Paragraph(String.valueOf(vals[i]), F_KPI_VAL);
            v.setAlignment(Element.ALIGN_CENTER);
            c.addElement(v);
            Paragraph l = new Paragraph(labels[i], F_KPI_LBL);
            l.setAlignment(Element.ALIGN_CENTER);
            c.addElement(l);
            t.addCell(c);
        }
        return t;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TABLAS
    // ─────────────────────────────────────────────────────────────────────────

    private static PdfPTable tablaActores(List<EstadisticaActorDTO> datos) throws DocumentException {
        PdfPTable t = tablaBase(new String[]{"ACTOR ARMADO", "EVENTOS", "FREC. %", "ACUMULADA"});
        for (EstadisticaActorDTO a : datos) {
            t.addCell(celda(a.getActor() != null ? a.getActor().name().replace("_", " ") : "DESCONOCIDO"));
            t.addCell(celda(String.valueOf(a.getTotalEventos())));
            t.addCell(celda(pct(a.getFrecuenciaRelativa())));
            t.addCell(celda(String.valueOf(a.getFrecuenciaAcumulada() != null ? a.getFrecuenciaAcumulada() : 0L)));
        }
        return t;
    }

    private static PdfPTable tablaCategoria(List<EstadisticaCategoriaDTO> datos) throws DocumentException {
        PdfPTable t = tablaBase(new String[]{"CATEGORÍA", "EVENTOS", "MUERTOS", "HERIDOS", "FREC. %"});
        t.setWidths(new float[]{3f, 1.2f, 1.2f, 1.2f, 1.2f});
        for (EstadisticaCategoriaDTO c : datos) {
            t.addCell(celda(c.getCategoria() != null ? c.getCategoria().name().replace("_", " ") : "SIN CATEGORÍA"));
            t.addCell(celda(String.valueOf(c.getTotalEventos())));
            t.addCell(celda(String.valueOf(c.getTotalMuertos() != null ? c.getTotalMuertos() : 0L)));
            t.addCell(celda(String.valueOf(c.getTotalHeridos() != null ? c.getTotalHeridos() : 0L)));
            t.addCell(celda(pct(c.getFrecuenciaRelativa())));
        }
        return t;
    }

    private static PdfPTable tablaMunicipios(List<EstadisticaMunicipioDTO> datos) throws DocumentException {
        PdfPTable t = tablaBase(new String[]{"MUNICIPIO", "EVENTOS", "MUERTOS", "HERIDOS", "DESPLAZADOS", "FREC. %"});
        datos.stream()
                .sorted((a, b) -> Long.compare(b.getTotalEventos(), a.getTotalEventos()))
                .limit(15)
                .forEach(m -> {
                    try {
                        t.addCell(celda(m.getMunicipio()));
                        t.addCell(celda(String.valueOf(m.getTotalEventos())));
                        t.addCell(celda(String.valueOf(m.getTotalMuertos())));
                        t.addCell(celda(String.valueOf(m.getTotalHeridos())));
                        t.addCell(celda(String.valueOf(m.getTotalDesplazados())));
                        t.addCell(celda(pct(m.getFrecuenciaRelativa())));
                    } catch (Exception ignored) {}
                });
        return t;
    }

    private static PdfPTable tablaVictimas(EstadisticasVictimasDTO v) throws DocumentException {
        PdfPTable t = new PdfPTable(2);
        t.setWidthPercentage(100);

        if (v.getPorGenero() != null && !v.getPorGenero().isEmpty()) {
            PdfPTable sub = tablaBase(new String[]{"GÉNERO", "VÍCTIMAS", "FREC. %"});
            for (DistribucionGeneroDTO g : v.getPorGenero()) {
                sub.addCell(celda(g.getGenero() != null ? g.getGenero().name() : "SIN DATO"));
                sub.addCell(celda(String.valueOf(g.getFrecuenciaAbsoluta() != null ? g.getFrecuenciaAbsoluta() : 0L)));
                sub.addCell(celda(pct(g.getFrecuenciaRelativa())));
            }
            t.addCell(celdaAnidada(sub, "DISTRIBUCIÓN POR GÉNERO"));
        }

        if (v.getPorGrupoPoblacional() != null && !v.getPorGrupoPoblacional().isEmpty()) {
            PdfPTable sub = tablaBase(new String[]{"GRUPO", "VÍCTIMAS", "FREC. %"});
            for (DistribucionGrupoPoblacionalDTO g : v.getPorGrupoPoblacional()) {
                sub.addCell(celda(g.getGrupoPoblacional() != null ? g.getGrupoPoblacional().name().replace("_", " ") : "SIN DATO"));
                sub.addCell(celda(String.valueOf(g.getFrecuenciaAbsoluta() != null ? g.getFrecuenciaAbsoluta() : 0L)));
                sub.addCell(celda(pct(g.getFrecuenciaRelativa())));
            }
            t.addCell(celdaAnidada(sub, "DISTRIBUCIÓN POR GRUPO POBLACIONAL"));
        }

        return t;
    }

    private static PdfPTable tablaDetalle(List<NovedadReporteDTO> detalles) throws DocumentException {
        PdfPTable t = tablaBase(new String[]{"FECHA", "MUNICIPIO", "CATEGORÍA", "ACTORES", "MUERTOS", "HERIDOS"});
        t.setWidths(new float[]{1.5f, 2f, 2f, 2f, 1f, 1f});
        int max = Math.min(detalles.size(), 50);
        for (int i = 0; i < max; i++) {
            NovedadReporteDTO r = detalles.get(i);
            t.addCell(celda(r.getFechaHecho()  != null ? r.getFechaHecho().toString() : ""));
            t.addCell(celda(r.getMunicipio()   != null ? r.getMunicipio() : ""));
            t.addCell(celda(r.getCategoria()   != null ? r.getCategoria().name().replace("_", " ") : ""));
            t.addCell(celda(r.getActoresDisplay() != null ? r.getActoresDisplay() : ""));
            t.addCell(celda(String.valueOf(r.getMuertosTotales() != null ? r.getMuertosTotales() : 0)));
            t.addCell(celda(String.valueOf(r.getHeridosTotales() != null ? r.getHeridosTotales() : 0)));
        }
        if (detalles.size() > 50) {
            PdfPCell nota = new PdfPCell(new Phrase(
                    "... y " + (detalles.size() - 50) + " registros más. Use el Excel para el conjunto completo.",
                    new Font(Font.HELVETICA, 8, Font.ITALIC, C_TEXTO_CLARO)
            ));
            nota.setColspan(6);
            nota.setBorder(Rectangle.NO_BORDER);
            nota.setPaddingTop(6);
            t.addCell(nota);
        }
        return t;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private static Paragraph seccion(String texto) {
        Paragraph p = new Paragraph(texto, F_SECCION);
        p.setSpacingBefore(6);
        p.setSpacingAfter(4);
        return p;
    }

    private static PdfPTable tablaBase(String[] headers) throws DocumentException {
        PdfPTable t = new PdfPTable(headers.length);
        t.setWidthPercentage(100);
        t.setSpacingBefore(4);
        t.setSpacingAfter(4);
        for (String h : headers) {
            PdfPCell c = new PdfPCell(new Phrase(h, F_TBL_HDR));
            c.setBackgroundColor(C_PRIMARIO);
            c.setPadding(6);
            c.setBorder(Rectangle.NO_BORDER);
            c.setHorizontalAlignment(Element.ALIGN_CENTER);
            t.addCell(c);
        }
        return t;
    }

    private static PdfPCell celda(String texto) {
        PdfPCell c = new PdfPCell(new Phrase(texto != null ? texto : "", F_TBL_CEL));
        c.setPadding(5);
        c.setBorderColor(C_GRIS_BORDE);
        c.setBorderWidth(0.5f);
        return c;
    }

    private static PdfPCell celdaAnidada(PdfPTable sub, String titulo) {
        PdfPCell c = new PdfPCell();
        c.setBorder(Rectangle.NO_BORDER);
        c.setPadding(4);
        Paragraph p = new Paragraph(titulo, new Font(Font.HELVETICA, 9, Font.BOLD, C_TEXTO_CLARO));
        p.setSpacingAfter(4);
        c.addElement(p);
        c.addElement(sub);
        return c;
    }

    private static PdfPCell celdaImg(Image imagen) {
        PdfPCell c = new PdfPCell(imagen, true);
        c.setBorder(Rectangle.NO_BORDER);
        c.setPadding(4);
        return c;
    }

    private static Image img(JFreeChart chart, int w, int h) throws IOException, BadElementException {
        BufferedImage bi = chart.createBufferedImage(w, h);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(bi, "PNG", out);
        Image imagen = Image.getInstance(out.toByteArray());
        imagen.setAlignment(Image.ALIGN_CENTER);
        return imagen;
    }

    private static String pct(Double v) {
        return String.format("%.1f%%", v != null ? v : 0.0);
    }

    private static boolean noVacio(List<?> lista) {
        return lista != null && !lista.isEmpty();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PIE DE PÁGINA
    // ─────────────────────────────────────────────────────────────────────────

    private static class PiePaginaEvent extends PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();
            Phrase pie = new Phrase(
                    "Vigía Cauca — Gobernación del Cauca  |  Documento de inteligencia — Pág. " + writer.getPageNumber(),
                    F_PIE_PG
            );
            ColumnText.showTextAligned(
                    cb, Element.ALIGN_CENTER, pie,
                    (document.left() + document.right()) / 2,
                    document.bottom() - 18,
                    0
            );
        }
    }
}
