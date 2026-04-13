package co.edu.unicauca.microreportes.fachadaServices.mapper;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.NovedadSnapshotEntity;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.*;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.NovedadReporteDTO;
import co.edu.unicauca.microreportes.mensajeria.NovedadEventoDTO;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.UUID;

@Component
public class SnapshotMapper {

    public NovedadSnapshotEntity fromEvento(NovedadEventoDTO evento) {
        LocalDate fecha = LocalDate.parse(evento.getFechaHecho());

        return NovedadSnapshotEntity.builder()
        // Dentro de fromEvento y actualizarDesdeEvento
                .novedadId(UUID.fromString(evento.getNovedadId()))
                .usuarioId(UUID.fromString(evento.getUsuarioId()))
                .oculto(evento.getOculto() != null ? evento.getOculto() : false)
                .fechaHecho(fecha)
                .anio(fecha.getYear())
                .mes(fecha.getMonthValue())
                .municipio(evento.getMunicipio())
                .categoria(parseEnum(CategoriaEvento.class, evento.getCategoria(), CategoriaEvento.OTRO))
                .actor1(parseEnum(Actor.class, evento.getActor1(), Actor.NO_IDENTIFICADO))
                .actor2(parseEnum(Actor.class, evento.getActor2(), null))
                .nivelConfianza(parseEnum(NivelConfianza.class, evento.getNivelConfianza(), NivelConfianza.PRELIMINAR))
                .nivelVisibilidad(parseEnum(NivelVisibilidad.class, evento.getNivelVisibilidad(), NivelVisibilidad.PUBLICA))
                .muertosTotales(safeInt(evento.getMuertosTotales()))
                .muertosCiviles(safeInt(evento.getMuertosCiviles()))
                .muertosFuerzaPublica(safeInt(evento.getMuertosFuerzaPublica()))
                .heridosTotales(safeInt(evento.getHeridosTotales()))
                .heridosCiviles(safeInt(evento.getHeridosCiviles()))
                .desplazadosTotales(safeInt(evento.getDesplazadosTotales()))
                .confinadosTotales(safeInt(evento.getConfinadosTotales()))
                .descripcionHecho(evento.getDescripcionHecho())
                .localidadEspecifica(evento.getLocalidadEspecifica())
                .build();
    }

    public NovedadReporteDTO toReporteDTO(NovedadSnapshotEntity entity) {
        // Construir display legible de actores
        String actoresDisplay = entity.getActor1() != null ? entity.getActor1().name() : "";
        if (entity.getActor2() != null) actoresDisplay += ", " + entity.getActor2().name();

        return NovedadReporteDTO.builder()
                .novedadId(entity.getNovedadId())
                .fechaHecho(entity.getFechaHecho())
                .municipio(entity.getMunicipio())
                .localidadEspecifica(entity.getLocalidadEspecifica())
                .categoria(entity.getCategoria())
                .actor1(entity.getActor1())
                .actor2(entity.getActor2())
                .actoresDisplay(actoresDisplay)
                .nivelConfianza(entity.getNivelConfianza())
                .muertosTotales(entity.getMuertosTotales())
                .muertosCiviles(entity.getMuertosCiviles())
                .muertosFuerzaPublica(entity.getMuertosFuerzaPublica())
                .heridosTotales(entity.getHeridosTotales())
                .heridosCiviles(entity.getHeridosCiviles())
                .desplazadosTotales(entity.getDesplazadosTotales())
                .confinadosTotales(entity.getConfinadosTotales())
                .descripcionHecho(entity.getDescripcionHecho())
                .build();
    }

    /**
     * Actualiza un snapshot existente con datos nuevos del evento.
     */
    public void actualizarDesdeEvento(NovedadSnapshotEntity entity, NovedadEventoDTO evento) {
        LocalDate fecha = LocalDate.parse(evento.getFechaHecho());
        // Dentro de fromEvento y actualizarDesdeEvento
        entity.setOculto(evento.getOculto() != null ? evento.getOculto() : false);
        entity.setFechaHecho(fecha);
        entity.setAnio(fecha.getYear());
        entity.setMes(fecha.getMonthValue());
        entity.setMunicipio(evento.getMunicipio());
        entity.setCategoria(CategoriaEvento.valueOf(evento.getCategoria()));
        entity.setActor1(parseActor(evento.getActor1()));
        entity.setActor2(parseActor(evento.getActor2()));
        entity.setNivelConfianza(NivelConfianza.valueOf(evento.getNivelConfianza()));
        entity.setNivelVisibilidad(NivelVisibilidad.valueOf(evento.getNivelVisibilidad()));
        entity.setMuertosTotales(safeInt(evento.getMuertosTotales()));
        entity.setMuertosCiviles(safeInt(evento.getMuertosCiviles()));
        entity.setMuertosFuerzaPublica(safeInt(evento.getMuertosFuerzaPublica()));
        entity.setHeridosTotales(safeInt(evento.getHeridosTotales()));
        entity.setHeridosCiviles(safeInt(evento.getHeridosCiviles()));
        entity.setDesplazadosTotales(safeInt(evento.getDesplazadosTotales()));
        entity.setConfinadosTotales(safeInt(evento.getConfinadosTotales()));
        entity.setDescripcionHecho(evento.getDescripcionHecho());
        entity.setLocalidadEspecifica(evento.getLocalidadEspecifica());
    }

    private int safeInt(Integer val) {
        return val != null ? val : 0;
    }

    private Actor parseActor(String actor) {
        if (actor == null || actor.isBlank()) return Actor.NO_IDENTIFICADO;
        try {
            return Actor.valueOf(actor);
        } catch (IllegalArgumentException e) {
            return Actor.OTRO;
        }
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass, String value, E defaultValue) {
        if (value == null || value.isBlank()) return defaultValue;
        try {
            return Enum.valueOf(enumClass, value);
        } catch (Exception e) {
            return defaultValue;
        }
    }

}
