package co.edu.unicauca.microreportes.capaAccesoDatos.models;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.TipoEvento;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Registro de eventos procesados para garantizar idempotencia.
 * Patrón: Idempotent Consumer
 */
@Entity
@Table(name = "evento_procesado", indexes = {
        @Index(name = "idx_evento_novedad", columnList = "novedad_id, tipo_evento")
})
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EventoProcesadoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "evento_id")
    private UUID eventoId;

    @Column(name = "novedad_id", nullable = false)
    private UUID novedadId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_evento", nullable = false)
    private TipoEvento tipoEvento;

    @Column(name = "timestamp_evento", nullable = false)
    private String timestampEvento;

    @Column(name = "fecha_procesado", nullable = false)
    private LocalDateTime fechaProcesado;

    @Column(name = "idempotency_key", nullable = false, unique = true)
    private String idempotencyKey;

    @PrePersist
    public void prePersist() {
        this.fechaProcesado = LocalDateTime.now();
    }
}
