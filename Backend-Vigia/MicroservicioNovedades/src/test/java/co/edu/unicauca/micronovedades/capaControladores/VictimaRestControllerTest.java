package co.edu.unicauca.micronovedades.capaControladores;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.GeneroVictima;
import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.GrupoPoblacional;
import co.edu.unicauca.micronovedades.capaControladores.controladorExcepciones.ResourceNotFoundException;
import co.edu.unicauca.micronovedades.config.RabbitMQConfig;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion.VictimaDTOPeticion;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta.VictimaDTORespuesta;
import co.edu.unicauca.micronovedades.fachadaServices.services.IVictimaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = VictimaRestController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {RabbitMQConfig.class}
        )
)
@ActiveProfiles("test")
class VictimaRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IVictimaService victimaService;

    private UUID novedadId;
    private UUID victimaId;
    private VictimaDTORespuesta respuestaEjemplo;
    private VictimaDTOPeticion peticionEjemplo;

    private static final String BASE_URL = "/api/v1/microNovedades/novedades/{novedadId}/victimas";

    @BeforeEach
    void setUp() {
        objectMapper.registerModule(new JavaTimeModule());

        novedadId = UUID.randomUUID();
        victimaId = UUID.randomUUID();

        respuestaEjemplo = VictimaDTORespuesta.builder()
                .victimaId(victimaId)
                .nombreVictima("Juan Pérez")
                .generoVictima(GeneroVictima.MASCULINO)
                .edadVictima(35)
                .grupoPoblacional(GrupoPoblacional.ADULTO)
                .ocupacionVictima("Agricultor")
                .build();

        peticionEjemplo = VictimaDTOPeticion.builder()
                .nombreVictima("Juan Pérez")
                .generoVictima(GeneroVictima.MASCULINO)
                .edadVictima(35)
                .grupoPoblacional(GrupoPoblacional.ADULTO)
                .ocupacionVictima("Agricultor")
                .build();
    }

    @Test
    void agregar_datosValidos_retorna201() throws Exception {
        when(victimaService.agregarVictima(eq(novedadId), any())).thenReturn(respuestaEjemplo);

        mockMvc.perform(post(BASE_URL, novedadId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticionEjemplo)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.victimaId").value(victimaId.toString()))
                .andExpect(jsonPath("$.nombreVictima").value("Juan Pérez"))
                .andExpect(jsonPath("$.generoVictima").value("MASCULINO"));

        verify(victimaService).agregarVictima(eq(novedadId), any());
    }

    @Test
    void agregar_sinNombre_retorna400() throws Exception {
        peticionEjemplo.setNombreVictima(null);

        mockMvc.perform(post(BASE_URL, novedadId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticionEjemplo)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void agregar_novedadNoExistente_retorna404() throws Exception {
        when(victimaService.agregarVictima(eq(novedadId), any()))
                .thenThrow(new ResourceNotFoundException("Novedad", novedadId));

        mockMvc.perform(post(BASE_URL, novedadId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticionEjemplo)))
                .andExpect(status().isNotFound());
    }

    @Test
    void listar_retornaVictimasDeLaNovedad() throws Exception {
        when(victimaService.listarPorNovedad(novedadId)).thenReturn(List.of(respuestaEjemplo));

        mockMvc.perform(get(BASE_URL, novedadId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nombreVictima").value("Juan Pérez"));

        verify(victimaService).listarPorNovedad(novedadId);
    }

    @Test
    void listar_novedadSinVictimas_retornaListaVacia() throws Exception {
        when(victimaService.listarPorNovedad(novedadId)).thenReturn(List.of());

        mockMvc.perform(get(BASE_URL, novedadId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void eliminar_victimaExistente_retorna204() throws Exception {
        doNothing().when(victimaService).eliminarVictima(novedadId, victimaId);

        mockMvc.perform(delete(BASE_URL + "/{victimaId}", novedadId, victimaId))
                .andExpect(status().isNoContent());

        verify(victimaService).eliminarVictima(novedadId, victimaId);
    }

    @Test
    void eliminar_victimaNoExistente_retorna404() throws Exception {
        doThrow(new ResourceNotFoundException("Víctima", victimaId))
                .when(victimaService).eliminarVictima(novedadId, victimaId);

        mockMvc.perform(delete(BASE_URL + "/{victimaId}", novedadId, victimaId))
                .andExpect(status().isNotFound());
    }
}
