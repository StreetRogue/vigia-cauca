package co.edu.unicauca.micronovedades.fachadaServices.services;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.NovedadEntity;
import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.*;
import co.edu.unicauca.micronovedades.capaAccesoDatos.repositories.AuditoriaNovedadRepository;
import co.edu.unicauca.micronovedades.capaAccesoDatos.repositories.NovedadRepository;
import co.edu.unicauca.micronovedades.capaControladores.controladorExcepciones.BadRequestException;
import co.edu.unicauca.micronovedades.capaControladores.controladorExcepciones.ResourceNotFoundException;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion.AfectacionHumanaDTOPeticion;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion.FiltroNovedadDTO;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion.NovedadDTOPeticion;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta.NovedadDTORespuesta;
import co.edu.unicauca.micronovedades.fachadaServices.mapper.NovedadMapper;
import co.edu.unicauca.micronovedades.fachadaServices.services.impl.NovedadServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.HashSet;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NovedadServiceImplTest {

    @Mock
    private NovedadRepository novedadRepository;

    @Mock
    private AuditoriaNovedadRepository auditoriaRepository;

    @Mock
    private NovedadMapper mapper;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private NovedadServiceImpl novedadService;

    private UUID novedadId;
    private UUID usuarioId;
    private NovedadEntity entityEjemplo;
    private NovedadDTORespuesta respuestaEjemplo;
    private NovedadDTOPeticion peticionEjemplo;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(novedadService, "queueName", "cola.novedades.notificaciones");

        novedadId = UUID.randomUUID();
        usuarioId = UUID.randomUUID();

        entityEjemplo = NovedadEntity.builder()
                .novedadId(novedadId)
                .usuarioId(usuarioId)
                .fechaHecho(LocalDate.of(2024, 3, 15))
                .horaInicio(LocalTime.of(8, 0))
                .horaFin(LocalTime.of(10, 0))
                .municipio("Popayán")
                .localidadEspecifica("Centro histórico")
                .categoria(CategoriaEvento.ENFRENTAMIENTO)
                .actores(new HashSet<>(List.of(Actor.ELN, Actor.FUERZA_PUBLICA)))
                .actor1(Actor.ELN)
                .actor2(Actor.FUERZA_PUBLICA)
                .descripcionHecho("Se registró un enfrentamiento")
                .nivelConfianza(NivelConfianza.CONFIRMADO)
                .nivelVisibilidad(NivelVisibilidad.PUBLICA)
                .oculto(false)
                .victimas(new HashSet<>())
                .evidencias(new HashSet<>())
                .build();

        respuestaEjemplo = NovedadDTORespuesta.builder()
                .novedadId(novedadId)
                .usuarioId(usuarioId)
                .municipio("Popayán")
                .categoria(CategoriaEvento.ENFRENTAMIENTO)
                .actores(List.of(Actor.ELN, Actor.FUERZA_PUBLICA))
                .nivelConfianza(NivelConfianza.CONFIRMADO)
                .nivelVisibilidad(NivelVisibilidad.PUBLICA)
                .build();

        peticionEjemplo = NovedadDTOPeticion.builder()
                .usuarioId(usuarioId)
                .fechaHecho(LocalDate.of(2024, 3, 15))
                .horaInicio(LocalTime.of(8, 0))
                .horaFin(LocalTime.of(10, 0))
                .municipio("Popayán")
                .localidadEspecifica("Centro histórico")
                .categoria(CategoriaEvento.ENFRENTAMIENTO)
                .actores(List.of(Actor.ELN, Actor.FUERZA_PUBLICA))
                .descripcionHecho("Se registró un enfrentamiento")
                .nivelConfianza(NivelConfianza.CONFIRMADO)
                .nivelVisibilidad(NivelVisibilidad.PUBLICA)
                .build();
    }

    // ===================== crearNovedad =====================

    @Test
    void crearNovedad_datosValidos_retornaDTO() throws Exception {
        when(mapper.toEntity(peticionEjemplo)).thenReturn(entityEjemplo);
        when(novedadRepository.save(entityEjemplo)).thenReturn(entityEjemplo);
        when(auditoriaRepository.save(any())).thenReturn(null);
        when(mapper.toDTO(entityEjemplo)).thenReturn(respuestaEjemplo);
        when(objectMapper.writeValueAsString(any())).thenReturn("{}");

        NovedadDTORespuesta resultado = novedadService.crearNovedad(peticionEjemplo);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getMunicipio()).isEqualTo("Popayán");
        verify(novedadRepository).save(entityEjemplo);
        verify(auditoriaRepository).save(any());
    }

    @Test
    void crearNovedad_sinActores_lanzaBadRequestException() {
        peticionEjemplo.setActores(null);

        assertThatThrownBy(() -> novedadService.crearNovedad(peticionEjemplo))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("actor");
    }

    @Test
    void crearNovedad_masde10Actores_lanzaBadRequestException() {
        List<Actor> actores = List.of(
                Actor.ELN, Actor.FUERZA_PUBLICA, Actor.COMUNIDAD_CIVIL, Actor.GUARDIA_INDIGENA,
                Actor.GRUPO_ARMADO_ORGANIZADO, Actor.NO_IDENTIFICADO, Actor.OTRO,
                Actor.SEGUNDA_MARQUETALIA, Actor.ELN, Actor.FUERZA_PUBLICA, Actor.COMUNIDAD_CIVIL
        );
        peticionEjemplo.setActores(actores);

        assertThatThrownBy(() -> novedadService.crearNovedad(peticionEjemplo))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("máximo 10");
    }

    @Test
    void crearNovedad_horaFinAnteriorAHoraInicio_lanzaBadRequestException() {
        peticionEjemplo.setHoraInicio(LocalTime.of(10, 0));
        peticionEjemplo.setHoraFin(LocalTime.of(8, 0));

        assertThatThrownBy(() -> novedadService.crearNovedad(peticionEjemplo))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("hora");
    }

    @Test
    void crearNovedad_fechaFutura_lanzaBadRequestException() {
        peticionEjemplo.setFechaHecho(LocalDate.now().plusDays(1));

        assertThatThrownBy(() -> novedadService.crearNovedad(peticionEjemplo))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("futura");
    }

    @Test
    void crearNovedad_muertosTotalesNegativos_lanzaBadRequestException() {
        AfectacionHumanaDTOPeticion afectacion = AfectacionHumanaDTOPeticion.builder()
                .muertosTotales(-1)
                .build();
        peticionEjemplo.setAfectacionHumana(afectacion);

        assertThatThrownBy(() -> novedadService.crearNovedad(peticionEjemplo))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("negativo");
    }

    @Test
    void crearNovedad_heridosTotalesNegativos_lanzaBadRequestException() {
        AfectacionHumanaDTOPeticion afectacion = AfectacionHumanaDTOPeticion.builder()
                .heridosTotales(-5)
                .build();
        peticionEjemplo.setAfectacionHumana(afectacion);

        assertThatThrownBy(() -> novedadService.crearNovedad(peticionEjemplo))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("negativo");
    }

    // ===================== obtenerPorId =====================

    @Test
    void obtenerPorId_novedadExistente_retornaDTO() {
        when(novedadRepository.findById(novedadId)).thenReturn(Optional.of(entityEjemplo));
        when(mapper.toDTO(entityEjemplo)).thenReturn(respuestaEjemplo);

        NovedadDTORespuesta resultado = novedadService.obtenerPorId(novedadId);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getNovedadId()).isEqualTo(novedadId);
        verify(novedadRepository).findById(novedadId);
    }

    @Test
    void obtenerPorId_novedadNoExistente_lanzaResourceNotFoundException() {
        UUID idInexistente = UUID.randomUUID();
        when(novedadRepository.findById(idInexistente)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> novedadService.obtenerPorId(idInexistente))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ===================== listarTodas =====================

    @Test
    void listarTodas_retornaListaCompleta() {
        when(novedadRepository.findAll()).thenReturn(List.of(entityEjemplo));
        when(mapper.toDTOList(any())).thenReturn(List.of(respuestaEjemplo));

        List<NovedadDTORespuesta> resultado = novedadService.listarTodas();

        assertThat(resultado).hasSize(1);
        verify(novedadRepository).findAll();
    }

    @Test
    void listarTodas_repositorioVacio_retornaListaVacia() {
        when(novedadRepository.findAll()).thenReturn(List.of());
        when(mapper.toDTOList(any())).thenReturn(List.of());

        List<NovedadDTORespuesta> resultado = novedadService.listarTodas();

        assertThat(resultado).isEmpty();
    }

    // ===================== listarTodasPaginado =====================

    @Test
    void listarTodasPaginado_retornaPagina() {
        PageRequest pageable = PageRequest.of(0, 10);
        Page<NovedadEntity> paginaEntity = new PageImpl<>(List.of(entityEjemplo), pageable, 1);
        when(novedadRepository.findAll(pageable)).thenReturn(paginaEntity);
        when(mapper.toDTO(entityEjemplo)).thenReturn(respuestaEjemplo);

        Page<NovedadDTORespuesta> resultado = novedadService.listarTodasPaginado(pageable);

        assertThat(resultado.getContent()).hasSize(1);
        assertThat(resultado.getTotalElements()).isEqualTo(1);
    }

    // ===================== listarPorUsuario =====================

    @Test
    void listarPorUsuario_retornaNovedadesDelUsuario() {
        when(novedadRepository.findByUsuarioId(usuarioId)).thenReturn(List.of(entityEjemplo));
        when(mapper.toDTOList(any())).thenReturn(List.of(respuestaEjemplo));

        List<NovedadDTORespuesta> resultado = novedadService.listarPorUsuario(usuarioId);

        assertThat(resultado).hasSize(1);
        verify(novedadRepository).findByUsuarioId(usuarioId);
    }

    // ===================== buscarConFiltros =====================

    @Test
    void buscarConFiltros_conFiltros_retornaResultados() {
        FiltroNovedadDTO filtro = FiltroNovedadDTO.builder()
                .fechaInicio(LocalDate.of(2024, 1, 1))
                .fechaFin(LocalDate.of(2024, 12, 31))
                .municipio("Popayán")
                .build();

        when(novedadRepository.buscarConFiltros(any(), any(), any(), any(), any()))
                .thenReturn(List.of(entityEjemplo));
        when(mapper.toDTOList(any())).thenReturn(List.of(respuestaEjemplo));

        List<NovedadDTORespuesta> resultado = novedadService.buscarConFiltros(filtro);

        assertThat(resultado).hasSize(1);
        verify(novedadRepository).buscarConFiltros(any(), any(), any(), any(), any());
    }

    // ===================== eliminarNovedad =====================

    @Test
    void eliminarNovedad_novedadExistente_marcaComoOculta() throws Exception {
        when(novedadRepository.findById(novedadId)).thenReturn(Optional.of(entityEjemplo));
        when(novedadRepository.save(any())).thenReturn(entityEjemplo);
        when(auditoriaRepository.save(any())).thenReturn(null);
        // Para DELETE: anterior=null y nuevo=null, entonces objectMapper no se invoca

        novedadService.eliminarNovedad(novedadId, usuarioId);

        assertThat(entityEjemplo.getOculto()).isTrue();
        verify(novedadRepository).save(entityEjemplo);
        verify(auditoriaRepository).save(any());
    }

    @Test
    void eliminarNovedad_novedadNoExistente_lanzaResourceNotFoundException() {
        when(novedadRepository.findById(novedadId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> novedadService.eliminarNovedad(novedadId, usuarioId))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(novedadRepository, never()).save(any());
    }

    // ===================== actualizarNovedad =====================

    @Test
    void actualizarNovedad_novedadExistente_retornaDTOActualizado() throws Exception {
        peticionEjemplo.setMunicipio("Santander de Quilichao");

        NovedadDTORespuesta respuestaActualizada = NovedadDTORespuesta.builder()
                .novedadId(novedadId)
                .municipio("Santander de Quilichao")
                .build();

        when(novedadRepository.findById(novedadId)).thenReturn(Optional.of(entityEjemplo));
        when(novedadRepository.save(any())).thenReturn(entityEjemplo);
        when(auditoriaRepository.save(any())).thenReturn(null);
        when(mapper.toDTO(any())).thenReturn(respuestaActualizada);
        when(objectMapper.writeValueAsString(any())).thenReturn("{}");

        NovedadDTORespuesta resultado = novedadService.actualizarNovedad(novedadId, peticionEjemplo);

        assertThat(resultado.getMunicipio()).isEqualTo("Santander de Quilichao");
        verify(novedadRepository).save(any());
        verify(auditoriaRepository).save(any());
    }

    @Test
    void actualizarNovedad_novedadNoExistente_lanzaResourceNotFoundException() {
        when(novedadRepository.findById(novedadId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> novedadService.actualizarNovedad(novedadId, peticionEjemplo))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
