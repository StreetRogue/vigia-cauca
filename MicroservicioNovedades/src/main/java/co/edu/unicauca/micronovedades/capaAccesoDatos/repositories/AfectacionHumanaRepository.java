package co.edu.unicauca.micronovedades.capaAccesoDatos.repositories;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.AfectacionHumanaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AfectacionHumanaRepository extends JpaRepository<AfectacionHumanaEntity, UUID> {

    Optional<AfectacionHumanaEntity> findByNovedad_NovedadId(UUID novedadId);
}
