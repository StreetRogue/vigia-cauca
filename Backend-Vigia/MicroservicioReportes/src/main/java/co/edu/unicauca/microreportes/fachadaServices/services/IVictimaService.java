package co.edu.unicauca.microreportes.fachadaServices.services;

import co.edu.unicauca.microreportes.fachadaServices.DTO.peticion.FiltroEstadisticaDTO;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.EstadisticasVictimasDTO;

public interface IVictimaService {

    /**
     * Devuelve estadísticas descriptivas completas de víctimas:
     * total, distribución por tipo, género, rango de edad y grupo poblacional.
     *
     * @param filtro filtros opcionales (anio, mes, municipio, categoria, tipoVictima, genero, grupoPoblacional)
     * @param rol    rol del usuario para determinar nivel de visibilidad (ADMIN/OPERADOR/VISITANTE)
     */
    EstadisticasVictimasDTO obtenerEstadisticas(FiltroEstadisticaDTO filtro, String rol);
}
