package co.edu.unicauca.microreportes.fachadaServices.services;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.EstadisticaAgregadaEntity;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.NovedadSnapshotEntity;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.CategoriaEvento;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.NivelVisibilidad;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.EstadisticaAgregadaRepository;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.EventoProcesadoRepository;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.NovedadSnapshotRepository;
import co.edu.unicauca.microreportes.fachadaServices.mapper.SnapshotMapper;
import co.edu.unicauca.microreportes.fachadaServices.services.impl.ProyeccionServiceImpl;
import co.edu.unicauca.microreportes.mensajeria.NovedadEventoDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProyeccionServiceImplTest {

    @Mock
    private NovedadSnapshotRepository snapshotRepository;

    @Mock
    private EstadisticaAgregadaRepository agregadaRepository;

    @Mock
    private EventoProcesadoRepository eventoProcesadoRepository;

    @Mock
    private SnapshotMapper snapshotMapper;

    @Mock
    private CacheManager cacheManager;

    @InjectMocks
    private ProyeccionServiceImpl proyeccionService;

    private UUID novedadId;
    private NovedadEventoDTO eventoCreado;
    private NovedadEventoDTO eventoActualizado;
    private NovedadEventoDTO eventoEliminado;
    private NovedadSnapshotEntity snapshotEntity;
    private EstadisticaAgregadaEntity estadisticaEntity;
    private Cache mockCache;

    @BeforeEach
    void setUp() {
        novedadId = UUID.randomUUID();

        eventoCreado = NovedadEventoDTO.builder()
                .tipo("NOVEDAD_CREADA")
                .novedadId(novedadId.toString())
                .usuarioId(UUID.randomUUID().toString())
                .municipio("Popayán")
                .categoria("ENFRENTAMIENTO")
                .fechaHecho("2024-03-15")
                .nivelConfianza("CONFIRMADO")
                .nivelVisibilidad("PUBLICA")
                .timestamp("2024-03-15T10:00:00")
                .muertosTotales(2)
                .muertosCiviles(1)
                .muertosFuerzaPublica(1)
                .heridosTotales(5)
                .heridosCiviles(3)
                .desplazadosTotales(10)
                .confinadosTotales(0)
                .actor1("ELN")
                .actor2("FUERZA_PUBLICA")
                .oculto(false)
                .build();

        eventoActualizado = NovedadEventoDTO.builder()
                .tipo("NOVEDAD_ACTUALIZADA")
                .novedadId(novedadId.toString())
                .usuarioId(UUID.randomUUID().toString())
                .municipio("Santander de Quilichao")
                .categoria("HOSTIGAMIENTO")
                .fechaHecho("2024-03-16")
                .nivelConfianza("PRELIMINAR")
                .nivelVisibilidad("PUBLICA")
                .timestamp("2024-03-16T11:00:00")
                .muertosTotales(0)
                .heridosTotales(3)
                .desplazadosTotales(0)
                .oculto(false)
                .build();

        eventoEliminado = NovedadEventoDTO.builder()
                .tipo("NOVEDAD_ELIMINADA")
                .novedadId(novedadId.toString())
                .municipio("Popayán")
                .categoria("ENFRENTAMIENTO")
                .timestamp("2024-03-17T08:00:00")
                .oculto(true)
                .build();

        snapshotEntity = NovedadSnapshotEntity.builder()
                .novedadId(novedadId)
                .municipio("Popayán")
                .categoria(CategoriaEvento.ENFRENTAMIENTO)
                .nivelVisibilidad(NivelVisibilidad.PUBLICA)
                .anio(2024)
                .mes(3)
                .muertosTotales(2)
                .muertosCiviles(1)
                .muertosFuerzaPublica(1)
                .heridosTotales(5)
                .heridosCiviles(3)
                .desplazadosTotales(10)
                .confinadosTotales(0)
                .oculto(false)
                .build();

        estadisticaEntity = EstadisticaAgregadaEntity.builder()
                .anio(2024)
                .mes(3)
                .municipio("Popayán")
                .categoria(CategoriaEvento.ENFRENTAMIENTO)
                .nivelVisibilidad(NivelVisibilidad.PUBLICA)
                .totalEventos(10L)
                .totalMuertos(5L)
                .totalHeridos(8L)
                .totalDesplazados(20L)
                .totalConfinados(0L)
                .build();

        mockCache = mock(Cache.class);
        // lenient: algunos tests terminan antes de invalidar la caché (duplicados),
        // así que este stub puede no usarse en todos los tests.
        lenient().when(cacheManager.getCache(anyString())).thenReturn(mockCache);
    }

    // ===================== procesarNovedadCreada =====================

    @Test
    void procesarNovedadCreada_eventoNuevo_creaSnapshotYActualizaEstadistica() {
        when(eventoProcesadoRepository.existsByIdempotencyKey(anyString())).thenReturn(false);
        when(snapshotMapper.fromEvento(eventoCreado)).thenReturn(snapshotEntity);
        when(snapshotRepository.save(snapshotEntity)).thenReturn(snapshotEntity);
        when(agregadaRepository.findByAnioAndMesAndMunicipioAndCategoriaAndNivelVisibilidad(
                any(), any(), any(), any(), any()))
                .thenReturn(Optional.of(estadisticaEntity));
        when(agregadaRepository.save(any())).thenReturn(estadisticaEntity);
        when(eventoProcesadoRepository.save(any())).thenReturn(null);

        proyeccionService.procesarNovedadCreada(eventoCreado);

        verify(snapshotRepository).save(snapshotEntity);
        verify(agregadaRepository).save(any());
        verify(eventoProcesadoRepository).save(any());
    }

    @Test
    void procesarNovedadCreada_eventoDuplicado_ignoraElProcesamiento() {
        when(eventoProcesadoRepository.existsByIdempotencyKey(anyString())).thenReturn(true);

        proyeccionService.procesarNovedadCreada(eventoCreado);

        verify(snapshotRepository, never()).save(any());
        verify(agregadaRepository, never()).save(any());
    }

    @Test
    void procesarNovedadCreada_sinEstadisticaExistente_creaUnaEstadisticaNueva() {
        when(eventoProcesadoRepository.existsByIdempotencyKey(anyString())).thenReturn(false);
        when(snapshotMapper.fromEvento(eventoCreado)).thenReturn(snapshotEntity);
        when(snapshotRepository.save(any())).thenReturn(snapshotEntity);
        when(agregadaRepository.findByAnioAndMesAndMunicipioAndCategoriaAndNivelVisibilidad(
                any(), any(), any(), any(), any()))
                .thenReturn(Optional.empty());
        when(agregadaRepository.save(any())).thenReturn(estadisticaEntity);
        when(eventoProcesadoRepository.save(any())).thenReturn(null);

        proyeccionService.procesarNovedadCreada(eventoCreado);

        verify(agregadaRepository).save(any());
    }

    @Test
    void procesarNovedadCreada_invalidaLasCaromasCache() {
        when(eventoProcesadoRepository.existsByIdempotencyKey(anyString())).thenReturn(false);
        when(snapshotMapper.fromEvento(eventoCreado)).thenReturn(snapshotEntity);
        when(snapshotRepository.save(any())).thenReturn(snapshotEntity);
        when(agregadaRepository.findByAnioAndMesAndMunicipioAndCategoriaAndNivelVisibilidad(
                any(), any(), any(), any(), any()))
                .thenReturn(Optional.of(estadisticaEntity));
        when(agregadaRepository.save(any())).thenReturn(estadisticaEntity);
        when(eventoProcesadoRepository.save(any())).thenReturn(null);

        proyeccionService.procesarNovedadCreada(eventoCreado);

        verify(cacheManager, atLeastOnce()).getCache(anyString());
        verify(mockCache, atLeastOnce()).clear();
    }

    // ===================== procesarNovedadActualizada =====================

    @Test
    void procesarNovedadActualizada_snapshotExistente_decrementaYLuegoIncrementa() {
        when(eventoProcesadoRepository.existsByIdempotencyKey(anyString())).thenReturn(false);
        when(snapshotRepository.findById(novedadId)).thenReturn(Optional.of(snapshotEntity));
        when(agregadaRepository.findByAnioAndMesAndMunicipioAndCategoriaAndNivelVisibilidad(
                any(), any(), any(), any(), any()))
                .thenReturn(Optional.of(estadisticaEntity));
        when(agregadaRepository.save(any())).thenReturn(estadisticaEntity);
        when(snapshotRepository.save(any())).thenReturn(snapshotEntity);
        when(eventoProcesadoRepository.save(any())).thenReturn(null);

        proyeccionService.procesarNovedadActualizada(eventoActualizado);

        // Verifica que se actualizó el snapshot
        verify(snapshotMapper).actualizarDesdeEvento(eq(snapshotEntity), eq(eventoActualizado));
        verify(snapshotRepository).save(snapshotEntity);
        // Verifica que se guardó la estadística (decremento + incremento = 2 saves)
        verify(agregadaRepository, times(2)).save(any());
    }

    @Test
    void procesarNovedadActualizada_snapshotNoExistente_creaSnapshotNuevo() {
        when(eventoProcesadoRepository.existsByIdempotencyKey(anyString())).thenReturn(false);
        when(snapshotRepository.findById(novedadId)).thenReturn(Optional.empty());
        when(snapshotMapper.fromEvento(eventoActualizado)).thenReturn(snapshotEntity);
        when(snapshotRepository.save(any())).thenReturn(snapshotEntity);
        when(agregadaRepository.findByAnioAndMesAndMunicipioAndCategoriaAndNivelVisibilidad(
                any(), any(), any(), any(), any()))
                .thenReturn(Optional.of(estadisticaEntity));
        when(agregadaRepository.save(any())).thenReturn(estadisticaEntity);
        when(eventoProcesadoRepository.save(any())).thenReturn(null);

        proyeccionService.procesarNovedadActualizada(eventoActualizado);

        verify(snapshotMapper).fromEvento(eventoActualizado);
        verify(snapshotRepository).save(any());
    }

    @Test
    void procesarNovedadActualizada_eventoDuplicado_ignoraElProcesamiento() {
        when(eventoProcesadoRepository.existsByIdempotencyKey(anyString())).thenReturn(true);

        proyeccionService.procesarNovedadActualizada(eventoActualizado);

        verify(snapshotRepository, never()).findById(any());
        verify(snapshotRepository, never()).save(any());
    }

    // ===================== procesarNovedadEliminada =====================

    @Test
    void procesarNovedadEliminada_snapshotExistente_marcaComoOculto() {
        when(snapshotRepository.findById(novedadId)).thenReturn(Optional.of(snapshotEntity));
        when(snapshotRepository.save(any())).thenReturn(snapshotEntity);
        when(eventoProcesadoRepository.save(any())).thenReturn(null);

        proyeccionService.procesarNovedadEliminada(eventoEliminado);

        assertThat(snapshotEntity.getOculto()).isTrue();
        verify(snapshotRepository).save(snapshotEntity);
    }

    @Test
    void procesarNovedadEliminada_NOdecrementaEstadisticas() {
        when(snapshotRepository.findById(novedadId)).thenReturn(Optional.of(snapshotEntity));
        when(snapshotRepository.save(any())).thenReturn(snapshotEntity);
        when(eventoProcesadoRepository.save(any())).thenReturn(null);

        proyeccionService.procesarNovedadEliminada(eventoEliminado);

        // Las estadísticas NO deben decrementarse (diseño intencional)
        verify(agregadaRepository, never()).save(any());
        verify(agregadaRepository, never()).findByAnioAndMesAndMunicipioAndCategoriaAndNivelVisibilidad(
                any(), any(), any(), any(), any());
    }

    @Test
    void procesarNovedadEliminada_snapshotNoExistente_noFalla() {
        when(snapshotRepository.findById(novedadId)).thenReturn(Optional.empty());
        when(eventoProcesadoRepository.save(any())).thenReturn(null);

        proyeccionService.procesarNovedadEliminada(eventoEliminado);

        verify(snapshotRepository, never()).save(any());
        verify(eventoProcesadoRepository).save(any());
    }

    @Test
    void procesarNovedadEliminada_registraEventoComoProcessado() {
        when(snapshotRepository.findById(novedadId)).thenReturn(Optional.of(snapshotEntity));
        when(snapshotRepository.save(any())).thenReturn(snapshotEntity);
        when(eventoProcesadoRepository.save(any())).thenReturn(null);

        proyeccionService.procesarNovedadEliminada(eventoEliminado);

        verify(eventoProcesadoRepository).save(any());
    }
}
