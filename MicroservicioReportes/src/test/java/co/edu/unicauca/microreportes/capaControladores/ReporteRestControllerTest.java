package co.edu.unicauca.microreportes.capaControladores;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.CategoriaEvento;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.NivelConfianza;
import co.edu.unicauca.microreportes.config.RabbitMQConfig;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.NovedadReporteDTO;
import co.edu.unicauca.microreportes.fachadaServices.services.IReporteService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = ReporteRestController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {RabbitMQConfig.class}
        )
)
@ActiveProfiles("test")
class ReporteRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IReporteService reporteService;

    private static final String BASE_URL = "/api/v1/reportes/documentos";

    private NovedadReporteDTO novedadReporteEjemplo;
    private List<NovedadReporteDTO> listaReporteEjemplo;

    @BeforeEach
    void setUp() {
        novedadReporteEjemplo = NovedadReporteDTO.builder()
                .novedadId(UUID.randomUUID())
                .fechaHecho(LocalDate.of(2024, 3, 15))
                .municipio("Popayán")
                .localidadEspecifica("Centro histórico")
                .categoria(CategoriaEvento.ENFRENTAMIENTO)
                .actoresDisplay("ELN / FUERZA_PUBLICA")
                .nivelConfianza(NivelConfianza.CONFIRMADO)
                .muertosTotales(2)
                .muertosCiviles(1)
                .muertosFuerzaPublica(1)
                .heridosTotales(5)
                .heridosCiviles(3)
                .desplazadosTotales(10)
                .confinadosTotales(0)
                .descripcionHecho("Enfrentamiento entre grupos armados")
                .build();

        listaReporteEjemplo = List.of(novedadReporteEjemplo);
    }

    // ===================== /previsualizar =====================

    @Test
    void previsualizar_sinParametros_retornaLista() throws Exception {
        when(reporteService.previsualizarReporte(any(), any())).thenReturn(listaReporteEjemplo);

        mockMvc.perform(get(BASE_URL + "/previsualizar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].municipio").value("Popayán"))
                .andExpect(jsonPath("$[0].categoria").value("ENFRENTAMIENTO"));

        verify(reporteService).previsualizarReporte(any(), any());
    }

    @Test
    void previsualizar_conFiltros_delegaAlServicio() throws Exception {
        when(reporteService.previsualizarReporte(any(), any())).thenReturn(listaReporteEjemplo);

        mockMvc.perform(get(BASE_URL + "/previsualizar")
                        .param("anio", "2024")
                        .param("municipio", "Popayán")
                        .param("categoria", "ENFRENTAMIENTO"))
                .andExpect(status().isOk());
    }

    @Test
    void previsualizar_conRolAdmin_delegaRol() throws Exception {
        when(reporteService.previsualizarReporte(any(), eq("ADMIN")))
                .thenReturn(listaReporteEjemplo);

        mockMvc.perform(get(BASE_URL + "/previsualizar")
                        .header("X-User-Role", "ADMIN"))
                .andExpect(status().isOk());

        verify(reporteService).previsualizarReporte(any(), eq("ADMIN"));
    }

    @Test
    void previsualizar_sinNovedades_retornaListaVacia() throws Exception {
        when(reporteService.previsualizarReporte(any(), any())).thenReturn(List.of());

        mockMvc.perform(get(BASE_URL + "/previsualizar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void previsualizar_rolDefaultEsVisitante() throws Exception {
        when(reporteService.previsualizarReporte(any(), eq("VISITANTE")))
                .thenReturn(listaReporteEjemplo);

        mockMvc.perform(get(BASE_URL + "/previsualizar"))
                .andExpect(status().isOk());

        verify(reporteService).previsualizarReporte(any(), eq("VISITANTE"));
    }

    // ===================== /descargar =====================

    @Test
    void descargar_sinParametros_retornaArchivoExcel() throws Exception {
        byte[] excelBytes = new byte[]{1, 2, 3, 4, 5};
        when(reporteService.generarReporteExcel(any(), any())).thenReturn(excelBytes);

        mockMvc.perform(get(BASE_URL + "/descargar"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE,
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                        containsString("attachment")))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                        containsString(".xlsx")))
                .andExpect(content().bytes(excelBytes));

        verify(reporteService).generarReporteExcel(any(), any());
    }

    @Test
    void descargar_conMunicipio_incluirMunicipioEnNombreArchivo() throws Exception {
        byte[] excelBytes = new byte[]{1, 2, 3};
        when(reporteService.generarReporteExcel(any(), any())).thenReturn(excelBytes);

        mockMvc.perform(get(BASE_URL + "/descargar")
                        .param("municipio", "Popayan"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                        containsString("popayan")));
    }

    @Test
    void descargar_conTodosLosFiltros_delegaAlServicio() throws Exception {
        byte[] excelBytes = new byte[]{1, 2, 3};
        when(reporteService.generarReporteExcel(any(), any())).thenReturn(excelBytes);

        mockMvc.perform(get(BASE_URL + "/descargar")
                        .param("fechaInicio", "2024-01-01")
                        .param("fechaFin", "2024-12-31")
                        .param("municipio", "Popayan")
                        .param("categoria", "ENFRENTAMIENTO")
                        .param("nivelConfianza", "CONFIRMADO")
                        .header("X-User-Role", "ADMIN"))
                .andExpect(status().isOk());

        verify(reporteService).generarReporteExcel(any(), eq("ADMIN"));
    }

    @Test
    void descargar_sinMunicipio_nombreArchivoConCauca() throws Exception {
        byte[] excelBytes = new byte[]{1};
        when(reporteService.generarReporteExcel(any(), any())).thenReturn(excelBytes);

        mockMvc.perform(get(BASE_URL + "/descargar"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                        containsString("cauca")));
    }
}
