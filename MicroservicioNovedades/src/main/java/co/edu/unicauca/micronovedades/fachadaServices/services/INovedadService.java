package co.edu.unicauca.micronovedades.fachadaServices.services;

import co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion.FiltroNovedadDTO;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion.NovedadDTOPeticion;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta.NovedadDTORespuesta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface INovedadService {

    NovedadDTORespuesta crearNovedad(NovedadDTOPeticion peticion);

    NovedadDTORespuesta obtenerPorId(UUID novedadId);

    List<NovedadDTORespuesta> listarTodas();

    Page<NovedadDTORespuesta> listarTodasPaginado(Pageable pageable);

    List<NovedadDTORespuesta> listarPorUsuario(UUID usuarioId);

    List<NovedadDTORespuesta> buscarConFiltros(FiltroNovedadDTO filtro);

    NovedadDTORespuesta actualizarNovedad(UUID novedadId, NovedadDTOPeticion peticion);

    void eliminarNovedad(UUID novedadId, UUID usuarioIdSolicitante);
}
