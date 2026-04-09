package co.edu.unicauca.micronovedades.capaAccesoDatos.repositories;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.EvidenciaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EvidenciaRepository extends JpaRepository<EvidenciaEntity, UUID> {

    List<EvidenciaEntity> findByNovedad_NovedadId(UUID novedadId);
}
