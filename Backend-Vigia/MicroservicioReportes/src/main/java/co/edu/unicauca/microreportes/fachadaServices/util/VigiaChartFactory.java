package co.edu.unicauca.microreportes.fachadaServices.util;

import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.EstadisticaActorDTO;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.EstadisticaCategoriaDTO;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.EstadisticaMunicipioDTO;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.SerieTemporalDTO;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.axis.CategoryAxis;
import org.jfree.chart.axis.CategoryLabelPositions;
import org.jfree.chart.plot.CategoryPlot;
import org.jfree.chart.plot.PiePlot;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.renderer.category.BarRenderer;
import org.jfree.chart.renderer.category.StandardBarPainter;
import org.jfree.data.category.DefaultCategoryDataset;
import org.jfree.data.general.DefaultPieDataset;

import java.awt.*;
import java.util.List;

/**
 * Clase utilitaria que genera objetos JFreeChart para el reporte PDF.
 * Cada método produce un gráfico con la paleta de colores de Vigía Cauca.
 */
public final class VigiaChartFactory {

    // Paleta de colores Vigía Cauca
    private static final Color COLOR_PRIMARIO   = new Color(0x12, 0x2D, 0x5D);
    private static final Color COLOR_ACENTO     = new Color(0x3B, 0x82, 0xF6);
    private static final Color COLOR_ROJO       = new Color(0xEF, 0x44, 0x44);
    private static final Color COLOR_NARANJA    = new Color(0xF5, 0x9E, 0x0B);
    private static final Color COLOR_VERDE      = new Color(0x10, 0xB9, 0x81);
    private static final Color COLOR_MORADO     = new Color(0x8B, 0x5C, 0xF6);
    private static final Color COLOR_ROSA       = new Color(0xEC, 0x48, 0x99);
    private static final Color COLOR_CYAN       = new Color(0x06, 0xB6, 0xD4);
    private static final Color FONDO_GRAFICO    = new Color(0xF8, 0xFA, 0xFF);

    private static final Color[] PALETA = {
            COLOR_ACENTO, COLOR_ROJO, COLOR_NARANJA, COLOR_VERDE,
            COLOR_MORADO, COLOR_ROSA, COLOR_CYAN, COLOR_PRIMARIO
    };

    private VigiaChartFactory() { /* utilidad, sin instancias */ }

    // ─────────────────────────────────────────────────────────────────────────
    // SERIE TEMPORAL — Barra vertical (eventos por mes)
    // ─────────────────────────────────────────────────────────────────────────

