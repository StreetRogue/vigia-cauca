package co.edu.unicauca.micronovedades.fachadaServices.services;

import co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta.AuditoriaNovedadDTORespuesta;

import java.util.List;
import java.util.UUID;

public interface IAuditoriaService {

    List<AuditoriaNovedadDTORespuesta> obtenerHistorialNovedad(UUID novedadId);

    List<AuditoriaNovedadDTORespuesta> obtenerHistorialPorUsuario(UUID usuarioId);
}
