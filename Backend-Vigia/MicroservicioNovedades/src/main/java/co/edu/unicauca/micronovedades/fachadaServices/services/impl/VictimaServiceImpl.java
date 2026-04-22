package co.edu.unicauca.micronovedades.fachadaServices.services.impl;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.NovedadEntity;
import co.edu.unicauca.micronovedades.capaAccesoDatos.models.VictimaEntity;
import co.edu.unicauca.micronovedades.capaAccesoDatos.repositories.NovedadRepository;
import co.edu.unicauca.micronovedades.capaAccesoDatos.repositories.VictimaRepository;
import co.edu.unicauca.micronovedades.capaControladores.controladorExcepciones.ResourceNotFoundException;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion.VictimaDTOPeticion;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta.VictimaDTORespuesta;
import co.edu.unicauca.micronovedades.fachadaServices.mapper.NovedadMapper;
import co.edu.unicauca.micronovedades.fachadaServices.services.IVictimaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class VictimaServiceImpl implements IVictimaService {

    private final VictimaRepository victimaRepository;
    private final NovedadRepository novedadRepository;
    private final NovedadMapper mapper;

    @Override
    @Transactional
    public VictimaDTORespuesta agregarVictima(UUID novedadId, VictimaDTOPeticion peticion) {
        NovedadEntity novedad = novedadRepository.findById(novedadId)
                .orElseThrow(() -> new ResourceNotFoundException("Novedad", novedadId));

        VictimaEntity victima = mapper.toVictimaEntity(peticion);
        novedad.agregarVictima(victima);

        VictimaEntity guardada = victimaRepository.save(victima);
        log.info("Víctima agregada a novedad {}: {}", novedadId, guardada.getVictimaId());
        return mapper.toVictimaDTO(guardada);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VictimaDTORespuesta> listarPorNovedad(UUID novedadId) {
        List<VictimaEntity> victimas = victimaRepository.findByNovedad_NovedadId(novedadId);
        return mapper.toVictimaDTOList(victimas);
    }

    @Override
    @Transactional
    public void eliminarVictima(UUID novedadId, UUID victimaId) {
        VictimaEntity victima = victimaRepository.findById(victimaId)
                .orElseThrow(() -> new ResourceNotFoundException("Víctima", victimaId));

        if (!victima.getNovedad().getNovedadId().equals(novedadId)) {
            throw new ResourceNotFoundException("Víctima", victimaId);
        }

        victimaRepository.delete(victima);
        log.info("Víctima eliminada con ID: {}", victimaId);
    }
}
