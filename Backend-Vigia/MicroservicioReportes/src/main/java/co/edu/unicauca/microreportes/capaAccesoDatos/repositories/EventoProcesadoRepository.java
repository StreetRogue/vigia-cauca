package co.edu.unicauca.microreportes.capaAccesoDatos.repositories;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.EventoProcesadoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EventoProcesadoRepository extends JpaRepository<EventoProcesadoEntity, UUID> {

    boolean existsByIdempotencyKey(String idempotencyKey);
}
