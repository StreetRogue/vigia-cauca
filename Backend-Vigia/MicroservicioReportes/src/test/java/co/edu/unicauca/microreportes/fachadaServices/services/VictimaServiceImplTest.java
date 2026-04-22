package co.edu.unicauca.microreportes.fachadaServices.services;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.*;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.VictimaSnapshotRepository;
import co.edu.unicauca.microreportes.fachadaServices.DTO.peticion.FiltroEstadisticaDTO;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.*;
import co.edu.unicauca.microreportes.fachadaServices.mapper.VisibilidadHelper;
import co.edu.unicauca.microreportes.fachadaServices.services.impl.VictimaServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VictimaServiceImplTest {

    @Mock
    private VictimaSnapshotRepository victimaRepository;

    @Mock
    private VisibilidadHelper visibilidadHelper;

    @InjectMocks
    private VictimaServiceImpl victimaService;

    private static final List<NivelVisibilidad> TODAS =
            List.of(NivelVisibilidad.PUBLICA, NivelVisibilidad.PRIVADA);
    private static final List<NivelVisibilidad> PUBLICA =
            List.of(NivelVisibilidad.PUBLICA);

    private List<Object[]> listaDeRows(Object[]... filas) {
        List<Object[]> lista = new ArrayList<>();
        for (Object[] fila : filas) lista.add(fila);
        return lista;
    }

    @BeforeEach
    void setUp() {
        when(visibilidadHelper.visibilidadesPorRol("ADMIN")).thenReturn(TODAS);
        when(visibilidadHelper.visibilidadesPorRol("VISITANTE")).thenReturn(PUBLICA);
    }

    // ─── total de víctimas ─────────────────────────────────────────────────────

    @Test
    void obtenerEstadisticas_sinFiltros_devuelveTotalCorrecto() {
        FiltroEstadisticaDTO filtro = FiltroEstadisticaDTO.builder().build();

        when(victimaRepository.contarTotal(isNull(), isNull(), isNull(), isNull(), isNull(), isNull(), anyList()))
                .thenReturn(150L);
        stubDistribuciones();

        EstadisticasVictimasDTO resultado = victimaService.obtenerEstadisticas(filtro, "ADMIN");

        assertThat(resultado.getTotalVictimas()).isEqualTo(150L);
        assertThat(resultado.getFiltrosAplicados()).isEmpty();
    }

    @Test
    void obtenerEstadisticas_conFiltroAnio_propagaFiltroAlRepositorio() {
        FiltroEstadisticaDTO filtro = FiltroEstadisticaDTO.builder().anio(2024).build();

        when(victimaRepository.contarTotal(eq(2024), isNull(), isNull(), isNull(), isNull(), isNull(), anyList()))
                .thenReturn(80L);
        stubDistribuciones();

        EstadisticasVictimasDTO resultado = victimaService.obtenerEstadisticas(filtro, "ADMIN");

        assertThat(resultado.getTotalVictimas()).isEqualTo(80L);
        assertThat(resultado.getFiltrosAplicados()).containsEntry("anio", "2024");
    }

    // ─── sin resultados ────────────────────────────────────────────────────────

    @Test
    void obtenerEstadisticas_sinVictimas_devuelveCeroYListasVacias() {
        FiltroEstadisticaDTO filtro = FiltroEstadisticaDTO.builder().anio(2099).build();

        when(victimaRepository.contarTotal(any(), any(), any(), any(), any(), any(), anyList()))
                .thenReturn(0L);
        when(victimaRepository.distribucionPorGenero(any(), any(), any(), any(), any(), anyList()))
                .thenReturn(List.of());
        when(victimaRepository.distribucionPorRangoEdad(any(), any(), any(), any(), any(), any(), anyList()))
                .thenReturn(List.of());
        when(victimaRepository.distribucionPorGrupoPoblacional(any(), any(), any(), any(), any(), anyList()))
                .thenReturn(List.of());

        EstadisticasVictimasDTO resultado = victimaService.obtenerEstadisticas(filtro, "VISITANTE");

        assertThat(resultado.getTotalVictimas()).isEqualTo(0L);
        assertThat(resultado.getPorGenero()).isEmpty();
        assertThat(resultado.getPorRangoEdad()).isEmpty();
        assertThat(resultado.getPorGrupoPoblacional()).isEmpty();
    }

    // ─── distribución por género ───────────────────────────────────────────────

    @Test
    void obtenerEstadisticas_distribucionGenero_calculaFrecuencias() {
        FiltroEstadisticaDTO filtro = FiltroEstadisticaDTO.builder().build();

        when(victimaRepository.contarTotal(any(), any(), any(), any(), any(), any(), anyList()))
                .thenReturn(90L);
        when(victimaRepository.distribucionPorGenero(any(), any(), any(), any(), any(), anyList()))
                .thenReturn(listaDeRows(
                        new Object[]{ Genero.MASCULINO,       70L },
                        new Object[]{ Genero.NO_ESPECIFICADO, 20L }
                ));
        when(victimaRepository.distribucionPorRangoEdad(any(), any(), any(), any(), any(), any(), anyList()))
                .thenReturn(List.of());
        when(victimaRepository.distribucionPorGrupoPoblacional(any(), any(), any(), any(), any(), anyList()))
                .thenReturn(List.of());

        EstadisticasVictimasDTO resultado = victimaService.obtenerEstadisticas(filtro, "VISITANTE");

        List<DistribucionGeneroDTO> porGenero = resultado.getPorGenero();
        assertThat(porGenero).hasSize(2);
        assertThat(porGenero.get(0).getGenero()).isEqualTo(Genero.MASCULINO);
        assertThat(porGenero.get(0).getFrecuenciaRelativa()).isEqualTo(77.78);
        assertThat(porGenero.get(1).getGenero()).isEqualTo(Genero.NO_ESPECIFICADO);
        assertThat(porGenero.get(1).getFrecuenciaAcumulada()).isEqualTo(90L);
    }

    // ─── distribución por rango de edad ────────────────────────────────────────

    @Test
    void obtenerEstadisticas_distribucionRangoEdad_incluyeEtiqueta() {
        FiltroEstadisticaDTO filtro = FiltroEstadisticaDTO.builder().build();

        when(victimaRepository.contarTotal(any(), any(), any(), any(), any(), any(), anyList()))
                .thenReturn(50L);
        when(victimaRepository.distribucionPorGenero(any(), any(), any(), any(), any(), anyList()))
                .thenReturn(List.of());
        when(victimaRepository.distribucionPorRangoEdad(any(), any(), any(), any(), any(), any(), anyList()))
                .thenReturn(listaDeRows(
                        new Object[]{ RangoEdad.DE_0_A_19,  10L },
                        new Object[]{ RangoEdad.DE_20_A_39, 30L },
                        new Object[]{ RangoEdad.DE_40_A_59, 10L }
                ));
        when(victimaRepository.distribucionPorGrupoPoblacional(any(), any(), any(), any(), any(), anyList()))
                .thenReturn(List.of());

        EstadisticasVictimasDTO resultado = victimaService.obtenerEstadisticas(filtro, "VISITANTE");

        List<DistribucionRangoEdadDTO> porEdad = resultado.getPorRangoEdad();
        assertThat(porEdad).hasSize(3);
        assertThat(porEdad.get(0).getEtiqueta()).isEqualTo("0 - 19");
        assertThat(porEdad.get(1).getEtiqueta()).isEqualTo("20 - 39");
        assertThat(porEdad.get(1).getFrecuenciaRelativa()).isEqualTo(60.0);
        assertThat(porEdad.get(2).getFrecuenciaAcumulada()).isEqualTo(50L);
    }

    // ─── distribución por grupo poblacional ────────────────────────────────────

    @Test
    void obtenerEstadisticas_distribucionGrupoPoblacional_calculaFrecuencias() {
        FiltroEstadisticaDTO filtro = FiltroEstadisticaDTO.builder().build();

        when(victimaRepository.contarTotal(any(), any(), any(), any(), any(), any(), anyList()))
                .thenReturn(100L);
        when(victimaRepository.distribucionPorGenero(any(), any(), any(), any(), any(), anyList()))
                .thenReturn(List.of());
        when(victimaRepository.distribucionPorRangoEdad(any(), any(), any(), any(), any(), any(), anyList()))
                .thenReturn(List.of());
        when(victimaRepository.distribucionPorGrupoPoblacional(any(), any(), any(), any(), any(), anyList()))
                .thenReturn(listaDeRows(
                        new Object[]{ GrupoPoblacional.ADULTO,    50L },
                        new Object[]{ GrupoPoblacional.CAMPESINO, 30L },
                        new Object[]{ GrupoPoblacional.INDIGENA,  20L }
                ));

        EstadisticasVictimasDTO resultado = victimaService.obtenerEstadisticas(filtro, "ADMIN");

        List<DistribucionGrupoPoblacionalDTO> porGrupo = resultado.getPorGrupoPoblacional();
        assertThat(porGrupo).hasSize(3);
        assertThat(porGrupo.get(0).getGrupoPoblacional()).isEqualTo(GrupoPoblacional.ADULTO);
        assertThat(porGrupo.get(0).getFrecuenciaRelativa()).isEqualTo(50.0);
        assertThat(porGrupo.get(2).getFrecuenciaAcumulada()).isEqualTo(100L);
    }

    // ─── filtro grupoPoblacional aplica correctamente al total ─────────────────

    @Test
    void obtenerEstadisticas_conFiltroGrupoPoblacional_seReflejaEnTotal() {
        FiltroEstadisticaDTO filtro = FiltroEstadisticaDTO.builder()
                .grupoPoblacional(GrupoPoblacional.INDIGENA).build();

        when(victimaRepository.contarTotal(isNull(), isNull(), isNull(), isNull(),
                isNull(), eq(GrupoPoblacional.INDIGENA), anyList())).thenReturn(25L);
        stubDistribuciones();

        EstadisticasVictimasDTO resultado = victimaService.obtenerEstadisticas(filtro, "ADMIN");

        assertThat(resultado.getFiltrosAplicados()).containsEntry("grupoPoblacional", "INDIGENA");
        assertThat(resultado.getTotalVictimas()).isEqualTo(25L);
    }

    // ─── filtro genero aplica correctamente al total ───────────────────────────

    @Test
    void obtenerEstadisticas_conFiltroGenero_seReflejaEnTotal() {
        FiltroEstadisticaDTO filtro = FiltroEstadisticaDTO.builder()
                .genero(Genero.FEMENINO).build();

        when(victimaRepository.contarTotal(isNull(), isNull(), isNull(), isNull(),
                eq(Genero.FEMENINO), isNull(), anyList())).thenReturn(40L);
        stubDistribuciones();

        EstadisticasVictimasDTO resultado = victimaService.obtenerEstadisticas(filtro, "VISITANTE");

        assertThat(resultado.getFiltrosAplicados()).containsEntry("genero", "FEMENINO");
        assertThat(resultado.getTotalVictimas()).isEqualTo(40L);
    }

    // ─── helper ───────────────────────────────────────────────────────────────

    private void stubDistribuciones() {
        when(victimaRepository.distribucionPorGenero(any(), any(), any(), any(), any(), anyList()))
                .thenReturn(List.of());
        when(victimaRepository.distribucionPorRangoEdad(any(), any(), any(), any(), any(), any(), anyList()))
                .thenReturn(List.of());
        when(victimaRepository.distribucionPorGrupoPoblacional(any(), any(), any(), any(), any(), anyList()))
                .thenReturn(List.of());
    }
}
