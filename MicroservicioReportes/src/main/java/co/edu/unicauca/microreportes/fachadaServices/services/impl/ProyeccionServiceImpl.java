package co.edu.unicauca.microreportes.fachadaServices.services.impl;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.EstadisticaAgregadaEntity;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.EventoProcesadoEntity;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.NovedadSnapshotEntity;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.VictimaSnapshotEntity;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.*;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.EstadisticaAgregadaRepository;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.EventoProcesadoRepository;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.NovedadSnapshotRepository;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.VictimaSnapshotRepository;
import co.edu.unicauca.microreportes.fachadaServices.mapper.SnapshotMapper;
import co.edu.unicauca.microreportes.fachadaServices.services.IProyeccionService;
import co.edu.unicauca.microreportes.mensajeria.NovedadEventoDTO;
import co.edu.unicauca.microreportes.mensajeria.VictimaEventoDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Implementación del procesador de proyecciones CQRS.
 *
 * Flujo por evento:
 * 1. Verificar idempotencia (¿ya procesé este evento?)
 * 2. Persistir/actualizar snapshot denormalizado
 * 3. Actualizar agregación pre-computada (incremento/decremento)
 * 4. Invalidar caché
 * 5. Registrar evento como procesado
 *
 * Patrones aplicados:
 * - Idempotent Consumer: evita doble procesamiento
 * - Materialized View: snapshot denormalizado
 * - Write-behind Aggregation: actualización incremental de stats
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProyeccionServiceImpl implements IProyeccionService {

    private final NovedadSnapshotRepository snapshotRepository;
    private final EstadisticaAgregadaRepository agregadaRepository;
    private final EventoProcesadoRepository eventoProcesadoRepository;
    private final VictimaSnapshotRepository victimaSnapshotRepository;
    private final SnapshotMapper snapshotMapper;
    private final CacheManager cacheManager;

    @Override
    @Transactional
    public void procesarNovedadCreada(NovedadEventoDTO evento) {
        String idempotencyKey = generarIdempotencyKey(evento);
        if (yaFueProcesado(idempotencyKey)) {
            log.warn("Evento duplicado ignorado: {}", idempotencyKey);
            return;
        }

        // 1. Crear snapshot
        NovedadSnapshotEntity snapshot = snapshotMapper.fromEvento(evento);
        snapshotRepository.save(snapshot);

        // 2. Actualizar agregación incremental
        actualizarAgregacion(snapshot, true);

        // 3. Persistir víctimas individuales
        persistirVictimas(evento, snapshot);

        // 4. Registrar como procesado
        registrarEventoProcesado(evento, TipoEvento.NOVEDAD_CREADA, idempotencyKey);

        // 5. Invalidar caché
        invalidarCaches();

        log.info("Proyección CREADA para novedad: {}", evento.getNovedadId());
    }

    @Override
    @Transactional
    public void procesarNovedadActualizada(NovedadEventoDTO evento) {
        String idempotencyKey = generarIdempotencyKey(evento);
        if (yaFueProcesado(idempotencyKey)) {
            log.warn("Evento duplicado ignorado: {}", idempotencyKey);
            return;
        }

        UUID novedadId = UUID.fromString(evento.getNovedadId());
        Optional<NovedadSnapshotEntity> existenteOpt = snapshotRepository.findById(novedadId);

        if (existenteOpt.isPresent()) {
            NovedadSnapshotEntity existente = existenteOpt.get();

            // 1. Decrementar stats antiguas
            actualizarAgregacion(existente, false);

            // 2. Actualizar snapshot
            snapshotMapper.actualizarDesdeEvento(existente, evento);
            snapshotRepository.save(existente);

            // 3. Incrementar stats nuevas
            actualizarAgregacion(existente, true);

            // 4. Reemplazar víctimas (borrar las viejas y persistir las nuevas)
            victimaSnapshotRepository.deleteByNovedadId(novedadId);
            persistirVictimas(evento, existente);
        } else {
            // Snapshot no existe (evento de creación se perdió) -> crear
            log.warn("Snapshot no encontrado para actualización, creando: {}", novedadId);
            NovedadSnapshotEntity snapshot = snapshotMapper.fromEvento(evento);
            snapshotRepository.save(snapshot);
            actualizarAgregacion(snapshot, true);
            persistirVictimas(evento, snapshot);
        }

        registrarEventoProcesado(evento, TipoEvento.NOVEDAD_ACTUALIZADA, idempotencyKey);
        invalidarCaches();

        log.info("Proyección ACTUALIZADA para novedad: {}", evento.getNovedadId());
    }

    @Override
    @Transactional
    public void procesarNovedadEliminada(NovedadEventoDTO evento) {
        UUID novedadId = UUID.fromString(evento.getNovedadId());
        Optional<NovedadSnapshotEntity> existenteOpt = snapshotRepository.findById(novedadId);

        if (existenteOpt.isPresent()) {
            NovedadSnapshotEntity existente = existenteOpt.get();

            // NO llamamos a actualizarAgregacion(existente, false) porque queremos que
            // la estadística SIGA CONTANDO este evento.

            // Solo marcamos el snapshot como oculto para los reportes
            existente.setOculto(true);
            snapshotRepository.save(existente);

            // Ocultar también las víctimas asociadas (soft delete)
            victimaSnapshotRepository.ocultarByNovedadId(novedadId);
        }

        registrarEventoProcesado(evento, TipoEvento.NOVEDAD_ELIMINADA, generarIdempotencyKey(evento));
        invalidarCaches();
        log.info("Snapshot marcado como OCULTO: {}", novedadId);
    }

    // ==========================================
    // AGREGACIÓN INCREMENTAL
    // ==========================================

    /**
     * Actualiza la tabla de agregaciones de forma incremental.
     * @param snapshot datos de la novedad
     * @param incrementar true = sumar, false = restar
     */
    private void actualizarAgregacion(NovedadSnapshotEntity snapshot, boolean incrementar) {
        EstadisticaAgregadaEntity agregada = agregadaRepository
                .findByAnioAndMesAndMunicipioAndCategoriaAndNivelVisibilidad(
                        snapshot.getAnio(), snapshot.getMes(),
                        snapshot.getMunicipio(), snapshot.getCategoria(),
                        snapshot.getNivelVisibilidad()
                )
                .orElseGet(() -> EstadisticaAgregadaEntity.builder()
                        .anio(snapshot.getAnio())
                        .mes(snapshot.getMes())
                        .municipio(snapshot.getMunicipio())
                        .categoria(snapshot.getCategoria())
                        .nivelVisibilidad(snapshot.getNivelVisibilidad())
                        .build()
                );

        if (incrementar) {
            agregada.incrementar(
                    snapshot.getMuertosTotales(), snapshot.getMuertosCiviles(),
                    snapshot.getMuertosFuerzaPublica(),
                    snapshot.getHeridosTotales(), snapshot.getHeridosCiviles(),
                    snapshot.getDesplazadosTotales(), snapshot.getConfinadosTotales()
            );
        } else {
            agregada.decrementar(
                    snapshot.getMuertosTotales(), snapshot.getMuertosCiviles(),
                    snapshot.getMuertosFuerzaPublica(),
                    snapshot.getHeridosTotales(), snapshot.getHeridosCiviles(),
                    snapshot.getDesplazadosTotales(), snapshot.getConfinadosTotales()
            );
        }

        agregadaRepository.save(agregada);
    }

    // ==========================================
    // VÍCTIMAS
    // ==========================================

    private void persistirVictimas(NovedadEventoDTO evento, NovedadSnapshotEntity snapshot) {
        if (evento.getVictimas() == null || evento.getVictimas().isEmpty()) return;

        UUID novedadId = snapshot.getNovedadId();
        NivelVisibilidad visibilidad = snapshot.getNivelVisibilidad();

        List<VictimaSnapshotEntity> victimas = new ArrayList<>();
        for (VictimaEventoDTO v : evento.getVictimas()) {
            victimas.add(VictimaSnapshotEntity.builder()
                    .novedadId(novedadId)
                    .anio(snapshot.getAnio())
                    .mes(snapshot.getMes())
                    .municipio(snapshot.getMunicipio())
                    .categoria(snapshot.getCategoria())
                    .nombreVictima(v.getNombreVictima())
                    .genero(parsearEnum(Genero.class, v.getGeneroVictima(), Genero.NO_ESPECIFICADO))
                    .edad(v.getEdadVictima())
                    .grupoPoblacional(parsearEnum(GrupoPoblacional.class, v.getGrupoPoblacional(), null))
                    .ocupacionVictima(v.getOcupacionVictima())
                    .nivelVisibilidad(visibilidad)
                    .build());
        }

        if (!victimas.isEmpty()) {
            victimaSnapshotRepository.saveAll(victimas);
        }
    }

    private <E extends Enum<E>> E parsearEnum(Class<E> tipo, String valor, E porDefecto) {
        if (valor == null || valor.isBlank()) return porDefecto;
        try {
            return Enum.valueOf(tipo, valor.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Valor desconocido para {}: '{}'", tipo.getSimpleName(), valor);
            return porDefecto;
        }
    }

    // ==========================================
    // IDEMPOTENCIA
    // ==========================================

    private String generarIdempotencyKey(NovedadEventoDTO evento) {
        return evento.getTipo() + ":" + evento.getNovedadId() + ":" + evento.getTimestamp();
    }

    private boolean yaFueProcesado(String idempotencyKey) {
        return eventoProcesadoRepository.existsByIdempotencyKey(idempotencyKey);
    }

    private void registrarEventoProcesado(NovedadEventoDTO evento, TipoEvento tipo, String idempotencyKey) {
        EventoProcesadoEntity registro = EventoProcesadoEntity.builder()
                .novedadId(UUID.fromString(evento.getNovedadId()))
                .tipoEvento(tipo)
                .timestampEvento(evento.getTimestamp())
                .idempotencyKey(idempotencyKey)
                .build();
        eventoProcesadoRepository.save(registro);
    }

    // ==========================================
    // CACHÉ
    // ==========================================

    private void invalidarCaches() {
        try {
            for (String nombre : new String[]{"kpis", "serieTemporal", "mapaCalor", "dashboard", "victimasEstadisticas"}) {
                var cache = cacheManager.getCache(nombre);
                if (cache != null) cache.clear();
            }
        } catch (Exception e) {
            log.warn("Error invalidando cachés: {}", e.getMessage());
        }
    }
}
