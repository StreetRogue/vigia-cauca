package co.edu.unicauca.micronovedades.fachadaServices.services;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.NovedadEntity;
import co.edu.unicauca.micronovedades.capaAccesoDatos.models.VictimaEntity;
import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.GeneroVictima;
import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.GrupoPoblacional;
import co.edu.unicauca.micronovedades.capaAccesoDatos.repositories.NovedadRepository;
import co.edu.unicauca.micronovedades.capaAccesoDatos.repositories.VictimaRepository;
import co.edu.unicauca.micronovedades.capaControladores.controladorExcepciones.ResourceNotFoundException;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion.VictimaDTOPeticion;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta.VictimaDTORespuesta;
import co.edu.unicauca.micronovedades.fachadaServices.mapper.NovedadMapper;
import co.edu.unicauca.micronovedades.fachadaServices.services.impl.VictimaServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VictimaServiceImplTest {

    @Mock
    private VictimaRepository victimaRepository;

    @Mock
    private NovedadRepository novedadRepository;

    @Mock
    private NovedadMapper mapper;

    @InjectMocks
    private VictimaServiceImpl victimaService;

    private UUID novedadId;
    private UUID victimaId;
    private NovedadEntity novedadEntity;
    private VictimaEntity victimaEntity;
    private VictimaDTOPeticion peticionEjemplo;
    private VictimaDTORespuesta respuestaEjemplo;

    @BeforeEach
    void setUp() {
        novedadId = UUID.randomUUID();
        victimaId = UUID.randomUUID();

        novedadEntity = NovedadEntity.builder()
                .novedadId(novedadId)
                .victimas(new HashSet<>())
                .build();

        victimaEntity = VictimaEntity.builder()
                .victimaId(victimaId)
                .nombreVictima("Juan Pérez")
                .generoVictima(GeneroVictima.MASCULINO)
                .edadVictima(35)
                .grupoPoblacional(GrupoPoblacional.ADULTO)
                .novedad(novedadEntity)
                .build();

        peticionEjemplo = VictimaDTOPeticion.builder()
                .nombreVictima("Juan Pérez")
                .generoVictima(GeneroVictima.MASCULINO)
                .edadVictima(35)
                .grupoPoblacional(GrupoPoblacional.ADULTO)
                .build();

        respuestaEjemplo = VictimaDTORespuesta.builder()
                .victimaId(victimaId)
                .nombreVictima("Juan Pérez")
                .generoVictima(GeneroVictima.MASCULINO)
                .edadVictima(35)
                .grupoPoblacional(GrupoPoblacional.ADULTO)
                .build();
    }

    // ===================== agregarVictima =====================

    @Test
    void agregarVictima_novedadExistente_retornaDTO() {
        when(novedadRepository.findById(novedadId)).thenReturn(Optional.of(novedadEntity));
        when(mapper.toVictimaEntity(peticionEjemplo)).thenReturn(victimaEntity);
        when(victimaRepository.save(victimaEntity)).thenReturn(victimaEntity);
        when(mapper.toVictimaDTO(victimaEntity)).thenReturn(respuestaEjemplo);

        VictimaDTORespuesta resultado = victimaService.agregarVictima(novedadId, peticionEjemplo);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getNombreVictima()).isEqualTo("Juan Pérez");
        assertThat(resultado.getGeneroVictima()).isEqualTo(GeneroVictima.MASCULINO);
        verify(victimaRepository).save(victimaEntity);
    }

    @Test
    void agregarVictima_novedadNoExistente_lanzaResourceNotFoundException() {
        UUID idInexistente = UUID.randomUUID();
        when(novedadRepository.findById(idInexistente)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> victimaService.agregarVictima(idInexistente, peticionEjemplo))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(victimaRepository, never()).save(any());
    }

    @Test
    void agregarVictima_verificaAsociacionConNovedad() {
        when(novedadRepository.findById(novedadId)).thenReturn(Optional.of(novedadEntity));
        when(mapper.toVictimaEntity(peticionEjemplo)).thenReturn(victimaEntity);
        when(victimaRepository.save(any())).thenReturn(victimaEntity);
        when(mapper.toVictimaDTO(any())).thenReturn(respuestaEjemplo);

        victimaService.agregarVictima(novedadId, peticionEjemplo);

        // La novedad debe tener la víctima asociada
        assertThat(novedadEntity.getVictimas()).contains(victimaEntity);
    }

    // ===================== listarPorNovedad =====================

    @Test
    void listarPorNovedad_retornaVictimasDeLaNovedad() {
        when(victimaRepository.findByNovedad_NovedadId(novedadId))
                .thenReturn(List.of(victimaEntity));
        when(mapper.toVictimaDTOList(any())).thenReturn(List.of(respuestaEjemplo));

        List<VictimaDTORespuesta> resultado = victimaService.listarPorNovedad(novedadId);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getNombreVictima()).isEqualTo("Juan Pérez");
        verify(victimaRepository).findByNovedad_NovedadId(novedadId);
    }

    @Test
    void listarPorNovedad_sinVictimas_retornaListaVacia() {
        when(victimaRepository.findByNovedad_NovedadId(novedadId)).thenReturn(List.of());
        when(mapper.toVictimaDTOList(any())).thenReturn(List.of());

        List<VictimaDTORespuesta> resultado = victimaService.listarPorNovedad(novedadId);

        assertThat(resultado).isEmpty();
    }

    // ===================== eliminarVictima =====================

    @Test
    void eliminarVictima_victimaExistente_eliminaCorrectamente() {
        when(victimaRepository.findById(victimaId)).thenReturn(Optional.of(victimaEntity));

        victimaService.eliminarVictima(novedadId, victimaId);

        verify(victimaRepository).delete(victimaEntity);
    }

    @Test
    void eliminarVictima_victimaNoExistente_lanzaResourceNotFoundException() {
        UUID idInexistente = UUID.randomUUID();
        when(victimaRepository.findById(idInexistente)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> victimaService.eliminarVictima(novedadId, idInexistente))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(victimaRepository, never()).delete(any());
    }

    @Test
    void eliminarVictima_victimaDeOtraNovedad_lanzaResourceNotFoundException() {
        UUID otraNovedadId = UUID.randomUUID();
        NovedadEntity otraNovedad = NovedadEntity.builder()
                .novedadId(otraNovedadId)
                .build();
        VictimaEntity victimaDeOtraNovedad = VictimaEntity.builder()
                .victimaId(victimaId)
                .nombreVictima("María García")
                .novedad(otraNovedad)
                .build();

        when(victimaRepository.findById(victimaId)).thenReturn(Optional.of(victimaDeOtraNovedad));

        assertThatThrownBy(() -> victimaService.eliminarVictima(novedadId, victimaId))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(victimaRepository, never()).delete(any());
    }
}
