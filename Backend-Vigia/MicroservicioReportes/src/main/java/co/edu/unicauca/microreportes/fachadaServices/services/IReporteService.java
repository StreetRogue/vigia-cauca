package co.edu.unicauca.microreportes.fachadaServices.services;

import co.edu.unicauca.microreportes.fachadaServices.DTO.peticion.FiltroEstadisticaDTO;
import co.edu.unicauca.microreportes.fachadaServices.DTO.peticion.FiltroReporteDTO;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.NovedadReporteDTO;

import java.util.List;

public interface IReporteService {

    byte[] generarReporteExcel(FiltroReporteDTO filtro, String rol);

    List<NovedadReporteDTO> previsualizarReporte(FiltroReporteDTO filtro, String rol);

    /**
     * Genera un reporte PDF gráfico con los mismos datos que muestra el dashboard.
     * Incluye KPIs, gráficos de barras/torta y tablas de detalle.
     *
     * @param filtro Filtros del dashboard (año, mes, municipio, categoría, actor…)
     * @param rol    Rol del usuario (determina visibilidad PUBLICA/PRIVADA)
     * @return       Bytes del PDF listo para descarga
     */
    byte[] generarReportePDF(FiltroEstadisticaDTO filtro, String rol);
}
