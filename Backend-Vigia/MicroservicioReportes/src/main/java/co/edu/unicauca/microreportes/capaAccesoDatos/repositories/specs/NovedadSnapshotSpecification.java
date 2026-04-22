package co.edu.unicauca.microreportes.capaAccesoDatos.repositories.specs;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.NovedadSnapshotEntity;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.NivelVisibilidad;
import co.edu.unicauca.microreportes.fachadaServices.DTO.peticion.FiltroReporteDTO;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import java.util.ArrayList;
import java.util.List;

public class NovedadSnapshotSpecification {

    public static Specification<NovedadSnapshotEntity> filtrar(FiltroReporteDTO filtro, List<NivelVisibilidad> visibilidades) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Siempre lo NO oculto
            predicates.add(cb.equal(root.get("oculto"), false));

            // 2. Seguridad por visibilidad
            predicates.add(root.get("nivelVisibilidad").in(visibilidades));

            // 3. Filtros opcionales
            if (filtro.getAnio() != null) {
                predicates.add(cb.equal(root.get("anio"), filtro.getAnio()));
            }
            if (filtro.getMunicipio() != null && !filtro.getMunicipio().isEmpty()) {
                predicates.add(cb.equal(root.get("municipio"), filtro.getMunicipio()));
            }
            if (filtro.getCategoria() != null) {
                predicates.add(cb.equal(root.get("categoria"), filtro.getCategoria()));
            }
            if (filtro.getActor1() != null) {
                predicates.add(cb.equal(root.get("actor1"), filtro.getActor1()));
            }
            if (filtro.getFechaInicio() != null && filtro.getFechaFin() != null) {
                predicates.add(cb.between(root.get("fechaHecho"), filtro.getFechaInicio(), filtro.getFechaFin()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}