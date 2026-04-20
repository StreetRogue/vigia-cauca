package co.edu.unicauca.microreportes.fachadaServices.services.impl;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.*;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.VictimaSnapshotRepository;
import co.edu.unicauca.microreportes.fachadaServices.DTO.peticion.FiltroEstadisticaDTO;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.*;
import co.edu.unicauca.microreportes.fachadaServices.mapper.VisibilidadHelper;
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
public class VictimaServiceImpl implements IVictimaService {

    private final VictimaSnapshotRepository victimaRepository;
    private final VisibilidadHelper visibilidadHelper;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "victimasEstadisticas",
            key = "#filtro.anio + '_' + #filtro.mes + '_' + #filtro.municipio + '_' + #filtro.categoria + '_' + #filtro.genero + '_' + #filtro.grupoPoblacional + '_' + #rol")
    public EstadisticasVictimasDTO obtenerEstadisticas(FiltroEstadisticaDTO filtro, String rol) {
        List<NivelVisibilidad> visibilidades = visibilidadHelper.visibilidadesPorRol(rol);

        // El total respeta TODOS los filtros activos
        Long total = victimaRepository.contarTotal(
                filtro.getAnio(), filtro.getMes(), filtro.getMunicipio(),
                filtro.getCategoria(), filtro.getGenero(), filtro.getGrupoPoblacional(),
                visibilidades
        );

        // Cada distribución excluye su propia dimensión del filtro
        // para mostrar el desglose completo según los demás filtros activos.
        List<DistribucionGeneroDTO>          porGenero    = construirDistribucionGenero(filtro, visibilidades);
        List<DistribucionRangoEdadDTO>       porRangoEdad = construirDistribucionRangoEdad(filtro, visibilidades);
        List<DistribucionGrupoPoblacionalDTO> porGrupo    = construirDistribucionGrupo(filtro, visibilidades);

        return EstadisticasVictimasDTO.builder()
                .filtrosAplicados(filtro.comoMapa())
                .totalVictimas(total)
                .porGenero(porGenero)
                .porRangoEdad(porRangoEdad)
                .porGrupoPoblacional(porGrupo)
                .build();
    }

    // ==========================================
    // CONSTRUCCIÓN DE DISTRIBUCIONES
    // ==========================================

    private List<DistribucionGeneroDTO> construirDistribucionGenero(
            FiltroEstadisticaDTO filtro, List<NivelVisibilidad> visibilidades) {

        // No filtra por genero → muestra el desglose de géneros.
        // Sí filtra por grupoPoblacional → si se pidió INDIGENA, muestra el género de los indígenas.
        List<Object[]> datos = victimaRepository.distribucionPorGenero(
                filtro.getAnio(), filtro.getMes(), filtro.getMunicipio(),
                filtro.getCategoria(), filtro.getGrupoPoblacional(), visibilidades
        );

        List<DistribucionGeneroDTO> lista = datos.stream()
                .map(row -> DistribucionGeneroDTO.builder()
                        .genero((Genero) row[0])
                        .frecuenciaAbsoluta(toLong(row[1]))
                        .build())
                .collect(Collectors.toCollection(ArrayList::new));

        FrecuenciaUtils.calcular(lista,
                DistribucionGeneroDTO::getFrecuenciaAbsoluta,
                DistribucionGeneroDTO::setFrecuenciaRelativa,
                DistribucionGeneroDTO::setFrecuenciaAcumulada);
        return lista;
    }

    private List<DistribucionRangoEdadDTO> construirDistribucionRangoEdad(
            FiltroEstadisticaDTO filtro, List<NivelVisibilidad> visibilidades) {

        // Filtra por genero y grupoPoblacional → desglose de edades del subconjunto filtrado.
        List<Object[]> datos = victimaRepository.distribucionPorRangoEdad(
                filtro.getAnio(), filtro.getMes(), filtro.getMunicipio(),
                filtro.getCategoria(), filtro.getGenero(), filtro.getGrupoPoblacional(),
                visibilidades
        );

        List<DistribucionRangoEdadDTO> lista = datos.stream()
                .map(row -> {
                    RangoEdad rango = (RangoEdad) row[0];
                    return DistribucionRangoEdadDTO.builder()
                            .rangoEdad(rango)
                            .etiqueta(rango.getEtiqueta())
                            .frecuenciaAbsoluta(toLong(row[1]))
                            .build();
                })
                .collect(Collectors.toCollection(ArrayList::new));

        FrecuenciaUtils.calcular(lista,
                DistribucionRangoEdadDTO::getFrecuenciaAbsoluta,
                DistribucionRangoEdadDTO::setFrecuenciaRelativa,
                DistribucionRangoEdadDTO::setFrecuenciaAcumulada);
        return lista;
    }

    private List<DistribucionGrupoPoblacionalDTO> construirDistribucionGrupo(
            FiltroEstadisticaDTO filtro, List<NivelVisibilidad> visibilidades) {

        // No filtra por grupoPoblacional → muestra el desglose de grupos.
        // Sí filtra por genero → si se pidió FEMENINO, muestra los grupos de las mujeres víctimas.
        List<Object[]> datos = victimaRepository.distribucionPorGrupoPoblacional(
                filtro.getAnio(), filtro.getMes(), filtro.getMunicipio(),
                filtro.getCategoria(), filtro.getGenero(), visibilidades
        );

        List<DistribucionGrupoPoblacionalDTO> lista = datos.stream()
                .map(row -> DistribucionGrupoPoblacionalDTO.builder()
                        .grupoPoblacional((GrupoPoblacional) row[0])
                        .frecuenciaAbsoluta(toLong(row[1]))
                        .build())
                .collect(Collectors.toCollection(ArrayList::new));

        FrecuenciaUtils.calcular(lista,
                DistribucionGrupoPoblacionalDTO::getFrecuenciaAbsoluta,
                DistribucionGrupoPoblacionalDTO::setFrecuenciaRelativa,
                DistribucionGrupoPoblacionalDTO::setFrecuenciaAcumulada);
        return lista;
    }

    // ==========================================
    // HELPERS
    // ==========================================

    private long toLong(Object obj) {
        if (obj == null) return 0L;
        if (obj instanceof Long l) return l;
        if (obj instanceof Number n) return n.longValue();
        return 0L;
    }
}
