package co.edu.unicauca.microreportes.fachadaServices.services;

import co.edu.unicauca.microreportes.fachadaServices.DTO.peticion.FiltroEstadisticaDTO;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.*;

import java.util.List;

public interface IEstadisticaService {

    ResumenKPIDTO obtenerResumenKPI(FiltroEstadisticaDTO filtro, String rol);

    List<SerieTemporalDTO> obtenerSerieTemporal(FiltroEstadisticaDTO filtro, String rol);

    List<EstadisticaActorDTO> obtenerEstadisticasPorActor(FiltroEstadisticaDTO filtro, String rol);

    List<EstadisticaMunicipioDTO> obtenerMapaCalor(FiltroEstadisticaDTO filtro, String rol);

    List<EstadisticaCategoriaDTO> obtenerDesgloseCategorias(FiltroEstadisticaDTO filtro, String rol);

    DashboardCompletoDTO obtenerDashboardCompleto(FiltroEstadisticaDTO filtro, String rol);
}
