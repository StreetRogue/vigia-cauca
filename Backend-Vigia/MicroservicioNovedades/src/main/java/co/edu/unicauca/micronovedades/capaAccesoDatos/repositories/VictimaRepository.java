package co.edu.unicauca.micronovedades.capaAccesoDatos.repositories;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.VictimaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VictimaRepository extends JpaRepository<VictimaEntity, UUID> {

    List<VictimaEntity> findByNovedad_NovedadId(UUID novedadId);
}
