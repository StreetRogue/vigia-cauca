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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EstadisticaServiceImpl implements IEstadisticaService {

    private final EstadisticaAgregadaRepository agregadaRepository;
    private final NovedadSnapshotRepository snapshotRepository;
    private static final List<NivelVisibilidad> TODAS_VISIBILIDADES =
            List.of(NivelVisibilidad.PUBLICA, NivelVisibilidad.PRIVADA);

    private static final String[] MESES = {
            "", "Ene", "Feb", "Mar", "Abr", "May", "Jun",
            "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    };

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "kpis", key = "#filtro.anio + '_' + #filtro.municipio")
    public ResumenKPIDTO obtenerResumenKPI(FiltroEstadisticaDTO filtro, String rol) {
        int anio = resolverAnio(filtro.getAnio());

        List<Object[]> resultado = agregadaRepository.obtenerKPIs(
                anio, filtro.getMunicipio(), TODAS_VISIBILIDADES);

        if (resultado.isEmpty() || resultado.get(0) == null) {
            return ResumenKPIDTO.builder()
                    .anio(anio).municipio(filtro.getMunicipio())
                    .totalEventos(0L).totalMuertos(0L).totalHeridos(0L)
                    .totalDesplazados(0L).totalConfinados(0L)
                    .build();
        }

        Object[] row = resultado.get(0);
        return ResumenKPIDTO.builder()
                .anio(anio)
                .municipio(filtro.getMunicipio())
                .totalEventos(toLong(row[0]))
                .totalMuertos(toLong(row[1]))
                .totalHeridos(toLong(row[2]))
                .totalDesplazados(toLong(row[3]))
                .totalConfinados(toLong(row[4]))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "serieTemporal",
            key = "#filtro.anio + '_' + #filtro.municipio + '_' + #filtro.categoria + '_' + #rol")
    public List<SerieTemporalDTO> obtenerSerieTemporal(FiltroEstadisticaDTO filtro, String rol) {
        int anio = resolverAnio(filtro.getAnio());

        List<Object[]> datos = snapshotRepository.serieTemporal(
                anio, filtro.getCategoria(), filtro.getMunicipio(), TODAS_VISIBILIDADES);

        return datos.stream().map(row -> SerieTemporalDTO.builder()
                .mes(toInt(row[0]))
                .nombreMes(MESES[toInt(row[0])])
                .totalEventos(toLong(row[1]))
                .totalMuertos(toLong(row[2]))
                .totalHeridos(toLong(row[3]))
                .build()
        ).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EstadisticaActorDTO> obtenerEstadisticasPorActor(FiltroEstadisticaDTO filtro, String rol) {
        int anio = resolverAnio(filtro.getAnio());

        List<Object[]> datos = snapshotRepository.contarPorActor(
                anio, filtro.getMunicipio(), TODAS_VISIBILIDADES);

        return datos.stream().map(row -> EstadisticaActorDTO.builder()
                .actor((Actor) row[0])
                .totalEventos(toLong(row[1]))
                .build()
        ).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "mapaCalor", key = "#anio + '_' + #rol")
    public List<EstadisticaMunicipioDTO> obtenerMapaCalor(Integer anio, String rol) {
        int anioResuelto = resolverAnio(anio);

        List<Object[]> datos = snapshotRepository.mapaCalorMunicipios(anioResuelto, TODAS_VISIBILIDADES);

        return datos.stream().map(row -> EstadisticaMunicipioDTO.builder()
                .municipio((String) row[0])
                .totalEventos(toLong(row[1]))
                .totalMuertos(toLong(row[2]))
                .totalHeridos(toLong(row[3]))
                .totalDesplazados(toLong(row[4]))
                .build()
        ).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EstadisticaCategoriaDTO> obtenerDesgloseCategorias(FiltroEstadisticaDTO filtro, String rol) {
        int anio = resolverAnio(filtro.getAnio());

        List<Object[]> datos = agregadaRepository.desglosePorCategoria(
                anio, filtro.getMunicipio(), TODAS_VISIBILIDADES);

        return datos.stream().map(row -> EstadisticaCategoriaDTO.builder()
                .categoria((CategoriaEvento) row[0])
                .totalEventos(toLong(row[1]))
                .totalMuertos(toLong(row[2]))
                .totalHeridos(toLong(row[3]))
                .build()
        ).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "dashboard",
            key = "#filtro.anio + '_' + #filtro.municipio + '_' + #filtro.categoria + '_' + #rol")
    public DashboardCompletoDTO obtenerDashboardCompleto(FiltroEstadisticaDTO filtro, String rol) {
        return DashboardCompletoDTO.builder()
                .resumen(obtenerResumenKPI(filtro, rol))
                .historicoMensual(obtenerSerieTemporal(filtro, rol))
                .incidentesPorActor(obtenerEstadisticasPorActor(filtro, rol))
                .mapaCalor(obtenerMapaCalor(filtro.getAnio(), rol))
                .desgloseCategorias(obtenerDesgloseCategorias(filtro, rol))
                .build();
    }

    // ==========================================
    // HELPERS
    // ==========================================

    private int resolverAnio(Integer anio) {
        return anio != null ? anio : LocalDate.now().getYear();
    }

    private long toLong(Object obj) {
        if (obj == null) return 0L;
        if (obj instanceof Long) return (Long) obj;
        if (obj instanceof Number) return ((Number) obj).longValue();
        return 0L;
    }

    private int toInt(Object obj) {
        if (obj == null) return 0;
        if (obj instanceof Integer) return (Integer) obj;
        if (obj instanceof Number) return ((Number) obj).intValue();
        return 0;
    }
}
