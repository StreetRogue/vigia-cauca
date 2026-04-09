package co.edu.unicauca.micronovedades.fachadaServices.mapper;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.*;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion.AfectacionHumanaDTOPeticion;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion.NovedadDTOPeticion;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion.VictimaDTOPeticion;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta.*;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper manual para NovedadEntity y sus subentidades.
 * Se prefiere sobre ModelMapper en este caso por la complejidad
 * de las relaciones bidireccionales (evita ciclos infinitos y
 * da control explícito sobre qué se expone en cada DTO).
 */
@Component
public class NovedadMapper {

    // ==========================================
    // NOVEDAD
    // ==========================================

    public NovedadEntity toEntity(NovedadDTOPeticion dto) {
        NovedadEntity entity = NovedadEntity.builder()
                .usuarioId(dto.getUsuarioId())
                .fechaHecho(dto.getFechaHecho())
                .horaInicio(dto.getHoraInicio())
                .horaFin(dto.getHoraFin())
                .municipio(dto.getMunicipio())
                .localidadEspecifica(dto.getLocalidadEspecifica())
                .categoria(dto.getCategoria())
                .actor1(dto.getActor1())
                .actor2(dto.getActor2())
                .infraestructuraAfectada(dto.getInfraestructuraAfectada())
                .accionInstitucional(dto.getAccionInstitucional())
                .descripcionHecho(dto.getDescripcionHecho())
                .nivelConfianza(dto.getNivelConfianza())
                .nivelVisibilidad(dto.getNivelVisibilidad())
                .build();

        // Mapear víctimas si vienen en la petición
        if (dto.getVictimas() != null) {
            dto.getVictimas().forEach(v -> {
                VictimaEntity victima = toVictimaEntity(v);
                entity.agregarVictima(victima);
            });
        }

        // Mapear afectación humana si viene
        if (dto.getAfectacionHumana() != null) {
            AfectacionHumanaEntity afectacion = toAfectacionEntity(dto.getAfectacionHumana());
            afectacion.setNovedad(entity);
            entity.setAfectacionHumana(afectacion);
        }

        // Mapear evidencias si vienen
        if (dto.getUrlsEvidencias() != null) {
            dto.getUrlsEvidencias().forEach(url -> {
                EvidenciaEntity evidencia = EvidenciaEntity.builder()
                        .urlArchivo(url)
                        .build();
                entity.agregarEvidencia(evidencia);
            });
        }

        return entity;
    }

    public NovedadDTORespuesta toDTO(NovedadEntity entity) {
        return NovedadDTORespuesta.builder()
                .novedadId(entity.getNovedadId())
                .usuarioId(entity.getUsuarioId())
                .fechaHecho(entity.getFechaHecho())
                .horaInicio(entity.getHoraInicio())
                .horaFin(entity.getHoraFin())
                .fechaReporte(entity.getFechaReporte())
                .fechaActualizacion(entity.getFechaActualizacion())
                .municipio(entity.getMunicipio())
                .localidadEspecifica(entity.getLocalidadEspecifica())
                .categoria(entity.getCategoria())
                .actor1(entity.getActor1())
                .actor2(entity.getActor2())
                .infraestructuraAfectada(entity.getInfraestructuraAfectada())
                .accionInstitucional(entity.getAccionInstitucional())
                .descripcionHecho(entity.getDescripcionHecho())
                .nivelConfianza(entity.getNivelConfianza())
                .nivelVisibilidad(entity.getNivelVisibilidad())
                .usuarioActualizacion(entity.getUsuarioActualizacion())
                .victimas(toVictimaDTOList(entity.getVictimas()))
                .afectacionHumana(entity.getAfectacionHumana() != null
                        ? toAfectacionDTO(entity.getAfectacionHumana()) : null)
                .evidencias(toEvidenciaDTOList(entity.getEvidencias()))
                .build();
    }

