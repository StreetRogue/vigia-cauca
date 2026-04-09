package co.edu.unicauca.micronovedades.fachadaServices.services.impl;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.*;
import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.AccionAuditoria;
import co.edu.unicauca.micronovedades.capaAccesoDatos.repositories.AuditoriaNovedadRepository;
import co.edu.unicauca.micronovedades.capaAccesoDatos.repositories.NovedadRepository;
import co.edu.unicauca.micronovedades.capaControladores.controladorExcepciones.BadRequestException;
import co.edu.unicauca.micronovedades.capaControladores.controladorExcepciones.ResourceNotFoundException;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion.FiltroNovedadDTO;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion.NovedadDTOPeticion;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta.NovedadDTORespuesta;
import co.edu.unicauca.micronovedades.fachadaServices.mapper.NovedadMapper;
import co.edu.unicauca.micronovedades.fachadaServices.services.INovedadService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NovedadServiceImpl implements INovedadService {

    private final NovedadRepository novedadRepository;
    private final AuditoriaNovedadRepository auditoriaRepository;
    private final NovedadMapper mapper;
    private final ObjectMapper objectMapper;
    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.queue.name}")
    private String queueName;

    @Override
    @Transactional
    public NovedadDTORespuesta crearNovedad(NovedadDTOPeticion peticion) {
        validarReglasNegocio(peticion);

        NovedadEntity entity = mapper.toEntity(peticion);
        NovedadEntity guardada = novedadRepository.save(entity);

        registrarAuditoria(guardada, peticion.getUsuarioId(), AccionAuditoria.CREATE, null, guardada);
        publicarEvento("NOVEDAD_CREADA", guardada);

        log.info("Novedad creada con ID: {}", guardada.getNovedadId());
        return mapper.toDTO(guardada);
    }

    @Override
    @Transactional(readOnly = true)
    public NovedadDTORespuesta obtenerPorId(UUID novedadId) {
        NovedadEntity entity = buscarNovedadOFallar(novedadId);
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NovedadDTORespuesta> listarTodas() {
        return mapper.toDTOList(novedadRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NovedadDTORespuesta> listarTodasPaginado(Pageable pageable) {
        return novedadRepository.findAll(pageable).map(mapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NovedadDTORespuesta> listarPorUsuario(UUID usuarioId) {
        return mapper.toDTOList(novedadRepository.findByUsuarioId(usuarioId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<NovedadDTORespuesta> buscarConFiltros(FiltroNovedadDTO filtro) {
        List<NovedadEntity> resultados = novedadRepository.buscarConFiltros(
                filtro.getFechaInicio(),
                filtro.getFechaFin(),
                filtro.getMunicipio(),
                filtro.getCategoria(),
                filtro.getNivelVisibilidad()
        );
        return mapper.toDTOList(resultados);
    }

    @Override
    @Transactional
    public NovedadDTORespuesta actualizarNovedad(UUID novedadId, NovedadDTOPeticion peticion) {
        validarReglasNegocio(peticion);
        NovedadEntity existente = buscarNovedadOFallar(novedadId);

        NovedadEntity snapshotAnterior = clonarParaAuditoria(existente);

        // Actualizar campos escalares
        existente.setFechaHecho(peticion.getFechaHecho());
        existente.setHoraInicio(peticion.getHoraInicio());
        existente.setHoraFin(peticion.getHoraFin());
        existente.setMunicipio(peticion.getMunicipio());
        existente.setLocalidadEspecifica(peticion.getLocalidadEspecifica());
        existente.setCategoria(peticion.getCategoria());
        // Actores: sincronizar lista y derivar actor1/actor2
        if (peticion.getActores() != null && !peticion.getActores().isEmpty()) {
            existente.getActores().clear();
            existente.getActores().addAll(peticion.getActores());
            existente.setActor1(peticion.getActores().get(0));
            existente.setActor2(peticion.getActores().size() > 1 ? peticion.getActores().get(1) : null);
        }
        existente.setInfraestructuraAfectada(peticion.getInfraestructuraAfectada());
        existente.setAccionInstitucional(peticion.getAccionInstitucional());
        existente.setDescripcionHecho(peticion.getDescripcionHecho());
        existente.setNivelConfianza(peticion.getNivelConfianza());
        existente.setNivelVisibilidad(peticion.getNivelVisibilidad());
        existente.setUsuarioActualizacion(peticion.getUsuarioId().toString());

        // Actualizar víctimas si vienen en la petición
        if (peticion.getVictimas() != null) {
            existente.getVictimas().clear();
            peticion.getVictimas().forEach(v -> {
                VictimaEntity victima = mapper.toVictimaEntity(v);
                existente.agregarVictima(victima);
            });
        }

        // Actualizar afectación humana si viene
        if (peticion.getAfectacionHumana() != null) {
            AfectacionHumanaEntity afectacion;
            if (existente.getAfectacionHumana() != null) {
                afectacion = existente.getAfectacionHumana();
                mapper.actualizarAfectacionEntity(afectacion, peticion.getAfectacionHumana());
            } else {
                afectacion = mapper.toAfectacionEntity(peticion.getAfectacionHumana());
                afectacion.setNovedad(existente);
                existente.setAfectacionHumana(afectacion);
            }
        }

        // Actualizar evidencias si vienen
        if (peticion.getUrlsEvidencias() != null) {
            existente.getEvidencias().clear();
            peticion.getUrlsEvidencias().forEach(url -> {
                EvidenciaEntity evidencia = EvidenciaEntity.builder()
                        .urlArchivo(url)
                        .build();
                existente.agregarEvidencia(evidencia);
            });
        }

        NovedadEntity actualizada = novedadRepository.save(existente);

        registrarAuditoria(actualizada, peticion.getUsuarioId(), AccionAuditoria.UPDATE, snapshotAnterior, actualizada);
        publicarEvento("NOVEDAD_ACTUALIZADA", actualizada);

        log.info("Novedad actualizada con ID: {}", novedadId);
        return mapper.toDTO(actualizada);
    }

    @Override
    @Transactional
    public void eliminarNovedad(UUID novedadId, UUID usuarioIdSolicitante) {
        NovedadEntity existente = buscarNovedadOFallar(novedadId);

        existente.setOculto(true);
        existente.setUsuarioActualizacion(usuarioIdSolicitante.toString());
        novedadRepository.save(existente);

        // Auditoría
        registrarAuditoria(existente, usuarioIdSolicitante, AccionAuditoria.DELETE, null, null);

        // Mandamos el evento NOVEDAD_ELIMINADA (que para nosotros es oculta)
        // Agregamos el campo "oculto" al mensaje de RabbitMQ
        publicarEvento("NOVEDAD_ELIMINADA", existente);

        log.info("Novedad marcada como OCULTA con ID: {}", novedadId);
    }

    // ==========================================
    // VALIDACIONES DE NEGOCIO
    // ==========================================

    private void validarReglasNegocio(NovedadDTOPeticion peticion) {
        if (peticion.getActores() == null || peticion.getActores().isEmpty()) {
            throw new BadRequestException("Debe indicarse al menos un actor");
        }
        if (peticion.getActores().size() > 10) {
            throw new BadRequestException("Se permiten máximo 10 actores");
        }

        if (peticion.getHoraFin() != null && peticion.getHoraInicio() != null
                && peticion.getHoraFin().isBefore(peticion.getHoraInicio())) {
            throw new BadRequestException("La hora de fin no puede ser anterior a la hora de inicio");
        }

        if (peticion.getFechaHecho() != null) {
            // LocalDate.now() es HOY.
            // Si la fecha del hecho es DESPUÉS de hoy, lanzamos error.
            if (peticion.getFechaHecho().isAfter(java.time.LocalDate.now())) {
                throw new BadRequestException("La fecha del hecho no puede ser una fecha futura (máximo hoy)");
            }
        }

        if (peticion.getAfectacionHumana() != null) {
            var ah = peticion.getAfectacionHumana();
            if (ah.getMuertosTotales() != null && ah.getMuertosTotales() < 0) {
                throw new BadRequestException("El conteo de muertos totales no puede ser negativo");
            }
            if (ah.getHeridosTotales() != null && ah.getHeridosTotales() < 0) {
                throw new BadRequestException("El conteo de heridos totales no puede ser negativo");
            }
            if (ah.getDesplazadosTotales() != null && ah.getDesplazadosTotales() < 0) {
                throw new BadRequestException("El conteo de desplazados no puede ser negativo");
            }
            if (ah.getConfinadosTotales() != null && ah.getConfinadosTotales() < 0) {
                throw new BadRequestException("El conteo de confinados no puede ser negativo");
            }
        }
    }

    // ==========================================
    // MÉTODOS PRIVADOS
    // ==========================================

    private NovedadEntity buscarNovedadOFallar(UUID novedadId) {
        return novedadRepository.findById(novedadId)
                .orElseThrow(() -> new ResourceNotFoundException("Novedad", novedadId));
    }

    private void registrarAuditoria(NovedadEntity novedad, UUID usuarioId,
                                     AccionAuditoria accion,
                                     NovedadEntity anterior, NovedadEntity nuevo) {
        try {
            AuditoriaNovedadEntity auditoria = AuditoriaNovedadEntity.builder()
                    .novedad(novedad)
                    .usuarioId(usuarioId)
                    .accion(accion)
                    .datosAnteriores(anterior != null ? serializarParaAuditoria(anterior) : null)
                    .datosNuevos(nuevo != null ? serializarParaAuditoria(nuevo) : null)
                    .build();
            auditoriaRepository.save(auditoria);
        } catch (Exception e) {
            log.error("Error al registrar auditoría para novedad {}: {}", novedad.getNovedadId(), e.getMessage());
            throw new RuntimeException("Fallo crítico en auditoría", e);
        }
    }

    private String serializarParaAuditoria(NovedadEntity entity) {
        try {
            NovedadDTORespuesta dto = NovedadDTORespuesta.builder()
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
                    .actores(entity.getActores() != null
                            ? new java.util.ArrayList<>(entity.getActores())
                            : java.util.Collections.emptyList())
                    .infraestructuraAfectada(entity.getInfraestructuraAfectada())
                    .accionInstitucional(entity.getAccionInstitucional())
                    .descripcionHecho(entity.getDescripcionHecho())
                    .nivelConfianza(entity.getNivelConfianza())
                    .nivelVisibilidad(entity.getNivelVisibilidad())
                    .usuarioActualizacion(entity.getUsuarioActualizacion())
                    .build();
            return objectMapper.writeValueAsString(dto);
        } catch (Exception e) {
            log.warn("No se pudo serializar entidad para auditoría: {}", e.getMessage());
            return "{}";
        }
    }

    private NovedadEntity clonarParaAuditoria(NovedadEntity original) {
        return NovedadEntity.builder()
                .novedadId(original.getNovedadId())
                .usuarioId(original.getUsuarioId())
                .fechaHecho(original.getFechaHecho())
                .horaInicio(original.getHoraInicio())
                .horaFin(original.getHoraFin())
                .fechaReporte(original.getFechaReporte())
                .fechaActualizacion(original.getFechaActualizacion())
                .municipio(original.getMunicipio())
                .localidadEspecifica(original.getLocalidadEspecifica())
                .categoria(original.getCategoria())
                .actor1(original.getActor1())
                .actor2(original.getActor2())
                .actores(original.getActores() != null
                        ? new java.util.HashSet<>(original.getActores())
                        : new java.util.HashSet<>())
                .infraestructuraAfectada(original.getInfraestructuraAfectada())
                .accionInstitucional(original.getAccionInstitucional())
                .descripcionHecho(original.getDescripcionHecho())
                .nivelConfianza(original.getNivelConfianza())
                .nivelVisibilidad(original.getNivelVisibilidad())
                .usuarioActualizacion(original.getUsuarioActualizacion())
                .build();
    }

    // ==========================================
    // EVENTOS RABBITMQ
    // ==========================================

    private void publicarEvento(String tipo, NovedadEntity novedad) {
        try {
            Map<String, Object> evento = new HashMap<>();
            evento.put("tipo", tipo);
            evento.put("oculto", novedad.getOculto());
            evento.put("novedadId", novedad.getNovedadId().toString());
            evento.put("usuarioId", novedad.getUsuarioId().toString());
            evento.put("municipio", novedad.getMunicipio());
            evento.put("categoria", novedad.getCategoria().name());
            evento.put("fechaHecho", novedad.getFechaHecho().toString());
            evento.put("nivelConfianza", novedad.getNivelConfianza().name()); // <--- ESTO FALTABA
            evento.put("nivelVisibilidad", novedad.getNivelVisibilidad().name());
            evento.put("localidadEspecifica", novedad.getLocalidadEspecifica());
            evento.put("descripcionHecho", novedad.getDescripcionHecho());
            evento.put("actor1", novedad.getActor1() != null ? novedad.getActor1().name() : null);
            evento.put("actor2", novedad.getActor2() != null ? novedad.getActor2().name() : null);
            // Lista completa de actores para compatibilidad futura
            if (novedad.getActores() != null && !novedad.getActores().isEmpty()) {
                evento.put("actores", novedad.getActores().stream()
                        .map(Enum::name).collect(java.util.stream.Collectors.toList()));
            }
            evento.put("timestamp", LocalDateTime.now().toString());

            if (novedad.getAfectacionHumana() != null) {
                var ah = novedad.getAfectacionHumana();
                evento.put("muertosTotales", ah.getMuertosTotales());
                evento.put("muertosCiviles", ah.getMuertosCiviles());
                evento.put("muertosFuerzaPublica", ah.getMuertosFuerzaPublica());
                evento.put("heridosTotales", ah.getHeridosTotales());
                evento.put("heridosCiviles", ah.getHeridosCiviles());
                evento.put("desplazadosTotales", ah.getDesplazadosTotales());
                evento.put("confinadosTotales", ah.getConfinadosTotales());
            } else {
                // Enviar ceros si no hay objeto de afectación
                evento.put("muertosTotales", 0);
                evento.put("heridosTotales", 0);
                evento.put("desplazadosTotales", 0);
                evento.put("confinadosTotales", 0);
            }

            rabbitTemplate.convertAndSend("exchange.novedades", "", evento);
            log.info("Evento {} enviado correctamente con todos los datos", tipo);
        } catch (Exception e) {
            log.error("Error al construir el mensaje para RabbitMQ: {}", e.getMessage());
        }
    }
}
