package co.edu.unicauca.micronovedades.capaControladores;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.*;
import co.edu.unicauca.micronovedades.capaControladores.controladorExcepciones.ResourceNotFoundException;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion.NovedadDTOPeticion;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta.NovedadDTORespuesta;
import co.edu.unicauca.micronovedades.fachadaServices.services.INovedadService;
import co.edu.unicauca.micronovedades.fachadaServices.services.impl.EvidenciaStorageService;
import co.edu.unicauca.micronovedades.fachadaServices.services.impl.ExcelNovedadService;
import co.edu.unicauca.micronovedades.config.RabbitMQConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = NovedadRestController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {RabbitMQConfig.class}
        )
)
@ActiveProfiles("test")
class NovedadRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private INovedadService novedadService;

    @MockBean
    private ExcelNovedadService excelNovedadService;

    @MockBean
    private EvidenciaStorageService evidenciaStorageService;

    private static final String BASE_URL = "/api/v1/microNovedades/novedades";

    private UUID novedadId;
    private UUID usuarioId;
    private NovedadDTORespuesta respuestaEjemplo;
    private NovedadDTOPeticion peticionEjemplo;

    @BeforeEach
    void setUp() {
        objectMapper.registerModule(new JavaTimeModule());

        novedadId = UUID.randomUUID();
        usuarioId = UUID.randomUUID();

        respuestaEjemplo = NovedadDTORespuesta.builder()
                .novedadId(novedadId)
                .usuarioId(usuarioId)
                .fechaHecho(LocalDate.of(2024, 3, 15))
                .horaInicio(LocalTime.of(8, 0))
                .horaFin(LocalTime.of(10, 0))
                .municipio("Popayán")
                .localidadEspecifica("Centro histórico")
                .categoria(CategoriaEvento.ENFRENTAMIENTO)
                .actores(List.of(Actor.ELN, Actor.FUERZA_PUBLICA))
                .descripcionHecho("Se registró un enfrentamiento en el área")
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
                .descripcionHecho("Se registró un enfrentamiento en el área")
                .nivelConfianza(NivelConfianza.CONFIRMADO)
                .nivelVisibilidad(NivelVisibilidad.PUBLICA)
                .build();
    }

    @Test
    void crear_conJsonValido_retorna201() throws Exception {
        when(novedadService.crearNovedad(any())).thenReturn(respuestaEjemplo);

        mockMvc.perform(post(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticionEjemplo)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.novedadId").value(novedadId.toString()))
                .andExpect(jsonPath("$.municipio").value("Popayán"))
                .andExpect(jsonPath("$.categoria").value("ENFRENTAMIENTO"));

        verify(novedadService).crearNovedad(any());
    }

    @Test
    void crear_sinActores_retorna400() throws Exception {
        peticionEjemplo.setActores(null);

        mockMvc.perform(post(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticionEjemplo)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void crear_sinMunicipio_retorna400() throws Exception {
        peticionEjemplo.setMunicipio(null);

        mockMvc.perform(post(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticionEjemplo)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void obtenerPorId_novedadExistente_retorna200() throws Exception {
        when(novedadService.obtenerPorId(novedadId)).thenReturn(respuestaEjemplo);

        mockMvc.perform(get(BASE_URL + "/{id}", novedadId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.novedadId").value(novedadId.toString()))
                .andExpect(jsonPath("$.municipio").value("Popayán"));

        verify(novedadService).obtenerPorId(novedadId);
    }

    @Test
    void obtenerPorId_novedadNoExistente_retorna404() throws Exception {
        UUID idInexistente = UUID.randomUUID();
        when(novedadService.obtenerPorId(idInexistente))
                .thenThrow(new ResourceNotFoundException("Novedad", idInexistente));

        mockMvc.perform(get(BASE_URL + "/{id}", idInexistente))
                .andExpect(status().isNotFound());
    }

    @Test
    void listarTodas_retornaLista() throws Exception {
        when(novedadService.listarTodas()).thenReturn(List.of(respuestaEjemplo));

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].municipio").value("Popayán"));

        verify(novedadService).listarTodas();
    }

    @Test
    void listarTodas_listaVacia_retornaListaVacia() throws Exception {
        when(novedadService.listarTodas()).thenReturn(List.of());

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void listarPaginado_retornaPagina() throws Exception {
        Page<NovedadDTORespuesta> page = new PageImpl<>(List.of(respuestaEjemplo));
        when(novedadService.listarTodasPaginado(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get(BASE_URL + "/paginado").param("page", "0").param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].municipio").value("Popayán"));
    }

    @Test
    void listarPorUsuario_retornaLista() throws Exception {
        when(novedadService.listarPorUsuario(usuarioId)).thenReturn(List.of(respuestaEjemplo));

        mockMvc.perform(get(BASE_URL + "/usuario/{usuarioId}", usuarioId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].novedadId").value(novedadId.toString()));

        verify(novedadService).listarPorUsuario(usuarioId);
    }

    @Test
    void buscarConFiltros_conFechas_retornaLista() throws Exception {
        when(novedadService.buscarConFiltros(any())).thenReturn(List.of(respuestaEjemplo));

        mockMvc.perform(get(BASE_URL + "/filtrar")
                        .param("fechaInicio", "2024-01-01")
                        .param("fechaFin", "2024-12-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        verify(novedadService).buscarConFiltros(any());
    }

    @Test
    void buscarConFiltros_conTodosLosParametros_retornaLista() throws Exception {
        when(novedadService.buscarConFiltros(any())).thenReturn(List.of(respuestaEjemplo));

        mockMvc.perform(get(BASE_URL + "/filtrar")
                        .param("fechaInicio", "2024-01-01")
                        .param("fechaFin", "2024-12-31")
                        .param("municipio", "Popayán")
                        .param("categoria", "ENFRENTAMIENTO")
                        .param("nivelVisibilidad", "PUBLICA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void actualizar_novedadExistente_retorna200() throws Exception {
        NovedadDTORespuesta actualizada = NovedadDTORespuesta.builder()
                .novedadId(novedadId)
                .municipio("Santander de Quilichao")
                .categoria(CategoriaEvento.HOSTIGAMIENTO)
                .actores(List.of(Actor.ELN))
                .nivelConfianza(NivelConfianza.PRELIMINAR)
                .nivelVisibilidad(NivelVisibilidad.PUBLICA)
                .build();

        when(novedadService.actualizarNovedad(eq(novedadId), any())).thenReturn(actualizada);

        peticionEjemplo.setMunicipio("Santander de Quilichao");

        mockMvc.perform(put(BASE_URL + "/{id}", novedadId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticionEjemplo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.municipio").value("Santander de Quilichao"));

        verify(novedadService).actualizarNovedad(eq(novedadId), any());
    }

    @Test
    void eliminar_novedadExistente_retorna204() throws Exception {
        doNothing().when(novedadService).eliminarNovedad(novedadId, usuarioId);

        mockMvc.perform(delete(BASE_URL + "/{id}", novedadId)
                        .param("usuarioId", usuarioId.toString()))
                .andExpect(status().isNoContent());

        verify(novedadService).eliminarNovedad(novedadId, usuarioId);
    }

    @Test
    void eliminar_novedadNoExistente_retorna404() throws Exception {
        doThrow(new ResourceNotFoundException("Novedad", novedadId))
                .when(novedadService).eliminarNovedad(novedadId, usuarioId);

        mockMvc.perform(delete(BASE_URL + "/{id}", novedadId)
                        .param("usuarioId", usuarioId.toString()))
                .andExpect(status().isNotFound());
    }

    @Test
    void descargarPlantilla_retornaArchivoExcel() throws Exception {
        byte[] plantilla = new byte[]{1, 2, 3, 4};
        when(excelNovedadService.generarPlantillaExcel()).thenReturn(plantilla);

        mockMvc.perform(get(BASE_URL + "/plantilla-excel"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .andExpect(header().string("Content-Disposition",
                        containsString("plantilla_novedades.xlsx")));

        verify(excelNovedadService).generarPlantillaExcel();
    }

    @Test
    void cargarDesdeExcel_archivoValido_retornaResultados() throws Exception {
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("totalFilasProcesadas", 5);
        resultado.put("novedadesCreadas", 4);
        resultado.put("errores", 1);

        when(excelNovedadService.cargarDesdeExcel(any(), eq(usuarioId))).thenReturn(resultado);

        MockMultipartFile archivo = new MockMultipartFile(
                "archivo", "novedades.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                new byte[]{1, 2, 3});

        mockMvc.perform(multipart(BASE_URL + "/carga-excel")
                        .file(archivo)
                        .param("usuarioId", usuarioId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalFilasProcesadas").value(5))
                .andExpect(jsonPath("$.novedadesCreadas").value(4));

        verify(excelNovedadService).cargarDesdeExcel(any(), eq(usuarioId));
    }
}
