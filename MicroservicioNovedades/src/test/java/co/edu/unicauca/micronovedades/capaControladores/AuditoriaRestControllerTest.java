package co.edu.unicauca.micronovedades.capaControladores;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.AccionAuditoria;
import co.edu.unicauca.micronovedades.config.RabbitMQConfig;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta.AuditoriaNovedadDTORespuesta;
import co.edu.unicauca.micronovedades.fachadaServices.services.IAuditoriaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = AuditoriaRestController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {RabbitMQConfig.class}
        )
)
@ActiveProfiles("test")
class AuditoriaRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IAuditoriaService auditoriaService;

    private UUID novedadId;
    private UUID usuarioId;
    private AuditoriaNovedadDTORespuesta auditoriaEjemplo;

    private static final String BASE_URL = "/api/v1/microNovedades/auditorias";

    @BeforeEach
    void setUp() {
        novedadId = UUID.randomUUID();
        usuarioId = UUID.randomUUID();

        auditoriaEjemplo = AuditoriaNovedadDTORespuesta.builder()
                .auditoriaId(UUID.randomUUID())
                .novedadId(novedadId)
                .usuarioId(usuarioId)
                .accion(AccionAuditoria.CREATE)
                .datosAnteriores(null)
                .datosNuevos("{\"municipio\":\"Popayán\"}")
                .cambios("Novedad creada")
                .fecha(LocalDateTime.of(2024, 3, 15, 10, 0))
                .build();
    }

    @Test
    void historialNovedad_conRegistros_retornaLista() throws Exception {
        when(auditoriaService.obtenerHistorialNovedad(novedadId))
                .thenReturn(List.of(auditoriaEjemplo));

        mockMvc.perform(get(BASE_URL + "/novedad/{novedadId}", novedadId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].novedadId").value(novedadId.toString()))
                .andExpect(jsonPath("$[0].accion").value("CREATE"));

        verify(auditoriaService).obtenerHistorialNovedad(novedadId);
    }

    @Test
    void historialNovedad_sinRegistros_retornaListaVacia() throws Exception {
        when(auditoriaService.obtenerHistorialNovedad(novedadId)).thenReturn(List.of());

        mockMvc.perform(get(BASE_URL + "/novedad/{novedadId}", novedadId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void historialNovedad_variosRegistros_retornaOrdenadoPorFecha() throws Exception {
        AuditoriaNovedadDTORespuesta auditoria2 = AuditoriaNovedadDTORespuesta.builder()
                .auditoriaId(UUID.randomUUID())
                .novedadId(novedadId)
                .usuarioId(usuarioId)
                .accion(AccionAuditoria.UPDATE)
                .fecha(LocalDateTime.of(2024, 3, 16, 11, 0))
                .build();

        when(auditoriaService.obtenerHistorialNovedad(novedadId))
                .thenReturn(List.of(auditoria2, auditoriaEjemplo));

        mockMvc.perform(get(BASE_URL + "/novedad/{novedadId}", novedadId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].accion").value("UPDATE"))
                .andExpect(jsonPath("$[1].accion").value("CREATE"));
    }

    @Test
    void historialUsuario_conRegistros_retornaLista() throws Exception {
        AuditoriaNovedadDTORespuesta auditoriaUpdate = AuditoriaNovedadDTORespuesta.builder()
                .auditoriaId(UUID.randomUUID())
                .novedadId(UUID.randomUUID())
                .usuarioId(usuarioId)
                .accion(AccionAuditoria.UPDATE)
                .fecha(LocalDateTime.of(2024, 3, 16, 11, 0))
                .build();

        when(auditoriaService.obtenerHistorialPorUsuario(usuarioId))
                .thenReturn(List.of(auditoriaUpdate, auditoriaEjemplo));

        mockMvc.perform(get(BASE_URL + "/usuario/{usuarioId}", usuarioId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].usuarioId").value(usuarioId.toString()));

        verify(auditoriaService).obtenerHistorialPorUsuario(usuarioId);
    }

    @Test
    void historialUsuario_sinRegistros_retornaListaVacia() throws Exception {
        when(auditoriaService.obtenerHistorialPorUsuario(usuarioId)).thenReturn(List.of());

        mockMvc.perform(get(BASE_URL + "/usuario/{usuarioId}", usuarioId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
