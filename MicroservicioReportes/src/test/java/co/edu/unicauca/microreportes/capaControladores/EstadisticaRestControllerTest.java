package co.edu.unicauca.microreportes.capaControladores;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.Actor;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.CategoriaEvento;
import co.edu.unicauca.microreportes.config.RabbitMQConfig;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.*;
import co.edu.unicauca.microreportes.fachadaServices.services.IEstadisticaService;
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
        controllers = EstadisticaRestController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {RabbitMQConfig.class}
        )
)
@ActiveProfiles("test")
class EstadisticaRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IEstadisticaService estadisticaService;

    private static final String BASE_URL = "/api/v1/reportes/estadisticas";

    private ResumenKPIDTO resumenKPIEjemplo;
    private List<SerieTemporalDTO> serieTemporalEjemplo;
    private List<EstadisticaActorDTO> estadisticaActorEjemplo;
    private List<EstadisticaMunicipioDTO> mapaCalorEjemplo;
    private List<EstadisticaCategoriaDTO> estadisticaCategoriaEjemplo;
    private DashboardCompletoDTO dashboardEjemplo;

    @BeforeEach
    void setUp() {
        resumenKPIEjemplo = ResumenKPIDTO.builder()
                .anio(2024)
                .municipio("Popayán")
                .totalEventos(100L)
                .totalMuertos(20L)
                .totalHeridos(35L)
                .totalDesplazados(50L)
                .totalConfinados(10L)
                .filtrosAplicados(Map.of("anio", "2024", "municipio", "Popayán"))
                .build();

        serieTemporalEjemplo = List.of(
                SerieTemporalDTO.builder()
                        .anio(2024).mes(1).nombreMes("Ene")
                        .totalEventos(10L).totalMuertos(2L).totalHeridos(5L).totalDesplazados(3L)
                        .frecuenciaRelativa(40.0).frecuenciaAcumulada(10L).build(),
                SerieTemporalDTO.builder()
                        .anio(2024).mes(2).nombreMes("Feb")
                        .totalEventos(15L).totalMuertos(3L).totalHeridos(8L).totalDesplazados(4L)
                        .frecuenciaRelativa(60.0).frecuenciaAcumulada(25L).build()
        );

        estadisticaActorEjemplo = List.of(
                EstadisticaActorDTO.builder().actor(Actor.ELN).totalEventos(40L).build(),
                EstadisticaActorDTO.builder().actor(Actor.FUERZA_PUBLICA).totalEventos(30L).build()
        );

        mapaCalorEjemplo = List.of(
                EstadisticaMunicipioDTO.builder()
                        .municipio("Popayán").totalEventos(25L).totalMuertos(5L)
                        .totalHeridos(10L).totalDesplazados(15L).build()
        );

        estadisticaCategoriaEjemplo = List.of(
                EstadisticaCategoriaDTO.builder()
                        .categoria(CategoriaEvento.ENFRENTAMIENTO)
                        .totalEventos(50L).totalMuertos(10L).totalHeridos(20L).build()
        );

        dashboardEjemplo = DashboardCompletoDTO.builder()
                .filtrosAplicados(Map.of())
                .resumen(resumenKPIEjemplo)
                .historicoMensual(serieTemporalEjemplo)
                .incidentesPorActor(estadisticaActorEjemplo)
                .mapaCalor(mapaCalorEjemplo)
                .desgloseCategorias(estadisticaCategoriaEjemplo)
                .build();
    }

    // ===================== /dashboard =====================

    @Test
    void dashboard_sinParametros_retorna200ConDashboard() throws Exception {
        when(estadisticaService.obtenerDashboardCompleto(any(), any())).thenReturn(dashboardEjemplo);

        mockMvc.perform(get(BASE_URL + "/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resumen.totalEventos").value(100))
                .andExpect(jsonPath("$.historicoMensual", hasSize(2)))
                .andExpect(jsonPath("$.incidentesPorActor", hasSize(2)))
                .andExpect(jsonPath("$.mapaCalor", hasSize(1)))
                .andExpect(jsonPath("$.desgloseCategorias", hasSize(1)));

        verify(estadisticaService).obtenerDashboardCompleto(any(), any());
    }

    @Test
    void dashboard_conRolAdmin_retornaDatosConRolAdmin() throws Exception {
        when(estadisticaService.obtenerDashboardCompleto(any(), eq("ADMIN")))
                .thenReturn(dashboardEjemplo);

        mockMvc.perform(get(BASE_URL + "/dashboard")
                        .header("X-User-Role", "ADMIN"))
                .andExpect(status().isOk());

        verify(estadisticaService).obtenerDashboardCompleto(any(), eq("ADMIN"));
    }

    @Test
    void dashboard_conFiltrosMultiples_retornaDashboardFiltrado() throws Exception {
        when(estadisticaService.obtenerDashboardCompleto(any(), any())).thenReturn(dashboardEjemplo);

        mockMvc.perform(get(BASE_URL + "/dashboard")
                        .param("anio", "2024")
                        .param("mes", "3")
                        .param("municipio", "Popayán")
                        .param("categoria", "ENFRENTAMIENTO")
                        .param("actor", "ELN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resumen.anio").value(2024));
    }

    @Test
    void dashboard_rolDefaultEsVisitante() throws Exception {
        when(estadisticaService.obtenerDashboardCompleto(any(), eq("VISITANTE")))
                .thenReturn(dashboardEjemplo);

        mockMvc.perform(get(BASE_URL + "/dashboard"))
                .andExpect(status().isOk());

        verify(estadisticaService).obtenerDashboardCompleto(any(), eq("VISITANTE"));
    }

    // ===================== /resumen =====================

    @Test
    void resumen_sinParametros_retornaKPIs() throws Exception {
        when(estadisticaService.obtenerResumenKPI(any(), any())).thenReturn(resumenKPIEjemplo);

        mockMvc.perform(get(BASE_URL + "/resumen"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEventos").value(100))
                .andExpect(jsonPath("$.totalMuertos").value(20))
                .andExpect(jsonPath("$.totalHeridos").value(35))
                .andExpect(jsonPath("$.totalDesplazados").value(50))
                .andExpect(jsonPath("$.totalConfinados").value(10));

        verify(estadisticaService).obtenerResumenKPI(any(), any());
    }

    @Test
    void resumen_conFiltrosAplicados_presentes_enRespuesta() throws Exception {
        when(estadisticaService.obtenerResumenKPI(any(), any())).thenReturn(resumenKPIEjemplo);

        mockMvc.perform(get(BASE_URL + "/resumen")
                        .param("anio", "2024")
                        .param("municipio", "Popayán"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.filtrosAplicados").exists());
    }

    @Test
    void resumen_conRolOperador_retornaKPIs() throws Exception {
        when(estadisticaService.obtenerResumenKPI(any(), eq("OPERADOR")))
                .thenReturn(resumenKPIEjemplo);

        mockMvc.perform(get(BASE_URL + "/resumen")
                        .header("X-User-Role", "OPERADOR")
                        .param("anio", "2024"))
                .andExpect(status().isOk());
    }

    // ===================== /serie-temporal =====================

    @Test
    void serieTemporal_sinParametros_retornaLista() throws Exception {
        when(estadisticaService.obtenerSerieTemporal(any(), any())).thenReturn(serieTemporalEjemplo);

        mockMvc.perform(get(BASE_URL + "/serie-temporal"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].anio").value(2024))
                .andExpect(jsonPath("$[0].mes").value(1))
                .andExpect(jsonPath("$[0].nombreMes").value("Ene"))
                .andExpect(jsonPath("$[0].frecuenciaRelativa").value(40.0))
                .andExpect(jsonPath("$[0].frecuenciaAcumulada").value(10))
                .andExpect(jsonPath("$[1].mes").value(2));

        verify(estadisticaService).obtenerSerieTemporal(any(), any());
    }

    @Test
    void serieTemporal_conCategoria_delegaAlServicio() throws Exception {
        when(estadisticaService.obtenerSerieTemporal(any(), any())).thenReturn(serieTemporalEjemplo);

        mockMvc.perform(get(BASE_URL + "/serie-temporal")
                        .param("anio", "2024")
                        .param("categoria", "ENFRENTAMIENTO"))
                .andExpect(status().isOk());
    }

    @Test
    void serieTemporal_conActor_delegaAlServicio() throws Exception {
        when(estadisticaService.obtenerSerieTemporal(any(), any())).thenReturn(serieTemporalEjemplo);

        mockMvc.perform(get(BASE_URL + "/serie-temporal")
                        .param("actor", "ELN"))
                .andExpect(status().isOk());

        verify(estadisticaService).obtenerSerieTemporal(any(), any());
    }

    // ===================== /por-actor =====================

    @Test
    void porActor_sinParametros_retornaEstadisticasDeActores() throws Exception {
        when(estadisticaService.obtenerEstadisticasPorActor(any(), any()))
                .thenReturn(estadisticaActorEjemplo);

        mockMvc.perform(get(BASE_URL + "/por-actor"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].actor").value("ELN"))
                .andExpect(jsonPath("$[0].totalEventos").value(40));

        verify(estadisticaService).obtenerEstadisticasPorActor(any(), any());
    }

    @Test
    void porActor_conMesYCategoria_delegaAlServicio() throws Exception {
        when(estadisticaService.obtenerEstadisticasPorActor(any(), any()))
                .thenReturn(estadisticaActorEjemplo);

        mockMvc.perform(get(BASE_URL + "/por-actor")
                        .param("mes", "5")
                        .param("categoria", "HOMICIDIO"))
                .andExpect(status().isOk());

        verify(estadisticaService).obtenerEstadisticasPorActor(any(), any());
    }

    // ===================== /mapa-calor =====================

    @Test
    void mapaCalor_sinParametros_retornaMunicipios() throws Exception {
        when(estadisticaService.obtenerMapaCalor(any(), any())).thenReturn(mapaCalorEjemplo);

        mockMvc.perform(get(BASE_URL + "/mapa-calor"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].municipio").value("Popayán"))
                .andExpect(jsonPath("$[0].totalEventos").value(25));

        verify(estadisticaService).obtenerMapaCalor(any(), any());
    }

    @Test
    void mapaCalor_conAnioYCategoria_delegaAlServicio() throws Exception {
        when(estadisticaService.obtenerMapaCalor(any(), any())).thenReturn(mapaCalorEjemplo);

        mockMvc.perform(get(BASE_URL + "/mapa-calor")
                        .param("anio", "2024")
                        .param("categoria", "ENFRENTAMIENTO"))
                .andExpect(status().isOk());
    }

    // ===================== /por-categoria =====================

    @Test
    void porCategoria_sinParametros_retornaCategorias() throws Exception {
        when(estadisticaService.obtenerDesgloseCategorias(any(), any()))
                .thenReturn(estadisticaCategoriaEjemplo);

        mockMvc.perform(get(BASE_URL + "/por-categoria"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].categoria").value("ENFRENTAMIENTO"))
                .andExpect(jsonPath("$[0].totalEventos").value(50));

        verify(estadisticaService).obtenerDesgloseCategorias(any(), any());
    }

    @Test
    void porCategoria_conMes_delegaAlServicio() throws Exception {
        when(estadisticaService.obtenerDesgloseCategorias(any(), any()))
                .thenReturn(estadisticaCategoriaEjemplo);

        mockMvc.perform(get(BASE_URL + "/por-categoria")
                        .param("mes", "6")
                        .param("municipio", "Popayán"))
                .andExpect(status().isOk());
    }
}
