package co.edu.unicauca.microreportes.fachadaServices.services.impl;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.Actor;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.CategoriaEvento;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.NivelVisibilidad;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.EstadisticaAgregadaRepository;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.NovedadSnapshotRepository;
import co.edu.unicauca.microreportes.fachadaServices.DTO.peticion.FiltroEstadisticaDTO;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.*;
import co.edu.unicauca.microreportes.fachadaServices.mapper.VisibilidadHelper;
import co.edu.unicauca.microreportes.fachadaServices.services.IEstadisticaService;
import co.edu.unicauca.microreportes.fachadaServices.services.IVictimaService;
import co.edu.unicauca.microreportes.fachadaServices.util.FrecuenciaUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EstadisticaServiceImpl implements IEstadisticaService {

    private final EstadisticaAgregadaRepository agregadaRepository;
    private final NovedadSnapshotRepository snapshotRepository;
    private final VisibilidadHelper visibilidadHelper;
    private final IVictimaService victimaService;

    private static final String[] MESES = {
            "", "Ene", "Feb", "Mar", "Abr", "May", "Jun",
            "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    };

    // ==========================================
    // ENDPOINTS PÚBLICOS
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "kpis",
            key = "#filtro.anio + '_' + #filtro.mes + '_' + #filtro.municipio + '_' + #filtro.categoria + '_' + #rol")
    public ResumenKPIDTO obtenerResumenKPI(FiltroEstadisticaDTO filtro, String rol) {
        List<NivelVisibilidad> visibilidades = visibilidadHelper.visibilidadesPorRol(rol);

        List<Object[]> resultado = agregadaRepository.obtenerKPIs(
                filtro.getAnio(), filtro.getMes(),
                filtro.getMunicipio(), filtro.getCategoria(),
                visibilidades
        );

        if (resultado.isEmpty() || resultado.get(0) == null) {
            return ResumenKPIDTO.builder()
                    .anio(filtro.getAnio()).municipio(filtro.getMunicipio())
                    .totalEventos(0L).totalMuertos(0L).totalHeridos(0L)
                    .totalDesplazados(0L).totalConfinados(0L)
                    .filtrosAplicados(filtro.comoMapa())
                    .build();
        }

        Object[] row = resultado.get(0);
        return ResumenKPIDTO.builder()
                .anio(filtro.getAnio()).municipio(filtro.getMunicipio())
                .totalEventos(toLong(row[0])).totalMuertos(toLong(row[1]))
                .totalHeridos(toLong(row[2])).totalDesplazados(toLong(row[3]))
                .totalConfinados(toLong(row[4]))
                .filtrosAplicados(filtro.comoMapa())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "serieTemporal",
            key = "#filtro.anio + '_' + #filtro.mes + '_' + #filtro.municipio + '_' + #filtro.categoria + '_' + #filtro.actor + '_' + #rol")
    public List<SerieTemporalDTO> obtenerSerieTemporal(FiltroEstadisticaDTO filtro, String rol) {
        List<NivelVisibilidad> visibilidades = visibilidadHelper.visibilidadesPorRol(rol);

        List<Object[]> datos = snapshotRepository.serieTemporal(
                filtro.getAnio(), filtro.getMes(), filtro.getCategoria(),
                filtro.getMunicipio(), filtro.getActor(), visibilidades
        );

        List<SerieTemporalDTO> serie = datos.stream()
                .map(row -> SerieTemporalDTO.builder()
                        .anio(toInt(row[0])).mes(toInt(row[1]))
                        .nombreMes(nombreMes(toInt(row[1])))
                        .totalEventos(toLong(row[2])).totalMuertos(toLong(row[3]))
                        .totalHeridos(toLong(row[4])).totalDesplazados(toLong(row[5]))
                        .build())
                .collect(Collectors.toCollection(ArrayList::new));

        FrecuenciaUtils.calcular(serie,
                SerieTemporalDTO::getTotalEventos,
                SerieTemporalDTO::setFrecuenciaRelativa,
                SerieTemporalDTO::setFrecuenciaAcumulada);
        return serie;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EstadisticaActorDTO> obtenerEstadisticasPorActor(FiltroEstadisticaDTO filtro, String rol) {
        List<NivelVisibilidad> visibilidades = visibilidadHelper.visibilidadesPorRol(rol);

        List<Object[]> datos = snapshotRepository.contarPorActor(
                filtro.getAnio(), filtro.getMes(),
                filtro.getMunicipio(), filtro.getCategoria(), visibilidades
        );

        List<EstadisticaActorDTO> lista = datos.stream()
                .map(row -> EstadisticaActorDTO.builder()
                        .actor((Actor) row[0])
                        .totalEventos(toLong(row[1]))
                        .build())
                .collect(Collectors.toCollection(ArrayList::new));

        FrecuenciaUtils.calcular(lista,
                EstadisticaActorDTO::getTotalEventos,
                EstadisticaActorDTO::setFrecuenciaRelativa,
                EstadisticaActorDTO::setFrecuenciaAcumulada);
        return lista;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "mapaCalor",
            key = "#filtro.anio + '_' + #filtro.mes + '_' + #filtro.categoria + '_' + #rol")
    public List<EstadisticaMunicipioDTO> obtenerMapaCalor(FiltroEstadisticaDTO filtro, String rol) {
        List<NivelVisibilidad> visibilidades = visibilidadHelper.visibilidadesPorRol(rol);

        List<Object[]> datos = snapshotRepository.mapaCalorMunicipios(
                filtro.getAnio(), filtro.getMes(), filtro.getCategoria(), visibilidades
        );

        List<EstadisticaMunicipioDTO> lista = datos.stream()
                .map(row -> EstadisticaMunicipioDTO.builder()
                        .municipio((String) row[0]).totalEventos(toLong(row[1]))
                        .totalMuertos(toLong(row[2])).totalHeridos(toLong(row[3]))
                        .totalDesplazados(toLong(row[4]))
                        .build())
                .collect(Collectors.toCollection(ArrayList::new));

        FrecuenciaUtils.calcular(lista,
                EstadisticaMunicipioDTO::getTotalEventos,
                EstadisticaMunicipioDTO::setFrecuenciaRelativa,
                EstadisticaMunicipioDTO::setFrecuenciaAcumulada);
        return lista;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EstadisticaCategoriaDTO> obtenerDesgloseCategorias(FiltroEstadisticaDTO filtro, String rol) {
        List<NivelVisibilidad> visibilidades = visibilidadHelper.visibilidadesPorRol(rol);

        List<Object[]> datos = agregadaRepository.desglosePorCategoria(
                filtro.getAnio(), filtro.getMes(), filtro.getMunicipio(), visibilidades
        );

        List<EstadisticaCategoriaDTO> lista = datos.stream()
                .map(row -> EstadisticaCategoriaDTO.builder()
                        .categoria((CategoriaEvento) row[0])
                        .totalEventos(toLong(row[1])).totalMuertos(toLong(row[2]))
                        .totalHeridos(toLong(row[3]))
                        .build())
                .collect(Collectors.toCollection(ArrayList::new));

        FrecuenciaUtils.calcular(lista,
                EstadisticaCategoriaDTO::getTotalEventos,
                EstadisticaCategoriaDTO::setFrecuenciaRelativa,
                EstadisticaCategoriaDTO::setFrecuenciaAcumulada);
        return lista;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "dashboard",
            key = "#filtro.anio + '_' + #filtro.mes + '_' + #filtro.municipio + '_' + #filtro.categoria + '_' + #filtro.actor + '_' + #rol")
    public DashboardCompletoDTO obtenerDashboardCompleto(FiltroEstadisticaDTO filtro, String rol) {
        return DashboardCompletoDTO.builder()
                .filtrosAplicados(filtro.comoMapa())
                .resumen(obtenerResumenKPI(filtro, rol))
                .historicoMensual(obtenerSerieTemporal(filtro, rol))
                .incidentesPorActor(obtenerEstadisticasPorActor(filtro, rol))
                .mapaCalor(obtenerMapaCalor(filtro, rol))
                .desgloseCategorias(obtenerDesgloseCategorias(filtro, rol))
                .estadisticasVictimas(victimaService.obtenerEstadisticas(filtro, rol))
                .build();
    }

    // ==========================================
    // HELPERS PRIVADOS
    // ==========================================

    private String nombreMes(int mes) {
        return (mes >= 1 && mes <= 12) ? MESES[mes] : "?";
    }

    private long toLong(Object obj) {
        if (obj == null) return 0L;
        if (obj instanceof Long l) return l;
        if (obj instanceof Number n) return n.longValue();
        return 0L;
    }

    private int toInt(Object obj) {
        if (obj == null) return 0;
        if (obj instanceof Integer i) return i;
        if (obj instanceof Number n) return n.intValue();
        return 0;
    }
}