    public List<NovedadDTORespuesta> toDTOList(List<NovedadEntity> entities) {
        if (entities == null) return Collections.emptyList();
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ==========================================
    // VÍCTIMA
    // ==========================================

    public VictimaEntity toVictimaEntity(VictimaDTOPeticion dto) {
        return VictimaEntity.builder()
                .nombreVictima(dto.getNombreVictima())
                .generoVictima(dto.getGeneroVictima())
                .edadVictima(dto.getEdadVictima())
                .grupoPoblacional(dto.getGrupoPoblacional())
                .ocupacionVictima(dto.getOcupacionVictima())
                .build();
    }

    public VictimaDTORespuesta toVictimaDTO(VictimaEntity entity) {
        return VictimaDTORespuesta.builder()
                .victimaId(entity.getVictimaId())
                .nombreVictima(entity.getNombreVictima())
                .generoVictima(entity.getGeneroVictima())
                .edadVictima(entity.getEdadVictima())
                .grupoPoblacional(entity.getGrupoPoblacional())
                .ocupacionVictima(entity.getOcupacionVictima())
                .build();
    }

    public List<VictimaDTORespuesta> toVictimaDTOList(List<VictimaEntity> entities) {
        if (entities == null) return Collections.emptyList();
        return entities.stream().map(this::toVictimaDTO).collect(Collectors.toList());
    }

    // ==========================================
    // AFECTACIÓN HUMANA
    // ==========================================

    public AfectacionHumanaEntity toAfectacionEntity(AfectacionHumanaDTOPeticion dto) {
        return AfectacionHumanaEntity.builder()
                .muertosTotales(dto.getMuertosTotales() != null ? dto.getMuertosTotales() : 0)
                .muertosCiviles(dto.getMuertosCiviles() != null ? dto.getMuertosCiviles() : 0)
                .muertosFuerzaPublica(dto.getMuertosFuerzaPublica() != null ? dto.getMuertosFuerzaPublica() : 0)
                .muertosIlegales(dto.getMuertosIlegales() != null ? dto.getMuertosIlegales() : 0)
                .heridosTotales(dto.getHeridosTotales() != null ? dto.getHeridosTotales() : 0)
                .heridosCiviles(dto.getHeridosCiviles() != null ? dto.getHeridosCiviles() : 0)
                .heridosFuerzaPublica(dto.getHeridosFuerzaPublica() != null ? dto.getHeridosFuerzaPublica() : 0)
                .desplazadosTotales(dto.getDesplazadosTotales() != null ? dto.getDesplazadosTotales() : 0)
                .confinadosTotales(dto.getConfinadosTotales() != null ? dto.getConfinadosTotales() : 0)
                .afectacionCivilesFlag(dto.getAfectacionCivilesFlag() != null ? dto.getAfectacionCivilesFlag() : false)
                .reclutamientoMenoresFlag(dto.getReclutamientoMenoresFlag())
                .build();
    }

    public void actualizarAfectacionEntity(AfectacionHumanaEntity entity, AfectacionHumanaDTOPeticion dto) {
        if (dto.getMuertosTotales() != null) entity.setMuertosTotales(dto.getMuertosTotales());
        if (dto.getMuertosCiviles() != null) entity.setMuertosCiviles(dto.getMuertosCiviles());
        if (dto.getMuertosFuerzaPublica() != null) entity.setMuertosFuerzaPublica(dto.getMuertosFuerzaPublica());
        if (dto.getMuertosIlegales() != null) entity.setMuertosIlegales(dto.getMuertosIlegales());
        if (dto.getHeridosTotales() != null) entity.setHeridosTotales(dto.getHeridosTotales());
        if (dto.getHeridosCiviles() != null) entity.setHeridosCiviles(dto.getHeridosCiviles());
        if (dto.getHeridosFuerzaPublica() != null) entity.setHeridosFuerzaPublica(dto.getHeridosFuerzaPublica());
        if (dto.getDesplazadosTotales() != null) entity.setDesplazadosTotales(dto.getDesplazadosTotales());
        if (dto.getConfinadosTotales() != null) entity.setConfinadosTotales(dto.getConfinadosTotales());
        if (dto.getAfectacionCivilesFlag() != null) entity.setAfectacionCivilesFlag(dto.getAfectacionCivilesFlag());
        if (dto.getReclutamientoMenoresFlag() != null) entity.setReclutamientoMenoresFlag(dto.getReclutamientoMenoresFlag());
    }

    public AfectacionHumanaDTORespuesta toAfectacionDTO(AfectacionHumanaEntity entity) {
        return AfectacionHumanaDTORespuesta.builder()
                .idAfectacion(entity.getIdAfectacion())
                .muertosTotales(entity.getMuertosTotales())
                .muertosCiviles(entity.getMuertosCiviles())
                .muertosFuerzaPublica(entity.getMuertosFuerzaPublica())
                .muertosIlegales(entity.getMuertosIlegales())
                .heridosTotales(entity.getHeridosTotales())
                .heridosCiviles(entity.getHeridosCiviles())
                .heridosFuerzaPublica(entity.getHeridosFuerzaPublica())
                .desplazadosTotales(entity.getDesplazadosTotales())
                .confinadosTotales(entity.getConfinadosTotales())
                .afectacionCivilesFlag(entity.getAfectacionCivilesFlag())
                .reclutamientoMenoresFlag(entity.getReclutamientoMenoresFlag())
                .build();
    }

    // ==========================================
    // EVIDENCIA
    // ==========================================

    public EvidenciaDTORespuesta toEvidenciaDTO(EvidenciaEntity entity) {
        return EvidenciaDTORespuesta.builder()
                .idEvidencia(entity.getIdEvidencia())
                .urlArchivo(entity.getUrlArchivo())
                .build();
    }

    public List<EvidenciaDTORespuesta> toEvidenciaDTOList(List<EvidenciaEntity> entities) {
        if (entities == null) return Collections.emptyList();
        return entities.stream().map(this::toEvidenciaDTO).collect(Collectors.toList());
    }

    // ==========================================
    // AUDITORÍA
    // ==========================================

    public AuditoriaNovedadDTORespuesta toAuditoriaDTO(AuditoriaNovedadEntity entity) {
        return AuditoriaNovedadDTORespuesta.builder()
                .auditoriaId(entity.getAuditoriaId())
                .novedadId(entity.getNovedad() != null ? entity.getNovedad().getNovedadId() : null)
                .usuarioId(entity.getUsuarioId())
                .accion(entity.getAccion())
                .datosAnteriores(entity.getDatosAnteriores())
                .datosNuevos(entity.getDatosNuevos())
                .cambios(entity.getCambios())
                .fecha(entity.getFecha())
                .build();
    }

    public List<AuditoriaNovedadDTORespuesta> toAuditoriaDTOList(List<AuditoriaNovedadEntity> entities) {
        if (entities == null) return Collections.emptyList();
        return entities.stream().map(this::toAuditoriaDTO).collect(Collectors.toList());
    }
}