    public static JFreeChart crearBarraHistorico(List<SerieTemporalDTO> datos) {
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();

        for (SerieTemporalDTO p : datos) {
            String label = p.getNombreMes() + " " + p.getAnio();
            dataset.addValue(p.getTotalEventos(), "Eventos", label);
        }

        JFreeChart chart = ChartFactory.createBarChart(
                null, "Período", "Total Eventos",
                dataset, PlotOrientation.VERTICAL, false, false, false
        );

        estilizarBarras(chart, COLOR_ACENTO);
        return chart;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ACTORES — Torta
    // ─────────────────────────────────────────────────────────────────────────

    public static JFreeChart crearTortaActores(List<EstadisticaActorDTO> datos) {
        DefaultPieDataset<String> dataset = new DefaultPieDataset<>();
        long otros = 0;
        int max = 7;

        for (int i = 0; i < datos.size(); i++) {
            EstadisticaActorDTO a = datos.get(i);
            if (i < max) {
                String nombre = a.getActor() != null ? a.getActor().name().replace("_", " ") : "DESCONOCIDO";
                dataset.setValue(nombre, a.getTotalEventos());
            } else {
                otros += a.getTotalEventos();
            }
        }

        if (otros > 0) {
            dataset.setValue("OTROS", otros);
        }

        return crearTortaEstilizada(dataset);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CATEGORÍAS — Torta
    // ─────────────────────────────────────────────────────────────────────────

    public static JFreeChart crearTortaCategorias(List<EstadisticaCategoriaDTO> datos) {
        DefaultPieDataset<String> dataset = new DefaultPieDataset<>();
        long otros = 0;
        int max = 7;

        for (int i = 0; i < datos.size(); i++) {
            EstadisticaCategoriaDTO c = datos.get(i);
            if (i < max) {
                String nombre = c.getCategoria() != null ? c.getCategoria().name().replace("_", " ") : "SIN CATEGORÍA";
                dataset.setValue(nombre, c.getTotalEventos());
            } else {
                otros += c.getTotalEventos();
            }
        }

        if (otros > 0) {
            dataset.setValue("OTROS", otros);
        }

        return crearTortaEstilizada(dataset);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MUNICIPIOS — Barra horizontal (top 10)
    // ─────────────────────────────────────────────────────────────────────────

    public static JFreeChart crearBarraMunicipios(List<EstadisticaMunicipioDTO> datos) {
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();

        List<EstadisticaMunicipioDTO> top = datos.stream()
                .sorted((a, b) -> Long.compare(b.getTotalEventos(), a.getTotalEventos()))
                .limit(10)
                .toList();

        for (EstadisticaMunicipioDTO m : top) {
            dataset.addValue(m.getTotalEventos(), "Eventos", m.getMunicipio());
        }

        JFreeChart chart = ChartFactory.createBarChart(
                null, "Municipio", "Eventos",
                dataset, PlotOrientation.HORIZONTAL, false, false, false
        );

        estilizarBarras(chart, COLOR_PRIMARIO);
        return chart;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS PRIVADOS
    // ─────────────────────────────────────────────────────────────────────────

    private static JFreeChart crearTortaEstilizada(DefaultPieDataset<String> dataset) {
        JFreeChart chart = ChartFactory.createPieChart(
                null, dataset, true, false, false
        );

        chart.setBackgroundPaint(FONDO_GRAFICO);
        chart.setBorderVisible(false);

        PiePlot<?> plot = (PiePlot<?>) chart.getPlot();
        plot.setBackgroundPaint(FONDO_GRAFICO);
        plot.setOutlineVisible(false);
        plot.setShadowPaint(null);
        plot.setLabelGenerator(null);

        int idx = 0;
        for (int i = 0; i < dataset.getItemCount(); i++) {
            plot.setSectionPaint(dataset.getKey(i), PALETA[idx % PALETA.length]);
            idx++;
        }

        if (chart.getLegend() != null) {
            chart.getLegend().setBackgroundPaint(FONDO_GRAFICO);
            chart.getLegend().setItemFont(new Font("SansSerif", Font.PLAIN, 10));
            chart.getLegend().setFrame(org.jfree.chart.block.BlockBorder.NONE);
        }

        return chart;
    }

    private static void estilizarBarras(JFreeChart chart, Color colorBarra) {
        chart.setBackgroundPaint(FONDO_GRAFICO);
        chart.setBorderVisible(false);

        CategoryPlot plot = chart.getCategoryPlot();
        plot.setBackgroundPaint(FONDO_GRAFICO);
        plot.setOutlineVisible(false);
        plot.setRangeGridlinePaint(new Color(0xE5, 0xE7, 0xEB));
        plot.setRangeGridlineStroke(new BasicStroke(0.5f));
        plot.setDomainGridlinesVisible(false);

        BarRenderer renderer = (BarRenderer) plot.getRenderer();
        renderer.setBarPainter(new StandardBarPainter());
        renderer.setShadowVisible(false);
        renderer.setSeriesPaint(0, colorBarra);
        renderer.setMaximumBarWidth(0.06);

        CategoryAxis axis = plot.getDomainAxis();
        axis.setCategoryLabelPositions(CategoryLabelPositions.UP_45);
        axis.setTickLabelFont(new Font("SansSerif", Font.PLAIN, 9));
        axis.setAxisLineVisible(false);

        plot.getRangeAxis().setTickLabelFont(new Font("SansSerif", Font.PLAIN, 9));
        plot.getRangeAxis().setAxisLineVisible(false);
    }
}
