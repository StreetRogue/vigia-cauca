package co.edu.unicauca.microreportes.capaControladores;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.*;
import co.edu.unicauca.microreportes.config.RabbitMQConfig;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.*;
import co.edu.unicauca.microreportes.fachadaServices.services.IVictimaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = VictimaRestController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = { RabbitMQConfig.class }
        )
)
@ActiveProfiles("test")
class VictimaRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IVictimaService victimaService;

    private static final String BASE_URL = "/api/v1/reportes/estadisticas/victimas";

    private EstadisticasVictimasDTO estadisticasEjemplo;

    @BeforeEach
    void setUp() {
        estadisticasEjemplo = EstadisticasVictimasDTO.builder()
                .filtrosAplicados(Map.of())
                .totalVictimas(150L)
                .porGenero(List.of(
                        DistribucionGeneroDTO.builder()
                                .genero(Genero.MASCULINO)
                                .frecuenciaAbsoluta(110L).frecuenciaRelativa(73.33).frecuenciaAcumulada(110L).build(),
                        DistribucionGeneroDTO.builder()
                                .genero(Genero.NO_ESPECIFICADO)
                                .frecuenciaAbsoluta(40L).frecuenciaRelativa(26.67).frecuenciaAcumulada(150L).build()
                ))
                .porRangoEdad(List.of(
                        DistribucionRangoEdadDTO.builder()
                                .rangoEdad(RangoEdad.DE_20_A_39).etiqueta("20 - 39")
                                .frecuenciaAbsoluta(80L).frecuenciaRelativa(53.33).frecuenciaAcumulada(80L).build()
                ))
                .porGrupoPoblacional(List.of(
                        DistribucionGrupoPoblacionalDTO.builder()
                                .grupoPoblacional(GrupoPoblacional.ADULTO)
                                .frecuenciaAbsoluta(90L).frecuenciaRelativa(60.0).frecuenciaAcumulada(90L).build()
                ))
                .build();
    }

    // ─── GET sin filtros ──────────────────────────────────────────────────────

    @Test
    void get_sinFiltros_retorna200ConEstadisticas() throws Exception {
        when(victimaService.obtenerEstadisticas(any(), any())).thenReturn(estadisticasEjemplo);

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalVictimas").value(150))
                .andExpect(jsonPath("$.porGenero", hasSize(2)))
                .andExpect(jsonPath("$.porRangoEdad", hasSize(1)))
                .andExpect(jsonPath("$.porGrupoPoblacional", hasSize(1)));
    }

    // ─── NO debe tener campo porTipoVictima ──────────────────────────────────

    @Test
    void get_respuesta_noContienePorTipoVictima() throws Exception {
        when(victimaService.obtenerEstadisticas(any(), any())).thenReturn(estadisticasEjemplo);

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.porTipoVictima").doesNotExist());
    }

    // ─── GET con rol ADMIN ────────────────────────────────────────────────────

    @Test
    void get_conRolAdmin_delegaRolAlServicio() throws Exception {
        when(victimaService.obtenerEstadisticas(any(), eq("ADMIN"))).thenReturn(estadisticasEjemplo);

        mockMvc.perform(get(BASE_URL).header("X-User-Role", "ADMIN"))
                .andExpect(status().isOk());

        verify(victimaService).obtenerEstadisticas(any(), eq("ADMIN"));
    }

    // ─── GET con rol VISITANTE (default) ─────────────────────────────────────

    @Test
    void get_sinHeader_usaRolVisitante() throws Exception {
        when(victimaService.obtenerEstadisticas(any(), eq("VISITANTE"))).thenReturn(estadisticasEjemplo);

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk());

        verify(victimaService).obtenerEstadisticas(any(), eq("VISITANTE"));
    }

    // ─── GET con filtros de contexto ─────────────────────────────────────────

    @Test
    void get_conFiltroAnioYMunicipio_retornaEstadisticas() throws Exception {
        when(victimaService.obtenerEstadisticas(any(), any())).thenReturn(estadisticasEjemplo);

        mockMvc.perform(get(BASE_URL)
                        .param("anio", "2024")
                        .param("municipio", "Toribío"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalVictimas").value(150));
    }

    // ─── GET con filtros demográficos ─────────────────────────────────────────

    @Test
    void get_conFiltroGenero_retorna200() throws Exception {
        when(victimaService.obtenerEstadisticas(any(), any())).thenReturn(estadisticasEjemplo);

        mockMvc.perform(get(BASE_URL).param("genero", "FEMENINO"))
                .andExpect(status().isOk());
    }

    @Test
    void get_conFiltroGrupoPoblacional_retorna200() throws Exception {
        when(victimaService.obtenerEstadisticas(any(), any())).thenReturn(estadisticasEjemplo);

        mockMvc.perform(get(BASE_URL).param("grupoPoblacional", "INDIGENA"))
                .andExpect(status().isOk());
    }

    // ─── estructura JSON ─────────────────────────────────────────────────────

    @Test
    void get_respuestaIncluye_frecuenciaRelativaYAcumulada() throws Exception {
        when(victimaService.obtenerEstadisticas(any(), any())).thenReturn(estadisticasEjemplo);

        mockMvc.perform(get(BASE_URL))
                .andExpect(jsonPath("$.porGenero[0].frecuenciaRelativa").value(73.33))
                .andExpect(jsonPath("$.porGenero[0].frecuenciaAcumulada").value(110))
                .andExpect(jsonPath("$.porGenero[1].frecuenciaAcumulada").value(150))
                .andExpect(jsonPath("$.porRangoEdad[0].etiqueta").value("20 - 39"));
    }

    @Test
    void get_respuestaIncluye_filtrosAplicados() throws Exception {
        EstadisticasVictimasDTO conFiltros = EstadisticasVictimasDTO.builder()
                .filtrosAplicados(Map.of("anio", "2024", "grupoPoblacional", "INDIGENA"))
                .totalVictimas(25L)
                .porGenero(List.of()).porRangoEdad(List.of()).porGrupoPoblacional(List.of())
                .build();

        when(victimaService.obtenerEstadisticas(any(), any())).thenReturn(conFiltros);

        mockMvc.perform(get(BASE_URL)
                        .param("anio", "2024")
                        .param("grupoPoblacional", "INDIGENA"))
                .andExpect(jsonPath("$.filtrosAplicados.anio").value("2024"))
                .andExpect(jsonPath("$.filtrosAplicados.grupoPoblacional").value("INDIGENA"));
    }
}
