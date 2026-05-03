package co.edu.unicauca.microreportes.capaControladores;

import co.edu.unicauca.microreportes.config.RabbitMQConfig;
import co.edu.unicauca.microreportes.fachadaServices.services.SseService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = SseController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {RabbitMQConfig.class}
        )
)
@ActiveProfiles("test")
class SseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SseService sseService;

    private static final String BASE_URL = "/api/v1/reportes/sse";

    @Test
    void status_retornaConexionesActivasYEstadoOK() throws Exception {
        when(sseService.conexionesActivas()).thenReturn(3);

        mockMvc.perform(get(BASE_URL + "/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.conexionesActivas", is(3)))
                .andExpect(jsonPath("$.status", is("OK")));

        verify(sseService).conexionesActivas();
    }

    @Test
    void status_sinConexiones_retornaCero() throws Exception {
        when(sseService.conexionesActivas()).thenReturn(0);

        mockMvc.perform(get(BASE_URL + "/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.conexionesActivas", is(0)))
                .andExpect(jsonPath("$.status", is("OK")));
    }

    @Test
    void stream_canalDefault_invocaSuscribirConCanalDashboard() throws Exception {
        SseEmitter emitter = new SseEmitter();
        when(sseService.suscribir("dashboard")).thenReturn(emitter);

        mockMvc.perform(get(BASE_URL + "/stream")
                        .accept(MediaType.TEXT_EVENT_STREAM))
                .andExpect(status().isOk());

        verify(sseService).suscribir("dashboard");
    }

    @Test
    void stream_canalPersonalizado_invocaSuscribirConCanalCorrecto() throws Exception {
        String canal = "dashboard:Popayan";
        SseEmitter emitter = new SseEmitter();
        when(sseService.suscribir(canal)).thenReturn(emitter);

        mockMvc.perform(get(BASE_URL + "/stream")
                        .param("canal", canal)
                        .accept(MediaType.TEXT_EVENT_STREAM))
                .andExpect(status().isOk());

        verify(sseService).suscribir(canal);
    }
}
