package co.edu.unicauca.microreportes.fachadaServices.services;

import co.edu.unicauca.microreportes.fachadaServices.DTO.peticion.FiltroReporteDTO;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.NovedadReporteDTO;

import java.util.List;

public interface IReporteService {

    byte[] generarReporteExcel(FiltroReporteDTO filtro, String rol);

    List<NovedadReporteDTO> previsualizarReporte(FiltroReporteDTO filtro, String rol);
}
