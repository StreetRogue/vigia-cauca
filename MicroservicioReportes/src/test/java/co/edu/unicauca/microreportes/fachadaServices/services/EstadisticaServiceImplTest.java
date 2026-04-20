package co.edu.unicauca.microreportes.fachadaServices.services;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.Actor;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.CategoriaEvento;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.NivelVisibilidad;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.EstadisticaAgregadaRepository;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.NovedadSnapshotRepository;
import co.edu.unicauca.microreportes.fachadaServices.DTO.peticion.FiltroEstadisticaDTO;
import co.edu.unicauca.microreportes.fachadaServices.DTO.respuesta.*;
import co.edu.unicauca.microreportes.fachadaServices.mapper.VisibilidadHelper;
import co.edu.unicauca.microreportes.fachadaServices.services.IVictimaService;
import co.edu.unicauca.microreportes.fachadaServices.services.impl.EstadisticaServiceImpl;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EstadisticaServiceImplTest {

    @Mock
    private EstadisticaAgregadaRepository agregadaRepository;

    @Mock
    private NovedadSnapshotRepository snapshotRepository;

    @Mock
    private VisibilidadHelper visibilidadHelper;

    @Mock
    private IVictimaService victimaService;

    @InjectMocks
    private EstadisticaServiceImpl estadisticaService;

    private FiltroEstadisticaDTO filtroConAnio;
    private FiltroEstadisticaDTO filtroSinFiltros;
    private FiltroEstadisticaDTO filtroConMunicipio;
    private FiltroEstadisticaDTO filtroConMes;
    private FiltroEstadisticaDTO filtroConActor;

    private static final List<NivelVisibilidad> TODAS_VISIBILIDADES =
            List.of(NivelVisibilidad.PUBLICA, NivelVisibilidad.PRIVADA);
    private static final List<NivelVisibilidad> SOLO_PUBLICA =
            List.of(NivelVisibilidad.PUBLICA);

    /** Helper para crear List<Object[]> sin problemas de inferencia de tipos */
    private List<Object[]> listaDeRows(Object[]... filas) {
        List<Object[]> lista = new ArrayList<>();
        for (Object[] fila : filas) lista.add(fila);
        return lista;
    }

    @BeforeEach
    void setUp() {
        filtroConAnio = FiltroEstadisticaDTO.builder()
                .anio(2024).build();

        filtroSinFiltros = FiltroEstadisticaDTO.builder().build();

        filtroConMunicipio = FiltroEstadisticaDTO.builder()
                .anio(2024).municipio("Popayán").build();

        filtroConMes = FiltroEstadisticaDTO.builder()
                .anio(2024).mes(3).build();

        filtroConActor = FiltroEstadisticaDTO.builder()
                .anio(2024).actor(Actor.ELN).build();

        when(visibilidadHelper.visibilidadesPorRol("ADMIN")).thenReturn(TODAS_VISIBILIDADES);
        when(visibilidadHelper.visibilidadesPorRol("OPERADOR")).thenReturn(TODAS_VISIBILIDADES);
        when(visibilidadHelper.visibilidadesPorRol("VISITANTE")).thenReturn(SOLO_PUBLICA);
    }

    // ===================== obtenerResumenKPI =====================

    @Test
    void obtenerResumenKPI_conDatos_retornaResumenCorrecto() {
        List<Object[]> resultado = listaDeRows(new Object[]{100L, 20L, 35L, 50L, 10L});
        when(agregadaRepository.obtenerKPIs(eq(2024), isNull(), isNull(), isNull(), anyList()))
                .thenReturn(resultado);

        ResumenKPIDTO kpi = estadisticaService.obtenerResumenKPI(filtroConAnio, "ADMIN");

        assertThat(kpi).isNotNull();
        assertThat(kpi.getAnio()).isEqualTo(2024);
        assertThat(kpi.getTotalEventos()).isEqualTo(100L);
        assertThat(kpi.getTotalMuertos()).isEqualTo(20L);
        assertThat(kpi.getTotalHeridos()).isEqualTo(35L);
        assertThat(kpi.getTotalDesplazados()).isEqualTo(50L);
        assertThat(kpi.getTotalConfinados()).isEqualTo(10L);
        assertThat(kpi.getFiltrosAplicados()).containsKey("anio");
    }

    @Test
    void obtenerResumenKPI_sinDatos_retornaResumenEnCeros() {
        when(agregadaRepository.obtenerKPIs(any(), any(), any(), any(), anyList()))
                .thenReturn(new ArrayList<>());

        ResumenKPIDTO kpi = estadisticaService.obtenerResumenKPI(filtroConAnio, "VISITANTE");

        assertThat(kpi.getTotalEventos()).isZero();
        assertThat(kpi.getTotalMuertos()).isZero();
        assertThat(kpi.getTotalHeridos()).isZero();
        assertThat(kpi.getTotalDesplazados()).isZero();
        assertThat(kpi.getTotalConfinados()).isZero();
    }

    @Test
    void obtenerResumenKPI_sinAnioEnFiltro_pasaAnioNull() {
        when(agregadaRepository.obtenerKPIs(isNull(), isNull(), isNull(), isNull(), anyList()))
                .thenReturn(new ArrayList<>());

        estadisticaService.obtenerResumenKPI(filtroSinFiltros, "VISITANTE");

        verify(agregadaRepository).obtenerKPIs(isNull(), isNull(), isNull(), isNull(), anyList());
    }

    @Test
    void obtenerResumenKPI_conMunicipio_filtraPorMunicipio() {
        List<Object[]> resultado = listaDeRows(new Object[]{25L, 5L, 10L, 15L, 2L});
        when(agregadaRepository.obtenerKPIs(eq(2024), isNull(), eq("Popayán"), isNull(), anyList()))
                .thenReturn(resultado);

        ResumenKPIDTO kpi = estadisticaService.obtenerResumenKPI(filtroConMunicipio, "ADMIN");

        assertThat(kpi.getMunicipio()).isEqualTo("Popayán");
        verify(agregadaRepository).obtenerKPIs(eq(2024), isNull(), eq("Popayán"), isNull(), anyList());
    }

    @Test
    void obtenerResumenKPI_filtrosAplicadosReflexanFiltroUsado() {
        when(agregadaRepository.obtenerKPIs(any(), any(), any(), any(), anyList()))
                .thenReturn(listaDeRows(new Object[]{10L, 1L, 2L, 3L, 0L}));

        ResumenKPIDTO kpi = estadisticaService.obtenerResumenKPI(filtroConMunicipio, "ADMIN");

        assertThat(kpi.getFiltrosAplicados()).containsKeys("anio", "municipio");
        assertThat(kpi.getFiltrosAplicados()).doesNotContainKey("mes");
    }

    // ===================== obtenerSerieTemporal =====================

    @Test
    void obtenerSerieTemporal_conDatos_retornaListaMensualConFrecuencias() {
        List<Object[]> datos = listaDeRows(
                new Object[]{2024, 1, 10L, 2L, 5L, 3L},
                new Object[]{2024, 2, 15L, 3L, 8L, 4L},
                new Object[]{2024, 3, 25L, 5L, 10L, 7L}
        );
        when(snapshotRepository.serieTemporal(eq(2024), isNull(), isNull(), isNull(), isNull(), anyList()))
                .thenReturn(datos);

        List<SerieTemporalDTO> resultado = estadisticaService.obtenerSerieTemporal(filtroConAnio, "VISITANTE");

        assertThat(resultado).hasSize(3);
        assertThat(resultado.get(0).getAnio()).isEqualTo(2024);
        assertThat(resultado.get(0).getMes()).isEqualTo(1);
        assertThat(resultado.get(0).getNombreMes()).isEqualTo("Ene");
        assertThat(resultado.get(0).getTotalEventos()).isEqualTo(10L);
        assertThat(resultado.get(1).getNombreMes()).isEqualTo("Feb");
        assertThat(resultado.get(2).getNombreMes()).isEqualTo("Mar");

        // Verificar frecuencias: total = 50
        assertThat(resultado.get(0).getFrecuenciaRelativa()).isEqualTo(20.0);
        assertThat(resultado.get(1).getFrecuenciaRelativa()).isEqualTo(30.0);
        assertThat(resultado.get(2).getFrecuenciaRelativa()).isEqualTo(50.0);

        assertThat(resultado.get(0).getFrecuenciaAcumulada()).isEqualTo(10L);
        assertThat(resultado.get(1).getFrecuenciaAcumulada()).isEqualTo(25L);
        assertThat(resultado.get(2).getFrecuenciaAcumulada()).isEqualTo(50L);
    }

    @Test
    void obtenerSerieTemporal_sinDatos_retornaListaVacia() {
        when(snapshotRepository.serieTemporal(any(), any(), any(), any(), any(), anyList()))
                .thenReturn(new ArrayList<>());

        List<SerieTemporalDTO> resultado = estadisticaService.obtenerSerieTemporal(filtroConAnio, "VISITANTE");

        assertThat(resultado).isEmpty();
    }

    @Test
    void obtenerSerieTemporal_conCategoria_filtraPorCategoria() {
        FiltroEstadisticaDTO filtroConCategoria = FiltroEstadisticaDTO.builder()
                .anio(2024).categoria(CategoriaEvento.ENFRENTAMIENTO).build();

        when(snapshotRepository.serieTemporal(
                eq(2024), isNull(), eq(CategoriaEvento.ENFRENTAMIENTO), isNull(), isNull(), anyList()))
                .thenReturn(new ArrayList<>());

        estadisticaService.obtenerSerieTemporal(filtroConCategoria, "ADMIN");

        verify(snapshotRepository).serieTemporal(
                eq(2024), isNull(), eq(CategoriaEvento.ENFRENTAMIENTO), isNull(), isNull(), anyList());
    }

    @Test
    void obtenerSerieTemporal_conActor_filtraPorActor() {
        when(snapshotRepository.serieTemporal(
                eq(2024), isNull(), isNull(), isNull(), eq(Actor.ELN), anyList()))
                .thenReturn(new ArrayList<>());

        estadisticaService.obtenerSerieTemporal(filtroConActor, "ADMIN");

        verify(snapshotRepository).serieTemporal(
                eq(2024), isNull(), isNull(), isNull(), eq(Actor.ELN), anyList());
    }

    @Test
    void obtenerSerieTemporal_conMes_filtraPorMes() {
        when(snapshotRepository.serieTemporal(
                eq(2024), eq(3), isNull(), isNull(), isNull(), anyList()))
                .thenReturn(new ArrayList<>());

        estadisticaService.obtenerSerieTemporal(filtroConMes, "VISITANTE");

        verify(snapshotRepository).serieTemporal(
                eq(2024), eq(3), isNull(), isNull(), isNull(), anyList());
    }

    @Test
    void obtenerSerieTemporal_sinAnio_consultaTodosLosAnios() {
        when(snapshotRepository.serieTemporal(isNull(), isNull(), isNull(), isNull(), isNull(), anyList()))
                .thenReturn(new ArrayList<>());

        estadisticaService.obtenerSerieTemporal(filtroSinFiltros, "VISITANTE");

        verify(snapshotRepository).serieTemporal(isNull(), isNull(), isNull(), isNull(), isNull(), anyList());
    }

    // ===================== obtenerEstadisticasPorActor =====================

    @Test
    void obtenerEstadisticasPorActor_conDatos_retornaListaConFrecuencias() {
        // ELN 40, FUERZA_PUBLICA 30, OTRO 30 → total 100
        List<Object[]> datos = listaDeRows(
                new Object[]{Actor.ELN, 40L},
                new Object[]{Actor.FUERZA_PUBLICA, 30L},
                new Object[]{Actor.OTRO, 30L}
        );
        when(snapshotRepository.contarPorActor(eq(2024), isNull(), isNull(), isNull(), anyList()))
                .thenReturn(datos);

        List<EstadisticaActorDTO> resultado =
                estadisticaService.obtenerEstadisticasPorActor(filtroConAnio, "VISITANTE");

        assertThat(resultado).hasSize(3);
        assertThat(resultado.get(0).getActor()).isEqualTo(Actor.ELN);
        assertThat(resultado.get(0).getTotalEventos()).isEqualTo(40L);
        assertThat(resultado.get(0).getFrecuenciaRelativa()).isEqualTo(40.0);
        assertThat(resultado.get(0).getFrecuenciaAcumulada()).isEqualTo(40L);
        assertThat(resultado.get(1).getFrecuenciaRelativa()).isEqualTo(30.0);
        assertThat(resultado.get(1).getFrecuenciaAcumulada()).isEqualTo(70L);
        assertThat(resultado.get(2).getFrecuenciaAcumulada()).isEqualTo(100L);
    }

    @Test
    void obtenerEstadisticasPorActor_sinDatos_retornaListaVacia() {
        when(snapshotRepository.contarPorActor(any(), any(), any(), any(), anyList()))
                .thenReturn(new ArrayList<>());

        List<EstadisticaActorDTO> resultado =
                estadisticaService.obtenerEstadisticasPorActor(filtroConAnio, "VISITANTE");

        assertThat(resultado).isEmpty();
    }

    // ===================== obtenerMapaCalor =====================

    @Test
    void obtenerMapaCalor_conDatos_retornaMunicipiosConFrecuencias() {
        // Popayán 60, Toribío 40 → total 100
        List<Object[]> datos = listaDeRows(
                new Object[]{"Popayán", 60L, 5L, 10L, 15L},
                new Object[]{"Toribío", 40L, 8L, 12L, 20L}
        );
        when(snapshotRepository.mapaCalorMunicipios(eq(2024), isNull(), isNull(), anyList()))
                .thenReturn(datos);

        List<EstadisticaMunicipioDTO> resultado =
                estadisticaService.obtenerMapaCalor(filtroConAnio, "ADMIN");

        assertThat(resultado).hasSize(2);
        assertThat(resultado.get(0).getMunicipio()).isEqualTo("Popayán");
        assertThat(resultado.get(0).getTotalEventos()).isEqualTo(60L);
        assertThat(resultado.get(0).getFrecuenciaRelativa()).isEqualTo(60.0);
        assertThat(resultado.get(0).getFrecuenciaAcumulada()).isEqualTo(60L);
        assertThat(resultado.get(1).getFrecuenciaRelativa()).isEqualTo(40.0);
        assertThat(resultado.get(1).getFrecuenciaAcumulada()).isEqualTo(100L);
    }

    @Test
    void obtenerMapaCalor_sinAnio_consultaTodosLosAnios() {
        when(snapshotRepository.mapaCalorMunicipios(isNull(), isNull(), isNull(), anyList()))
                .thenReturn(new ArrayList<>());

        estadisticaService.obtenerMapaCalor(filtroSinFiltros, "VISITANTE");

        verify(snapshotRepository).mapaCalorMunicipios(isNull(), isNull(), isNull(), anyList());
    }

    @Test
    void obtenerMapaCalor_visitanteSoloVeDatosPublicos() {
        when(snapshotRepository.mapaCalorMunicipios(any(), any(), any(), eq(SOLO_PUBLICA)))
                .thenReturn(new ArrayList<>());

        estadisticaService.obtenerMapaCalor(filtroConAnio, "VISITANTE");

        verify(snapshotRepository).mapaCalorMunicipios(any(), any(), any(), eq(SOLO_PUBLICA));
    }

    // ===================== obtenerDesgloseCategorias =====================

    @Test
    void obtenerDesgloseCategorias_conDatos_retornaCategoriasConFrecuencias() {
        // ENFRENTAMIENTO 50, HOMICIDIO 30, HOSTIGAMIENTO 20 → total 100
        List<Object[]> datos = listaDeRows(
                new Object[]{CategoriaEvento.ENFRENTAMIENTO, 50L, 10L, 20L},
                new Object[]{CategoriaEvento.HOMICIDIO,      30L, 30L,  0L},
                new Object[]{CategoriaEvento.HOSTIGAMIENTO,  20L,  0L,  5L}
        );
        when(agregadaRepository.desglosePorCategoria(eq(2024), isNull(), isNull(), anyList()))
                .thenReturn(datos);

        List<EstadisticaCategoriaDTO> resultado =
                estadisticaService.obtenerDesgloseCategorias(filtroConAnio, "VISITANTE");

        assertThat(resultado).hasSize(3);
        assertThat(resultado.get(0).getCategoria()).isEqualTo(CategoriaEvento.ENFRENTAMIENTO);
        assertThat(resultado.get(0).getTotalEventos()).isEqualTo(50L);
        assertThat(resultado.get(0).getFrecuenciaRelativa()).isEqualTo(50.0);
        assertThat(resultado.get(0).getFrecuenciaAcumulada()).isEqualTo(50L);
        assertThat(resultado.get(1).getFrecuenciaRelativa()).isEqualTo(30.0);
        assertThat(resultado.get(1).getFrecuenciaAcumulada()).isEqualTo(80L);
        assertThat(resultado.get(2).getFrecuenciaRelativa()).isEqualTo(20.0);
        assertThat(resultado.get(2).getFrecuenciaAcumulada()).isEqualTo(100L);
    }

    @Test
    void obtenerDesgloseCategorias_sinDatos_retornaListaVacia() {
        when(agregadaRepository.desglosePorCategoria(any(), any(), any(), anyList()))
                .thenReturn(new ArrayList<>());

        List<EstadisticaCategoriaDTO> resultado =
                estadisticaService.obtenerDesgloseCategorias(filtroConAnio, "VISITANTE");

        assertThat(resultado).isEmpty();
    }

    // ===================== Cálculo de frecuencias (integración interna) =====================

    @Test
    void calcularFrecuencias_conTresEventos_distribuyeCorrectamente() {
        // 20 + 30 + 50 = 100 total
        List<Object[]> datos = listaDeRows(
                new Object[]{2024, 1, 20L, 0L, 0L, 0L},
                new Object[]{2024, 2, 30L, 0L, 0L, 0L},
                new Object[]{2024, 3, 50L, 0L, 0L, 0L}
        );
        when(snapshotRepository.serieTemporal(any(), any(), any(), any(), any(), anyList()))
                .thenReturn(datos);

        List<SerieTemporalDTO> serie = estadisticaService.obtenerSerieTemporal(filtroConAnio, "ADMIN");

        assertThat(serie.get(0).getFrecuenciaRelativa()).isEqualTo(20.0);
        assertThat(serie.get(1).getFrecuenciaRelativa()).isEqualTo(30.0);
        assertThat(serie.get(2).getFrecuenciaRelativa()).isEqualTo(50.0);

        assertThat(serie.get(0).getFrecuenciaAcumulada()).isEqualTo(20L);
        assertThat(serie.get(1).getFrecuenciaAcumulada()).isEqualTo(50L);
        assertThat(serie.get(2).getFrecuenciaAcumulada()).isEqualTo(100L);
    }

    @Test
    void calcularFrecuencias_serieSinEventos_frecuenciaCeroSinExcepcion() {
        List<Object[]> datos = listaDeRows(new Object[]{2024, 1, 0L, 0L, 0L, 0L});
        when(snapshotRepository.serieTemporal(any(), any(), any(), any(), any(), anyList()))
                .thenReturn(datos);

        List<SerieTemporalDTO> serie = estadisticaService.obtenerSerieTemporal(filtroConAnio, "VISITANTE");

        assertThat(serie.get(0).getFrecuenciaRelativa()).isEqualTo(0.0);
        assertThat(serie.get(0).getFrecuenciaAcumulada()).isEqualTo(0L);
    }
}
