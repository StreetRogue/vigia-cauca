package co.edu.unicauca.micronovedades.fachadaServices.services;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.AuditoriaNovedadEntity;
import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.AccionAuditoria;
import co.edu.unicauca.micronovedades.capaAccesoDatos.repositories.AuditoriaNovedadRepository;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta.AuditoriaNovedadDTORespuesta;
import co.edu.unicauca.micronovedades.fachadaServices.mapper.NovedadMapper;
import co.edu.unicauca.micronovedades.fachadaServices.services.impl.AuditoriaServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditoriaServiceImplTest {

    @Mock
    private AuditoriaNovedadRepository auditoriaRepository;

    @Mock
    private NovedadMapper mapper;

    @InjectMocks
    private AuditoriaServiceImpl auditoriaService;

    private UUID novedadId;
    private UUID usuarioId;
    private AuditoriaNovedadEntity auditoriaEntityCreate;
    private AuditoriaNovedadEntity auditoriaEntityUpdate;
    private AuditoriaNovedadDTORespuesta auditoriaRespuestaCreate;
    private AuditoriaNovedadDTORespuesta auditoriaRespuestaUpdate;

    @BeforeEach
    void setUp() {
        novedadId = UUID.randomUUID();
        usuarioId = UUID.randomUUID();

        auditoriaEntityCreate = AuditoriaNovedadEntity.builder()
                .auditoriaId(UUID.randomUUID())
                .usuarioId(usuarioId)
                .accion(AccionAuditoria.CREATE)
                .datosNuevos("{\"municipio\":\"Popayán\"}")
                .fecha(LocalDateTime.of(2024, 3, 15, 10, 0))
                .build();

        auditoriaEntityUpdate = AuditoriaNovedadEntity.builder()
                .auditoriaId(UUID.randomUUID())
                .usuarioId(usuarioId)
                .accion(AccionAuditoria.UPDATE)
                .datosAnteriores("{\"municipio\":\"Popayán\"}")
                .datosNuevos("{\"municipio\":\"Santander\"}")
                .fecha(LocalDateTime.of(2024, 3, 16, 11, 0))
                .build();

        auditoriaRespuestaCreate = AuditoriaNovedadDTORespuesta.builder()
                .auditoriaId(auditoriaEntityCreate.getAuditoriaId())
                .novedadId(novedadId)
                .usuarioId(usuarioId)
                .accion(AccionAuditoria.CREATE)
                .fecha(LocalDateTime.of(2024, 3, 15, 10, 0))
                .build();

        auditoriaRespuestaUpdate = AuditoriaNovedadDTORespuesta.builder()
                .auditoriaId(auditoriaEntityUpdate.getAuditoriaId())
                .novedadId(novedadId)
                .usuarioId(usuarioId)
                .accion(AccionAuditoria.UPDATE)
                .fecha(LocalDateTime.of(2024, 3, 16, 11, 0))
                .build();
    }

    // ===================== obtenerHistorialNovedad =====================

    @Test
    void obtenerHistorialNovedad_conRegistros_retornaListaOrdenadaDesc() {
        List<AuditoriaNovedadEntity> entidades = List.of(auditoriaEntityUpdate, auditoriaEntityCreate);
        List<AuditoriaNovedadDTORespuesta> dtos = List.of(auditoriaRespuestaUpdate, auditoriaRespuestaCreate);

        when(auditoriaRepository.findByNovedad_NovedadIdOrderByFechaDesc(novedadId))
                .thenReturn(entidades);
        when(mapper.toAuditoriaDTOList(entidades)).thenReturn(dtos);

        List<AuditoriaNovedadDTORespuesta> resultado = auditoriaService.obtenerHistorialNovedad(novedadId);

        assertThat(resultado).hasSize(2);
        assertThat(resultado.get(0).getAccion()).isEqualTo(AccionAuditoria.UPDATE);
        assertThat(resultado.get(1).getAccion()).isEqualTo(AccionAuditoria.CREATE);
        verify(auditoriaRepository).findByNovedad_NovedadIdOrderByFechaDesc(novedadId);
    }

    @Test
    void obtenerHistorialNovedad_sinRegistros_retornaListaVacia() {
        when(auditoriaRepository.findByNovedad_NovedadIdOrderByFechaDesc(novedadId))
                .thenReturn(List.of());
        when(mapper.toAuditoriaDTOList(List.of())).thenReturn(List.of());

        List<AuditoriaNovedadDTORespuesta> resultado = auditoriaService.obtenerHistorialNovedad(novedadId);

        assertThat(resultado).isEmpty();
    }

    @Test
    void obtenerHistorialNovedad_delegaAlRepositorioConIdCorrecto() {
        UUID otroId = UUID.randomUUID();
        when(auditoriaRepository.findByNovedad_NovedadIdOrderByFechaDesc(otroId))
                .thenReturn(List.of());
        when(mapper.toAuditoriaDTOList(any())).thenReturn(List.of());

        auditoriaService.obtenerHistorialNovedad(otroId);

        verify(auditoriaRepository).findByNovedad_NovedadIdOrderByFechaDesc(otroId);
        verify(auditoriaRepository, never()).findByNovedad_NovedadIdOrderByFechaDesc(novedadId);
    }

    // ===================== obtenerHistorialPorUsuario =====================

    @Test
    void obtenerHistorialPorUsuario_conRegistros_retornaListaDelUsuario() {
        List<AuditoriaNovedadEntity> entidades = List.of(auditoriaEntityUpdate, auditoriaEntityCreate);
        List<AuditoriaNovedadDTORespuesta> dtos = List.of(auditoriaRespuestaUpdate, auditoriaRespuestaCreate);

        when(auditoriaRepository.findByUsuarioIdOrderByFechaDesc(usuarioId))
                .thenReturn(entidades);
        when(mapper.toAuditoriaDTOList(entidades)).thenReturn(dtos);

        List<AuditoriaNovedadDTORespuesta> resultado = auditoriaService.obtenerHistorialPorUsuario(usuarioId);

        assertThat(resultado).hasSize(2);
        assertThat(resultado).allMatch(r -> r.getUsuarioId().equals(usuarioId));
        verify(auditoriaRepository).findByUsuarioIdOrderByFechaDesc(usuarioId);
    }

    @Test
    void obtenerHistorialPorUsuario_usuarioSinHistorial_retornaListaVacia() {
        UUID usuarioSinHistorial = UUID.randomUUID();
        when(auditoriaRepository.findByUsuarioIdOrderByFechaDesc(usuarioSinHistorial))
                .thenReturn(List.of());
        when(mapper.toAuditoriaDTOList(List.of())).thenReturn(List.of());

        List<AuditoriaNovedadDTORespuesta> resultado =
                auditoriaService.obtenerHistorialPorUsuario(usuarioSinHistorial);

        assertThat(resultado).isEmpty();
    }

    @Test
    void obtenerHistorialPorUsuario_invocaMapperConEntidadesDelRepositorio() {
        List<AuditoriaNovedadEntity> entidades = List.of(auditoriaEntityCreate);
        when(auditoriaRepository.findByUsuarioIdOrderByFechaDesc(usuarioId)).thenReturn(entidades);
        when(mapper.toAuditoriaDTOList(entidades)).thenReturn(List.of(auditoriaRespuestaCreate));

        auditoriaService.obtenerHistorialPorUsuario(usuarioId);

        verify(mapper).toAuditoriaDTOList(entidades);
    }
}
