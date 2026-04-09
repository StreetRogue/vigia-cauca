package co.edu.unicauca.microreportes.fachadaServices.services.impl;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.EstadisticaAgregadaEntity;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.EventoProcesadoEntity;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.NovedadSnapshotEntity;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.CategoriaEvento;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.NivelVisibilidad;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.TipoEvento;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.EstadisticaAgregadaRepository;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.EventoProcesadoRepository;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.NovedadSnapshotRepository;
import co.edu.unicauca.microreportes.fachadaServices.mapper.SnapshotMapper;
import co.edu.unicauca.microreportes.fachadaServices.services.IProyeccionService;
import co.edu.unicauca.microreportes.mensajeria.NovedadEventoDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        // 3. Registrar como procesado
        registrarEventoProcesado(evento, TipoEvento.NOVEDAD_CREADA, idempotencyKey);

        // 4. Invalidar caché
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
        } else {
            // Snapshot no existe (evento de creación se perdió) -> crear
            log.warn("Snapshot no encontrado para actualización, creando: {}", novedadId);
            NovedadSnapshotEntity snapshot = snapshotMapper.fromEvento(evento);
            snapshotRepository.save(snapshot);
            actualizarAgregacion(snapshot, true);
        }

        registrarEventoProcesado(evento, TipoEvento.NOVEDAD_ACTUALIZADA, idempotencyKey);
        invalidarCaches();

        log.info("Proyección ACTUALIZADA para novedad: {}", evento.getNovedadId());
    }

    @Override
    @Transactional
    public void procesarNovedadEliminada(NovedadEventoDTO evento) {
        String idempotencyKey = generarIdempotencyKey(evento);
        if (yaFueProcesado(idempotencyKey)) {
            log.warn("Evento duplicado ignorado: {}", idempotencyKey);
            return;
        }

        UUID novedadId = UUID.fromString(evento.getNovedadId());
        Optional<NovedadSnapshotEntity> existenteOpt = snapshotRepository.findById(novedadId);

        if (existenteOpt.isPresent()) {
            NovedadSnapshotEntity existente = existenteOpt.get();

            // 1. Decrementar stats
            actualizarAgregacion(existente, false);

            // 2. Eliminar snapshot
            snapshotRepository.delete(existente);
        } else {
            log.warn("Snapshot no encontrado para eliminación: {}", novedadId);
        }

        registrarEventoProcesado(evento, TipoEvento.NOVEDAD_ELIMINADA, idempotencyKey);
        invalidarCaches();

        log.info("Proyección ELIMINADA para novedad: {}", evento.getNovedadId());
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
            if (cacheManager.getCache("kpis") != null)
                cacheManager.getCache("kpis").clear();
            if (cacheManager.getCache("serieTemporal") != null)
                cacheManager.getCache("serieTemporal").clear();
            if (cacheManager.getCache("mapaCalor") != null)
                cacheManager.getCache("mapaCalor").clear();
            if (cacheManager.getCache("dashboard") != null)
                cacheManager.getCache("dashboard").clear();
        } catch (Exception e) {
            log.warn("Error invalidando cachés: {}", e.getMessage());
        }
    }
}
