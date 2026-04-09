package co.edu.unicauca.microreportes.fachadaServices.services;

import co.edu.unicauca.microreportes.mensajeria.NovedadEventoDTO;

/**
 * Servicio que procesa eventos y actualiza las proyecciones (read model).
 * Patrón: CQRS Projection Handler
 */
public interface IProyeccionService {

    void procesarNovedadCreada(NovedadEventoDTO evento);

    void procesarNovedadActualizada(NovedadEventoDTO evento);

    void procesarNovedadEliminada(NovedadEventoDTO evento);
}
