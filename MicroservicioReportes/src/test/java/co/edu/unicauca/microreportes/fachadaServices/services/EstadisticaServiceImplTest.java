package co.edu.unicauca.microreportes.fachadaServices.services;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.Actor;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.CategoriaEvento;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.EstadisticaAgregadaRepository;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.NovedadSnapshotRepository;
import co.edu.unicauca.microreportes.fachadaServices.DTO.peticion.FiltroEstadisticaDTO;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.*;
import co.edu.unicauca.microreportes.fachadaServices.services.impl.EstadisticaServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EstadisticaServiceImplTest {

    @Mock
    private EstadisticaAgregadaRepository agregadaRepository;

    @Mock
    private NovedadSnapshotRepository snapshotRepository;

    @InjectMocks
    private EstadisticaServiceImpl estadisticaService;

    private FiltroEstadisticaDTO filtroConAnio;
    private FiltroEstadisticaDTO filtroSinAnio;
    private FiltroEstadisticaDTO filtroConMunicipio;
    private int anioActual;

    /** Helper para crear List<Object[]> sin problemas de inferencia de tipos */
    private List<Object[]> listaDeRows(Object[]... filas) {
        List<Object[]> lista = new ArrayList<>();
        for (Object[] fila : filas) {
            lista.add(fila);
        }
        return lista;
    }

    @BeforeEach
    void setUp() {
        anioActual = LocalDate.now().getYear();

        filtroConAnio = FiltroEstadisticaDTO.builder()
                .anio(2024)
                .municipio(null)
                .categoria(null)
                .build();

        filtroSinAnio = FiltroEstadisticaDTO.builder()
                .anio(null)
                .municipio(null)
                .categoria(null)
                .build();

        filtroConMunicipio = FiltroEstadisticaDTO.builder()
                .anio(2024)
                .municipio("Popayán")
                .categoria(null)
                .build();
    }

    // ===================== obtenerResumenKPI =====================

    @Test
    void obtenerResumenKPI_conDatos_retornaResumenCorrecto() {
        List<Object[]> resultado = listaDeRows(new Object[]{100L, 20L, 35L, 50L, 10L});
        when(agregadaRepository.obtenerKPIs(eq(2024), isNull(), anyList()))
                .thenReturn(resultado);

        ResumenKPIDTO kpi = estadisticaService.obtenerResumenKPI(filtroConAnio, "ADMIN");

        assertThat(kpi).isNotNull();
        assertThat(kpi.getAnio()).isEqualTo(2024);
        assertThat(kpi.getTotalEventos()).isEqualTo(100L);
        assertThat(kpi.getTotalMuertos()).isEqualTo(20L);
        assertThat(kpi.getTotalHeridos()).isEqualTo(35L);
        assertThat(kpi.getTotalDesplazados()).isEqualTo(50L);
        assertThat(kpi.getTotalConfinados()).isEqualTo(10L);
    }

    @Test
    void obtenerResumenKPI_sinDatos_retornaResumenEnCeros() {
        when(agregadaRepository.obtenerKPIs(anyInt(), any(), anyList()))
                .thenReturn(new ArrayList<>());

        ResumenKPIDTO kpi = estadisticaService.obtenerResumenKPI(filtroConAnio, "VISITANTE");

        assertThat(kpi.getTotalEventos()).isZero();
        assertThat(kpi.getTotalMuertos()).isZero();
        assertThat(kpi.getTotalHeridos()).isZero();
        assertThat(kpi.getTotalDesplazados()).isZero();
        assertThat(kpi.getTotalConfinados()).isZero();
    }

    @Test
    void obtenerResumenKPI_sinAnioEnFiltro_usaAnioActual() {
        when(agregadaRepository.obtenerKPIs(eq(anioActual), isNull(), anyList()))
                .thenReturn(new ArrayList<>());

        estadisticaService.obtenerResumenKPI(filtroSinAnio, "VISITANTE");

        verify(agregadaRepository).obtenerKPIs(eq(anioActual), isNull(), anyList());
    }

    @Test
    void obtenerResumenKPI_conMunicipio_filtraPorMunicipio() {
        List<Object[]> resultado = listaDeRows(new Object[]{25L, 5L, 10L, 15L, 2L});
        when(agregadaRepository.obtenerKPIs(eq(2024), eq("Popayán"), anyList()))
                .thenReturn(resultado);

        ResumenKPIDTO kpi = estadisticaService.obtenerResumenKPI(filtroConMunicipio, "ADMIN");

        assertThat(kpi.getMunicipio()).isEqualTo("Popayán");
        verify(agregadaRepository).obtenerKPIs(eq(2024), eq("Popayán"), anyList());
    }

    // ===================== obtenerSerieTemporal =====================

    @Test
    void obtenerSerieTemporal_conDatos_retornaListaMensual() {
        List<Object[]> datos = listaDeRows(
                new Object[]{1, 10L, 2L, 5L},
                new Object[]{2, 15L, 3L, 8L},
                new Object[]{3, 8L, 1L, 3L}
        );
        when(snapshotRepository.serieTemporal(eq(2024), isNull(), isNull(), anyList()))
                .thenReturn(datos);

        List<SerieTemporalDTO> resultado = estadisticaService.obtenerSerieTemporal(filtroConAnio, "VISITANTE");

        assertThat(resultado).hasSize(3);
        assertThat(resultado.get(0).getMes()).isEqualTo(1);
        assertThat(resultado.get(0).getNombreMes()).isEqualTo("Ene");
        assertThat(resultado.get(0).getTotalEventos()).isEqualTo(10L);
        assertThat(resultado.get(1).getNombreMes()).isEqualTo("Feb");
        assertThat(resultado.get(2).getNombreMes()).isEqualTo("Mar");
    }

    @Test
    void obtenerSerieTemporal_sinDatos_retornaListaVacia() {
        when(snapshotRepository.serieTemporal(anyInt(), any(), any(), anyList()))
                .thenReturn(new ArrayList<>());

        List<SerieTemporalDTO> resultado = estadisticaService.obtenerSerieTemporal(filtroConAnio, "VISITANTE");

        assertThat(resultado).isEmpty();
    }

    @Test
    void obtenerSerieTemporal_conCategoria_filtraPorCategoria() {
        FiltroEstadisticaDTO filtroConCategoria = FiltroEstadisticaDTO.builder()
                .anio(2024)
                .categoria(CategoriaEvento.ENFRENTAMIENTO)
                .build();

        when(snapshotRepository.serieTemporal(eq(2024), eq(CategoriaEvento.ENFRENTAMIENTO), isNull(), anyList()))
                .thenReturn(new ArrayList<>());

        estadisticaService.obtenerSerieTemporal(filtroConCategoria, "ADMIN");

        verify(snapshotRepository).serieTemporal(
                eq(2024), eq(CategoriaEvento.ENFRENTAMIENTO), isNull(), anyList());
    }

    // ===================== obtenerEstadisticasPorActor =====================

    @Test
    void obtenerEstadisticasPorActor_conDatos_retornaListaDeActores() {
        List<Object[]> datos = listaDeRows(
                new Object[]{Actor.ELN, 40L},
                new Object[]{Actor.FUERZA_PUBLICA, 30L}
        );
        when(snapshotRepository.contarPorActor(eq(2024), isNull(), anyList()))
                .thenReturn(datos);

        List<EstadisticaActorDTO> resultado =
                estadisticaService.obtenerEstadisticasPorActor(filtroConAnio, "VISITANTE");

        assertThat(resultado).hasSize(2);
        assertThat(resultado.get(0).getActor()).isEqualTo(Actor.ELN);
        assertThat(resultado.get(0).getTotalEventos()).isEqualTo(40L);
        assertThat(resultado.get(1).getActor()).isEqualTo(Actor.FUERZA_PUBLICA);
    }

    @Test
    void obtenerEstadisticasPorActor_sinDatos_retornaListaVacia() {
        when(snapshotRepository.contarPorActor(anyInt(), any(), anyList()))
                .thenReturn(new ArrayList<>());

        List<EstadisticaActorDTO> resultado =
                estadisticaService.obtenerEstadisticasPorActor(filtroConAnio, "VISITANTE");

        assertThat(resultado).isEmpty();
    }

    // ===================== obtenerMapaCalor =====================

    @Test
    void obtenerMapaCalor_conDatos_retornaMunicipios() {
        List<Object[]> datos = listaDeRows(new Object[]{"Popayán", 25L, 5L, 10L, 15L});
        when(snapshotRepository.mapaCalorMunicipios(eq(2024), anyList()))
                .thenReturn(datos);

        List<EstadisticaMunicipioDTO> resultado = estadisticaService.obtenerMapaCalor(2024, "ADMIN");

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getMunicipio()).isEqualTo("Popayán");
        assertThat(resultado.get(0).getTotalEventos()).isEqualTo(25L);
        assertThat(resultado.get(0).getTotalMuertos()).isEqualTo(5L);
        assertThat(resultado.get(0).getTotalDesplazados()).isEqualTo(15L);
    }

    @Test
    void obtenerMapaCalor_sinAnio_usaAnioActual() {
        when(snapshotRepository.mapaCalorMunicipios(eq(anioActual), anyList()))
                .thenReturn(new ArrayList<>());

        estadisticaService.obtenerMapaCalor(null, "VISITANTE");

        verify(snapshotRepository).mapaCalorMunicipios(eq(anioActual), anyList());
    }

    // ===================== obtenerDesgloseCategorias =====================

    @Test
    void obtenerDesgloseCategorias_conDatos_retornaCategorias() {
        List<Object[]> datos = listaDeRows(
                new Object[]{CategoriaEvento.ENFRENTAMIENTO, 50L, 10L, 20L},
                new Object[]{CategoriaEvento.HOMICIDIO, 30L, 30L, 0L}
        );
        when(agregadaRepository.desglosePorCategoria(eq(2024), isNull(), anyList()))
                .thenReturn(datos);

        List<EstadisticaCategoriaDTO> resultado =
                estadisticaService.obtenerDesgloseCategorias(filtroConAnio, "VISITANTE");

        assertThat(resultado).hasSize(2);
        assertThat(resultado.get(0).getCategoria()).isEqualTo(CategoriaEvento.ENFRENTAMIENTO);
        assertThat(resultado.get(0).getTotalEventos()).isEqualTo(50L);
        assertThat(resultado.get(1).getCategoria()).isEqualTo(CategoriaEvento.HOMICIDIO);
    }

    @Test
    void obtenerDesgloseCategorias_sinDatos_retornaListaVacia() {
        when(agregadaRepository.desglosePorCategoria(anyInt(), any(), anyList()))
                .thenReturn(new ArrayList<>());

        List<EstadisticaCategoriaDTO> resultado =
                estadisticaService.obtenerDesgloseCategorias(filtroConAnio, "VISITANTE");

        assertThat(resultado).isEmpty();
    }
}
