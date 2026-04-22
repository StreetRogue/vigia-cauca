package co.edu.unicauca.micronovedades.capaAccesoDatos.repositories;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.AuditoriaNovedadEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditoriaNovedadRepository extends JpaRepository<AuditoriaNovedadEntity, UUID> {

    // Historial de auditoría de una novedad, ordenado del más reciente al más antiguo
    List<AuditoriaNovedadEntity> findByNovedad_NovedadIdOrderByFechaDesc(UUID novedadId);

    // Auditorías realizadas por un usuario específico
    List<AuditoriaNovedadEntity> findByUsuarioIdOrderByFechaDesc(UUID usuarioId);
}
