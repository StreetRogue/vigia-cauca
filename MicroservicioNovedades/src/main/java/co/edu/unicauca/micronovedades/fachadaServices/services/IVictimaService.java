package co.edu.unicauca.micronovedades.fachadaServices.services;

import co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion.VictimaDTOPeticion;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta.VictimaDTORespuesta;

import java.util.List;
import java.util.UUID;

public interface IVictimaService {

    VictimaDTORespuesta agregarVictima(UUID novedadId, VictimaDTOPeticion peticion);

    List<VictimaDTORespuesta> listarPorNovedad(UUID novedadId);

    void eliminarVictima(UUID novedadId, UUID victimaId);
}
